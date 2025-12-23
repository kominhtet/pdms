export function buildJVectorMapFromGeoJSON(input, opts = {}) {
  const features = Array.isArray(input)
    ? input
    : input && input.type === "FeatureCollection"
    ? input.features || []
    : [];

  const width = opts.width ?? 900;
  const height = opts.height ?? 600;

  // Support independent X/Y padding (0–20%)
  const clampPad = (v) => Math.min(Math.max(v, 0), 0.2);
  const padX = clampPad(opts.paddingX ?? opts.padding ?? 0.08);
  const padY = clampPad(opts.paddingY ?? opts.padding ?? 0.08);

  // Compute bounds from data
  let lonMin = Number.POSITIVE_INFINITY;
  let lonMax = Number.NEGATIVE_INFINITY;
  let latMin = Number.POSITIVE_INFINITY;
  let latMax = Number.NEGATIVE_INFINITY;

  const updateBounds = (coords) => {
    for (const ring of coords || []) {
      if (!Array.isArray(ring)) continue;
      for (const point of ring) {
        if (!Array.isArray(point) || point.length < 2) continue;
        const lon = Number(point[0]);
        const lat = Number(point[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
        if (lon < lonMin) lonMin = lon;
        if (lon > lonMax) lonMax = lon;
        if (lat < latMin) latMin = lat;
        if (lat > latMax) latMax = lat;
      }
    }
  };

  for (const f of features) {
    const g = f?.geometry;
    if (!g) continue;
    if (g.type === "Polygon") updateBounds(g.coordinates);
    else if (g.type === "MultiPolygon") for (const poly of g.coordinates || []) updateBounds(poly);
  }

  if (!isFinite(lonMin)) {
    lonMin = opts.lonMin ?? 92.2;
    lonMax = opts.lonMax ?? 101.2;
    latMin = opts.latMin ?? 9.9;
    latMax = opts.latMax ?? 28.6;
  } else {
    lonMin = opts.lonMin ?? lonMin;
    lonMax = opts.lonMax ?? lonMax;
    latMin = opts.latMin ?? latMin;
    latMax = opts.latMax ?? latMax;
  }

  // Miller projection
  const project = (lon, lat) => {
    const λ = (lon * Math.PI) / 180;
    const φ = (lat * Math.PI) / 180;
    const x = λ;
    const y = (5 / 4) * Math.log(Math.tan(Math.PI / 4 + (2 * φ) / 5));
    return { x, y };
  };

  // Precompute projected bbox & scale, with zoom support
  const pMin = project(lonMin, latMin);
  const pMax = project(lonMax, latMax);
  const pxMin = Math.min(pMin.x, pMax.x);
  const pxMax = Math.max(pMin.x, pMax.x);
  const pyMin = Math.min(pMin.y, pMax.y);
  const pyMax = Math.max(pMin.y, pMax.y);

  const innerWidth = width * (1 - 2 * padX);
  const innerHeight = height * (1 - 2 * padY);
  const zoom = Number.isFinite(opts.zoom) ? opts.zoom : 1;
  const baseScale = Math.min(innerWidth / (pxMax - pxMin), innerHeight / (pyMax - pyMin));
  const uniformScale = baseScale * zoom;

  const shapeWidth = (pxMax - pxMin) * uniformScale;
  const shapeHeight = (pyMax - pyMin) * uniformScale;
  const offsetX = (width - shapeWidth) / 2;
  const offsetY = (height - shapeHeight) / 2;

  const nudgeY = Number.isFinite(opts.nudgeY) ? opts.nudgeY : 0;

  const toSvgPoint = (lon, lat) => {
    const { x, y } = project(lon, lat);
    const sx = offsetX + (x - pxMin) * uniformScale;
    const sy = height - (offsetY + (y - pyMin) * uniformScale) + nudgeY;
    return [sx, sy];
  };

  const polygonToPath = (poly) =>
    (poly || [])
      .map(
        (ring) =>
          (ring || [])
            .map(([lon, lat], i) => {
              const [x, y] = toSvgPoint(lon, lat);
              return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ") + " Z"
      )
      .join(" ");

  // Compute centroid in lon/lat using planar polygon centroid formula
  const ringCentroid = (ring) => {
    const pts = ring || [];
    const n = pts.length;
    if (n === 0) return { lon: 0, lat: 0, area: 0 };
    let a = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < n; i++) {
      const [lon1, lat1] = pts[i];
      const [lon2, lat2] = pts[(i + 1) % n];
      const cross = lon1 * lat2 - lon2 * lat1;
      a += cross;
      cx += (lon1 + lon2) * cross;
      cy += (lat1 + lat2) * cross;
    }
    a *= 0.5;
    if (Math.abs(a) < 1e-12) {
      // fallback: average
      const sum = pts.reduce((acc, [lon, lat]) => ({ lon: acc.lon + lon, lat: acc.lat + lat }), {
        lon: 0,
        lat: 0,
      });
      return { lon: sum.lon / n, lat: sum.lat / n, area: 0 };
    }
    return { lon: cx / (6 * a), lat: cy / (6 * a), area: Math.abs(a) };
  };

  const geometryCentroid = (geometry) => {
    if (!geometry) return null;
    if (geometry.type === "Polygon") {
      const c = ringCentroid((geometry.coordinates || [])[0] || []);
      return { lon: c.lon, lat: c.lat };
    }
    if (geometry.type === "MultiPolygon") {
      let accA = 0;
      let accX = 0;
      let accY = 0;
      for (const poly of geometry.coordinates || []) {
        const c = ringCentroid((poly || [])[0] || []);
        accA += c.area;
        accX += c.lon * c.area;
        accY += c.lat * c.area;
      }
      if (accA > 0) return { lon: accX / accA, lat: accY / accA };
    }
    return null;
  };

  const paths = {};
  for (const f of features) {
    if (!f || f.type !== "Feature" || !f.geometry) continue;

    const id = String(
      f.id ?? f.properties?.id ?? f.properties?.code ?? f.properties?.GID ?? cryptoRandomId()
    );
    const name =
      f.properties?.name ||
      f.properties?.NAME_1 ||
      f.properties?.NAME_2 ||
      f.properties?.NAME ||
      id;

    const g = f.geometry;
    let d = "";
    if (g.type === "Polygon") d = polygonToPath(g.coordinates || []);
    else if (g.type === "MultiPolygon") d = (g.coordinates || []).map(polygonToPath).join(" ");
    else continue;

    if (d.trim()) {
      const centroid = geometryCentroid(g);
      paths[id] = {
        name,
        path: d,
        meta: f.properties || {},
        centroid: centroid ? { lat: centroid.lat, lng: centroid.lon } : undefined,
      };
    }
  }

  // Use the same miller projection units as jvectormap for the inset bbox
  const JV_RADIUS = 6381372;
  const RAD = Math.PI / 180;
  const centralMeridian = Number.isFinite(opts.centralMeridian) ? opts.centralMeridian : 96; // near Myanmar
  const projMill = (lat, lng) => ({
    x: JV_RADIUS * (lng - centralMeridian) * RAD,
    y: (-JV_RADIUS * Math.log(Math.tan((45 + 0.4 * lat) * RAD))) / 0.8,
  });

  const corners = [
    projMill(latMin, lonMin),
    projMill(latMin, lonMax),
    projMill(latMax, lonMin),
    projMill(latMax, lonMax),
  ];
  const bxMin = Math.min(...corners.map((p) => p.x));
  const bxMax = Math.max(...corners.map((p) => p.x));
  const byMin = Math.min(...corners.map((p) => p.y));
  const byMax = Math.max(...corners.map((p) => p.y));

  return {
    name: opts.name || "myanmar_mill",
    content: {
      width,
      height,
      projection: { type: "mill", centralMeridian },
      insets: [
        {
          name: "myanmar",
          type: "mill",
          top: 0,
          left: 0,
          width,
          height,
          bbox: [
            { x: bxMin, y: byMin },
            { x: bxMax, y: byMax },
          ],
        },
      ],
      paths,
    },
  };
}

function cryptoRandomId() {
  return "id_" + Math.random().toString(36).slice(2, 9);
}
