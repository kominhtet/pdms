import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// @mui icons
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Language from "@mui/icons-material/Language";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";

function About() {
  const [activeSection, setActiveSection] = useState("Overview");

  const darkText = "#0a0a0a";
  const whiteText = "#FFFFFF";
  const facebookBlue = "#1877F2";
  const lightBlue = "#E7F3FF";
  const secondaryText = "#65676B";
  const lightGray = "#F0F2F5";

  const navigationLinks = [
    "Overview",
    "Work and education",
    "Places lived",
    "Contact and basic info",
    "Family and relationships",
    "Details about you",
    "Life events",
  ];

  const overviewItems = [
    {
      icon: <WorkIcon sx={{ color: secondaryText, fontSize: 24 }} />,
      title: "Works at Myanmar",
      subtitle: "1 April 2025 to present",
      showEdit: false,
    },
    {
      icon: <SchoolIcon sx={{ color: secondaryText, fontSize: 24 }} />,
      title: "Studied at Bago University",
      subtitle: "Started in 2025",
      showEdit: false,
    },
    {
      icon: <HomeIcon sx={{ color: secondaryText, fontSize: 24 }} />,
      title: "Lives in Bago, Myanmar",
      subtitle: null,
      showEdit: false,
    },
    {
      icon: <LocationOnIcon sx={{ color: secondaryText, fontSize: 24 }} />,
      title: "From Bago, Myanmar",
      subtitle: null,
      showEdit: false,
    },
    {
      icon: <FavoriteIcon sx={{ color: secondaryText, fontSize: 24 }} />,
      title: "Single",
      subtitle: null,
      showEdit: true,
    },
  ];

  return (
    <MDBox mt={3}>
      <Grid container spacing={3} alignItems="flex-start">
        {/* Left Column - Navigation Sidebar */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              backgroundColor: whiteText,
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <MDBox p={2}>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                sx={{ color: darkText, mb: 2, fontSize: "20px" }}
              >
                About
              </MDTypography>
              <MDBox>
                {navigationLinks.map((link) => (
                  <MDBox
                    key={link}
                    onClick={() => setActiveSection(link)}
                    sx={{
                      p: 1.5,
                      mb: 0.5,
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: activeSection === link ? lightBlue : "transparent",
                      color: activeSection === link ? facebookBlue : darkText,
                      fontWeight: activeSection === link ? 600 : 400,
                      fontSize: "15px",
                      "&:hover": {
                        backgroundColor: activeSection === link ? lightBlue : lightGray,
                      },
                    }}
                  >
                    {link}
                  </MDBox>
                ))}
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Right Column - Content Area */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              backgroundColor: whiteText,
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <MDBox p={2}>
              {activeSection === "Overview" && (
                <MDBox>
                  {overviewItems.map((item, index) => (
                    <MDBox
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        py: 1.5,
                        borderBottom:
                          index < overviewItems.length - 1 ? "1px solid #E4E6EB" : "none",
                      }}
                    >
                      {/* Icon */}
                      <MDBox sx={{ mr: 2, mt: 0.5 }}>{item.icon}</MDBox>

                      {/* Content */}
                      <MDBox sx={{ flex: 1 }}>
                        <MDTypography
                          variant="body1"
                          fontWeight={500}
                          sx={{ color: darkText, mb: 0.5, fontSize: "15px" }}
                        >
                          {item.title}
                        </MDTypography>
                        {item.subtitle && (
                          <MDTypography
                            variant="caption"
                            sx={{ color: secondaryText, fontSize: "13px" }}
                          >
                            {item.subtitle}
                          </MDTypography>
                        )}
                      </MDBox>

                      {/* Action Icons */}
                      <MDBox sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          sx={{
                            color: secondaryText,
                            "&:hover": { backgroundColor: lightGray },
                          }}
                        >
                          <Language sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            color: secondaryText,
                            "&:hover": { backgroundColor: lightGray },
                          }}
                        >
                          {item.showEdit ? (
                            <EditIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <MoreHoriz sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </MDBox>
                    </MDBox>
                  ))}
                </MDBox>
              )}

              {activeSection !== "Overview" && (
                <MDBox>
                  <MDTypography
                    variant="body1"
                    sx={{ color: darkText, textAlign: "center", py: 4, fontSize: "15px" }}
                  >
                    {activeSection} content coming soon
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default About;
