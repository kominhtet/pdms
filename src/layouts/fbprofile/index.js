// import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";

// @mui icons
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeIcon from "@mui/icons-material/Home";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Language from "@mui/icons-material/Language";
import SearchIcon from "@mui/icons-material/Search";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Images
import team1 from "assets/images/team-1.jpg";
import poe from "assets/images/poe.jpg";
import poe1 from "assets/images/poe1.jpg";
import poe2 from "assets/images/poe2.jpg";
import poe3 from "assets/images/poe3.jpg";
import poe4 from "assets/images/poe4.jpg";
// Analysis page (rendered when the Analysis tab is selected)
import AnalysisPage from "./analysis";
// Photo page (rendered when the Photos tab is selected)
import PhotoPage from "./photo";
// About page (rendered when the About tab is selected)
import AboutPage from "./about";

// 🔹 localStorage key for this page
const CACHE_KEY = "fbProfileCache_v1";
// 🔹 Cache timestamp key
const CACHE_TIMESTAMP_KEY = "fbProfileCache_timestamp";
// 🔹 Cache expiration time (30 minutes)
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// 🔹 helper to safely read cache with timestamp check
const getCachedState = () => {
  if (typeof window === "undefined") return {};
  try {
    const timestamp = window.localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();

    // Check if cache is expired
    if (timestamp && now - parseInt(timestamp) > CACHE_EXPIRY) {
      // Clear expired cache
      window.localStorage.removeItem(CACHE_KEY);
      window.localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return {};
    }

    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to parse FBProfile cache:", e);
    return {};
  }
};

// 🔹 helper to update cache timestamp
const updateCacheTimestamp = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Failed to update cache timestamp:", e);
  }
};

// 🔹 helper to get cached photos for a specific person
const getCachedPhotosForPerson = (personId) => {
  if (typeof window === "undefined") return null;
  try {
    const photosCacheKey = `fbProfile_photos_${personId}`;
    const timestampKey = `fbProfile_photos_timestamp_${personId}`;

    const timestamp = window.localStorage.getItem(timestampKey);
    const now = Date.now();

    // Check if cache is expired
    if (timestamp && now - parseInt(timestamp) > CACHE_EXPIRY) {
      // Clear expired cache
      window.localStorage.removeItem(photosCacheKey);
      window.localStorage.removeItem(timestampKey);
      return null;
    }

    const raw = window.localStorage.getItem(photosCacheKey);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Failed to parse photos cache:", e);
    return null;
  }
};

// 🔹 helper to cache photos for a specific person
const cachePhotosForPerson = (personId, photos) => {
  if (typeof window === "undefined") return;
  try {
    const photosCacheKey = `fbProfile_photos_${personId}`;
    const timestampKey = `fbProfile_photos_timestamp_${personId}`;

    window.localStorage.setItem(photosCacheKey, JSON.stringify(photos));
    window.localStorage.setItem(timestampKey, Date.now().toString());
  } catch (e) {
    console.warn("Failed to save photos cache:", e);
  }
};

