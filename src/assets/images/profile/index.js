// src/layouts/profile/index.js
import React from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React container
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

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
} from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

// ✅ Adjust the path to your image if needed
import profileImg from "assets/images/profile/pf.jpg";

/* ---------- Layout constants ---------- */
const AVATAR = { xs: 140, md: 210 }; // avatar size
const BANNER_H = { xs: 150, md: 180 }; // banner height
const HAIRLINE = 2; // hairline height under the banner

export default function ProfilePage() {
  return (
    <DashboardLayout>
      {/* ======= Banner (title at 2/3 horizontal position) ======= */}
      <Box
        sx={{
          bgcolor: "#082c2d",
          color: "white",
          height: { xs: 100, md: 150 }, // or BANNER_H.xs / md
          position: "relative",
          display: "flex",
          alignItems: "center", // vertically center
          justifyContent: "flex-start", // we'll position manually
          borderRadius: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: "80%", // 💡 horizontally at 3/2 point (2/3 of width)
            top: "50%", // vertically centered
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
            Poe Mamhe Thar
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, opacity: 0.95 }}>
            Artist
          </Typography>
        </Box>
      </Box>
      {/* Hairline */}
      {/* <Box sx={{ height: HAIRLINE, bgcolor: "#cfcfcf", mb: { xs: 6, md: 8 } }} /> */}

      {/* ======= Main area fills to bottom of viewport ======= */}
      <Box
        sx={{
          minHeight: {
            xs: `calc(100vh - ${BANNER_H.xs}px - ${HAIRLINE}px)`,
            md: `calc(100vh - ${BANNER_H.md}px - ${HAIRLINE}px)`,
          },
          display: "flex",
        }}
      >
        <Grid container spacing={0} alignItems="stretch" sx={{ flex: 1 }}>
          {/* ---------- LEFT: Biography (equal height) ---------- */}
          <Grid item xs={12} md={4} sx={{ display: "flex" }}>
            {/* Wrapper anchors the absolute avatar; lets the Card stretch */}
            <Box sx={{ position: "relative", flex: 1, display: "flex" }}>
              {/* Avatar centered on Biography: half above, half inside */}
              <Avatar
                src={profileImg}
                alt="Profile"
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  width: { xs: AVATAR.xs, md: AVATAR.md },
                  height: { xs: AVATAR.xs, md: AVATAR.md },
                  border: "8px solid #f0f0f0",
                  boxShadow: 3,
                  bgcolor: "white",
                  zIndex: 2,
                }}
              />

              <Card
                elevation={0}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#0f5857",
                  color: "white",
                  borderRadius: 0,
                  p: 3,
                  // ❗️No paddingTop here (it caused the big gap)
                  minHeight: 0,
                  height: "100%",
                }}
              >
                {/* ✅ Spacer BEFORE the header — reserves room for avatar's lower half
                    so header/divider stay tight and do NOT create a gap above NRC */}
                <Box
                  sx={{
                    height: {
                      xs: AVATAR.xs / 2 + 16, // tweak +16 for a bit of breathing space
                      md: AVATAR.md / 2 + 16,
                    },
                  }}
                />

                {/* Biography header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="h5" sx={{ fontFamily: "serif" }}>
                    Biography
                  </Typography>
                  <OpenInNewOutlinedIcon fontSize="small" />
                  <EditOutlinedIcon fontSize="small" />
                  <AppsOutlinedIcon fontSize="small" />
                </Box>

                {/* Divider sits RIGHT under header (no extra blank space above) */}
                <Box
                  sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.35)",
                    mb: 2, // modest gap before the first row
                  }}
                />

                {/* Form: labels left, pill inputs right */}
                <Box
                  component="form"
                  autoComplete="off"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    columnGap: 2,
                    rowGap: 1.1,
                    "& .pill": {
                      gridColumn: "2 / 3",
                      backgroundColor: "rgba(0,0,0,0.12)",
                      borderRadius: 999,
                      overflow: "hidden",
                      color: "white",
                    },
                    "& .MuiFilledInput-root": { backgroundColor: "transparent" },
                    "& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after": {
                      display: "none",
                    },
                    "& .MuiInputBase-input": { px: 2, py: 1 },
                    "& .label": {
                      alignSelf: "center",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 13.5,
                    },
                  }}
                >
                  <Label text="NRC" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Passport" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Birthday" />
                  <TextField
                    type="date"
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarMonthOutlinedIcon sx={{ color: "white" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Label text="Nationality" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Age" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Father Name" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Height" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Blood" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Sex" />
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{
                      width: "100%",
                      "& .MuiFilledInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                        minHeight: "40px", // Match TextField height
                      },
                    }}
                  >
                    <Select
                      defaultValue=""
                      displayEmpty
                      sx={{
                        color: "white",
                        "& .MuiSelect-icon": { color: "white" },
                        px: 2,
                        py: 1.2, // Match TextField padding
                        borderRadius: 2,
                        "& .MuiSelect-select": {
                          paddingTop: "8px",
                          paddingBottom: "8px",
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>—</em>
                      </MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                  </FormControl>

                  <Label text="Phone" />
                  <TextField
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiFilledInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#15534f",
                        "&:before": { borderBottom: "none" },
                        "&:after": { borderBottom: "none" },
                        "&:hover:before": { borderBottom: "none" },
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                        color: "white",
                      },
                    }}
                  />

                  <Label text="Address" />
                  <TextField
                    variant="outlined"
                    size="small"
                    multiline
                    rows={4}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                      "& .MuiInputBase-input": {
                        px: 2,
                        py: 1.2,
                      },
                    }}
                  />
                </Box>
              </Card>
            </Box>
          </Grid>

          {/* ---------- RIGHT: Content (compact gap under About) ---------- */}
          <Grid item xs={12} md={8} sx={{ display: "flex" }}>
            <Card
              elevation={0}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#bfbfbf",
                p: 2,
                borderRadius: 0,
                minHeight: 0,
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0 }}>
                <Panel title="Education" rows={4} />
                <Panel title="Work" rows={4} />

                {/* ⬇️ Remove flex:1 so About doesn't push a big gap */}
                <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <Panel title="About" rows={10} />
                </Box>

                {/* ⬇️ Don't pin to bottom; just a small margin */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: "#222", mb: 0.5 }}>
                    Social Media
                  </Typography>
                  <Box
                    sx={{
                      height: 2,
                      borderBottom: "2px solid rgba(255,255,255,0.9)",
                      mb: 1,
                    }}
                  />
                  <Link
                    href="#"
                    underline="hover"
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.7 }}
                  >
                    <FacebookIcon fontSize="small" sx={{ color: "#1877f2" }} />
                    <Typography variant="body2" sx={{ color: "#0f2a6b" }}>
                      Poe Mamhe Thar
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

/* ---------- Small helpers (with PropTypes) ---------- */
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

function Panel({ title, rows }) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "#dcdcdc",
        color: "#202020",
        borderRadius: 1.5,
        p: 2,
        mb: 2,
        border: "1px solid #c8c8c8",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "#2b2b2b" }}>
        {title}
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={rows}
        variant="outlined"
        sx={{
          bgcolor: "white",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#bdbdbd" },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#9a9a9a",
          },
          "& .MuiInputBase-input": {
            color: "#000", // 💡 text color when typing
          },
        }}
      />
    </Card>
  );
}
Panel.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.number,
};
Panel.defaultProps = {
  rows: 4,
};
