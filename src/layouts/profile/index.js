// eslint-disable-next-line
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// Material Dashboard 2 React container
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

// import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TelegramIcon from "@mui/icons-material/Telegram";
import XIcon from "@mui/icons-material/X"; // if you use MUI X icon (or use TwitterIcon)
import MusicNoteIcon from "@mui/icons-material/MusicNote"; // for TikTok fallback
import PublicIcon from "@mui/icons-material/Public"; // Google news fallback
// import Link from "@mui/material/Link";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
// Add to your imports section
import { useNavigate, useLocation } from "react-router-dom"; // Updated imports

// MUI
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  FormControl,
  Link,
  Button,
  Pagination,
  Stack,
} from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
// ✅ Adjust the path to your image if needed
import profileImg from "assets/images/profile/wiki1.png";
// import profileImg from "assets/images/profile/p.gif";

/* ---------- Layout constants ---------- */
const AVATAR = { xs: 140, md: 210 }; // avatar size
const BANNER_H = { xs: 100, md: 120 }; // banner height
const HAIRLINE = 2; // hairline height under the banner
const CARDS_PER_PAGE = 8; // Number of cards to show per page

export default function ProfilePage() {
  const [searchName, setSearchName] = useState("");
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false); // ✅ Add editing state
  const [editedProfile, setEditedProfile] = useState({}); // ✅ Add edited profile state

  const [editedAccounts, setEditedAccounts] = useState([]);
  const [deletedAccountIds, setDeletedAccountIds] = useState([]);

  // ===============================for save state cache to localStorage===============================

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedState = localStorage.getItem("profilePageState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);

        // Set all your states from localStorage
        setSearchName(parsedState.searchName || "");
        setPeople(parsedState.people || []);
        setSelectedProfile(parsedState.selectedProfile || null);
        setCurrentPage(parsedState.currentPage || 1);
        setIsEditing(parsedState.isEditing || false);
        setEditedProfile(parsedState.editedProfile || {});
        setEditedAccounts(parsedState.editedAccounts || []);
        setDeletedAccountIds(parsedState.deletedAccountIds || []);
        setTotalPages(parsedState.totalPages || 1);
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save all state to localStorage whenever it changes
    const stateToSave = {
      searchName,
      people,
      selectedProfile,
      currentPage,
      isEditing,
      editedProfile,
      editedAccounts,
      deletedAccountIds,
      totalPages,
    };

    localStorage.setItem("profilePageState", JSON.stringify(stateToSave));
  }, [
    searchName,
    people,
    selectedProfile,
    currentPage,
    isEditing,
    editedProfile,
    editedAccounts,
    deletedAccountIds,
    totalPages,
  ]);

  // ======================================================================================================

  const netIcon = (netId) => {
    const sx = { color: "rgba(255, 255, 255, 0.9)" };

    switch (Number(netId)) {
      case 1:
        return <FacebookIcon fontSize="small" sx={sx} />;
      case 2:
        return <YouTubeIcon fontSize="small" sx={sx} />;
      case 3:
        return <TelegramIcon fontSize="small" sx={sx} />;
      case 4:
        return <XIcon fontSize="small" sx={sx} />;
      case 5:
        return <MusicNoteIcon fontSize="small" sx={sx} />;
      case 6:
        return <PublicIcon fontSize="small" sx={sx} />;
      default:
        return <PublicIcon fontSize="small" sx={sx} />;
    }
  };

  // ✅ Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({}); // Clear edited data
  };

  const buildPatchPayload = (p) => {
    const payload = {};

    const put = (k, v) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string" && v.trim() === "") return; // ✅ skip blank
      payload[k] = v;
    };

    put("nrc", p.nrc);
    put("passport", p.passport);

    // ✅ height_cm must be number, don't send null/"".
    if (p.height_cm !== undefined && p.height_cm !== null && String(p.height_cm).trim() !== "") {
      payload.height_cm = Number(p.height_cm);
    }

    put("blood_type", p.blood_type);
    put("phone", p.phone);

    put("birthday", p.birthday);
    put("nationality", p.nationality);
    put("father_name", p.father_name);
    put("sex", p.sex);
    put("address", p.address);
    put("education", p.education);
    put("occupation", p.occupation);
    put("brief_bio", p.brief_bio);

    return payload;
  };

  const handleSave = async () => {
    try {
      const payload = buildPatchPayload(editedProfile);
      const res = await axios.patch(
        `http://192.168.11.70:7789/profile/update/${selectedProfile.id}/`,
        payload
      );
      setSelectedProfile(res.data); // ✅ refresh UI
      setIsEditing(false);
    } catch (e) {
      console.error("PATCH ERROR:", e?.response?.data || e.message);
    }
  };

  // ✅ Handle edit toggle
  const handleEditToggle = async () => {
    // ✅ SAVE
    if (isEditing && selectedProfile?.id) {
      try {
        setLoading(true);

        // ✅ only send fields you allow to edit
        const payload = {
          nrc: editedProfile.nrc ?? "",
          passport: editedProfile.passport ?? "",
          birthday: editedProfile.birthday ?? null,
          nationality: editedProfile.nationality ?? "",
          father_name: editedProfile.father_name ?? "",
          height_cm: editedProfile.height_cm ?? null,
          blood_type: editedProfile.blood_type ?? "",
          sex: editedProfile.sex ?? "",
          phone: editedProfile.phone ?? "",
          address: editedProfile.address ?? "",
          education: editedProfile.education ?? "",
          occupation: editedProfile.occupation ?? "",
          brief_bio: editedProfile.brief_bio ?? "",
        };

        // 1) ✅ Update main profile fields
        await axios.patch(
          `http://192.168.11.70:7789/profile/update/${selectedProfile.id}/`,
          payload
        );

        // 2) ✅ Sync social accounts (delete + update remaining)
        // (editedAccounts / deletedAccountIds ကို သင့် state နဲ့ ကိုက်အောင်အသုံးပြုပါ)
        const accPayload = {
          delete_ids: deletedAccountIds,
          accounts: editedAccounts,
        };

        const r = await axios.patch(
          `http://192.168.11.70:7789/profile/${selectedProfile.id}/accounts/`,
          accPayload
        );

        // 3) ✅ refresh UI state
        setSelectedProfile((prev) => ({
          ...prev,
          ...payload,
          person_accounts: r.data.person_accounts,
        }));

        setDeletedAccountIds([]);
        setIsEditing(false);
        setEditedProfile({});
      } catch (err) {
        console.error("SAVE ERROR", err?.response?.data || err);
      } finally {
        setLoading(false);
      }

      return;
    }

    // ✅ ENTER EDIT MODE
    setIsEditing(true);
    if (selectedProfile) {
      setEditedProfile({ ...selectedProfile });
      setEditedAccounts(selectedProfile?.person_accounts || []);
      setDeletedAccountIds([]);
    }
  };

  // ✅ Handle input changes
  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Calculate age based on selectedProfile
  const age = selectedProfile?.birthday
    ? new Date().getFullYear() - new Date(selectedProfile.birthday).getFullYear()
    : "";

  // ✅ Calculate paginated people
  const paginatedPeople = people.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  // ✅ Update total pages when people change
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(people.length / CARDS_PER_PAGE);
    setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);

    // Reset to page 1 when people data changes
    setCurrentPage(1);
  }, [people]);

  // ✅ Search function
  const handleSearch = async () => {
    if (!searchName) return;
    setLoading(true);
    try {
      const response = await axios.get("http://192.168.11.70:7789/profile/icon/", {
        params: { name: searchName },
      });
      setPeople(response.data);
    } catch (error) {
      console.error(error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle card click to load profile details
  const handleCardClick = async (name, id = null) => {
    try {
      setLoading(true);

      // Use ID if provided, otherwise use name
      const params = id ? { id } : { name };

      const response = await axios.get("http://192.168.11.70:7789/profile/", {
        params: params,
      });
      setSelectedProfile(response.data);
    } catch (error) {
      console.error(error);
      setSelectedProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show All function
  const handleShowAll = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://192.168.11.70:7789/profile/all/"); // Adjust API endpoint
      setPeople(response.data);
      setSearchName(""); // Clear search input
    } catch (error) {
      console.error(error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleRemoveAccount = (acc) => {
    // UI ထဲကနေဖယ်
    setEditedAccounts((prev) => prev.filter((x) => x.id !== acc.id));

    // DB row delete list ထဲထည့် (id ရှိတဲ့ row ပဲ)
    if (acc.id) setDeletedAccountIds((prev) => [...prev, acc.id]);
  };

  useEffect(() => {
    if (selectedProfile?.person_accounts) {
      setEditedAccounts(selectedProfile.person_accounts);
      setDeletedAccountIds([]);
    }
  }, [selectedProfile]);

  return (
    <DashboardLayout>
      {/* ======= Aura Background ======= */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.3, // Increase opacity
          background:
            "radial-gradient(70vmax 70vmax at 20% 20%, #38bdf8 0%, transparent 45%), radial-gradient(60vmax 50vmax at 90% 10%, #8b5cf6 0%, transparent 50%)",
          zIndex: -1,
        }}
      />

      {/* ======= Main container for banner and cards ======= */}
      <Box sx={{ p: { xs: 1, sm: 2, md: 2 } }}>
        {/* ======= Banner with glass effect - aligned width ======= */}
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            height: { xs: 90, md: 120 },
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 3,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            mb: { xs: 1.5, sm: 2 },
            width: "100%",
            px: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          {/* Center Content */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.4,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              }}
            >
              {selectedProfile?.name || ""}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: { xs: 0.5, md: 1 },
              }}
            >
              {/* <Avatar src={selectedProfile?.profile_icon} sx={{ width: 40, height: 40, mr: 1 }} /> */}
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.95,
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
                }}
              >
                {selectedProfile ? selectedProfile.occupation : ""}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ======= Main area with glass effect ======= */}
        <Box
          sx={{
            display: "flex",
          }}
        >
          <Grid container spacing={{ xs: 1, sm: 2, md: 2 }} alignItems="stretch" sx={{ flex: 1 }}>
            <ThemeProvider
              theme={createTheme({
                components: {
                  MuiTypography: {
                    styleOverrides: {
                      root: {
                        color: "white !important",
                      },
                    },
                  },
                  MuiInputBase: {
                    styleOverrides: {
                      input: {
                        color: "white !important",
                        fontSize: "13.5px",
                      },
                      root: {
                        color: "white !important",
                      },
                    },
                  },
                  MuiInputLabel: {
                    styleOverrides: {
                      root: {
                        color: "rgba(255,255,255,0.8) !important",
                      },
                    },
                  },
                  MuiSelect: {
                    styleOverrides: {
                      select: {
                        color: "white !important",
                        fontSize: "13.5px",
                      },
                      icon: {
                        color: "white !important",
                      },
                    },
                  },
                  MuiFormLabel: {
                    styleOverrides: {
                      root: {
                        color: "rgba(255,255,255,0.8) !important",
                      },
                    },
                  },
                  MuiMenuItem: {
                    styleOverrides: {
                      root: {
                        color: "black",
                      },
                    },
                  },
                },
              })}
            >
              {/* ---------- LEFT: Biography with glass effect ---------- */}
              <Grid item xs={12} sm={12} md={4} sx={{ display: "flex" }}>
                <Box sx={{ position: "relative", flex: 1, display: "flex", width: "100%" }}>
                  {/* Avatar with glass border */}
                  <Avatar
                    src={selectedProfile?.profile_icon || profileImg}
                    alt="Profile"
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      transform: "translate(-50%, -50%)",
                      width: { xs: AVATAR.xs, md: AVATAR.md },
                      height: { xs: AVATAR.xs, md: AVATAR.md },
                      border: "8px solid rgba(255, 255, 255, 0.3)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      zIndex: 2,
                    }}
                  />

                  <Card
                    elevation={0}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(15px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      borderRadius: 3,
                      p: { xs: 2, sm: 2.5, md: 3 },
                      minHeight: 0,
                      height: "100%",
                      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                      width: "100%",
                    }}
                  >
                    {/* Spacer for avatar */}
                    <Box
                      sx={{
                        height: {
                          xs: AVATAR.xs / 2 + 16,
                          sm: AVATAR.xs / 2 + 16,
                          md: AVATAR.md / 2 + 16,
                        },
                      }}
                    />

                    {/* Biography header */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: "serif",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                          fontSize: { xs: "1.25rem", sm: "1.375rem", md: "1.5rem" },
                          fontWeight: 600,
                          color: "white",
                        }}
                      >
                        Biography
                      </Typography>
                      {/* <OpenInNewOutlinedIcon fontSize="small" sx={{ opacity: 0.8 }} /> */}

                      {/* Edit/Save and Cancel buttons */}
                      {isEditing ? (
                        <>
                          <SaveOutlinedIcon
                            fontSize="small"
                            sx={{
                              opacity: 0.8,
                              cursor: "pointer",
                              "&:hover": {
                                opacity: 1,
                                color: "#4CAF50",
                              },
                            }}
                            onClick={handleEditToggle}
                          />
                          <CancelOutlinedIcon
                            fontSize="small"
                            sx={{
                              opacity: 0.8,
                              cursor: "pointer",
                              "&:hover": {
                                opacity: 1,
                                color: "#f44336",
                              },
                            }}
                            onClick={handleCancelEdit}
                          />
                        </>
                      ) : (
                        <EditOutlinedIcon
                          fontSize="small"
                          sx={{
                            opacity: 0.8,
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 1,
                              color: "#FFD700",
                            },
                          }}
                          onClick={handleEditToggle}
                        />
                      )}
                      {/* <AppsOutlinedIcon fontSize="small" sx={{ opacity: 0.8 }} /> */}
                    </Box>

                    {/* Glass divider */}
                    <Box
                      sx={{
                        borderBottom: "1px solid rgba(255,255,255,0.3)",
                        mb: 2,
                      }}
                    />

                    {/* Form with glass inputs */}
                    <Box
                      component="form"
                      autoComplete="off"
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "90px 1fr", sm: "100px 1fr", md: "110px 1fr" },
                        columnGap: { xs: 1, sm: 1.5, md: 2 },
                        rowGap: { xs: 1, sm: 1.1, md: 1.1 },
                        "& .MuiFilledInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                        },
                        "& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after": {
                          display: "none",
                        },
                        "& .MuiInputBase-input": {
                          px: 2,
                          py: 1,
                          color: "white",
                          fontSize: "13.5px",
                          "&::placeholder": {
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "13.5px",
                          },
                        },
                        "& .label": {
                          alignSelf: "center",
                          color: "rgba(255,255,255,0.9)",
                          fontSize: { xs: 12.5, sm: 13, md: 13.5 },
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        },
                      }}
                    >
                      <Label text="NRC" />
                      <TextField
                        variant="filled"
                        size="small"
                        value={isEditing ? editedProfile?.nrc || "" : selectedProfile?.nrc || ""}
                        onChange={(e) => handleInputChange("nrc", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
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
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />
                      <Label text="Passport" />
                      <TextField
                        variant="filled"
                        size="small"
                        value={
                          isEditing
                            ? editedProfile?.passport || ""
                            : selectedProfile?.passport || ""
                        }
                        onChange={(e) => handleInputChange("passport", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
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
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Birthday" />
                      <TextField
                        type="date"
                        variant="filled"
                        size="small"
                        value={
                          isEditing
                            ? editedProfile?.birthday || ""
                            : selectedProfile?.birthday || ""
                        }
                        onChange={(e) => handleInputChange("birthday", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing, // Use readOnly instead of disabled
                          endAdornment: (
                            <InputAdornment position="end">
                              <CalendarMonthOutlinedIcon sx={{ color: "rgba(255,255,255,0.8)" }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          "& .MuiFilledInput-root": {
                            borderRadius: 2,
                            backgroundColor: "rgba(0, 0, 0, 0.35)", // darker background
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            "&:before": { borderBottom: "none" },
                            "&:after": { borderBottom: "none" },
                            "&:hover:before": { borderBottom: "none" },
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.45)", // slightly darker on hover
                            },
                          },
                          "& .MuiInputBase-input": {
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Nationality" />
                      <TextField
                        variant="filled"
                        size="small"
                        // value={selectedProfile?.nationality || ""}
                        value={
                          isEditing
                            ? editedProfile?.nationality || ""
                            : selectedProfile?.nationality || ""
                        }
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
                        sx={{
                          "& .MuiFilledInput-root": {
                            borderRadius: 2,
                            backgroundColor: "rgba(0, 0, 0, 0.35)", // darker background
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            "&:before": { borderBottom: "none" },
                            "&:after": { borderBottom: "none" },
                            "&:hover:before": { borderBottom: "none" },
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.45)", // slightly darker on hover
                            },
                          },
                          "& .MuiInputBase-input": {
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Age" />
                      <TextField
                        variant="filled"
                        size="small"
                        value={isEditing ? editedProfile?.age || age : age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
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
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Father Name" />
                      <TextField
                        variant="filled"
                        size="small"
                        // value={selectedProfile?.father_name || ""}
                        value={
                          isEditing
                            ? editedProfile?.father_name || ""
                            : selectedProfile?.father_name || ""
                        }
                        onChange={(e) => handleInputChange("father_name", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
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
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Height" />
                      <TextField
                        variant="filled"
                        size="small"
                        // value={selectedProfile?.height || ""}
                        value={
                          isEditing ? editedProfile?.height || "" : selectedProfile?.height || ""
                        }
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
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
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Blood" />
                      <TextField
                        variant="filled"
                        size="small"
                        // value={selectedProfile?.blood || ""}
                        value={
                          isEditing ? editedProfile?.blood || "" : selectedProfile?.blood || ""
                        }
                        onChange={(e) => handleInputChange("blood", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
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
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Sex" />
                      <FormControl
                        variant="filled"
                        size="small"
                        sx={{
                          width: "100%",
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
                            minHeight: "unset", // Remove any min-height
                            height: "42px", // Match exact height of other text fields
                          },
                        }}
                      >
                        <Select
                          value={isEditing ? editedProfile?.sex || "" : selectedProfile?.sex || ""}
                          onChange={(e) => handleInputChange("sex", e.target.value)}
                          inputProps={{
                            readOnly: !isEditing,
                          }}
                          displayEmpty
                          sx={{
                            color: "rgba(255,255,255,0.95)",
                            fontSize: "13.5px",
                            "& .MuiSelect-icon": {
                              color: isEditing ? "rgba(255,255,255,0.8)" : "transparent",
                            },
                            height: "42px", // Exact height
                            minHeight: "unset",
                            px: 2,
                            borderRadius: 2,
                            "& .MuiSelect-select": {
                              padding: "8px 0", // Adjust padding to fit height
                              fontSize: "13.5px",
                              cursor: isEditing ? "pointer" : "default",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              boxSizing: "border-box",
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                bgcolor: "rgba(255, 255, 255, 0.9)",
                                backdropFilter: "blur(10px)",
                                mt: 0.5,
                                "& .MuiMenuItem-root": {
                                  fontSize: "13.5px",
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em style={{ color: "#666", fontSize: "13.5px" }}>—</em>
                          </MenuItem>
                          <MenuItem value="Male" sx={{ fontSize: "13.5px" }}>
                            Male
                          </MenuItem>
                          <MenuItem value="Female" sx={{ fontSize: "13.5px" }}>
                            Female
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <Label text="Phone" />
                      <TextField
                        variant="filled"
                        size="small"
                        // value={selectedProfile?.phone || ""}
                        value={
                          isEditing ? editedProfile?.phone || "" : selectedProfile?.phone || ""
                        }
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing,
                        }}
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
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />

                      <Label text="Address" />
                      <TextField
                        variant="filled"
                        size="small"
                        value={
                          isEditing ? editedProfile?.address || "" : selectedProfile?.address || ""
                        }
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        InputProps={{
                          readOnly: !isEditing, // Use readOnly instead of disabled
                        }}
                        multiline
                        rows={4}
                        sx={{
                          "& .MuiFilledInput-root": {
                            borderRadius: 2,
                            backgroundColor: "rgba(0, 0, 0, 0.35)", // darker background
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            "&:before": { borderBottom: "none" },
                            "&:after": { borderBottom: "none" },
                            "&:hover:before": { borderBottom: "none" },
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.45)", // slightly darker on hover
                            },
                          },
                          "& .MuiInputBase-input": {
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 1, sm: 1.2 },
                            color: "rgba(255,255,255,0.95)",
                            fontSize: { xs: "12.5px", sm: "13px", md: "13.5px" },
                            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
                          },
                        }}
                      />
                    </Box>
                  </Card>
                </Box>
              </Grid>

              {/* ---------- CENTER: Content with glass effect ---------- */}
              <Grid item xs={12} sm={12} md={5} sx={{ display: "flex" }}>
                <Card
                  elevation={0}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 3,
                    p: { xs: 2, sm: 2.5, md: 3 },
                    minHeight: 0,
                    height: "100%",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      // gap: { xs: 2, sm: 2.5, md: 3 },
                      gap: { xs: 1, sm: 1.5, md: 2 },
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    <GlassPanel
                      title="Education"
                      rows={4}
                      value={isEditing ? editedProfile?.education : selectedProfile?.education}
                      field="education"
                      isEditing={isEditing}
                      onValueChange={handleInputChange}
                    />
                    <GlassPanel
                      title="Occupation"
                      rows={4}
                      value={isEditing ? editedProfile?.occupation : selectedProfile?.occupation}
                      field="occupation"
                      isEditing={isEditing}
                      onValueChange={handleInputChange}
                    />

                    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                      <GlassPanel
                        title="About"
                        rows={10}
                        value={isEditing ? editedProfile?.brief_bio : selectedProfile?.brief_bio}
                        field="brief_bio"
                        isEditing={isEditing}
                        onValueChange={handleInputChange}
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontFamily: "serif",
                          fontWeight: 600,
                          color: "white",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                          fontSize: "1.5rem",
                          mb: 0.5,
                        }}
                      >
                        Social Media
                      </Typography>

                      <Box
                        sx={{
                          height: 2,
                          borderBottom: "2px solid rgba(255,255,255,0.3)",
                          mb: 1,
                        }}
                      />

                      {(isEditing ? editedAccounts : selectedProfile?.person_accounts)?.length ? (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}
                        >
                          {(isEditing ? editedAccounts : selectedProfile.person_accounts)
                            .filter((a) => a?.username && a?.link)
                            .map((acc, idx) => (
                              <Box
                                key={`${acc.id ?? "new"}-${acc.net_id}-${idx}`}
                                component="a"
                                href={isEditing ? undefined : acc.link}
                                onClick={(e) => {
                                  if (isEditing) e.preventDefault(); // edit mode မှာ link click မဖြစ်စေ
                                }}
                                target={isEditing ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                sx={{
                                  position: "relative", // ✅ for close button
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.6,
                                  px: 1.2,
                                  py: 0.45,
                                  pr: isEditing ? 3.2 : 1.2, // ✅ right space for X
                                  borderRadius: 999,
                                  textDecoration: "none",
                                  background: "rgba(56,189,248,0.10)",
                                  border: "1px solid rgba(56,189,248,0.35)",
                                  color: "#38bdf8",
                                  textShadow: "0 0 6px rgba(56,189,248,0.65)",
                                }}
                              >
                                {netIcon(acc.net_id)}
                                <Box component="span" sx={{ fontSize: "13.5px", fontWeight: 700 }}>
                                  {acc.username}
                                </Box>

                                {/* ✅ Edit mode only: X icon */}
                                {isEditing && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveAccount(acc);
                                    }}
                                    sx={{
                                      position: "absolute",
                                      right: 4,
                                      top: 4,
                                      p: "2px",
                                      bgcolor: "rgba(0,0,0,0.35)",
                                      border: "1px solid rgba(255,255,255,0.25)",
                                      "&:hover": { bgcolor: "rgba(244,67,54,0.35)" },
                                    }}
                                  >
                                    <CloseIcon
                                      sx={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}
                                    />
                                  </IconButton>
                                )}
                              </Box>
                            ))}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.6)", fontSize: "13.5px" }}
                        >
                          No linked accounts
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </ThemeProvider>

            {/* ---------- RIGHT: People Cards Section ---------- */}
            <Grid item xs={12} sm={12} md={3} sx={{ display: "flex" }}>
              <Card
                elevation={0}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  p: { xs: 2, sm: 2.5, md: 3 },
                  minHeight: 0,
                  height: "100%",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                  width: "100%",
                  maxWidth: "100%",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {/* People Section Header */}
                <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, width: "100%", overflow: "hidden" }}>
                  {/* Right Corner: Search Box and Button */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      gap: { xs: 1, sm: 1, md: 1.5 },
                      width: "100%",
                      maxWidth: "100%",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Search Box */}
                    <TextField
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="Search..."
                      variant="outlined"
                      size="small"
                      fullWidth={false}
                      sx={{
                        flex: { xs: "1 1 100%", sm: "1 1 0", md: "1 1 0" },
                        width: { xs: "100%", sm: "auto", md: "auto" },
                        minWidth: { xs: 0, sm: 80, md: 100 },
                        maxWidth: {
                          xs: "100%",
                          sm: "calc(100% - 200px)",
                          md: "calc(100% - 220px)",
                        },
                        overflow: "hidden",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "white",
                          fontSize: { xs: "0.85rem", sm: "0.875rem", md: "0.9rem" },
                          padding: { xs: "8px 12px", sm: "9px 13px", md: "10px 14px" },
                          "&::placeholder": {
                            color: "rgba(255, 255, 255, 0.7)",
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              sx={{
                                color: "rgba(255, 255, 255, 0.8)",
                                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Search Button */}
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }} />}
                      onClick={handleSearch}
                      sx={{
                        background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: 3,
                        px: { xs: 1.5, sm: 1.5, md: 2 },
                        py: { xs: 0.875, sm: 1, md: 1 },
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: { xs: "0.75rem", sm: "0.75rem", md: "0.8rem" },
                        width: { xs: "100%", sm: "auto", md: "auto" },
                        minWidth: { xs: "100%", sm: "80px", md: "90px" },
                        maxWidth: { xs: "100%", sm: "90px", md: "100px" },
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        boxShadow: "0 4px 15px 0 rgba(116, 75, 162, 0.3)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #764ba2 0%, #667eea 100%)",
                          boxShadow: "0 6px 20px 0 rgba(116, 75, 162, 0.4)",
                          transform: "translateY(-1px)",
                        },
                        "&:active": {
                          transform: "translateY(0)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Search
                    </Button>

                    {/* Show All Button */}
                    <Button
                      variant="contained"
                      onClick={handleShowAll}
                      sx={{
                        background: "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: 3,
                        px: { xs: 1.5, sm: 1.5, md: 2 },
                        py: { xs: 0.875, sm: 1, md: 1 },
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: { xs: "0.75rem", sm: "0.75rem", md: "0.8rem" },
                        color: "white",
                        width: { xs: "100%", sm: "auto", md: "auto" },
                        minWidth: { xs: "100%", sm: "80px", md: "90px" },
                        maxWidth: { xs: "100%", sm: "90px", md: "100px" },
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        boxShadow: "0 4px 15px 0 rgba(79, 172, 254, 0.3)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #00f2fe 0%, #4facfe 100%)",
                          boxShadow: "0 6px 20px 0 rgba(79, 172, 254, 0.4)",
                          transform: "translateY(-1px)",
                        },
                        "&:active": {
                          transform: "translateY(0)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Show All
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      height: 2,
                      borderBottom: "2px solid rgba(255,255,255,0.3)",
                      mb: { xs: 1.5, sm: 2 },
                      mt: { xs: 1.5, sm: 2 },
                    }}
                  />
                </Box>

                {/* People Cards Container - Fixed height with scroll */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr" },
                    gap: { xs: 1.5, sm: 2 },
                    flex: 1,
                    height: { xs: "300px", sm: "350px", md: "350px" },
                    overflowY: "auto",
                    pb: 1,
                    alignContent: "flex-start",
                    "& .MuiCard-root": {
                      background:
                        "linear-gradient(135deg, rgba(64, 224, 208, 0.15), rgba(0, 191, 255, 0.2))",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(64, 224, 208, 0.5)",
                      borderRadius: "14px",
                      boxShadow: `
        0 0 30px rgba(64, 224, 208, 0.3),
        0 8px 25px rgba(0, 191, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.4)
      `,
                      transition: "all 0.4s ease",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, rgba(64, 224, 208, 0.25), rgba(0, 191, 255, 0.3))",
                        transform: "translateY(-5px)",
                        boxShadow: `
          0 0 50px rgba(64, 224, 208, 0.5),
          0 12px 35px rgba(0, 191, 255, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.6)
        `,
                        border: "1px solid rgba(64, 224, 208, 0.7)",
                      },
                    },
                    "&::-webkit-scrollbar": {
                      width: 6,
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(0, 191, 255, 0.1)",
                      borderRadius: 3,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(64, 224, 208, 0.4)",
                      borderRadius: 3,
                      "&:hover": {
                        background: "rgba(64, 224, 208, 0.6)",
                      },
                    },
                  }}
                >
                  {/* {loading && (
                    <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 2 }}>
                      <Typography sx={{ color: "white" }}>Loading...</Typography>
                    </Box>
                  )}

                  {!loading && paginatedPeople.length === 0 && (
                    <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 2 }}>
                      <Typography sx={{ color: "white" }}>No results found</Typography>
                    </Box>
                  )} */}

                  {paginatedPeople.map((person, index) => (
                    <SimplePersonCard
                      key={index}
                      name={person.name}
                      role={person.profile_icon}
                      image={person.profile_icon}
                      id={person.id}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </Box>

                {/* Pagination Section */}
                {people.length > CARDS_PER_PAGE && (
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <Stack spacing={1}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        size="small"
                        siblingCount={0} // No siblings shown
                        boundaryCount={1} // Only show first and last page
                        showFirstButton={false}
                        showLastButton={false}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: "white",
                            fontSize: { xs: "0.7rem", sm: "0.725rem", md: "0.75rem" },
                            minWidth: { xs: "28px", sm: "30px", md: "32px" },
                            height: { xs: "28px", sm: "30px", md: "32px" },
                            margin: { xs: "0 1px", sm: "0 1.5px", md: "0 2px" },
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            background: "rgba(255, 255, 255, 0.08)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "8px",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.15)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)",
                            },
                            "&.Mui-selected": {
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              color: "white",
                              fontWeight: "bold",
                              border: "1px solid rgba(255, 255, 255, 0.5)",
                              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                              },
                            },
                            "&.MuiPaginationItem-ellipsis": {
                              color: "rgba(255, 255, 255, 0.6)",
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
                          "& .MuiPaginationItem-previousNext": {
                            background:
                              "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))",
                              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.25)",
                            },
                            "&.Mui-disabled": {
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "rgba(255, 255, 255, 0.3)",
                              boxShadow: "none",
                            },
                          },
                        }}
                      />
                    </Stack>
                  </Box>
                )}
                {/* Results Count */}
                {people.length > 0 && (
                  <Box sx={{ mt: 1, textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      Showing{" "}
                      <Box component="span" sx={{ color: "#FFD700", fontWeight: 600 }}>
                        {paginatedPeople.length}
                      </Box>{" "}
                      of{" "}
                      <Box component="span" sx={{ color: "#FFD700", fontWeight: 600 }}>
                        {people.length}
                      </Box>{" "}
                      results
                      {totalPages > 1 && (
                        <>
                          {" "}
                          (Page{" "}
                          <Box component="span" sx={{ color: "#FFD700", fontWeight: 600 }}>
                            {currentPage}
                          </Box>{" "}
                          of{" "}
                          <Box component="span" sx={{ color: "#FFD700", fontWeight: 600 }}>
                            {totalPages}
                          </Box>
                          )
                        </>
                      )}
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

// ✅ SimplePersonCard component with proper props
function SimplePersonCard({ name, role, image, onCardClick, id }) {
  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: "#e6e6e6",
        borderRadius: 2,
        overflow: "hidden",
        p: 2,
        transition: "all 0.3s ease",
        height: { xs: "160px", sm: "170px", md: "180px" },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 1, sm: 1.25, md: 1.5 },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <Avatar
        src={image}
        alt={name}
        sx={{
          width: { xs: 50, sm: 55, md: 60 },
          height: { xs: 50, sm: 55, md: 60 },
          border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      />

      <Typography
        variant="subtitle2"
        sx={{
          background: "linear-gradient(135deg, #FFD700, #D4AF37)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 600,
          // color: "#FFFF",
          fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
          textAlign: "center",
          lineHeight: 1.3,
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        {name}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: "#FFF",
          fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {role}
      </Typography>

      <Button
        size="small"
        onClick={() => onCardClick(name, id)}
        sx={{
          color: "#0D47A1", // Dark blue
          textAlign: "center",
          lineHeight: 1.3,
          textShadow: "0 0 6px rgba(13, 71, 161, 0.4)", // Dark blue glow
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.85rem",
          px: 1.5,
          py: 0.3,
          "&:hover": {
            textDecoration: "underline",
            backgroundColor: "transparent",
          },
        }}
      >
        More
      </Button>
    </Card>
  );
}

SimplePersonCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  image: PropTypes.string,
  onCardClick: PropTypes.func.isRequired,
  id: PropTypes.number,
};

// ✅ Label component
function Label({ text }) {
  return (
    <Typography className="label" noWrap>
      {text}
    </Typography>
  );
}

Label.propTypes = {
  text: PropTypes.string.isRequired,
};

// ✅ GlassPanel component
function GlassPanel({ title, rows, value, field, isEditing = false, onValueChange = () => {} }) {
  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        backdropFilter: "none",
        border: "none",
        color: "white",
        borderRadius: 2,
        p: 2,
        mb: 2,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontFamily: "serif",
          fontWeight: 600,
          mb: 1,
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          fontSize: { xs: "1.25rem", sm: "1.375rem", md: "1.5rem" },
          color: "white",
        }}
      >
        {title}
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={rows}
        variant="filled"
        value={value || ""}
        onChange={(e) => onValueChange(field, e.target.value)}
        InputProps={{
          readOnly: !isEditing, // Use readOnly instead of disabled
          disableUnderline: true,
        }}
        sx={{
          "& .MuiFilledInput-root": {
            borderRadius: 2,
            backgroundColor: "rgba(0, 0, 0, 0.35)", // darker background
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            "&:before": { borderBottom: "none" },
            "&:after": { borderBottom: "none" },
            "&:hover:before": { borderBottom: "none" },
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.45)", // slightly darker on hover
            },
          },
          "& .MuiInputBase-input": {
            px: 2,
            py: 1.2,
            color: "rgba(255,255,255,0.95)",
            fontSize: "13.5px",
            cursor: isEditing ? "text" : "default", // Change cursor based on edit mode
          },
        }}
      />
    </Card>
  );
}

GlassPanel.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.number,
  value: PropTypes.string,
  field: PropTypes.string, // ✅ Add field prop
  isEditing: PropTypes.bool, // ✅ Add isEditing prop
  onValueChange: PropTypes.func, // ✅ Add onValueChange prop
};

GlassPanel.defaultProps = {
  rows: 4,
  value: "",
  isEditing: false,
  onValueChange: () => {},
};
