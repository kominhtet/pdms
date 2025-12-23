// src/pages/analysis.js
import { useMemo, useState, useEffect } from "react";
import axios from "axios";

// import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { API_BASE } from "../../config";
import PropTypes from "prop-types";
import pf from "../../assets/images/fb.png";
import CircularProgress from "@mui/material/CircularProgress";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMap,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LabelList,
  Cell, // ✅ Add this import
} from "recharts";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

/* --- Demo data --- */
const commenters = [
  "Nay Aung",
  "Hnin Hnin Wai",
  "Chit Khoon Cho",
  "Wai Wai Nwe",
  "Phyu Hnin Satt",
  "Aung Lay",
  "Aye Myat Thaw",
  "Aye Mya Thandar",
  "Su Wai Hnin",
];

const comments = ["Wow! very beautiful", "Happy Birthday, sister", "Have a safe flight"];

const series7 = [
  { d: "08 May", v: 450 },
  { d: "09 May", v: 300 },
  { d: "10 May", v: 200 },
  { d: "11 May", v: 50 },
  { d: "12 May", v: 80 },
  { d: "13 May", v: 160 },
  { d: "14 May", v: 30 },
];

const series30 = Array.from({ length: 30 }, (_, i) => ({
  d: `${i + 1}`,
  v: Math.round(80 + 60 * Math.sin(i / 5) + (i % 6) * 10),
}));

const series90 = Array.from({ length: 90 }, (_, i) => ({
  d: `${i + 1}`,
  v: Math.round(120 + 80 * Math.sin(i / 7) + (i % 9) * 8),
}));
const GREEN = "#2E5B57";
const TOP_CARD_HEIGHT = 500; // Comments + Post Analytics
const BOTTOM_CARD_HEIGHT = 360; // Geo + Sentiment
const GRID_ROW_GAP = 24; // spacing={3} => 3 * 8px

// Helper function to get color based on sentiment category name
const getSentimentColor = (categoryName) => {
  if (!categoryName) return "#757575"; // Default gray for unknown categories

  const name = categoryName.toLowerCase().trim();

  // Normalize variations: "anti-government", "anti government", "antigovernment" -> "antigovernment"
  const normalizedName = name.replace(/[- ]/g, "");

  // Check for "Post about None" first (most specific)
  if (normalizedName.includes("postaboutnone") || name.includes("none")) {
    return "#757575"; // Gray/Neutral for Post about None
  }

  // Check for Anti-Government categories (more specific, check before general government)
  // Match: "positive" + ("anti" + "government" or "antigovernment")
  const hasAntiGov =
    normalizedName.includes("antigovernment") ||
    (normalizedName.includes("anti") && normalizedName.includes("government"));

  if (normalizedName.includes("positive") && hasAntiGov) {
    return "#F57C00"; // Orange for Positive Post about Anti-Government
  }
  if (normalizedName.includes("negative") && hasAntiGov) {
    return "#2196F3"; // Blue for Negative Post about Anti-Government
  }

  // Check for Government categories (but not anti-government)
  if (normalizedName.includes("positive") && normalizedName.includes("government") && !hasAntiGov) {
    return "#4CAF50"; // Green for Positive Post about Government
  }
  if (normalizedName.includes("negative") && normalizedName.includes("government") && !hasAntiGov) {
    return "#D32F2F"; // Red for Negative Post about Government
  }

  // Fallback to gray if no match
  return "#757575";
};

