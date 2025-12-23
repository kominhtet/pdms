import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { API_BASE } from "../../config";
import pf from "../../assets/images/profile/wiki.png";
import CircularProgress from "@mui/material/CircularProgress";

import {
  Card,
  TextField,
  Button,
  Select,
  MenuItem,
  Avatar,
  Grid,
  Typography,
  Box,
  styled,
} from "@mui/material";

// Neon Blue Glass Button
const NeonBlueButton = styled(Button)(({ theme }) => ({
  background: "rgba(0, 150, 255, 0.2)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(0, 200, 255, 0.5)",
  color: "#00ccff",
  fontWeight: "bold",
  textTransform: "none",
  borderRadius: "8px",
  boxShadow: `
    0 0 10px rgba(0, 200, 255, 0.5),
    0 0 20px rgba(0, 150, 255, 0.3),
    inset 0 0 15px rgba(0, 200, 255, 0.2)
  `,
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(0, 150, 255, 0.3)",
    border: "1px solid rgba(0, 230, 255, 0.8)",
    boxShadow: `
      0 0 15px rgba(0, 230, 255, 0.7),
      0 0 30px rgba(0, 180, 255, 0.5),
      inset 0 0 20px rgba(0, 230, 255, 0.3)
    `,
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: `
      0 0 5px rgba(0, 200, 255, 0.5),
      inset 0 0 10px rgba(0, 200, 255, 0.3)
    `,
  },
}));

// Cache key for localStorage
const CACHE_KEY = "profile_linking_state";