function FBProfile() {
  // read cache once
  const cachedInitial = getCachedState();

  const [tabValue, setTabValue] = useState(() => cachedInitial.tabValue ?? 0);
  const [searchQuery, setSearchQuery] = useState(() => cachedInitial.searchQuery ?? "");
  const [currentPage, setCurrentPage] = useState(() => cachedInitial.currentPage ?? 1);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // reset to page 1 whenever searching
  };

  // 👉 New state for API data
  const [people, setPeople] = useState(() => cachedInitial.people || []);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [peopleError, setPeopleError] = useState(null);
  const [peopleLoaded, setPeopleLoaded] = useState(() => cachedInitial.peopleLoaded || false);

  // 👉 New state for photos
  const [photos, setPhotos] = useState(() => {
    // Try to get cached photos for the selected person
    const cachedPersonId = cachedInitial.selectedPerson?.id;
    if (cachedPersonId) {
      const cachedPhotos = getCachedPhotosForPerson(cachedPersonId);
      if (cachedPhotos) return cachedPhotos;
    }
    return [];
  });
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photosError, setPhotosError] = useState(null);

  // 👉 New state for posts
  const [posts, setPosts] = useState(() => cachedInitial.posts || []);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [postsPage, setPostsPage] = useState(() => cachedInitial.postsPage ?? 1);
  const [hasMorePosts, setHasMorePosts] = useState(() => cachedInitial.hasMorePosts ?? false);
  const [postsLoaded, setPostsLoaded] = useState(() => cachedInitial.postsLoaded || false);

  // 👉 New state for selected person - NO AUTO-SELECTION
  const [selectedPerson, setSelectedPerson] = useState(() => {
    // Only use cached selection if it exists
    if (cachedInitial.selectedPerson && cachedInitial.selectedPerson.id) {
      return cachedInitial.selectedPerson;
    }
    // Default empty state - no auto-selection
    return {
      id: null,
      name: "",
      profile_image: poe4,
      link: null,
      task_id: null,
      isSelected: false,
    };
  });

  const [expandedPosts, setExpandedPosts] = useState(() => cachedInitial.expandedPosts || {});
  const MAX_TEXT_LENGTH = 220;

  // Modal state for comment form
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [commentText, setCommentText] = useState("");

  // Modal state for image gallery
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageGallery, setImageGallery] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  // Facebook blue color
  const facebookBlue = "#1877F2";
  // Dark teal for header
  const headerTeal = "#052B2D";
  const bg = "#D9D9D9";
  // Text colors
  const darkText = "#0a0a0a";
  const whiteText = "#FFFFFF";
  const darkGray = "#1C1E21";
  const secondaryText = "#B0B3B8";

  // ==================== 🔐 CACHE SYNC EFFECT ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const toStore = {
        tabValue,
        searchQuery,
        currentPage,
        selectedPerson,
        postsPage,
        posts,
        photos, // Photos are cached globally too
        hasMorePosts,
        expandedPosts,
        people,
        peopleLoaded,
        postsLoaded,
      };
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(toStore));
      updateCacheTimestamp();

      // Also cache photos separately for the selected person
      if (selectedPerson.id && photos.length > 0) {
        cachePhotosForPerson(selectedPerson.id, photos);
      }
    } catch (e) {
      console.warn("Failed to save FBProfile cache:", e);
    }
  }, [
    tabValue,
    searchQuery,
    currentPage,
    selectedPerson,
    postsPage,
    posts,
    photos,
    hasMorePosts,
    expandedPosts,
    people,
    peopleLoaded,
    postsLoaded,
  ]);

  // ========== Fetch People from API ==========
  useEffect(() => {
    const fetchPeople = async () => {
      setLoadingPeople(true);
      setPeopleError(null);
      try {
        const res = await axios.get(`${API_BASE}/tasks_source/all/`);
        const data = res.data || [];
        setPeople(data);
        setPeopleLoaded(true);
      } catch (err) {
        console.error("Error fetching people:", err);
        setPeopleError("Failed to load people");
      } finally {
        setLoadingPeople(false);
      }
    };

    // Only fetch people if we don't have them cached
    if (!peopleLoaded || people.length === 0) {
      fetchPeople();
    }
  }, [peopleLoaded]);

  // ========== Handle Person Selection ==========
  const handlePersonSelect = (person) => {
    if (!person.id) return;

    const newSelectedPerson = {
      id: person.id,
      name: person.name,
      profile_image: person.profile_image || poe4,
      link: person.link || null,
      task_id: person.task_id || null,
      isSelected: true,
    };

    setSelectedPerson(newSelectedPerson);

    // Reset posts state for new person
    setPosts([]);
    setPostsPage(1);
    setHasMorePosts(true);
    setPostsLoaded(false);

    // Check for cached photos for this person
    const cachedPhotos = getCachedPhotosForPerson(person.id);
    if (cachedPhotos && cachedPhotos.length > 0) {
      setPhotos(cachedPhotos);
      // Still load fresh photos in background
      fetchPhotosFromAPI(person.task_id);
    } else {
      setPhotos([]);
      fetchPhotosFromAPI(person.task_id);
    }

    // Load posts for this person
    if (person.task_id) {
      fetchPosts(1, person.task_id);
    }
  };

  // ========== Fetch Posts for Selected Person ==========
  const fetchPosts = async (pageToLoad, taskId = selectedPerson.task_id) => {
    if (!taskId) {
      setPosts([]);
      setHasMorePosts(false);
      setPostsLoaded(true);
      return;
    }

    setLoadingPosts(true);
    setPostsError(null);

    try {
      const res = await axios.get(`${API_BASE}/tasks/${taskId}/posts/`, {
        params: { page: pageToLoad, page_size: 10 },
      });

      const data = res.data;
      const newPosts = data.results || [];

      setPosts((prev) => (pageToLoad === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMorePosts(Boolean(data.next));
      setPostsPage(pageToLoad);
      setPostsLoaded(true);
    } catch (err) {
      console.error("Error loading posts:", err);
      setPostsError("Failed to load posts");
      setPostsLoaded(true);
    } finally {
      setLoadingPosts(false);
    }
  };

  // ========== Fetch Photos for Selected Person ==========
  const fetchPhotosFromAPI = async (taskId) => {
    if (!taskId) {
      setPhotos([]);
      setLoadingPhotos(false);
      setPhotosError(null);
      return;
    }

    setLoadingPhotos(true);
    setPhotosError(null);

    try {
      const res = await axios.get(`${API_BASE}/tasks/${taskId}/photos/`);

      const data = Array.isArray(res.data) ? res.data : [];
      const allPhotoUrls = data.flatMap((item) => item.photos || []);

      setPhotos(allPhotoUrls);
    } catch (err) {
      console.error("Error loading photos:", err);
      setPhotosError("Failed to load photos");
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // ========== Pagination Logic ==========
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredPeople = normalizedSearch
    ? people.filter((p) => (p.name || "").toLowerCase().includes(normalizedSearch))
    : people;

  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / ITEMS_PER_PAGE));
  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentPeople = filteredPeople.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (event, value) => {
    if (value < 1 || value > totalPages) return;
    setCurrentPage(value);
  };

  // Handle load more posts
  const handleLoadMorePosts = () => {
    if (selectedPerson.task_id && hasMorePosts) {
      fetchPosts(postsPage + 1);
    }
  };

  return (
    <DashboardLayout>
      {/* ======= Aura Background ======= */}
      <MDBox
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.3,
          background:
            "radial-gradient(70vmax 70vmax at 20% 20%, #38bdf8 0%, transparent 45%), radial-gradient(60vmax 50vmax at 90% 10%, #8b5cf6 0%, transparent 50%)",
          zIndex: -1,
        }}
      />
      <MDBox
        minHeight="100vh"
        sx={{
          position: "relative",
        }}
      >
        <MDBox mx="auto" maxWidth="1500px" px={2} pt={3} pb={3}>
          {/* Header - Half by Half Split */}
          <MDBox
            sx={{
              position: "relative",
              height: "400px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Top Half - Dark Teal */}
            <MDBox
              sx={{
                height: "50%",
                backgroundColor: headerTeal,
              }}
            />
            {/* Bottom Half - Light Gray */}
            <MDBox
              sx={{
                height: "50%",
                backgroundColor: bg,
              }}
            />

            {/* Left-Centered Profile Picture */}
            <MDBox
              sx={{
                position: "absolute",
                top: "50%",
                left: "40px",
                transform: "translateY(-50%)",
                zIndex: 2,
              }}
            >
              <Avatar
                src={selectedPerson.profile_image || poe4}
                alt={selectedPerson.name}
                sx={{
                  width: 168,
                  height: 168,
                  border: "4px solid white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </MDBox>

            {/* Name, Divider, and Tabs Container in bottom half */}
            <MDBox
              sx={{
                position: "absolute",
                top: "50%",
                left: "240px",
                width: "calc(100% - 280px)",
                zIndex: 2,
                pt: 4,
              }}
            >
              {/* Profile Name */}
              <MDTypography
                variant="h4"
                fontWeight="bold"
                sx={{
                  mb: 1,
                  color: selectedPerson.isSelected ? facebookBlue : secondaryText,
                }}
              >
                {selectedPerson.isSelected ? (
                  selectedPerson.link ? (
                    <Link
                      href={selectedPerson.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: facebookBlue,
                        textDecoration: "underline",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "none",
                        },
                      }}
                    >
                      {selectedPerson.name}
                    </Link>
                  ) : (
                    <span
                      style={{
                        color: facebookBlue,
                        textDecoration: "underline",
                        cursor: "default",
                      }}
                    >
                      {selectedPerson.name}
                    </span>
                  )
                ) : (
                  <span style={{ color: secondaryText }}>Select a person to view profile</span>
                )}
              </MDTypography>
            </MDBox>
            {/* Tabs section aligned under the name (inside header) */}
            <MDBox
              sx={{
                position: "absolute",
                top: "calc(50% + 100px)",
                left: 0,
                width: "100%",
                zIndex: 3,
              }}
            >
              <Divider sx={{ mb: 1, borderColor: "#B0B3B8", opacity: 0.8 }} />
              <Card
                sx={{
                  backgroundColor: whiteText,
                  borderRadius: "0px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  mb: 2,
                  opacity: selectedPerson.isSelected ? 1 : 0.7,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleSetTabValue}
                  sx={{
                    "& .MuiTabs-indicator": {
                      backgroundColor: facebookBlue,
                      height: 3,
                    },
                  }}
                >
                  <Tab
                    label="Posts"
                    sx={{
                      color: tabValue === 0 ? facebookBlue : darkGray,
                      fontWeight: tabValue === 0 ? 600 : 400,
                      textTransform: "none",
                      fontSize: "15px",
                      minHeight: 48,
                      px: 2,
                      "&.Mui-selected": {
                        color: facebookBlue,
                      },
                    }}
                  />
                  <Tab
                    label="About"
                    sx={{
                      color: tabValue === 1 ? facebookBlue : darkGray,
                      fontWeight: tabValue === 1 ? 600 : 400,
                      textTransform: "none",
                      fontSize: "15px",
                      minHeight: 48,
                      px: 2,
                      "&.Mui-selected": {
                        color: facebookBlue,
                      },
                    }}
                  />
                  <Tab
                    label="Photos"
                    sx={{
                      color: tabValue === 2 ? facebookBlue : darkGray,
                      fontWeight: tabValue === 2 ? 600 : 400,
                      textTransform: "none",
                      fontSize: "15px",
                      minHeight: 48,
                      px: 2,
                      "&.Mui-selected": {
                        color: facebookBlue,
                      },
                    }}
                  />
                  <Tab
                    label="Analysis"
                    sx={{
                      color: tabValue === 3 ? facebookBlue : darkGray,
                      fontWeight: tabValue === 3 ? 600 : 400,
                      textTransform: "none",
                      fontSize: "15px",
                      minHeight: 48,
                      px: 2,
                      "&.Mui-selected": {
                        color: facebookBlue,
                      },
                    }}
                  />
                </Tabs>
              </Card>
            </MDBox>
          </MDBox>

          {/* Content Area */}
          {tabValue === 1 ? (
            <AboutPage />
          ) : tabValue === 2 ? (
            // Show Photo page when "Photos" tab is active
            <PhotoPage taskId={selectedPerson.task_id} personName={selectedPerson.name} />
          ) : tabValue === 3 ? (
            <AnalysisPage taskId={selectedPerson.task_id} />
          ) : (
            <Grid container spacing={3} mt={2} alignItems="flex-start">
              {/* Left Column */}
              <Grid item xs={12} md={3}>
                {/* About Card */}
                <Card
                  sx={{
                    backgroundColor: whiteText,
                    borderRadius: "8px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    mb: 2,
                    opacity: selectedPerson.isSelected ? 1 : 0.7,
                  }}
                >
                  <MDBox p={2}>
                    <MDTypography variant="h6" fontWeight="bold" sx={{ color: darkText, mb: 2 }}>
                      About
                    </MDTypography>
                    {selectedPerson.isSelected ? (
                      <>
                        <MDBox display="flex" alignItems="center" mb={1}>
                          <HomeIcon sx={{ color: darkText, fontSize: 18, mr: 1 }} />
                          <MDTypography variant="body2" sx={{ color: darkText }}>
                            Lives in Yangon
                          </MDTypography>
                        </MDBox>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <LocationOnIcon sx={{ color: darkText, fontSize: 18, mr: 1 }} />
                          <MDTypography variant="body2" sx={{ color: darkText }}>
                            From Mandalay, Myanmar
                          </MDTypography>
                        </MDBox>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <MoreHoriz sx={{ color: darkText, fontSize: 18, mr: 1 }} />
                          <Link
                            component="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setTabValue(1);
                            }}
                            sx={{
                              color: facebookBlue,
                              textDecoration: "none",
                              fontSize: "15px",
                              fontWeight: 500,
                              cursor: "pointer",
                              border: "none",
                              background: "none",
                              padding: 0,
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            See About Info
                          </Link>
                        </MDBox>
                      </>
                    ) : (
                      <MDTypography variant="body2" sx={{ color: secondaryText }}>
                        Select a person to view about info
                      </MDTypography>
                    )}
                  </MDBox>
                </Card>

                {/* Photos Card */}
                <Card
                  sx={{
                    backgroundColor: whiteText,
                    borderRadius: "8px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    opacity: selectedPerson.isSelected ? 1 : 0.7,
                  }}
                >
                  <MDBox p={2}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: darkText }}>
                        Photos
                      </MDTypography>

                      {selectedPerson.task_id && ( // 👈 use task_id instead of isSelected
                        <Link
                          component="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setTabValue(2); // switch to Photos tab
                          }}
                          sx={{
                            color: facebookBlue,
                            textDecoration: "none",
                            fontSize: "15px",
                            fontWeight: 500,
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            padding: 0,
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          See all photos
                        </Link>
                      )}
                    </MDBox>

                    {!selectedPerson.isSelected ? (
                      <MDTypography variant="body2" sx={{ color: secondaryText }}>
                        Select a person to view photos
                      </MDTypography>
                    ) : (
                      <>
                        {photosError && (
                          <MDTypography variant="body2" sx={{ color: "red", mb: 1 }}>
                            {photosError}
                          </MDTypography>
                        )}

                        {loadingPhotos ? (
                          <MDBox
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              minHeight: 120,
                            }}
                          >
                            <CircularProgress size={28} />
                          </MDBox>
                        ) : (
                          <Grid container spacing={1}>
                            {photos.slice(0, 9).map((photoUrl, idx) => (
                              <Grid item xs={4} key={idx}>
                                <MDBox
                                  component="img"
                                  src={photoUrl}
                                  alt={`Photo ${idx + 1}`}
                                  sx={{
                                    width: "100%",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                              </Grid>
                            ))}

                            {photos.length === 0 && (
                              <Grid item xs={12}>
                                <MDTypography variant="body2" sx={{ color: secondaryText }}>
                                  No photos for this person.
                                </MDTypography>
                              </Grid>
                            )}
                          </Grid>
                        )}
                      </>
                    )}
                  </MDBox>
                </Card>
              </Grid>

              {/* Middle Column - Posts */}
              <Grid item xs={12} md={6}>
                <MDBox
                  sx={{
                    maxHeight: "calc(100vh - 220px)",
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#F0F2F5",
                      borderRadius: "3px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#BCC0C4",
                      borderRadius: "3px",
                      "&:hover": {
                        background: "#8A8D91",
                      },
                    },
                  }}
                >
                  {/* No person selected */}
                  {!selectedPerson.isSelected && (
                    <Card
                      sx={{
                        backgroundColor: whiteText,
                        borderRadius: "8px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        mb: 2,
                      }}
                    >
                      <MDBox p={4} textAlign="center">
                        <MDTypography variant="h6" sx={{ color: secondaryText, mb: 2 }}>
                          👈 Select a person from the right panel to view their posts
                        </MDTypography>
                        <MDTypography variant="body2" sx={{ color: secondaryText }}>
                          Click on any person in the &quot;People&quot; section to load their
                          profile
                        </MDTypography>
                      </MDBox>
                    </Card>
                  )}

                  {/* Person selected but loading */}
                  {selectedPerson.isSelected && loadingPosts && posts.length === 0 && (
                    <Card
                      sx={{
                        backgroundColor: whiteText,
                        borderRadius: "8px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        mb: 2,
                      }}
                    >
                      <MDBox
                        p={2}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="120px"
                      >
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <MDTypography variant="body2" sx={{ color: darkText }}>
                          Loading posts…
                        </MDTypography>
                      </MDBox>
                    </Card>
                  )}

                  {/* Error state */}
                  {selectedPerson.isSelected && postsError && !loadingPosts && (
                    <Card
                      sx={{
                        backgroundColor: whiteText,
                        borderRadius: "8px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        mb: 2,
                      }}
                    >
                      <MDBox p={2}>
                        <MDTypography variant="body2" sx={{ color: "red" }}>
                          {postsError}
                        </MDTypography>
                      </MDBox>
                    </Card>
                  )}

                  {/* No posts */}
                  {selectedPerson.isSelected &&
                    !loadingPosts &&
                    !postsError &&
                    posts.length === 0 &&
                    postsLoaded && (
                      <Card
                        sx={{
                          backgroundColor: whiteText,
                          borderRadius: "8px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          mb: 2,
                        }}
                      >
                        <MDBox p={2}>
                          <MDTypography variant="body2" sx={{ color: darkText }}>
                            No posts found for this person.
                          </MDTypography>
                        </MDBox>
                      </Card>
                    )}

                  {/* Actual posts */}
                  {selectedPerson.isSelected &&
                    !postsError &&
                    posts.map((post) => {
                      const userName = selectedPerson.name;
                      const userProfile = selectedPerson.profile_image || poe4;
                      const dateText = post.date ? new Date(post.date).toLocaleString() : "";

                      const likes = post.likes ?? 0;
                      const comments = post.comments ?? 0;
                      const shares = post.shares ?? 0;
                      const postLink = post.user_link;

                      const photos = post.photos || [];

                      return (
                        <Card
                          key={post.id || `${post.content_id}-${post.date}`}
                          sx={{
                            backgroundColor: whiteText,
                            borderRadius: "8px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            mb: 2,
                          }}
                        >
                          <MDBox p={2}>
                            {/* Header */}
                            <MDBox display="flex" alignItems="center" mb={2}>
                              <Avatar
                                src={userProfile}
                                alt={userName}
                                sx={{ width: 40, height: 40, mr: 1.5 }}
                              />
                              <MDBox>
                                {postLink ? (
                                  <MDTypography
                                    component="a"
                                    href={postLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="body1"
                                    fontWeight="600"
                                    sx={{
                                      color: facebookBlue,
                                      textDecoration: "none",
                                      "&:hover": { textDecoration: "underline" },
                                    }}
                                  >
                                    {userName}
                                  </MDTypography>
                                ) : (
                                  <MDTypography
                                    variant="body1"
                                    fontWeight="600"
                                    sx={{ color: darkText }}
                                  >
                                    {userName}
                                  </MDTypography>
                                )}
                                <MDBox display="flex" alignItems="center">
                                  <MDTypography variant="caption" sx={{ color: darkText, mr: 0.5 }}>
                                    {dateText}
                                  </MDTypography>
                                  <Language sx={{ color: secondaryText, fontSize: 16 }} />
                                </MDBox>
                              </MDBox>
                            </MDBox>

                            {/* Text with "See more" */}
                            {post.text &&
                              (() => {
                                const fullText = post.text || "";
                                const isLong = fullText.length > MAX_TEXT_LENGTH;
                                const isExpanded = expandedPosts[post.id] || false;
                                const displayText =
                                  !isLong || isExpanded
                                    ? fullText
                                    : fullText.slice(0, MAX_TEXT_LENGTH) + "…";

                                return (
                                  <MDBox mb={2}>
                                    <MDTypography variant="body2" sx={{ color: darkText }}>
                                      {displayText}
                                    </MDTypography>
                                    {isLong && (
                                      <MDTypography
                                        component="button"
                                        onClick={() =>
                                          setExpandedPosts((prev) => ({
                                            ...prev,
                                            [post.id]: !isExpanded,
                                          }))
                                        }
                                        sx={{
                                          mt: 0.5,
                                          border: "none",
                                          background: "none",
                                          padding: 0,
                                          color: facebookBlue,
                                          fontSize: "0.85rem",
                                          fontWeight: 600,
                                          cursor: "pointer",
                                          "&:hover": { textDecoration: "underline" },
                                        }}
                                      >
                                        {isExpanded ? "See less" : "See more"}
                                      </MDTypography>
                                    )}
                                  </MDBox>
                                );
                              })()}

                            {/* Images */}
                            {photos.length > 0 && (
                              <MDBox mb={2}>
                                {photos.length === 1 ? (
                                  <MDBox
                                    component="img"
                                    src={photos[0]}
                                    alt="Post"
                                    onClick={() => {
                                      setImageGallery(photos);
                                      setCurrentImageIndex(0);
                                      setImageModalOpen(true);
                                    }}
                                    sx={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                      borderRadius: "8px",
                                      display: "block",
                                      cursor: "pointer",
                                      transition: "transform 0.3s ease, opacity 0.3s ease",
                                      "&:hover": {
                                        transform: "scale(1.01)",
                                        opacity: 0.95,
                                      },
                                    }}
                                  />
                                ) : (
                                  <Grid container spacing={0.5}>
                                    {(photos.length > 4 ? photos.slice(0, 4) : photos).map(
                                      (url, idx, arr) => {
                                        const isLastWithOverlay =
                                          photos.length > 4 && idx === arr.length - 1;
                                        const extraCount = photos.length - 4;

                                        return (
                                          <Grid item xs={6} key={idx}>
                                            <MDBox
                                              onClick={() => {
                                                setImageGallery(photos);
                                                setCurrentImageIndex(idx);
                                                setImageModalOpen(true);
                                              }}
                                              sx={{
                                                position: "relative",
                                                borderRadius: "6px",
                                                overflow: "hidden",
                                                cursor: "pointer",
                                              }}
                                            >
                                              <MDBox
                                                component="img"
                                                src={url}
                                                alt={`Post photo ${idx + 1}`}
                                                sx={{
                                                  width: "100%",
                                                  height: "160px",
                                                  objectFit: "cover",
                                                  display: "block",
                                                  transition:
                                                    "transform 0.3s ease, opacity 0.3s ease",
                                                  "&:hover": {
                                                    transform: "scale(1.01)",
                                                    opacity: 0.95,
                                                  },
                                                }}
                                              />

                                              {isLastWithOverlay && extraCount > 0 && (
                                                <MDBox
                                                  sx={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    backgroundColor: "rgba(0, 0, 0, 0.55)",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <MDTypography
                                                    variant="h4"
                                                    sx={{ color: "#fff", fontWeight: "bold" }}
                                                  >
                                                    +{extraCount}
                                                  </MDTypography>
                                                </MDBox>
                                              )}
                                            </MDBox>
                                          </Grid>
                                        );
                                      }
                                    )}
                                  </Grid>
                                )}
                              </MDBox>
                            )}

                            {/* Stats */}
                            {(likes || comments || shares) && (
                              <MDBox display="flex" alignItems="center" mb={1}>
                                <ThumbUpIcon sx={{ color: facebookBlue, fontSize: 18, mr: 0.5 }} />
                                <MDTypography variant="caption" sx={{ color: darkText, mr: 2 }}>
                                  {likes}
                                </MDTypography>
                                <MDTypography variant="caption" sx={{ color: darkText }}>
                                  {comments} Comments · {shares} Shares
                                </MDTypography>
                              </MDBox>
                            )}

                            <Divider sx={{ my: 1, borderColor: darkText }} />

                            {/* Actions */}
                            <MDBox display="flex" justifyContent="space-around">
                              <MDBox
                                display="flex"
                                alignItems="center"
                                sx={{ cursor: "pointer", "&:hover": { opacity: 0.7 } }}
                              >
                                <ThumbUpIcon sx={{ color: darkText, mr: 1 }} />
                                <MDTypography
                                  variant="body2"
                                  sx={{ color: darkText, fontWeight: 600 }}
                                >
                                  Like
                                </MDTypography>
                              </MDBox>
                              <MDBox
                                display="flex"
                                alignItems="center"
                                onClick={() => {
                                  setSelectedPostForComment(post);
                                  setCommentText("");
                                  setCommentModalOpen(true);
                                }}
                                sx={{ cursor: "pointer", "&:hover": { opacity: 0.7 } }}
                              >
                                <CommentIcon sx={{ color: darkText, mr: 1 }} />
                                <MDTypography
                                  variant="body2"
                                  sx={{ color: darkText, fontWeight: 600 }}
                                >
                                  Comment
                                </MDTypography>
                              </MDBox>
                              <MDBox
                                display="flex"
                                alignItems="center"
                                sx={{ cursor: "pointer", "&:hover": { opacity: 0.7 } }}
                              >
                                <ShareIcon sx={{ color: darkText, mr: 1 }} />
                                <MDTypography
                                  variant="body2"
                                  sx={{ color: darkText, fontWeight: 600 }}
                                >
                                  Share
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          </MDBox>
                        </Card>
                      );
                    })}

                  {/* Load more button */}
                  {selectedPerson.isSelected && posts.length > 0 && (
                    <MDBox textAlign="center" mt={1} mb={2}>
                      {loadingPosts ? (
                        <CircularProgress size={24} />
                      ) : hasMorePosts ? (
                        <Button
                          variant="outlined"
                          onClick={handleLoadMorePosts}
                          sx={{ textTransform: "none" }}
                        >
                          Load more
                        </Button>
                      ) : (
                        <MDTypography variant="caption" sx={{ color: secondaryText }}>
                          No more posts
                        </MDTypography>
                      )}
                    </MDBox>
                  )}
                </MDBox>
              </Grid>

              {/* Right Column - Search, People, Pagination */}
              <Grid item xs={12} md={3}>
                {/* Search Card */}
                <Card
                  sx={{
                    backgroundColor: whiteText,
                    borderRadius: "8px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    mb: 3,
                    position: "sticky",
                    top: 16,
                  }}
                >
                  <MDBox p={2}>
                    <MDBox display="flex" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        placeholder="Search people…"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: darkText }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#F0F2F5",
                            "& fieldset": {
                              borderColor: "#E4E6EB",
                            },
                            "&:hover fieldset": {
                              borderColor: facebookBlue,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: facebookBlue,
                            },
                            "& input": {
                              color: darkText,
                            },
                            "& input::placeholder": {
                              color: darkText,
                              opacity: 0.7,
                            },
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: facebookBlue,
                          color: whiteText,
                          textTransform: "none",
                          minWidth: "auto",
                          px: 2,
                          "&:hover": {
                            backgroundColor: "#166FE5",
                          },
                        }}
                      >
                        Search
                      </Button>
                    </MDBox>
                  </MDBox>
                </Card>

                {/* People Card */}
                <Card
                  sx={{
                    backgroundColor: whiteText,
                    borderRadius: "8px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    position: "sticky",
                    top: 120,
                  }}
                >
                  <MDBox p={2}>
                    <MDTypography variant="h6" fontWeight="bold" sx={{ color: darkText, mb: 2 }}>
                      People
                    </MDTypography>

                    {loadingPeople && (
                      <MDBox display="flex" alignItems="center" mb={2}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <MDTypography variant="body2" sx={{ color: secondaryText }}>
                          Loading people...
                        </MDTypography>
                      </MDBox>
                    )}

                    {peopleError && (
                      <MDTypography variant="body2" sx={{ color: "red", mb: 1 }}>
                        {peopleError}
                      </MDTypography>
                    )}

                    <MDBox sx={{ mb: 2 }}>
                      {currentPeople.map((person) => (
                        <MDBox
                          key={person.id}
                          display="flex"
                          alignItems="center"
                          onClick={() => handlePersonSelect(person)}
                          sx={{
                            p: 1.5,
                            borderRadius: "8px",
                            cursor: "pointer",
                            mb: 0.5,
                            backgroundColor:
                              selectedPerson.id === person.id ? "#F0F2F5" : "transparent",
                            border:
                              selectedPerson.id === person.id
                                ? `2px solid ${facebookBlue}`
                                : "none",
                            "&:hover": {
                              backgroundColor: "#F0F2F5",
                            },
                          }}
                        >
                          <Avatar
                            src={person.profile_image || undefined}
                            alt={person.name}
                            sx={{
                              width: 40,
                              height: 40,
                              mr: 1.5,
                              border:
                                selectedPerson.id === person.id
                                  ? `2px solid ${facebookBlue}`
                                  : "2px solid #E4E6EB",
                            }}
                          />
                          <MDTypography
                            variant="body2"
                            sx={{
                              color: selectedPerson.id === person.id ? facebookBlue : darkText,
                              fontWeight: selectedPerson.id === person.id ? 600 : 500,
                              fontSize: "14px",
                            }}
                          >
                            {person.name}
                          </MDTypography>
                        </MDBox>
                      ))}

                      {!loadingPeople && currentPeople.length === 0 && (
                        <MDTypography variant="body2" sx={{ color: secondaryText }}>
                          No people found.
                        </MDTypography>
                      )}
                    </MDBox>

                    {/* Pagination */}
                    {people.length > 0 && (
                      <MDBox display="flex" justifyContent="center" alignItems="center" mt={1}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          size="small"
                          siblingCount={0}
                          boundaryCount={1}
                          showFirstButton={false}
                          showLastButton={false}
                          sx={{
                            "& .MuiPaginationItem-root": {
                              color: darkText,
                              fontSize: { xs: "0.7rem", sm: "0.725rem", md: "0.75rem" },
                              minWidth: { xs: "28px", sm: "30px", md: "32px" },
                              height: { xs: "28px", sm: "30px", md: "32px" },
                              margin: { xs: "0 1px", sm: "0 1.5px", md: "0 2px" },
                              border: "1px solid rgba(0, 0, 0, 0.08)",
                              background: "rgba(240, 242, 245, 0.9)",
                              backdropFilter: "blur(10px)",
                              borderRadius: "8px",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "rgba(221, 224, 229, 1)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                              },
                              "&.Mui-selected": {
                                background: "linear-gradient(135deg, #1877F2 0%, #166FE5 100%)",
                                color: "white",
                                fontWeight: "bold",
                                border: "1px solid rgba(24, 119, 242, 0.6)",
                                boxShadow: "0 4px 12px rgba(24, 119, 242, 0.4)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #166FE5 0%, #145CC9 100%)",
                                  boxShadow: "0 6px 18px rgba(24, 119, 242, 0.55)",
                                },
                              },
                              "&.MuiPaginationItem-ellipsis": {
                                color: "rgba(0, 0, 0, 0.4)",
                                border: "none",
                                background: "transparent",
                                backdropFilter: "none",
                                "&:hover": {
                                  background: "transparent",
                                  transform: "none",
                                  boxShadow: "none",
                                },
                              },
                            },
                          }}
                        />
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          )}
        </MDBox>
      </MDBox>

      {/* Comment Modal */}
      <Dialog
        open={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedPostForComment(null);
          setCommentText("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: whiteText,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            borderBottom: `1px solid #E4E6EB`,
          }}
        >
          <MDTypography variant="h6" fontWeight="bold" sx={{ color: darkText }}>
            Write a comment
          </MDTypography>
          <IconButton
            onClick={() => {
              setCommentModalOpen(false);
              setSelectedPostForComment(null);
              setCommentText("");
            }}
            sx={{
              color: secondaryText,
              "&:hover": {
                backgroundColor: "#F0F2F5",
                color: darkText,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {/* Post Preview */}
          {selectedPostForComment && (
            <MDBox
              sx={{
                backgroundColor: "#F0F2F5",
                borderRadius: "8px",
                p: 2,
                mb: 2,
              }}
            >
              <MDBox display="flex" alignItems="center" mb={1.5}>
                <Avatar
                  src={selectedPerson.profile_image || poe4}
                  alt={selectedPerson.name}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
                <MDTypography variant="body2" fontWeight="600" sx={{ color: darkText }}>
                  {selectedPerson.name}
                </MDTypography>
              </MDBox>
              {selectedPostForComment.text && (
                <MDTypography
                  variant="body2"
                  sx={{
                    color: darkText,
                    fontSize: "0.875rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {selectedPostForComment.text}
                </MDTypography>
              )}
            </MDBox>
          )}

          {/* Comment Input */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F0F2F5",
                "& fieldset": {
                  borderColor: "#E4E6EB",
                },
                "&:hover fieldset": {
                  borderColor: facebookBlue,
                },
                "&.Mui-focused fieldset": {
                  borderColor: facebookBlue,
                },
                "& textarea": {
                  color: darkText,
                },
                "& textarea::placeholder": {
                  color: secondaryText,
                  opacity: 0.7,
                },
              },
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            pt: 1,
            borderTop: `1px solid #E4E6EB`,
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => {
              setCommentModalOpen(false);
              setSelectedPostForComment(null);
              setCommentText("");
            }}
            sx={{
              color: darkText,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#F0F2F5",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Handle comment submission here
              console.log("Comment submitted:", commentText);
              console.log("For post:", selectedPostForComment);
              // You can add API call here to submit the comment
              setCommentModalOpen(false);
              setSelectedPostForComment(null);
              setCommentText("");
            }}
            variant="contained"
            disabled={!commentText.trim()}
            sx={{
              backgroundColor: facebookBlue,
              color: whiteText,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                backgroundColor: "#166FE5",
              },
              "&.Mui-disabled": {
                backgroundColor: "#E4E6EB",
                color: secondaryText,
              },
            }}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setImageGallery([]);
          setCurrentImageIndex(0);
        }}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            boxShadow: "none",
            margin: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            borderRadius: 0,
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
          {/* Close Button */}
          <IconButton
            onClick={() => {
              setImageModalOpen(false);
              setImageGallery([]);
              setCurrentImageIndex(0);
            }}
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              color: "#fff",
              backgroundColor: "rgba(0,0,0,0.7)",
              width: 56,
              height: 56,
              border: "2px solid rgba(255,255,255,0.3)",
              zIndex: 1000,
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "2px solid rgba(255,255,255,0.5)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 32, color: "#fff" }} />
          </IconButton>

          {/* Previous Button */}
          {imageGallery.length > 1 && (
            <IconButton
              onClick={() => {
                setCurrentImageIndex((prev) => (prev === 0 ? imageGallery.length - 1 : prev - 1));
              }}
              sx={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.7)",
                width: 56,
                height: 56,
                border: "2px solid rgba(255,255,255,0.3)",
                zIndex: 1000,
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "2px solid rgba(255,255,255,0.5)",
                },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 32, color: "#fff" }} />
            </IconButton>
          )}

          {/* Next Button */}
          {imageGallery.length > 1 && (
            <IconButton
              onClick={() => {
                setCurrentImageIndex((prev) => (prev === imageGallery.length - 1 ? 0 : prev + 1));
              }}
              sx={{
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.7)",
                width: 56,
                height: 56,
                border: "2px solid rgba(255,255,255,0.3)",
                zIndex: 1000,
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "2px solid rgba(255,255,255,0.5)",
                },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 32, color: "#fff" }} />
            </IconButton>
          )}

          {/* Image Display */}
          {imageGallery.length > 0 && (
            <MDBox
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                px: { xs: 1, sm: 2 },
                py: { xs: 1, sm: 2 },
              }}
            >
              <MDBox
                component="img"
                src={imageGallery[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
                sx={{
                  maxWidth: "calc(100vw - 200px)",
                  maxHeight: "calc(100vh - 100px)",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </MDBox>
          )}

          {/* Image Counter */}
          {imageGallery.length > 1 && (
            <MDBox
              sx={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "#fff",
                px: 2,
                py: 1,
                borderRadius: "20px",
                zIndex: 1000,
              }}
            >
              <MDTypography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                {currentImageIndex + 1} / {imageGallery.length}
              </MDTypography>
            </MDBox>
          )}

          {/* Thumbnail Scrollbar (if more than 1 image) */}
          {imageGallery.length > 1 && (
            <MDBox
              sx={{
                position: "absolute",
                bottom: 80,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
                maxWidth: "90%",
                overflowX: "auto",
                px: 2,
                py: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: "8px",
                zIndex: 1000,
                "&::-webkit-scrollbar": {
                  height: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "3px",
                  "&:hover": {
                    background: "rgba(255,255,255,0.5)",
                  },
                },
              }}
            >
              {imageGallery.map((url, idx) => (
                <MDBox
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: currentImageIndex === idx ? "2px solid #fff" : "2px solid transparent",
                    opacity: currentImageIndex === idx ? 1 : 0.7,
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                    "&:hover": {
                      opacity: 1,
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <MDBox
                    component="img"
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </MDBox>
              ))}
            </MDBox>
          )}
        </MDBox>
      </Dialog>
    </DashboardLayout>
  );
}

export default FBProfile;