export default function AnalysisPage({ taskId }) {
  const [commentData, setCommentData] = useState([]);
  const [range, setRange] = useState("7d");

  // Pagination states
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Modal state for commenter comments
  const [commenterModalOpen, setCommenterModalOpen] = useState(false);
  const [selectedCommenter, setSelectedCommenter] = useState(null);
  const [commenterComments, setCommenterComments] = useState([]);
  const [loadingCommenterComments, setLoadingCommenterComments] = useState(false);
  const [commenterPhotoDir, setCommenterPhotoDir] = useState(null);
  const [commenterOffset, setCommenterOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  // Modal state for location posts
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationPosts, setLocationPosts] = useState([]);
  const [loadingLocationPosts, setLoadingLocationPosts] = useState(false);
  const [locationPostsOffset, setLocationPostsOffset] = useState(0);
  const [hasMoreLocationPosts, setHasMoreLocationPosts] = useState(true);
  const [loadingMoreLocationPosts, setLoadingMoreLocationPosts] = useState(false);

  // Modal state for sentiment posts
  const [sentimentModalOpen, setSentimentModalOpen] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [sentimentPosts, setSentimentPosts] = useState([]);
  const [loadingSentimentPosts, setLoadingSentimentPosts] = useState(false);
  const [sentimentPostsOffset, setSentimentPostsOffset] = useState(0);
  const [hasMoreSentimentPosts, setHasMoreSentimentPosts] = useState(true);
  const [loadingMoreSentimentPosts, setLoadingMoreSentimentPosts] = useState(false);

  // Modal state for date posts
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [datePosts, setDatePosts] = useState([]);
  const [loadingDatePosts, setLoadingDatePosts] = useState(false);

  const data = useMemo(
    () => (range === "7d" ? series7 : range === "30d" ? series30 : series90),
    [range]
  );

  const loadComments = async () => {
    if (!taskId || loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/tasks/${taskId}/comment-target-posts/?offset=${offset}&limit=${limit}`
      );

      const newComments = res.data.comments || [];
      setCommentData((prev) => [...prev, ...newComments]);
      setOffset((prev) => prev + limit);

      // Check if we have more comments
      if (
        newComments.length < limit ||
        (res.data.total_count && commentData.length + newComments.length >= res.data.total_count)
      ) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const [mostCommenters, setMostCommenters] = useState([]);
  const [offsetCommenters, setOffsetCommenters] = useState(0);
  const [hasMoreCommenters, setHasMoreCommenters] = useState(true);
  const [loadingCommenters, setLoadingCommenters] = useState(false);
  const commentersLimit = 5;

  const loadMostCommenters = async () => {
    if (!taskId || loadingCommenters || !hasMoreCommenters) return;

    setLoadingCommenters(true);
    try {
      const res = await axios.get(
        `${API_BASE}/top-commenters/${taskId}/?offset=${offsetCommenters}&limit=${commentersLimit}`
      );

      const newData = res.data.results || [];
      setMostCommenters((prev) => [...prev, ...newData]);
      setOffsetCommenters((prev) => prev + commentersLimit);

      if (
        newData.length < commentersLimit ||
        (res.data.total_unique_task_ids &&
          mostCommenters.length + newData.length >= res.data.total_unique_task_ids)
      ) {
        setHasMoreCommenters(false);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingCommenters(false);
  };

  // Load more comments for selected commenter
  const loadMoreCommenterComments = async () => {
    if (!selectedCommenter?.id || !taskId || loadingMoreComments || !hasMoreComments) return;

    setLoadingMoreComments(true);
    try {
      const res = await axios.get(
        `${API_BASE}/tasks/${taskId}/get_comments_by_user/${selectedCommenter.id}/comments/?limit=7&offset=${commenterOffset}`
      );

      if (res.data?.results && res.data.results.length > 0) {
        // Append new comments to existing ones
        setCommenterComments((prev) => {
          const newComments = [...prev, ...res.data.results];
          setCommenterOffset(newComments.length);

          // Check if there are more comments
          const total = res.data?.total || 0;
          setHasMoreComments(newComments.length < total && res.data.results.length === 7);
          return newComments;
        });
      } else {
        setHasMoreComments(false);
      }
    } catch (err) {
      console.error("Error loading more comments:", err);
      setHasMoreComments(false);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const [sentiments, setSentiments] = useState([]);
  const fetchSentiments = async (taskId) => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${taskId}/sentiment-summary/`);
      setSentiments(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const [geoPins, setGeoPins] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchGeoPins = async (taskId) => {
    if (!taskId) return;
    setGeoLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/tasks/${taskId}/locations/?network_id=1&limit=200`);
      setGeoPins(Array.isArray(res.data?.results) ? res.data.results : []);
    } catch (e) {
      console.error("Geo API error:", e);
      setGeoPins([]);
    } finally {
      setGeoLoading(false);
    }
  };

  // Fetch posts for a specific location
  const fetchLocationPosts = async (location, taskId) => {
    if (!location || !taskId) return;

    setLoadingLocationPosts(true);
    setLocationPosts([]);
    setLocationPostsOffset(0);
    setHasMoreLocationPosts(true);

    try {
      // Try different API endpoints
      let posts = [];
      const limit = 10;

      // Try location_id endpoint first
      if (location.location_id) {
        try {
          const res = await axios.get(
            `${API_BASE}/tasks/${taskId}/locations/${location.location_id}/posts/?limit=${limit}&offset=0`
          );
          if (res.data?.results && res.data.results.length > 0) {
            posts = res.data.results;
            // Check if there are more posts
            const total = res.data?.total || res.data?.total_count || 0;
            setHasMoreLocationPosts(
              posts.length === limit && (total === 0 || posts.length < total)
            );
            setLocationPostsOffset(posts.length);
          } else if (res.data?.posts && res.data.posts.length > 0) {
            posts = res.data.posts;
            setHasMoreLocationPosts(posts.length === limit);
            setLocationPostsOffset(posts.length);
          } else {
            setHasMoreLocationPosts(false);
          }
        } catch (apiErr) {
          console.log("Location ID endpoint not available, trying alternative");
          setHasMoreLocationPosts(false);
        }
      }

      // // Fallback: Try querying posts by coordinates
      // if (posts.length === 0 && location.latitude && location.longitude) {
      //   try {
      //     const res = await axios.get(`${API_BASE}/tasks/${taskId}/posts/`, {
      //       params: {
      //         latitude: location.latitude,
      //         longitude: location.longitude,
      //         limit: 50,
      //       },
      //     });
      //     if (res.data?.results && res.data.results.length > 0) {
      //       posts = res.data.results;
      //     }
      //   } catch (coordErr) {
      //     console.log("Coordinate-based query not available");
      //   }
      // }

      setLocationPosts(posts);
    } catch (err) {
      console.error("Error fetching location posts:", err);
      setLocationPosts([]);
      setHasMoreLocationPosts(false);
    } finally {
      setLoadingLocationPosts(false);
    }
  };

  // Load more location posts
  const loadMoreLocationPosts = async () => {
    if (
      !selectedLocation?.location_id ||
      !taskId ||
      loadingMoreLocationPosts ||
      !hasMoreLocationPosts
    )
      return;

    setLoadingMoreLocationPosts(true);
    try {
      const limit = 10;
      const res = await axios.get(
        `${API_BASE}/tasks/${taskId}/locations/${selectedLocation.location_id}/posts/?limit=${limit}&offset=${locationPostsOffset}`
      );

      let newPosts = [];
      if (res.data?.results && res.data.results.length > 0) {
        newPosts = res.data.results;
      } else if (res.data?.posts && res.data.posts.length > 0) {
        newPosts = res.data.posts;
      }

      if (newPosts.length > 0) {
        setLocationPosts((prev) => [...prev, ...newPosts]);
        setLocationPostsOffset((prev) => prev + newPosts.length);

        // Check if there are more posts
        const total = res.data?.total || res.data?.total_count || 0;
        setHasMoreLocationPosts(
          newPosts.length === limit &&
            (total === 0 || locationPosts.length + newPosts.length < total)
        );
      } else {
        setHasMoreLocationPosts(false);
      }
    } catch (err) {
      console.error("Error loading more location posts:", err);
      setHasMoreLocationPosts(false);
    } finally {
      setLoadingMoreLocationPosts(false);
    }
  };

  // Fetch posts for a specific sentiment category
  const fetchSentimentPosts = async (sentimentEntry, taskId) => {
    if (!sentimentEntry || !taskId) return;

    setLoadingSentimentPosts(true);
    setSentimentPosts([]);
    setSentimentPostsOffset(0);
    setHasMoreSentimentPosts(true);

    try {
      let posts = [];
      const limit = 7;

      // Try sentiment category endpoint
      if (sentimentEntry.name) {
        try {
          const sentimentName = encodeURIComponent(sentimentEntry.name);
          console.log("Sentiment Name:", sentimentName);
          const res = await axios.get(
            `${API_BASE}/tasks/${taskId}/sentiment-posts/${encodeURIComponent(
              sentimentName
            )}/?limit=${limit}&offset=0`
          );
          if (res.data?.results && res.data.results.length > 0) {
            posts = res.data.results;
            // Check if there are more posts
            const total = res.data?.total || res.data?.total_count || 0;
            setHasMoreSentimentPosts(
              posts.length === limit && (total === 0 || posts.length < total)
            );
            setSentimentPostsOffset(posts.length);
          } else if (res.data?.posts && res.data.posts.length > 0) {
            posts = res.data.posts;
            setHasMoreSentimentPosts(posts.length === limit);
            setSentimentPostsOffset(posts.length);
          } else {
            setHasMoreSentimentPosts(false);
          }
        } catch (apiErr) {
          console.log("Error fetching sentiment posts:", apiErr);
          setHasMoreSentimentPosts(false);
        }
      }

      setSentimentPosts(posts);
    } catch (err) {
      console.error("Error fetching sentiment posts:", err);
      setSentimentPosts([]);
      setHasMoreSentimentPosts(false);
    } finally {
      setLoadingSentimentPosts(false);
    }
  };

  // Load more sentiment posts
  const loadMoreSentimentPosts = async () => {
    if (!selectedSentiment?.name || !taskId || loadingMoreSentimentPosts || !hasMoreSentimentPosts)
      return;

    setLoadingMoreSentimentPosts(true);
    try {
      const limit = 7;
      const sentimentName = encodeURIComponent(selectedSentiment.name);
      const res = await axios.get(
        `${API_BASE}/tasks/${taskId}/sentiment-posts/${encodeURIComponent(
          sentimentName
        )}/?limit=${limit}&offset=${sentimentPostsOffset}`
      );

      let newPosts = [];
      if (res.data?.results && res.data.results.length > 0) {
        newPosts = res.data.results;
      } else if (res.data?.posts && res.data.posts.length > 0) {
        newPosts = res.data.posts;
      }

      if (newPosts.length > 0) {
        setSentimentPosts((prev) => [...prev, ...newPosts]);
        setSentimentPostsOffset((prev) => prev + newPosts.length);

        // Check if there are more posts
        const total = res.data?.total || res.data?.total_count || 0;
        setHasMoreSentimentPosts(
          newPosts.length === limit &&
            (total === 0 || sentimentPosts.length + newPosts.length < total)
        );
      } else {
        setHasMoreSentimentPosts(false);
      }
    } catch (err) {
      console.error("Error loading more sentiment posts:", err);
      setHasMoreSentimentPosts(false);
    } finally {
      setLoadingMoreSentimentPosts(false);
    }
  };

  // Fetch posts for a specific date
  const fetchDatePosts = async (date, taskId) => {
    if (!date || !taskId) {
      console.log("Missing date or taskId:", { date, taskId });
      return;
    }

    setLoadingDatePosts(true);
    setDatePosts([]);

    try {
      let posts = [];

      // Normalize date format - handle various input formats
      let dateStr;
      if (typeof date === "string") {
        // If it's already a string, use it as-is (might be "2025-11-17" or "2025-12-09")
        dateStr = date;
      } else if (date instanceof Date) {
        // If it's a Date object, convert to ISO string and take date part
        dateStr = date.toISOString().split("T")[0];
      } else {
        // Try to parse as date string
        dateStr = new Date(date).toISOString().split("T")[0];
      }

      console.log("Fetching posts for date:", dateStr);

      // Try different API endpoints for date-based posts
      try {
        // Option 1: Query posts by date parameter
        const res = await axios.get(`${API_BASE}/tasks/${taskId}/posts/`, {
          params: {
            date: dateStr,
            limit: 100,
          },
        });
        console.log("Posts API response:", res.data);
        if (res.data?.results && res.data.results.length > 0) {
          posts = res.data.results;
        } else if (res.data?.posts && res.data.posts.length > 0) {
          posts = res.data.posts;
        } else if (Array.isArray(res.data) && res.data.length > 0) {
          posts = res.data;
        }
      } catch (err1) {
        console.log("Option 1 failed, trying option 2:", err1.message);
        // Option 2: Try post-counts endpoint with date filter
        try {
          const res = await axios.get(`${API_BASE}/tasks/${taskId}/post-counts/`, {
            params: {
              date: dateStr,
              limit: 100,
            },
          });
          console.log("Post-counts API response:", res.data);
          if (res.data?.results && res.data.results.length > 0) {
            // If post-counts returns posts, use them
            posts = res.data.results;
          } else if (res.data?.posts && res.data.posts.length > 0) {
            posts = res.data.posts;
          } else if (Array.isArray(res.data) && res.data.length > 0) {
            posts = res.data;
          }
        } catch (err2) {
          console.log("Option 2 failed, trying option 3:", err2.message);
          // Option 3: Try filtering all posts by date
          try {
            const res = await axios.get(`${API_BASE}/tasks/${taskId}/posts/`, {
              params: {
                limit: 200, // Get more posts to filter
              },
            });
            if (res.data?.results && Array.isArray(res.data.results)) {
              // Filter posts by matching date
              posts = res.data.results.filter((post) => {
                const postDate = post.date || post.created_at || post.post_date;
                if (!postDate) return false;
                const postDateStr = new Date(postDate).toISOString().split("T")[0];
                return postDateStr === dateStr;
              });
            }
          } catch (err3) {
            console.log("All date-based post endpoints unavailable:", err3.message);
          }
        }
      }

      console.log("Final posts found:", posts.length);
      setDatePosts(posts);
    } catch (err) {
      console.error("Error fetching date posts:", err);
      setDatePosts([]);
    } finally {
      setLoadingDatePosts(false);
    }
  };

  const [postSeries, setPostSeries] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [totalPostCount, setTotalPostCount] = useState(0);

  const rangeToDays = (r) => (r === "7d" ? 7 : r === "30d" ? 30 : 90);

  const fetchPostCounts = async (taskId, r) => {
    if (!taskId) return;

    setLoadingSeries(true);
    try {
      const days = rangeToDays(r);
      const res = await axios.get(
        `${API_BASE}/tasks/${taskId}/post-counts/?range=${days}&skip_zero=1`
      );

      const rows = Array.isArray(res.data?.results) ? res.data.results : [];
      setPostSeries(rows.map((x) => ({ d: x.date, v: x.count })));
      // Store total_count from API response
      setTotalPostCount(res.data?.total_count || 0);
    } catch (e) {
      console.error(e);
      setPostSeries([]);
      setTotalPostCount(0);
    } finally {
      setLoadingSeries(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;

    // Reset comments
    setCommentData([]);
    setOffset(0);
    setHasMore(true);

    // Reset most commenters
    setMostCommenters([]);
    setOffsetCommenters(0);
    setHasMoreCommenters(true);

    // Reset sentiments
    setSentiments([]);

    // Reset geo pins
    setGeoPins([]);
    setGeoLoading(false);

    // Reset post analytics series
    setPostSeries([]); // ✅ NEW
    setLoadingSeries(false); // ✅ NEW
    setTotalPostCount(0); // ✅ NEW

    // Load first batch
    loadComments();
    loadMostCommenters();
    fetchSentiments(taskId);
    fetchGeoPins(taskId);

    // Load post analytics from API (based on current range)
    fetchPostCounts(taskId, range); // ✅ NEW
  }, [taskId]);

  // Fetch post counts when range changes
  useEffect(() => {
    if (!taskId) return;
    fetchPostCounts(taskId, range);
  }, [range, taskId]);

  function FitBounds({ pins }) {
    const map = useMap();

    useEffect(() => {
      if (!pins || pins.length === 0) return;

      const bounds = L.latLngBounds(pins.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }, [pins, map]);

    return null;
  }

  FitBounds.propTypes = {
    pins: PropTypes.arrayOf(
      PropTypes.shape({
        location_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
        location_name: PropTypes.string,
        township: PropTypes.string,
        district: PropTypes.string,
        state_division: PropTypes.string,
      })
    ),
  };

  FitBounds.defaultProps = {
    pins: [],
  };

  // Custom dot component for Line chart with click handler
  const CustomDot = ({ cx, cy, payload }) => {
    const handleClick = (e) => {
      e.stopPropagation();
      if (payload && payload.d) {
        console.log("Date clicked:", payload.d, "Type:", typeof payload.d, "Value:", payload.v);
        setSelectedDate(payload.d);
        setDateModalOpen(true);
        fetchDatePosts(payload.d, taskId);
      }
    };

    return (
      <g onClick={handleClick} style={{ cursor: "pointer" }}>
        {/* Larger invisible circle for easier clicking */}
        <circle cx={cx} cy={cy} r={8} fill="transparent" />
        {/* Visible dot */}
        <circle cx={cx} cy={cy} r={3} fill={GREEN} />
      </g>
    );
  };

  CustomDot.propTypes = {
    cx: PropTypes.number,
    cy: PropTypes.number,
    payload: PropTypes.shape({
      d: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      v: PropTypes.number,
    }),
  };

  return (
    <MDBox mt={2}>
      {/* MASTER LAYOUT: Top row with Most Commenter and right cards */}
      <Grid container spacing={3} alignItems="stretch">
        {/* LEFT: Most Commenter (fixed rail) */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              height: 500, // 👉 Same height as "Comments to other users post"
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <MDBox
              sx={{
                backgroundColor: GREEN,
                borderRadius: 2,
                mx: 2,
                mt: 2,
                p: 1.2,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#fff" }}>
                Most Commenter
              </MDTypography>
            </MDBox>

            <Divider sx={{ my: 1, flexShrink: 0 }} />

            {/* SCROLLABLE LIST AREA */}
            <MDBox
              sx={{
                flexGrow: 1, // take all remaining space
                minHeight: 0, // IMPORTANT: allow it to shrink so scroll works
                px: 1,
                pb: 1,
                overflowY: "auto",
                overflowX: "hidden",

                // Fancy scrollbar
                scrollbarWidth: "thin",
                scrollbarColor: `rgba(0, 0, 0, 0.3) transparent`,
                "&::-webkit-scrollbar": { width: "10px" },
                "&::-webkit-scrollbar-track": {
                  background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
                  borderRadius: "10px",
                  boxShadow: "inset 0 0 6px rgba(0,0,0,0.1)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: `linear-gradient(180deg, ${GREEN} 0%, ${alpha(GREEN, 0.7)} 100%)`,
                  borderRadius: "10px",
                  border: "2px solid #f8f9fa",
                  backgroundClip: "padding-box",
                  "&:hover": {
                    background: `linear-gradient(180deg, ${alpha(GREEN, 0.9)} 0%, ${alpha(
                      GREEN,
                      0.6
                    )} 100%)`,
                  },
                },
              }}
            >
              <List dense>
                {mostCommenters.map((c) => (
                  <ListItem
                    key={c.id}
                    onClick={async () => {
                      setSelectedCommenter(c);
                      setCommenterModalOpen(true);
                      setLoadingCommenterComments(true);
                      setCommenterComments([]);
                      setCommenterPhotoDir(null);
                      setCommenterOffset(0);
                      setHasMoreComments(true);

                      try {
                        // Try to fetch comments from the new API endpoint
                        if (c.id && taskId) {
                          try {
                            const res = await axios.get(
                              `${API_BASE}/tasks/${taskId}/get_comments_by_user/${c.id}/comments/?limit=7&offset=0`
                            );
                            // Store photo_dir from API response
                            if (res.data?.photo_dir) {
                              setCommenterPhotoDir(res.data.photo_dir);
                            }
                            // API returns comments in 'results' array
                            if (res.data?.results && res.data.results.length > 0) {
                              // Set the fetched comments to state
                              setCommenterComments(res.data.results);
                              setCommenterOffset(res.data.results.length);
                              // Check if there are more comments
                              const total = res.data?.total || 0;
                              setHasMoreComments(
                                res.data.results.length === 7 && total > res.data.results.length
                              );
                              setLoadingCommenterComments(false);
                              return;
                            } else if (res.data?.comments && res.data.comments.length > 0) {
                              // Fallback: check for 'comments' property
                              setCommenterComments(res.data.comments);
                              setCommenterOffset(res.data.comments.length);
                              setHasMoreComments(false);
                              setLoadingCommenterComments(false);
                              return;
                            }
                          } catch (apiErr) {
                            console.log(
                              "API endpoint not available, filtering from existing data",
                              apiErr
                            );
                          }
                        }

                        // Fallback: Filter comments by matching profile photo URL
                        const filtered = commentData.filter((comment) => {
                          const commenterPhoto = comment.commenter_profile_photo || "";
                          const commenterPhotoDir = c.photo_dir || "";
                          if (commenterPhoto && commenterPhotoDir) {
                            return commenterPhoto === commenterPhotoDir;
                          }
                          return false;
                        });

                        setCommenterComments(filtered);
                        setHasMoreComments(false);
                      } catch (err) {
                        console.error("Error loading commenter comments:", err);
                        setCommenterComments([]);
                        setHasMoreComments(false);
                      } finally {
                        setLoadingCommenterComments(false);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: alpha(GREEN, 0.06) },
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={c.photo_dir || pf}
                        alt={c.name}
                        sx={{ width: 48, height: 48, mr: 1.5 }}
                      />
                      <MDTypography
                        component="span"
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {c.name}
                      </MDTypography>
                    </Box>
                    <MDTypography variant="body2" color="textSecondary">
                      {c.count}
                    </MDTypography>
                  </ListItem>
                ))}
              </List>
            </MDBox>

            {/* Footer */}
            <MDBox
              sx={{
                borderTop: "1px solid #eee",
                py: 1,
                px: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0, // header/ footer မကျုံ့အောင်
              }}
            >
              {hasMoreCommenters ? (
                loadingCommenters ? (
                  <CircularProgress size={24} color="info" />
                ) : (
                  <MDTypography
                    variant="button"
                    color="info"
                    sx={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={loadMostCommenters}
                  >
                    Load More
                  </MDTypography>
                )
              ) : (
                <MDTypography variant="caption" color="textSecondary">
                  No more commenters
                </MDTypography>
              )}
            </MDBox>
          </Card>
        </Grid>

        {/* RIGHT: Top row cards */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3} columns={12}>
            {/* TOP LEFT: Activity */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  height: 500, // fixed card height
                  display: "flex",
                  flexDirection: "column",
                  p: 2,
                }}
              >
                {/* <MDTypography mt={2} variant="h6" fontWeight="bold" color="text">
                  Comments to other users post
                </MDTypography> */}
                <MDTypography variant="h6" fontWeight="bold" color="darkText">
                  Comments to other users post
                </MDTypography>

                {/* Scrollable comment list */}
                <MDBox
                  mt={1}
                  sx={{
                    flexGrow: 1,
                    borderRadius: 2,
                    backgroundColor: "#e9ecef",
                    p: 2,
                    overflowY: "auto",
                    maxHeight: 400,
                    "&::-webkit-scrollbar": { width: "8px" },
                    "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
                    "&::-webkit-scrollbar-thumb": { background: "#4CAF50", borderRadius: "4px" },
                    "&::-webkit-scrollbar-thumb:hover": { background: "#45a049" },
                  }}
                >
                  {commentData.map((item, i) => {
                    const commentText = item.comment_text; // <-- define commentText
                    const account = item.target_accounts?.[0]; // <-- define account
                    const sourceId = account?.source_id;
                    const link = item.target_post_fb_post_link;

                    return (
                      <MDBox
                        key={item.comment_id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: alpha("#4CAF50", 0.15),
                          borderRadius: 2,
                          p: 1.5,
                          mb: i === commentData.length - 1 ? 0 : 1,
                        }}
                      >
                        <MDBox display="flex" alignItems="center">
                          <Avatar src={item?.commenter_profile_photo || pf} sx={{ mr: 1.5 }} />
                          <MDBox>
                            <MDTypography variant="body2" color="darkText">
                              {commentText}
                            </MDTypography>
                            <MDBox display="flex" alignItems="center" gap={1}>
                              <Avatar
                                src={account?.profile_photo || pf}
                                alt={sourceId || "Account"}
                                sx={{ width: 20, height: 20 }}
                              />
                              <MDTypography variant="caption" color="secondary">
                                {sourceId}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </MDBox>

                        <Link
                          href={link}
                          underline="hover"
                          color="danger"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </Link>
                      </MDBox>
                    );
                  })}
                </MDBox>

                {/* Load More Button outside scrollable box */}
                {hasMore && (
                  <MDBox mt={1} display="flex" justifyContent="center" alignItems="center">
                    {loading ? (
                      <CircularProgress size={24} color="info" />
                    ) : (
                      <MDTypography
                        variant="button"
                        color="info"
                        sx={{ cursor: "pointer", fontWeight: "bold" }}
                        onClick={loadComments}
                      >
                        Load More
                      </MDTypography>
                    )}
                  </MDBox>
                )}
              </Card>
            </Grid>

            {/* TOP RIGHT: Post Analytics */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <MDBox p={2} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <MDTypography variant="h6" fontWeight="bold" color="darkText">
                    Post Analytics Report
                  </MDTypography>

                  <MDBox display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
                    <MDTypography variant="caption" color="darkText">
                      <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
                        {totalPostCount.toLocaleString()}
                      </Box>{" "}
                      posts
                    </MDTypography>

                    <ToggleButtonGroup
                      value={range}
                      exclusive
                      size="small"
                      disabled={loadingSeries}
                      onChange={(_, val) => val && setRange(val)}
                    >
                      <ToggleButton value="7d">7 DAYS</ToggleButton>
                      <ToggleButton value="30d">30 DAYS</ToggleButton>
                      <ToggleButton value="90d">90 DAYS</ToggleButton>
                    </ToggleButtonGroup>
                  </MDBox>

                  <MDBox mt={1.5} sx={{ flexGrow: 1 }}>
                    {loadingSeries ? (
                      <MDBox
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <CircularProgress size={24} color="info" />
                      </MDBox>
                    ) : postSeries.length === 0 ? (
                      <MDTypography
                        variant="body2"
                        color="text"
                        sx={{ textAlign: "center", mt: 6, color: "#666" }}
                      >
                        No post data
                      </MDTypography>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={postSeries}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => [value === 1 ? "1 post" : `${value} posts`]}
                          />
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={GREEN}
                            strokeWidth={2}
                            dot={<CustomDot />}
                            activeDot={{ r: 5, cursor: "pointer" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* BOTTOM RIGHT: Sentiment (md=5) */}
          </Grid>
        </Grid>
        {/* BOTTOM LEFT: Geo (md=7) */}
        <Grid item xs={12} md={7.5}>
          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <MDBox p={2} sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <MDTypography variant="h6" fontWeight="bold" color="darkText">
                Geo Location
              </MDTypography>
              <Divider sx={{ my: 1 }} />

              <MDBox
                mt={2}
                sx={{
                  height: 350, // IMPORTANT: gives Leaflet a real height
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <MapContainer
                  key={taskId || "default"} // Force remount when taskId changes to clear pins
                  center={[16.8661, 96.1951]} // fallback center
                  zoom={12}
                  style={{ width: "100%", height: "100%" }}
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                      />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Satellite View">
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles © Esri"
                      />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="Terrain">
                      <TileLayer
                        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.jpg"
                        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank" rel="noreferrer">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank" rel="noreferrer">Stamen</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                        maxZoom={20}
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>

                  {/* ✅ auto fit to pins */}
                  <FitBounds pins={geoPins} />

                  {/* ✅ dynamic pins */}
                  {geoPins.map((p) => (
                    <Marker key={p.location_id} position={[p.latitude, p.longitude]}>
                      <LeafletTooltip>{p.location_name || "Unknown location"}</LeafletTooltip>
                      <Popup>
                        <div>
                          <b>{p.location_name || "Unknown location"}</b>
                          <br />
                          {p.township || ""} {p.district || ""} {p.state_division || ""}
                          <br />
                          {p.latitude}, {p.longitude}
                          <br />
                          <button
                            onClick={() => {
                              setSelectedLocation(p);
                              setLocationModalOpen(true);
                              fetchLocationPosts(p, taskId);
                            }}
                            style={{
                              marginTop: "8px",
                              padding: "6px 12px",
                              backgroundColor: GREEN,
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = alpha(GREEN, 0.8);
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = GREEN;
                            }}
                          >
                            View Posts
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </MDBox>

              <MDBox mt={1} display="flex" gap={1} flexWrap="wrap">
                <Chip
                  size="small"
                  label={geoLoading ? "Loading..." : `${geoPins.length} pins`}
                  sx={{ bgcolor: alpha(GREEN, 0.08) }}
                />

                <Chip size="small" label="Updated just now" variant="outlined" />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} md={4.5}>
          <Card
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              height: "100%", // ✅ Same height as geo location card
              display: "flex",
              flexDirection: "column",
            }}
          >
            <MDBox p={2} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <MDTypography variant="h6" fontWeight="bold" color="darkText">
                All Post&apos;s Sentiment
              </MDTypography>

              {/* Legend - separate box below title */}
              {sentiments.length > 0 && (
                <MDBox
                  sx={{
                    mt: 1.5,
                    mb: 1,
                    backgroundColor: "#F8F9FA",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 1.5,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <MDBox display="flex" flexWrap="wrap" gap={1.5}>
                    {sentiments.map((entry, index) => {
                      // ✅ API ကလာတဲ့ label text ကို သုံးမယ်
                      const description = entry.name || `Category ${index + 1}`;
                      const color = getSentimentColor(entry.name);

                      return (
                        <MDBox
                          key={`legend-${index}`}
                          display="flex"
                          alignItems="center"
                          gap={0.75}
                        >
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: "2px",
                              backgroundColor: color,
                              flexShrink: 0,
                              border: "1px solid rgba(0,0,0,0.1)",
                            }}
                          />
                          <MDTypography
                            variant="caption"
                            color="textSecondary"
                            sx={{
                              lineHeight: 1.2,
                              fontSize: "0.75rem",
                              wordBreak: "break-word",
                            }}
                          >
                            {description}
                          </MDTypography>
                        </MDBox>
                      );
                    })}
                  </MDBox>
                </MDBox>
              )}

              <Divider sx={{ my: 1 }} />

              <MDBox
                mt={2}
                sx={{
                  flexGrow: 1,
                  minHeight: 240, // ✅ Adjusted minHeight
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sentiments}
                    margin={{ top: 20, right: 10, left: 0, bottom: 10 }} // ✅ Bottom margin လျှော့
                    barCategoryGap={10}
                    barSize={40}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    {/* XAxis ကို ဖျောက်ထား - height လျှော့ */}
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tick={false}
                      height={5} // ✅ Very small height
                    />

                    <YAxis
                      tick={{ fontSize: 11, fill: "#666" }}
                      width={40}
                      allowDecimals={false}
                      axisLine={{ stroke: "#ddd" }}
                      tickLine={false}
                    />

                    <Tooltip
                      cursor={{ fill: alpha("#e0e0e0", 0.3) }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: `1px solid #ddd`,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value.toLocaleString()} posts`]}
                      labelFormatter={(label) => label}
                    />

                    {/* Single Bar with different colors */}
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      barSize={40}
                      onClick={(data, index) => {
                        if (sentiments[index]) {
                          setSelectedSentiment(sentiments[index]);
                          setSentimentModalOpen(true);
                          fetchSentimentPosts(sentiments[index], taskId);
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {sentiments.map((entry, index) => {
                        const color = getSentimentColor(entry.name);

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={color}
                            fillOpacity={0.8}
                            style={{ cursor: "pointer" }}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </MDBox>

              {/* Total posts summary */}
              <MDBox
                mt={1}
                display="flex"
                justifyContent="center"
                sx={{ flexShrink: 0 }} // ✅ မကျုံ့အောင်
              >
                <Chip
                  size="small"
                  label={`Total: ${sentiments
                    .reduce((sum, item) => sum + (item.value || 0), 0)
                    .toLocaleString()}`}
                  sx={{
                    bgcolor: alpha("#2E5B57", 0.1),
                    fontWeight: "medium",
                    fontSize: "0.75rem",
                  }}
                />
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Commenter Comments Modal */}
      <Dialog
        open={commenterModalOpen}
        onClose={() => {
          setCommenterModalOpen(false);
          setSelectedCommenter(null);
          setCommenterComments([]);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            maxHeight: "90vh",
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
          <MDBox display="flex" alignItems="center" gap={1.5}>
            {selectedCommenter && (
              <>
                <Avatar
                  src={selectedCommenter.photo_dir || pf}
                  alt={selectedCommenter.name}
                  sx={{ width: 40, height: 40 }}
                />
                <MDBox>
                  {selectedCommenter.link ||
                  (commenterComments.length > 0 && commenterComments[0]?.user_link) ? (
                    <Link
                      href={selectedCommenter.link || commenterComments[0]?.user_link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      <MDTypography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          color: GREEN,
                          cursor: "pointer",
                          "&:hover": { color: alpha(GREEN, 0.8) },
                        }}
                      >
                        {selectedCommenter.name}
                      </MDTypography>
                    </Link>
                  ) : (
                    <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
                      {selectedCommenter.name}
                    </MDTypography>
                  )}
                  <MDTypography variant="caption" sx={{ color: "#666" }}>
                    {selectedCommenter.count} comments
                  </MDTypography>
                </MDBox>
              </>
            )}
          </MDBox>
          <IconButton
            onClick={() => {
              setCommenterModalOpen(false);
              setSelectedCommenter(null);
              setCommenterComments([]);
              setCommenterPhotoDir(null);
              setCommenterOffset(0);
              setHasMoreComments(true);
            }}
            sx={{
              color: "#666",
              "&:hover": {
                backgroundColor: "#F0F2F5",
                color: "#333",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 3,
            pb: 2,
            px: 2,
            overflowY: "auto",
            maxHeight: "calc(90vh - 140px)",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb": { background: GREEN, borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb:hover": { background: alpha(GREEN, 0.8) },
          }}
        >
          {loadingCommenterComments ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={32} sx={{ color: GREEN }} />
            </MDBox>
          ) : commenterComments.length === 0 ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <MDTypography variant="body2" sx={{ color: "#666" }}>
                No comments found for this commenter.
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox>
              {commenterComments.map((item, i) => {
                const commentText = item.content || item.comment_text || "";
                const userName = item.user_name || "";
                const postLink = item.post_fb_link || item.target_post_fb_post_link || "";
                const userLink = item.user_link || "";

                return (
                  <MDBox
                    key={`comment-${item.comment_id}-${i}`}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      backgroundColor: alpha(GREEN, 0.08),
                      borderRadius: 2,
                      p: 2,
                      mb: i === commenterComments.length - 1 ? 0 : 2,
                    }}
                  >
                    <MDBox display="flex" alignItems="flex-start" sx={{ flex: 1 }}>
                      <Avatar
                        src={
                          commenterPhotoDir ||
                          item?.photo_dir ||
                          item?.commenter_profile_photo ||
                          selectedCommenter?.photo_dir ||
                          pf
                        }
                        sx={{ width: 40, height: 40, mr: 1.5, flexShrink: 0 }}
                        onError={(e) => {
                          // Fallback to default image if photo fails to load
                          e.target.src = pf;
                        }}
                      />
                      <MDBox sx={{ flex: 1 }}>
                        {userName && (
                          <Link
                            href={userLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            <MDTypography
                              variant="body2"
                              fontWeight="bold"
                              sx={{
                                color: GREEN,
                                mb: 0.5,
                                cursor: "pointer",
                                "&:hover": { color: alpha(GREEN, 0.8) },
                              }}
                            >
                              {userName}
                            </MDTypography>
                          </Link>
                        )}
                        <MDTypography
                          variant="body2"
                          sx={{ color: "#333", mb: 1, lineHeight: 1.5 }}
                        >
                          {commentText}
                        </MDTypography>
                        {item.date && (
                          <MDTypography
                            variant="caption"
                            sx={{ color: "#999", mt: 0.5, display: "block" }}
                          >
                            {new Date(item.date).toLocaleString()}
                          </MDTypography>
                        )}
                      </MDBox>
                    </MDBox>
                    {postLink && (
                      <Link
                        href={postLink}
                        underline="hover"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          ml: 2,
                          color: GREEN,
                          fontWeight: 600,
                          flexShrink: 0,
                          "&:hover": { color: alpha(GREEN, 0.8) },
                        }}
                      >
                        View Post
                      </Link>
                    )}
                  </MDBox>
                );
              })}
            </MDBox>
          )}

          {/* Load More Button */}
          {!loadingCommenterComments && commenterComments.length > 0 && hasMoreComments && (
            <MDBox
              sx={{
                borderTop: `1px solid #E4E6EB`,
                pt: 2,
                pb: 2,
                px: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loadingMoreComments ? (
                <CircularProgress size={24} sx={{ color: GREEN }} />
              ) : (
                <MDTypography
                  variant="button"
                  sx={{
                    color: GREEN,
                    fontWeight: "bold",
                    cursor: "pointer",
                    "&:hover": { color: alpha(GREEN, 0.8), textDecoration: "underline" },
                  }}
                  onClick={loadMoreCommenterComments}
                >
                  Load More
                </MDTypography>
              )}
            </MDBox>
          )}
        </DialogContent>
      </Dialog>

      {/* Location Posts Modal */}
      <Dialog
        open={locationModalOpen}
        onClose={() => {
          setLocationModalOpen(false);
          setSelectedLocation(null);
          setLocationPosts([]);
          setLocationPostsOffset(0);
          setHasMoreLocationPosts(true);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            maxHeight: "90vh",
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
          <MDBox>
            <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
              {selectedLocation?.location_name || "Location Posts"}
            </MDTypography>
            {selectedLocation && (
              <MDTypography variant="caption" sx={{ color: "#666", display: "block", mt: 0.5 }}>
                {selectedLocation.township || ""} {selectedLocation.district || ""}{" "}
                {selectedLocation.state_division || ""}
                {selectedLocation.latitude && selectedLocation.longitude && (
                  <>
                    {" "}
                    · {selectedLocation.latitude}, {selectedLocation.longitude}
                  </>
                )}
              </MDTypography>
            )}
          </MDBox>
          <IconButton
            onClick={() => {
              setLocationModalOpen(false);
              setSelectedLocation(null);
              setLocationPosts([]);
              setLocationPostsOffset(0);
              setHasMoreLocationPosts(true);
            }}
            sx={{
              color: "#666",
              "&:hover": {
                backgroundColor: "#F0F2F5",
                color: "#333",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 3,
            pb: 2,
            px: 2,
            overflowY: "auto",
            maxHeight: "calc(90vh - 140px)",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb": { background: GREEN, borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb:hover": { background: alpha(GREEN, 0.8) },
          }}
        >
          {loadingLocationPosts ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={32} sx={{ color: GREEN }} />
            </MDBox>
          ) : locationPosts.length === 0 ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <MDTypography variant="body2" sx={{ color: "#666" }}>
                No posts found for this location.
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox>
              {locationPosts.map((post, i) => {
                const postText = post.text || post.content || "";
                const postDate = post.date || post.created_at || "";
                const postLink = post.fb_post_link || "";
                const postPhotos = post.photos || [];
                const likes = post.likes || 0;
                const comments = post.comments || 0;
                const shares = post.shares || 0;

                return (
                  <MDBox
                    key={post.id || post.content_id || i}
                    sx={{
                      backgroundColor: alpha(GREEN, 0.05),
                      borderRadius: 2,
                      p: 2,
                      mb: i === locationPosts.length - 1 ? 0 : 2,
                      border: `1px solid ${alpha(GREEN, 0.1)}`,
                    }}
                  >
                    {/* Post Header */}
                    <MDBox display="flex" alignItems="center" mb={1.5}>
                      <Avatar
                        src={post.profile_image || post.profile_photo || pf}
                        sx={{ width: 40, height: 40, mr: 1.5 }}
                      />
                      <MDBox sx={{ flex: 1 }}>
                        <MDTypography variant="body2" fontWeight="600" sx={{ color: "#333" }}>
                          {post.user_name || post.name || "Unknown User"}
                        </MDTypography>
                        {postDate && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            {new Date(postDate).toLocaleString()}
                          </MDTypography>
                        )}
                      </MDBox>
                    </MDBox>

                    {/* Post Text */}
                    {postText && (
                      <MDTypography
                        variant="body2"
                        sx={{ color: "#333", mb: postPhotos.length > 0 ? 1.5 : 0, lineHeight: 1.6 }}
                      >
                        {postText}
                      </MDTypography>
                    )}

                    {/* Post Images */}
                    {postPhotos.length > 0 && (
                      <MDBox
                        sx={{
                          display: "grid",
                          gridTemplateColumns: postPhotos.length === 1 ? "1fr" : "repeat(2, 1fr)",
                          gap: 1,
                          mt: 1.5,
                          mb: 1.5,
                        }}
                      >
                        {postPhotos.slice(0, 4).map((photoUrl, idx) => (
                          <MDBox
                            key={idx}
                            component="img"
                            src={photoUrl}
                            alt={`Post image ${idx + 1}`}
                            sx={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ))}
                      </MDBox>
                    )}

                    {/* Post Stats */}
                    {(likes > 0 || comments > 0 || shares > 0) && (
                      <MDBox
                        display="flex"
                        alignItems="center"
                        gap={2}
                        mt={1.5}
                        sx={{ borderTop: `1px solid ${alpha(GREEN, 0.1)}`, pt: 1.5 }}
                      >
                        {likes > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            👍 {likes} likes
                          </MDTypography>
                        )}
                        {comments > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            💬 {comments} comments
                          </MDTypography>
                        )}
                        {shares > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            🔄 {shares} shares
                          </MDTypography>
                        )}
                      </MDBox>
                    )}

                    {/* Post Link */}
                    {postLink && (
                      <MDBox mt={1.5}>
                        <Link
                          href={postLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: GREEN,
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            "&:hover": { color: alpha(GREEN, 0.8) },
                          }}
                        >
                          View Original Post →
                        </Link>
                      </MDBox>
                    )}
                  </MDBox>
                );
              })}
            </MDBox>
          )}

          {/* Load More Button */}
          {!loadingLocationPosts && locationPosts.length > 0 && hasMoreLocationPosts && (
            <MDBox
              sx={{
                borderTop: `1px solid #E4E6EB`,
                pt: 2,
                pb: 2,
                px: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loadingMoreLocationPosts ? (
                <CircularProgress size={24} sx={{ color: GREEN }} />
              ) : (
                <MDTypography
                  variant="button"
                  sx={{
                    color: GREEN,
                    fontWeight: "bold",
                    cursor: "pointer",
                    "&:hover": { color: alpha(GREEN, 0.8), textDecoration: "underline" },
                  }}
                  onClick={loadMoreLocationPosts}
                >
                  Load More
                </MDTypography>
              )}
            </MDBox>
          )}
        </DialogContent>
      </Dialog>

      {/* Sentiment Posts Modal */}
      <Dialog
        open={sentimentModalOpen}
        onClose={() => {
          setSentimentModalOpen(false);
          setSelectedSentiment(null);
          setSentimentPosts([]);
          setSentimentPostsOffset(0);
          setHasMoreSentimentPosts(true);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            maxHeight: "90vh",
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
          <MDBox>
            <MDBox display="flex" alignItems="center" gap={1.5}>
              {selectedSentiment && (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "4px",
                    backgroundColor: getSentimentColor(selectedSentiment.name),
                    flexShrink: 0,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                />
              )}
              <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
                {selectedSentiment?.name || "Sentiment Posts"}
              </MDTypography>
            </MDBox>
            {selectedSentiment && (
              <MDTypography variant="caption" sx={{ color: "#666", display: "block", mt: 0.5 }}>
                {selectedSentiment.value || 0} posts in this category
              </MDTypography>
            )}
          </MDBox>
          <IconButton
            onClick={() => {
              setSentimentModalOpen(false);
              setSelectedSentiment(null);
              setSentimentPosts([]);
              setSentimentPostsOffset(0);
              setHasMoreSentimentPosts(true);
            }}
            sx={{
              color: "#666",
              "&:hover": {
                backgroundColor: "#F0F2F5",
                color: "#333",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 3,
            pb: 2,
            px: 2,
            overflowY: "auto",
            maxHeight: "calc(90vh - 140px)",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb": { background: GREEN, borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb:hover": { background: alpha(GREEN, 0.8) },
          }}
        >
          {loadingSentimentPosts ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={32} sx={{ color: GREEN }} />
            </MDBox>
          ) : sentimentPosts.length === 0 ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <MDTypography variant="body2" sx={{ color: "#666" }}>
                No posts found for this sentiment category.
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox>
              {sentimentPosts.map((post, i) => {
                const postText = post.text || post.content || "";
                const postDate = post.date || post.created_at || "";
                const postLink = post.fb_post_link || "";
                const postPhotos = post.photos || [];
                const likes = post.likes || 0;
                const comments = post.comments || 0;
                const shares = post.shares || 0;
                const sentimentColor = selectedSentiment
                  ? getSentimentColor(selectedSentiment.name)
                  : GREEN;

                return (
                  <MDBox
                    key={post.id || post.content_id || i}
                    sx={{
                      backgroundColor: alpha(sentimentColor, 0.05),
                      borderRadius: 2,
                      p: 2,
                      mb: i === sentimentPosts.length - 1 ? 0 : 2,
                      border: `1px solid ${alpha(sentimentColor, 0.1)}`,
                    }}
                  >
                    {/* Post Header */}
                    <MDBox display="flex" alignItems="center" mb={1.5}>
                      <Avatar
                        src={post.profile_image || post.profile_photo || pf}
                        sx={{ width: 40, height: 40, mr: 1.5 }}
                      />
                      <MDBox sx={{ flex: 1 }}>
                        <MDTypography variant="body2" fontWeight="600" sx={{ color: "#333" }}>
                          {post.user_name || post.name || "Unknown User"}
                        </MDTypography>
                        {postDate && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            {new Date(postDate).toLocaleString()}
                          </MDTypography>
                        )}
                      </MDBox>
                    </MDBox>

                    {/* Post Text */}
                    {postText && (
                      <MDTypography
                        variant="body2"
                        sx={{ color: "#333", mb: postPhotos.length > 0 ? 1.5 : 0, lineHeight: 1.6 }}
                      >
                        {postText}
                      </MDTypography>
                    )}

                    {/* Post Images */}
                    {postPhotos.length > 0 && (
                      <MDBox
                        sx={{
                          display: "grid",
                          gridTemplateColumns: postPhotos.length === 1 ? "1fr" : "repeat(2, 1fr)",
                          gap: 1,
                          mt: 1.5,
                          mb: 1.5,
                        }}
                      >
                        {postPhotos.slice(0, 4).map((photoUrl, idx) => (
                          <MDBox
                            key={idx}
                            component="img"
                            src={photoUrl}
                            alt={`Post image ${idx + 1}`}
                            sx={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ))}
                      </MDBox>
                    )}

                    {/* Post Stats */}
                    {(likes > 0 || comments > 0 || shares > 0) && (
                      <MDBox
                        display="flex"
                        alignItems="center"
                        gap={2}
                        mt={1.5}
                        sx={{ borderTop: `1px solid ${alpha(sentimentColor, 0.1)}`, pt: 1.5 }}
                      >
                        {likes > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            👍 {likes} likes
                          </MDTypography>
                        )}
                        {comments > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            💬 {comments} comments
                          </MDTypography>
                        )}
                        {shares > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            🔄 {shares} shares
                          </MDTypography>
                        )}
                      </MDBox>
                    )}

                    {/* Post Link */}
                    {postLink && (
                      <MDBox mt={1.5}>
                        <Link
                          href={postLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: sentimentColor,
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            "&:hover": { color: alpha(sentimentColor, 0.8) },
                          }}
                        >
                          View Original Post →
                        </Link>
                      </MDBox>
                    )}
                  </MDBox>
                );
              })}
            </MDBox>
          )}

          {/* Load More Button */}
          {!loadingSentimentPosts && sentimentPosts.length > 0 && hasMoreSentimentPosts && (
            <MDBox
              sx={{
                borderTop: `1px solid #E4E6EB`,
                pt: 2,
                pb: 2,
                px: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {loadingMoreSentimentPosts ? (
                <CircularProgress size={24} sx={{ color: GREEN }} />
              ) : (
                <MDTypography
                  variant="button"
                  sx={{
                    color: GREEN,
                    fontWeight: "bold",
                    cursor: "pointer",
                    "&:hover": { color: alpha(GREEN, 0.8), textDecoration: "underline" },
                  }}
                  onClick={loadMoreSentimentPosts}
                >
                  Load More
                </MDTypography>
              )}
            </MDBox>
          )}
        </DialogContent>
      </Dialog>

      {/* Date Posts Modal */}
      <Dialog
        open={dateModalOpen}
        onClose={() => {
          setDateModalOpen(false);
          setSelectedDate(null);
          setDatePosts([]);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            maxHeight: "90vh",
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
          <MDBox>
            <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
              Posts on{" "}
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Selected Date"}
            </MDTypography>
            {selectedDate && (
              <MDTypography variant="caption" sx={{ color: "#666", display: "block", mt: 0.5 }}>
                {datePosts.length} {datePosts.length === 1 ? "post" : "posts"} found
              </MDTypography>
            )}
          </MDBox>
          <IconButton
            onClick={() => {
              setDateModalOpen(false);
              setSelectedDate(null);
              setDatePosts([]);
            }}
            sx={{
              color: "#666",
              "&:hover": {
                backgroundColor: "#F0F2F5",
                color: "#333",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 3,
            pb: 2,
            px: 2,
            overflowY: "auto",
            maxHeight: "calc(90vh - 140px)",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb": { background: GREEN, borderRadius: "4px" },
            "&::-webkit-scrollbar-thumb:hover": { background: alpha(GREEN, 0.8) },
          }}
        >
          {loadingDatePosts ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={32} sx={{ color: GREEN }} />
            </MDBox>
          ) : datePosts.length === 0 ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <MDTypography variant="body2" sx={{ color: "#666" }}>
                No posts found for this date.
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox>
              {datePosts.map((post, i) => {
                const postText = post.text || post.content || "";
                const postDate = post.date || post.created_at || "";
                const postLink = post.link || post.user_link || post.fb_post_link || "";
                const postPhotos = post.photos || [];
                const likes = post.likes || 0;
                const comments = post.comments || 0;
                const shares = post.shares || 0;

                return (
                  <MDBox
                    key={post.id || post.content_id || i}
                    sx={{
                      backgroundColor: alpha(GREEN, 0.05),
                      borderRadius: 2,
                      p: 2,
                      mb: i === datePosts.length - 1 ? 0 : 2,
                      border: `1px solid ${alpha(GREEN, 0.1)}`,
                    }}
                  >
                    {/* Post Header */}
                    <MDBox display="flex" alignItems="center" mb={1.5}>
                      <Avatar
                        src={post.profile_image || post.profile_photo || pf}
                        sx={{ width: 40, height: 40, mr: 1.5 }}
                      />
                      <MDBox sx={{ flex: 1 }}>
                        <MDTypography variant="body2" fontWeight="600" sx={{ color: "#333" }}>
                          {post.user_name || post.name || "Unknown User"}
                        </MDTypography>
                        {postDate && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            {new Date(postDate).toLocaleString()}
                          </MDTypography>
                        )}
                      </MDBox>
                    </MDBox>

                    {/* Post Text */}
                    {postText && (
                      <MDTypography
                        variant="body2"
                        sx={{ color: "#333", mb: postPhotos.length > 0 ? 1.5 : 0, lineHeight: 1.6 }}
                      >
                        {postText}
                      </MDTypography>
                    )}

                    {/* Post Images */}
                    {postPhotos.length > 0 && (
                      <MDBox
                        sx={{
                          display: "grid",
                          gridTemplateColumns: postPhotos.length === 1 ? "1fr" : "repeat(2, 1fr)",
                          gap: 1,
                          mt: 1.5,
                          mb: 1.5,
                        }}
                      >
                        {postPhotos.slice(0, 4).map((photoUrl, idx) => (
                          <MDBox
                            key={idx}
                            component="img"
                            src={photoUrl}
                            alt={`Post image ${idx + 1}`}
                            sx={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ))}
                      </MDBox>
                    )}

                    {/* Post Stats */}
                    {(likes > 0 || comments > 0 || shares > 0) && (
                      <MDBox
                        display="flex"
                        alignItems="center"
                        gap={2}
                        mt={1.5}
                        sx={{ borderTop: `1px solid ${alpha(GREEN, 0.1)}`, pt: 1.5 }}
                      >
                        {likes > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            👍 {likes} likes
                          </MDTypography>
                        )}
                        {comments > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            💬 {comments} comments
                          </MDTypography>
                        )}
                        {shares > 0 && (
                          <MDTypography variant="caption" sx={{ color: "#666" }}>
                            🔄 {shares} shares
                          </MDTypography>
                        )}
                      </MDBox>
                    )}

                    {/* Post Link */}
                    {postLink && (
                      <MDBox mt={1.5}>
                        <Link
                          href={postLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: GREEN,
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            "&:hover": { color: alpha(GREEN, 0.8) },
                          }}
                        >
                          View Original Post →
                        </Link>
                      </MDBox>
                    )}
                  </MDBox>
                );
              })}
            </MDBox>
          )}
        </DialogContent>
      </Dialog>
    </MDBox>
  );
}

AnalysisPage.propTypes = {
  taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

AnalysisPage.defaultProps = {
  taskId: null,
};