export default function ProfileTable() {
  // Initialize state with cached values or defaults
  const getCachedState = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          profiles: parsed.profiles || [],
          facebookAccounts: parsed.facebookAccounts || [],
          selectedMedia: parsed.selectedMedia || "media",
          selectedMediaWiki: parsed.selectedMediaWiki || "media",
          searchQueryWiki: parsed.searchQueryWiki || "",
          searchQuery: parsed.searchQuery || "",
          selectedFbAccount: parsed.selectedFbAccount || null,
          selectedFbPhotos: parsed.selectedFbPhotos || [],
        };
      }
    } catch (err) {
      console.error("Error loading cached state:", err);
    }
    return {
      profiles: [],
      facebookAccounts: [],
      selectedMedia: "media",
      selectedMediaWiki: "media",
      searchQuery: "",
      searchQueryWiki: "",
      selectedFbAccount: null,
      selectedFbPhotos: [],
    };
  };

  const cachedState = getCachedState();

  const [profiles, setProfiles] = useState(cachedState.profiles);
  const [facebookAccounts, setFacebookAccounts] = useState(cachedState.facebookAccounts);

  const [selectedMedia, setSelectedMedia] = useState(cachedState.selectedMedia);
  const [selectedMediaWiki, setSelectedMediaWiki] = useState(
    cachedState.selectedMediaWiki || "media"
  );

  const [searchQueryWiki, setSearchQueryWiki] = useState(cachedState.searchQueryWiki);
  const [searchQuery, setSearchQuery] = useState(cachedState.searchQuery);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFB, setLoadingFB] = useState(false);
  const [error, setError] = useState(null);
  const [errorFB, setErrorFB] = useState(null);
  const [loadingFbPhotos, setLoadingFbPhotos] = useState(false);
  const [fbPhotosError, setFbPhotosError] = useState(null); // optional

  // Handler functions
  const handleMediaChange = (event) => {
    setSelectedMedia(event.target.value);
  };

  const handleMediaChangeWiki = (event) => {
    setSelectedMediaWiki(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const handleSearch = () => {
  //   console.log("Searching for:", searchQuery);
  // };

  const handleSearchChangeWiki = (event) => {
    setSearchQueryWiki(event.target.value);
  };

  // const handleSearchWiki = () => {
  //   console.log("Searching for:", searchQueryWiki);
  // };

  // 🔹 NEW: which Facebook account is selected (from right table)
  const [selectedFbAccount, setSelectedFbAccount] = useState(cachedState.selectedFbAccount);
  const [selectedFbPhotos, setSelectedFbPhotos] = useState(cachedState.selectedFbPhotos);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState(null);

  const [selectedWikiId, setSelectedWikiId] = useState(null);

  // const [selectedProfile, setSelectedProfile] = useState(null);

  // ✅ MUST be defined inside the component
  const personalFields = [
    { label: "NRC", key: "nrc" },
    { label: "Passport", key: "passport" },
    { label: "Birthday", key: "birthday" },
    { label: "Nationality", key: "nationality" },
    { label: "Age", key: "age" },
    { label: "Father Name", key: "father_name" },
    { label: "Height", key: "height_cm" },
    { label: "Sex", key: "sex" },
    { label: "Phone", key: "phone" },
    { label: "Address", key: "address" },
  ];

  // 🔹 CACHE: Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToCache = {
        profiles,
        facebookAccounts,
        selectedMedia,
        selectedMediaWiki,
        searchQueryWiki,
        searchQuery,
        selectedFbAccount,
        selectedFbPhotos,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(stateToCache));
    } catch (err) {
      console.error("Error saving state to cache:", err);
    }
  }, [
    profiles,
    facebookAccounts,
    selectedMedia,
    selectedMediaWiki,
    searchQueryWiki,
    searchQuery,
    selectedFbAccount,
    selectedFbPhotos,
  ]);

  // 🔹 CACHE: Restore selected FB account photos if account was cached
  useEffect(() => {
    if (cachedState.selectedFbAccount?.task_id && cachedState.selectedFbPhotos.length > 0) {
      // Photos are already cached, no need to refetch
      console.log("Restored cached FB account and photos");
    }
  }, []); // Only run on mount

  const handleAccountClick = async (taskId) => {
    try {
      // 1) Set selected account (for avatar/name)
      const found = facebookAccounts.find((acc) => acc.task_id === taskId);
      if (found) {
        setSelectedFbAccount(found);
        console.log("Selected FB account:", found);
      }

      // 2) Start loading photos
      setLoadingFbPhotos(true);
      setFbPhotosError(null);
      setSelectedFbPhotos([]); // optional: clear old photos while loading

      // 3) Fetch photos
      const res = await axios.get(`${API_BASE}/tasks/${taskId}/photos/`);
      const rawData = res.data;

      // Your API: [{ content_id, photos: [url, ...] }, ...]
      let allPhotos = [];

      if (Array.isArray(rawData)) {
        allPhotos = rawData.flatMap((item) => item.photos || []);
      } else if (rawData && Array.isArray(rawData.photos)) {
        allPhotos = rawData.photos;
      }

      const firstNinePhotos = allPhotos.slice(0, 9);
      setSelectedFbPhotos(firstNinePhotos);
      console.log("Selected photos:", firstNinePhotos);
    } catch (err) {
      console.error("Error loading photos", err);
      setFbPhotosError("Failed to load photos");
      setSelectedFbPhotos([]);
    } finally {
      setLoadingFbPhotos(false);
    }
  };

  // Fetch Facebook accounts from API
  const fetchFacebookAccounts = async () => {
    // 🟦 CASE 1: Facebook → call API
    if (selectedMedia === "facebook") {
      setLoadingFB(true);
      setErrorFB(null);

      try {
        console.log("Making API call to /tasks_source/all/");

        const baseURLs = [`${API_BASE}/tasks_source/all/`];

        let response = null;
        let lastError = null;

        for (const url of baseURLs) {
          try {
            console.log(`Trying URL: ${url}`);
            response = await axios.get(url, { timeout: 30000 }); // 30s timeout
            console.log("✅ API call successful to:", url);
            console.log("API Response data:", response.data);
            break;
          } catch (err) {
            lastError = err;
            console.log(`❌ Failed to fetch from ${url}:`, err.message);
            if (err.code === "ECONNABORTED") {
              console.log(`⏱️ Request to ${url} timed out after 30 seconds`);
            } else if (err.code === "ECONNREFUSED") {
              console.log(`🔌 Connection refused to ${url} - is the backend server running?`);
            }
          }
        }

        if (!response) {
          throw new Error(`All API endpoints failed. Last error: ${lastError?.message}`);
        }

        const apiData = response.data;

        let accountsData = [];
        if (Array.isArray(apiData)) {
          accountsData = apiData;
        } else if (apiData.results && Array.isArray(apiData.results)) {
          accountsData = apiData.results;
        } else if (apiData.accounts && Array.isArray(apiData.accounts)) {
          accountsData = apiData.accounts;
        } else if (apiData.data && Array.isArray(apiData.data)) {
          accountsData = apiData.data;
        } else {
          console.warn("Unexpected API response format:", apiData);
          accountsData = [];
        }

        console.log("Transformed tasks_source data:", accountsData);

        const transformedAccounts = accountsData.map((item, index) => ({
          serial: index + 1,
          realId: item.id,
          account: item.name || "Unknown Source",
          about: item.link || "No link available",
          profile: item.profile_image || "",
          task_id: item.task_id,
          remark: item.remark || "No remark available",
          source_name: item.source_name || null, // ✅ MUST exist
        }));

        console.log("Final transformed accounts:", transformedAccounts);

        if (transformedAccounts.length === 0) {
          setErrorFB("No tasks_source records found in the API response.");
          setFacebookAccounts([]);
        } else {
          setFacebookAccounts(transformedAccounts);
        }
      } catch (err) {
        console.error("❌ Error fetching accounts:", err);
        console.error("Error details:", err.response?.data || err.message);

        let errorMessage;
        if (err.code === "ECONNABORTED") {
          errorMessage =
            "Request timed out. The backend server may be slow or the database query is taking too long. Please try again or check the backend server.";
        } else if (err.code === "ECONNREFUSED") {
          errorMessage =
            "Cannot connect to backend server. Please ensure the Django server is running on port 8000.";
        } else if (err.response?.status === 404) {
          errorMessage =
            "API endpoint not found (404). Please check the backend server and endpoint URL.";
        } else if (err.response?.status === 500) {
          errorMessage = "Server error (500). Please check the backend server logs.";
        } else {
          errorMessage = `Failed to fetch accounts: ${err.message}`;
        }

        setErrorFB(errorMessage);
        setFacebookAccounts([]);
      } finally {
        setLoadingFB(false);
      }

      // 🟧 CASE 2: Twitter
    } else if (selectedMedia === "twitter") {
      console.log("Twitter selected – no API implemented yet.");
      setFacebookAccounts([]);
      setSelectedFbAccount(null);
      setSelectedFbPhotos([]);
      setErrorFB("Twitter accounts not implemented yet.");

      // 🟨 CASE 3: Instagram
    } else if (selectedMedia === "instagram") {
      console.log("Instagram selected – no API implemented yet.");
      setFacebookAccounts([]);
      setSelectedFbAccount(null);
      setSelectedFbPhotos([]);
      setErrorFB("Instagram accounts not implemented yet.");

      // 🟥 DEFAULT: anything else (media / youtube / tiktok / etc.)
    } else {
      console.log("No valid media selected or not supported:", selectedMedia);
      setFacebookAccounts([]);
      setSelectedFbAccount(null);
      setSelectedFbPhotos([]);
      setErrorFB(null); // or set a message if you want
    }
  };

  const handleShowProfiles = async () => {
    if (selectedMediaWiki === "All") {
      // "All" option
      setLoading(true);
      setError(null);
      try {
        console.log("Making API call to /profile/all/");

        const baseURLs = [`${API_BASE}/profile/all/`];

        let response = null;
        let lastError = null;

        for (const url of baseURLs) {
          try {
            console.log(`Trying URL: ${url}`);
            response = await axios.get(url, { timeout: 30000 });
            console.log("✅ API call successful to:", url);
            console.log("API Response data:", response.data);
            break;
          } catch (err) {
            lastError = err;
            console.log(`❌ Failed to fetch from ${url}:`, err.message);
            if (err.code === "ECONNABORTED") {
              console.log(`⏱️ Request to ${url} timed out after 30 seconds`);
            } else if (err.code === "ECONNREFUSED") {
              console.log(`🔌 Connection refused to ${url} - is the backend server running?`);
            }
            continue;
          }
        }

        if (!response) {
          throw new Error(`All API endpoints failed. Last error: ${lastError?.message}`);
        }

        const apiData = response.data;
        let profilesData = [];

        if (Array.isArray(apiData)) {
          profilesData = apiData;
        } else if (apiData.results && Array.isArray(apiData.results)) {
          profilesData = apiData.results;
        } else if (apiData.profiles && Array.isArray(apiData.profiles)) {
          profilesData = apiData.profiles;
        } else if (apiData.data && Array.isArray(apiData.data)) {
          profilesData = apiData.data;
        } else {
          console.warn("Unexpected API response format:", apiData);
          profilesData = [];
        }

        console.log("Transformed profiles data:", profilesData);

        const transformedProfiles = profilesData.map((profile, index) => ({
          id: index + 1,
          realId: profile.id, // users.id from API
          name: profile.name || "Unknown Name",
          role: profile.brief_bio || "No description available",
          img: pf,
          // img: "pf.jpg",
          profile_icon: profile.profile_icon || "No profile icon available",
        }));

        console.log("Final transformed profiles:", transformedProfiles);

        if (transformedProfiles.length === 0) {
          setError("No profiles found in the API response.");
          setProfiles(getSampleProfiles());
        } else {
          setProfiles(transformedProfiles);
        }
      } catch (err) {
        console.error("❌ Error fetching profiles:", err);
        console.error("Error details:", err.response?.data || err.message);

        let errorMessage;
        if (err.code === "ECONNABORTED") {
          errorMessage =
            "Request timed out. The backend server may be slow or the database query is taking too long. Please try again or check the backend server.";
        } else if (err.code === "ECONNREFUSED") {
          errorMessage =
            "Cannot connect to backend server. Please ensure the Django server is running on port 8000.";
        } else if (err.response?.status === 404) {
          errorMessage =
            "API endpoint not found (404). Please check the backend server and endpoint URL.";
        } else if (err.response?.status === 500) {
          errorMessage = "Server error (500). Please check the backend server logs.";
        } else {
          errorMessage = `Failed to fetch profiles: ${err.message}`;
        }

        setError(errorMessage);
        setProfiles(getSampleProfiles());
      } finally {
        setLoading(false);
      }
    } else {
      // ❗ Not "All" → clear table
      console.log("Clearing profiles for media:", selectedMediaWiki);
      setProfiles([]); // ⬅️ no data
      setError(null);
    }
  };

  // // Helper function for sample data
  // const getSampleProfiles = () => {
  //   return [
  //     { id: 1, name: "Poe Mamhe Thar", role: "Artist and performer from Myanmar", img: "pf.jpg" },
  //     { id: 2, name: "Sai Sai Kham Leng", role: "Popular musician and singer", img: "pf.jpg" },
  //     { id: 3, name: "AS TA", role: "Political figure and activist", img: "pf.jpg" },
  //     { id: 4, name: "Penclio", role: "Writer and content creator", img: "pf.jpg" },
  //     { id: 5, name: "Khin Yl", role: "Politician and public speaker", img: "pf.jpg" },
  //     {
  //       id: 6,
  //       name: "DrThet Thet Khine",
  //       role: "Medical professional and politician",
  //       img: "pf.jpg",
  //     },
  //     { id: 7, name: "Ko Ko Gyl", role: "Political activist and community leader", img: "pf.jpg" },
  //     { id: 8, name: "Ko Zwal Official", role: "Musician and performer", img: "pf.jpg" },
  //     { id: 9, name: "Shwe Moe", role: "Blogger and educator based in Korea", img: "pf.jpg" },
  //   ];
  // };

  // in handleProfileClick(realId)
  const handleProfileClick = async (realId) => {
    setSelectedWikiId(realId); // ✅ store id
    setSelectedProfile({ realId }); // ✅ store selected wiki id
    try {
      const res = await axios.get(`${API_BASE}/profile/?id=${realId}`);
      setSelectedProfileDetail(res.data);
    } catch (err) {
      console.error("Error loading profile detail:", err);
    }
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQueryWiki.toLowerCase()) ||
      profile.role.toLowerCase().includes(searchQueryWiki.toLowerCase())
  );

  const filteredFacebookAccounts = facebookAccounts.filter(
    (account) =>
      account.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.about.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLink = async () => {
    const profile_id = selectedWikiId; // ✅ correct
    const acc_id = selectedFbAccount?.source_name; // ✅ fb_id (for acc_id)
    const username = selectedFbAccount?.account;
    const link = selectedFbAccount?.about; // ✅ fb link
    const net_id = selectedMedia === "facebook" ? 1 : null;

    if (!profile_id || !acc_id || !net_id) {
      console.log("DEBUG:", { profile_id, net_id, acc_id, selectedFbAccount });
      alert("Select Wiki profile + Facebook account first.");
      return;
    }

    try {
      const payload = { profile_id, net_id, acc_id, username, link };
      console.log("LINK PAYLOAD >>>", payload);

      await axios.post(`${API_BASE}/profile-person-acc/link/`, payload);

      alert("Linked ✅");
    } catch (err) {
      console.error("LINK ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Link failed");
    }
  };

  return (
    <DashboardLayout>
      {/* ======= Aura Background ======= */}
      <Box
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
      <Box p={2}>
        <Grid container spacing={2}>
          {/* LEFT TABLE */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 2,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                height: "600px",
              }}
            >
              <Box display="flex" gap={2} mb={2} alignItems="center">
                {/* Select Media Dropdown */}
                <Select
                  size="small"
                  value={selectedMediaWiki}
                  onChange={handleMediaChangeWiki}
                  sx={{
                    color: "white",
                    height: "40px",
                    minWidth: "140px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 200, 255, 0.5)",
                      borderWidth: "1px",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 230, 255, 0.8)",
                      borderWidth: "1px",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 230, 255, 1)",
                      borderWidth: "1px",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "rgba(0, 200, 255, 0.8)",
                    },
                    background: "rgba(0, 150, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0, 200, 255, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "rgba(0, 0, 0, 0.9)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(0, 200, 255, 0.5)",
                        borderRadius: "8px",
                        boxShadow: "0 0 20px rgba(0, 200, 255, 0.4)",
                        "& .MuiMenuItem-root": {
                          color: "white",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "rgba(0, 150, 255, 0.3)",
                            color: "#00ccff",
                          },
                          "&.Mui-selected": {
                            background: "rgba(0, 150, 255, 0.2)",
                            color: "#00ccff",
                          },
                          "&.Mui-selected:hover": {
                            background: "rgba(0, 150, 255, 0.4)",
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="media">Select Media</MenuItem>
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="linked">Linked</MenuItem>
                  <MenuItem value="unlink">Unlink</MenuItem>
                </Select>

                <NeonBlueButton
                  onClick={handleShowProfiles}
                  disabled={loading}
                  sx={{
                    height: "40px",
                    minWidth: "100px",
                  }}
                >
                  {loading ? "Loading..." : "Show"}
                </NeonBlueButton>

                <TextField
                  size="small"
                  label="Search"
                  placeholder="Search profiles..."
                  value={searchQueryWiki}
                  onChange={handleSearchChangeWiki}
                  fullWidth
                  InputLabelProps={{
                    style: {
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "14px",
                    },
                  }}
                  sx={{
                    height: "40px",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      color: "white",
                      background: "rgba(0, 150, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "8px",
                      boxShadow: "0 0 10px rgba(0, 200, 255, 0.3)",
                      transition: "all 0.3s ease",
                      "& fieldset": {
                        borderColor: "rgba(0, 200, 255, 0.5)",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(0, 230, 255, 0.8)",
                        borderWidth: "1px",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(0, 230, 255, 1)",
                        borderWidth: "1px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      height: "40px",
                      padding: "0 14px",
                      "&::placeholder": {
                        color: "rgba(255,255,255,0.5)",
                        opacity: 1,
                      },
                    },
                  }}
                />
                {/* <NeonBlueButton
                  onClick={handleSearchWiki}
                  sx={{
                    height: "40px",
                    minWidth: "100px",
                  }}
                >
                  Search
                </NeonBlueButton> */}
              </Box>

              {error && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    background: "rgba(255,0,0,0.1)",
                    border: "1px solid rgba(255,0,0,0.3)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "rgba(255, 100, 100, 0.9)" }}>
                    {error}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  minHeight: 0,
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0, 150, 255, 0.4)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(0, 150, 255, 0.7)",
                  },
                }}
              >
                <table
                  style={{
                    width: "100%",
                    fontSize: 14,
                    color: "white",
                    borderCollapse: "collapse",
                    marginTop: "16px",
                  }}
                >
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "rgba(0, 150, 255, 0.1)",
                    }}
                  >
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(0, 200, 255, 0.3)",
                        background: "rgba(0, 150, 255, 0.1)",
                      }}
                    >
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 8px",
                          fontWeight: 600,
                          width: "10%",
                        }}
                      >
                        No
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 8px",
                          fontWeight: 600,
                          width: "40%",
                        }}
                      >
                        Profile
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 8px",
                          fontWeight: 600,
                          width: "50%",
                        }}
                      >
                        About
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProfiles.length > 0 ? (
                      filteredProfiles.map((item) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(0, 150, 255, 0.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 8px",
                              width: "10%",
                              color: "rgba(255, 255, 255, 0.9)",
                            }}
                          >
                            {item.id}
                          </td>
                          <td style={{ padding: "12px 8px", width: "40%" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                cursor: "pointer",
                                color: "rgba(255, 255, 255, 0.9)",
                                fontWeight: 500,
                                transition: "color 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "rgba(100, 200, 255, 1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                              }}
                              onClick={() => handleProfileClick(item.realId)} // 👈 ADD THIS
                            >
                              <img
                                // src={require(`../../assets/images/profile/${item.img}`)}
                                src={item.img || pf}
                                alt="profile"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              {item.name}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "12px 8px",
                              width: "50%",
                              color: "rgba(255, 255, 255, 0.8)",
                            }}
                          >
                            {item.role}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          {loading
                            ? "Loading profiles..."
                            : "No profiles found. Click 'Show' to load profiles."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Card>
          </Grid>

          {/* RIGHT TABLE */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 2,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                height: "600px",
                overflow: "hidden", // Prevent horizontal scroll
              }}
            >
              <Box
                display="flex"
                gap={1}
                mb={2}
                alignItems="center"
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  "& > *": {
                    height: "40px",
                  },
                }}
              >
                <Select
                  size="small"
                  value={selectedMedia}
                  onChange={handleMediaChange}
                  sx={{
                    color: "white",
                    height: "40px",
                    minWidth: "140px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 200, 255, 0.5)",
                      borderWidth: "1px",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 230, 255, 0.8)",
                      borderWidth: "1px",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 230, 255, 1)",
                      borderWidth: "1px",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "rgba(0, 200, 255, 0.8)",
                    },
                    background: "rgba(0, 150, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0, 200, 255, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "rgba(0, 0, 0, 0.9)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(0, 200, 255, 0.5)",
                        borderRadius: "8px",
                        boxShadow: "0 0 20px rgba(0, 200, 255, 0.4)",
                        "& .MuiMenuItem-root": {
                          color: "white",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "rgba(0, 150, 255, 0.3)",
                            color: "#00ccff",
                          },
                          "&.Mui-selected": {
                            background: "rgba(0, 150, 255, 0.2)",
                            color: "#00ccff",
                          },
                          "&.Mui-selected:hover": {
                            background: "rgba(0, 150, 255, 0.4)",
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="media">Select Media</MenuItem>
                  <MenuItem value="facebook">Facebook</MenuItem>
                  <MenuItem value="twitter">Twitter</MenuItem>
                  <MenuItem value="instagram">Instagram</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="tiktok">TikTok</MenuItem>
                </Select>

                <NeonBlueButton
                  onClick={fetchFacebookAccounts}
                  disabled={loadingFB}
                  sx={{
                    height: "40px",
                    minWidth: "100px",
                  }}
                >
                  {loadingFB ? "Loading..." : "Show"}
                </NeonBlueButton>

                <TextField
                  size="small"
                  label="Search"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  fullWidth
                  InputLabelProps={{
                    style: {
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "14px",
                    },
                  }}
                  sx={{
                    height: "40px",
                    "& .MuiOutlinedInput-root": {
                      height: "40px",
                      color: "white",
                      background: "rgba(0, 150, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "8px",
                      boxShadow: "0 0 10px rgba(0, 200, 255, 0.3)",
                      transition: "all 0.3s ease",
                      "& fieldset": {
                        borderColor: "rgba(0, 200, 255, 0.5)",
                        borderWidth: "1px",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(0, 230, 255, 0.8)",
                        borderWidth: "1px",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(0, 230, 255, 1)",
                        borderWidth: "1px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      height: "40px",
                      padding: "0 14px",
                      "&::placeholder": {
                        color: "rgba(255,255,255,0.5)",
                        opacity: 1,
                      },
                    },
                  }}
                />

                {/* <NeonBlueButton
                  onClick={handleSearch}
                  size="small"
                  sx={{
                    height: "40px",
                    minWidth: "100px",
                  }}
                >
                  Search
                </NeonBlueButton> */}
              </Box>

              {errorFB && (
                <Box
                  sx={{
                    mb: 2,
                    p: 1,
                    background: "rgba(255,0,0,0.1)",
                    border: "1px solid rgba(255,0,0,0.3)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "rgba(255, 100, 100, 0.9)" }}>
                    {errorFB}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden", // Prevent horizontal scroll
                  minHeight: 0,
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0, 150, 255, 0.4)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(0, 150, 255, 0.7)",
                  },
                }}
              >
                <table
                  style={{
                    width: "100%",
                    fontSize: 14,
                    color: "white",
                    borderCollapse: "collapse",
                    marginTop: "16px",
                    tableLayout: "fixed", // Ensure consistent column widths
                  }}
                >
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "rgba(0, 150, 255, 0.1)",
                    }}
                  >
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(0, 200, 255, 0.3)",
                        background: "rgba(0, 150, 255, 0.1)",
                      }}
                    >
                      {/* No column - reduced width */}
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 8px",
                          fontWeight: 600,
                          width: "50px", // Fixed small width for serial number
                        }}
                      >
                        No
                      </th>

                      {/* Facebook Account column - increased width */}
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 8px",
                          fontWeight: 600,
                          width: "50%", // Increased to 50% of table width
                        }}
                      >
                        Facebook Account
                      </th>

                      {/* About column - clickable links */}
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px 8px",
                          fontWeight: 600,
                          width: "calc(50% - 50px)", // Remaining width minus serial column
                        }}
                      >
                        Link
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFacebookAccounts.length > 0 ? (
                      filteredFacebookAccounts.map((item) => (
                        <tr
                          key={item.realId}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(0, 150, 255, 0.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {/* Serial Number */}
                          <td
                            style={{
                              padding: "12px 8px",
                              color: "rgba(255, 255, 255, 0.9)",
                              width: "50px",
                              wordWrap: "break-word",
                            }}
                          >
                            {item.serial}
                          </td>

                          {/* Account Column */}
                          <td
                            style={{
                              padding: "12px 8px",
                              width: "50%",
                              wordWrap: "break-word",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                cursor: "pointer",
                                color: "rgba(255, 255, 255, 0.9)",
                                fontWeight: 500,
                                transition: "color 0.2s ease",
                              }}
                              onClick={() => handleAccountClick(item.task_id)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "rgba(100, 200, 255, 1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                              }}
                            >
                              <img
                                src={item.profile}
                                alt="profile"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  flexShrink: 0, // Prevent image from shrinking
                                }}
                              />
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "100%", // Ensure text doesn't overflow
                                }}
                              >
                                {item.account}
                              </span>
                            </div>
                          </td>

                          {/* About / Link Column - Now clickable */}
                          <td
                            style={{
                              padding: "12px 8px",
                              width: "calc(50% - 50px)",
                              wordWrap: "break-word",
                            }}
                          >
                            {item.about && (
                              <a
                                href={item.about}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "rgba(100, 200, 255, 0.9)",
                                  textDecoration: "none",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  display: "inline-block",
                                  maxWidth: "100%",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "rgba(100, 230, 255, 1)";
                                  e.currentTarget.style.textDecoration = "underline";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "rgba(100, 200, 255, 0.9)";
                                  e.currentTarget.style.textDecoration = "none";
                                }}
                                title={item.about} // Show full link on hover
                              >
                                {item.about}
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          {loadingFB
                            ? "Loading Facebook accounts..."
                            : "No Facebook accounts found. Click 'Show' to load accounts."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Card>
          </Grid>

          {/* LINKING SECTION */}
          <Grid item xs={12}>
            <Card
              sx={{
                p: 3,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 2,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255, 255, 255, 0.95)", fontWeight: 600 }}
                >
                  Linking
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleLink}
                  disabled={!selectedWikiId || !selectedFbAccount?.source_name}
                  sx={{
                    background: "rgba(0, 150, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0, 200, 255, 0.5)",
                    color: "#00ccff",
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": {
                      background: "rgba(0, 150, 255, 0.3)",
                      border: "1px solid rgba(0, 230, 255, 0.8)",
                    },
                  }}
                >
                  Link
                </Button>
              </Box>

              <Grid container spacing={2}>
                {/* LEFT PROFILE DETAIL */}
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      p: 1.5,
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      borderRadius: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Avatar
                        src={selectedProfile?.profile_icon || pf} // if icon is an image URL
                        sx={{ width: 50, height: 50 }}
                      />
                      <Box>
                        <Typography
                          component="a"
                          href="#"
                          sx={{
                            color: "#00ccff",
                            fontWeight: 600,
                            textDecoration: "underline",
                            cursor: "pointer",
                            display: "block",
                            "&:hover": {
                              color: "#00e6ff",
                            },
                          }}
                        >
                          {selectedProfileDetail?.name || "Select a profile from the table"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                          {selectedProfileDetail?.profile_icon || ""} {/* 👈 instead of "Artist" */}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={1.5}>
                      {/* LEFT COLUMN: Personal Details */}
                      <Grid item xs={12} sm={6}>
                        {personalFields.map((field) => (
                          <Box
                            key={field.label}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            py={0.5}
                          >
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.9)",
                                fontSize: "14px",
                                minWidth: "120px",
                              }}
                            >
                              {field.label}
                            </Typography>
                            <TextField
                              size="small"
                              variant="filled"
                              value={
                                selectedProfileDetail
                                  ? String(selectedProfileDetail[field.key] ?? "")
                                  : ""
                              }
                              InputProps={{ readOnly: true }}
                              sx={{
                                flex: 1,
                                "& .MuiFilledInput-root": {
                                  borderRadius: 2,
                                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                                  backdropFilter: "blur(12px)",
                                  border: "1px solid rgba(255, 255, 255, 0.15)",
                                  "&:before": { borderBottom: "none" },
                                  "&:after": { borderBottom: "none" },
                                  "&:hover:before": { borderBottom: "none" },
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  color: "rgba(255, 255, 255, 0.9)",
                                  fontSize: "14px",
                                  padding: "10px 14px",
                                },
                              }}
                            />
                          </Box>
                        ))}
                      </Grid>

                      {/* RIGHT COLUMN: Education, Occupation, About */}
                      <Grid item xs={12} sm={6}>
                        <Box mb={1.5}>
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.9)",
                              fontSize: "14px",
                              fontWeight: 500,
                              mb: 0.75,
                            }}
                          >
                            Education
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            variant="filled"
                            value={selectedProfileDetail?.education || ""}
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiFilledInput-root": {
                                borderRadius: 2,
                                backgroundColor: "rgba(0, 0, 0, 0.35)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                "&:before": { borderBottom: "none" },
                                "&:after": { borderBottom: "none" },
                                "&:hover:before": { borderBottom: "none" },
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                                },
                              },
                              "& .MuiInputBase-input": {
                                color: "rgba(255, 255, 255, 0.9)",
                                fontSize: "14px",
                                padding: "10px 14px",
                              },
                            }}
                          />
                        </Box>

                        <Box mb={1.5}>
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.9)",
                              fontSize: "14px",
                              fontWeight: 500,
                              mb: 0.75,
                            }}
                          >
                            Occupation
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            variant="filled"
                            value={selectedProfileDetail?.occupation || ""}
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiFilledInput-root": {
                                borderRadius: 2,
                                backgroundColor: "rgba(0, 0, 0, 0.35)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                "&:before": { borderBottom: "none" },
                                "&:after": { borderBottom: "none" },
                                "&:hover:before": { borderBottom: "none" },
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                                },
                              },
                              "& .MuiInputBase-input": {
                                color: "rgba(255, 255, 255, 0.9)",
                                fontSize: "14px",
                                padding: "10px 14px",
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.9)",
                              fontSize: "14px",
                              fontWeight: 500,
                              mb: 0.75,
                            }}
                          >
                            About
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            variant="filled"
                            value={selectedProfileDetail?.brief_bio || ""}
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiFilledInput-root": {
                                borderRadius: 2,
                                backgroundColor: "rgba(0, 0, 0, 0.35)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                "&:before": { borderBottom: "none" },
                                "&:after": { borderBottom: "none" },
                                "&:hover:before": { borderBottom: "none" },
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                                },
                              },
                              "& .MuiInputBase-input": {
                                color: "rgba(255, 255, 255, 0.9)",
                                fontSize: "14px",
                                padding: "10px 14px",
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                {/* RIGHT PROFILE PHOTOS */}
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      p: 2,
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      borderRadius: 2,
                      // backdropFilter: "blur(12px)",
                      // border: "1px solid rgba(255,255,255,0.2)",
                      minHeight: "100%",
                    }}
                  >
                    {/* 🔹 UPDATED: use selectedFbAccount here */}
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        sx={{ width: 50, height: 50 }}
                        src={selectedFbAccount?.profile || ""}
                      />
                      <Box>
                        <Typography
                          // variant="h6"
                          sx={{
                            color: "#00ccff",
                            fontWeight: 600,
                            // textDecoration: "underline",
                            cursor: "pointer",
                            display: "block",
                            "&:hover": {
                              color: "#00e6ff",
                            },
                          }}
                        >
                          {selectedFbAccount?.account || "Select a Facebook account"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(248, 250, 108, 0.7)" }}>
                          {selectedFbAccount?.remark ||
                            "Click an account in the table to view here"}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ height: "calc(100% - 80px)" }}>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            height: "100%",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 2,
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(255,255,255,0.5)",
                            fontStyle: "italic",
                          }}
                        >
                          About section content...
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card
                          sx={{
                            p: 2,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 2,
                            border: "1px solid rgba(255,255,255,0.1)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            width: "fit-content",
                            minWidth: "100%",
                          }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{
                              color: "#00ccff",
                              fontWeight: "bold",
                              mb: 2,
                              justifyContent: "center",
                            }}
                          >
                            <Box sx={{ fontSize: "20px" }}>📸</Box>
                            <Typography
                              variant="body1"
                              sx={{
                                color: "rgba(255, 255, 255, 0.95)",
                                fontWeight: "bold",
                                fontSize: "15px",
                              }}
                            >
                              Photos
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flex: 1,
                              width: "100%",
                              height: "100%",
                              padding: "8px",
                            }}
                          >
                            {loadingFbPhotos ? ( // ✅ use loadingFbPhotos
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  width: "100%",
                                  height: "100%",
                                  minHeight: 120,
                                }}
                              >
                                <CircularProgress size={28} />
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gap: "10px",
                                  width: "100%",
                                  height: "100%",
                                  maxWidth: "320px",
                                  maxHeight: "320px",
                                  margin: "auto",
                                }}
                              >
                                {selectedFbPhotos.length > 0
                                  ? selectedFbPhotos.map((url, i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          aspectRatio: "1 / 1",
                                          width: "100%",
                                          height: "100%",
                                          minHeight: "0",
                                          borderRadius: "6px",
                                          overflow: "hidden",
                                          border: "1px solid rgba(0, 200, 255, 0.3)",
                                          cursor: "pointer",
                                          transition: "0.25s ease",
                                          "&:hover": {
                                            transform: "scale(1.05)",
                                            border: "1px solid rgba(0, 230, 255, 0.6)",
                                          },
                                        }}
                                      >
                                        <img
                                          src={url}
                                          alt="fb-photo"
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                        />
                                      </Box>
                                    ))
                                  : [...Array(9)].map((_, i) => (
                                      <Box
                                        key={i}
                                        sx={{
                                          aspectRatio: "1 / 1",
                                          width: "100%",
                                          height: "100%",
                                          minHeight: "0",
                                          background: "rgba(0, 150, 255, 0.1)",
                                          borderRadius: "6px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          border: "1px solid rgba(0, 200, 255, 0.3)",
                                        }}
                                      >
                                        📷
                                      </Box>
                                    ))}
                              </Box>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
