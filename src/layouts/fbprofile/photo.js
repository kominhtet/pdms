import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { API_BASE } from "../../config";

const facebookBlue = "#1877F2";

// ---- cache config ----
const PHOTOS_CACHE_KEY = "fbPhotosCache";
const PHOTOS_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getPhotosCache = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PHOTOS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to read photos cache:", e);
    return {};
  }
};

const savePhotosCache = (taskId, photos, offset, hasMore) => {
  if (!taskId || typeof window === "undefined") return;
  try {
    const cache = getPhotosCache();
    cache[taskId] = {
      photos,
      offset,
      hasMore,
      ts: Date.now(),
    };
    window.localStorage.setItem(PHOTOS_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to write photos cache:", e);
  }
};

function Photo({ taskId, personName }) {
  const PAGE_SIZE = 20;

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [open, setOpen] = useState(false);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedPhoto(null);
  };

  const fetchPhotos = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      // Check cache first
      const cache = getPhotosCache();
      const cached = cache[taskId];

      if (cached && !isLoadMore && Date.now() - cached.ts < PHOTOS_TTL_MS) {
        setPhotos(cached.photos || []);
        setOffset(cached.offset || cached.photos.length || 0);
        setHasMore(cached.hasMore ?? true);
        return;
      }

      const res = await axios.get(
        `${API_BASE}/tasks/${taskId}/photosAll/?offset=${offset}&limit=${PAGE_SIZE}`
      );

      const data = Array.isArray(res.data) ? res.data : [];
      const urls = data.flatMap((item) => item.photos || []);

      const newPhotos = isLoadMore ? [...photos, ...urls] : urls;

      setPhotos(newPhotos);
      setOffset((prev) => prev + urls.length);
      setHasMore(urls.length >= PAGE_SIZE);

      // Save updated state to cache
      savePhotosCache(taskId, newPhotos, offset + urls.length, urls.length >= PAGE_SIZE);
    } catch (err) {
      console.error("Error loading photos:", err);
      setError("Failed to load photos");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // reset state when taskId changes
    setPhotos([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
    if (taskId) fetchPhotos(false);
  }, [taskId]);

  return (
    <MDBox mt={3}>
      <Card
        sx={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <MDBox p={2}>
          <MDBox
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 2 }}
          >
            <MDTypography variant="h6" fontWeight="bold">
              Photos
            </MDTypography>
            {personName && (
              <MDTypography component="span" sx={{ color: facebookBlue, fontSize: 14 }}>
                {personName}&apos;s Photos
              </MDTypography>
            )}
          </MDBox>

          {loading && (
            <MDBox
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 160,
              }}
            >
              <CircularProgress size={28} />
            </MDBox>
          )}

          {error && !loading && (
            <MDTypography variant="body2" sx={{ color: "red", mb: 2 }}>
              {error}
            </MDTypography>
          )}

          {!loading && !error && (
            <MDBox
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(5, 1fr)",
                },
                gap: 1.5,
              }}
            >
              {photos.map((photo, index) => (
                <Card
                  key={`${photo}-${index}`}
                  onClick={() => handlePhotoClick(photo)}
                  sx={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.16)",
                    },
                  }}
                >
                  <MDBox
                    component="img"
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    sx={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                  />
                </Card>
              ))}

              {photos.length === 0 && (
                <MDTypography variant="body2" sx={{ color: "#999", gridColumn: "1 / -1" }}>
                  No photos for this account.
                </MDTypography>
              )}

              {hasMore && !loading && (
                <MDBox gridColumn="1 / -1" display="flex" justifyContent="center" mt={2}>
                  {loadingMore ? (
                    <CircularProgress size={24} />
                  ) : (
                    <MDTypography
                      variant="button"
                      color="info"
                      sx={{ cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => fetchPhotos(true)}
                    >
                      Load More
                    </MDTypography>
                  )}
                </MDBox>
              )}
            </MDBox>
          )}
        </MDBox>
      </Card>

      {/* Full-size Photo Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            boxShadow: "none",
            margin: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          },
        }}
      >
        <MDBox
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              color: "#fff",
              backgroundColor: "rgba(0,0,0,0.7)",
              width: 56,
              height: 56,
              border: "2px solid rgba(255,255,255,0.3)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "2px solid rgba(255,255,255,0.5)",
              },
              zIndex: 1000,
            }}
          >
            <CloseIcon sx={{ fontSize: 32, color: "#fff" }} />
          </IconButton>

          {selectedPhoto && (
            <MDBox
              component="img"
              src={selectedPhoto}
              alt="Full size"
              sx={{
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "calc(100vh - 32px)",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </MDBox>
      </Dialog>
    </MDBox>
  );
}

Photo.propTypes = {
  taskId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  personName: PropTypes.string,
};

export default Photo;
