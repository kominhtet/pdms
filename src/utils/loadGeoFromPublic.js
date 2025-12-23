export async function loadGeoFromPublic(name, options = {}) {
  const base =
    options.baseUrl ?? (typeof process !== "undefined" ? process.env.PUBLIC_URL : "") ?? "";

  // Try JSON first
  const jsonUrl = `${base}/maps/${name}.json`;
  try {
    const r = await fetch(jsonUrl, { cache: "no-store" });
    if (!r.ok) throw new Error(`HTTP ${r.status} at ${jsonUrl}`);
    const txt = await r.text();
    if (isLikelyHtml(txt)) throw new Error(`Looks like HTML at ${jsonUrl}`);
    const data = JSON.parse(txt);
    if (!isFeatureCollection(data)) throw new Error(`Invalid FeatureCollection at ${jsonUrl}`);
    return data;
  } catch (_) {
    // continue to JS fallback
  }

  // Then try JS (expects: var geoData = {...};)
  const jsUrl = `${base}/maps/${name}.js`;
  const r2 = await fetch(jsUrl, { cache: "no-store" });
  if (!r2.ok) throw new Error(`HTTP ${r2.status} at ${jsUrl}`);
  const js = await r2.text();
  if (isLikelyHtml(js)) throw new Error(`Looks like HTML at ${jsUrl}`);

  // Evaluate in a function scope to capture `geoData` safely
  const factory = new Function(`${js}; return (typeof geoData !== 'undefined') ? geoData : null;`);
  const data = factory();
  if (!data) throw new Error(`geoData not found in ${jsUrl}`);
  if (!isFeatureCollection(data)) throw new Error(`Invalid FeatureCollection in ${jsUrl}`);
  return data;
}

function isLikelyHtml(text) {
  const t = String(text || "").trimStart();
  return t.startsWith("<") || t.startsWith("<!DOCTYPE");
}

function isFeatureCollection(obj) {
  return obj && obj.type === "FeatureCollection" && Array.isArray(obj.features);
}
