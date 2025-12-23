import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CircleIcon from "@mui/icons-material/Circle";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { keyframes } from "@mui/system";

import image from "assets/images/pdms.png";
import slide1 from "./image/6.png";
import slide2 from "./image/2.png";
import slide3 from "./image/8.jpg";
import slide4 from "./image/4.jpg";
import slide5 from "./image/5.jpg";

// CSS animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.02); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

export default function ModernImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(2); // Start with center image
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  // Cinematic images for the slider
  const images = [
    {
      id: 1,
      image: slide1,
      title: "Profile Management",
      subtitle: "Manage user profiles efficiently",
      color: "#ff00ff",
    },
    {
      id: 2,
      image: slide2,
      title: "Data Analytics",
      subtitle: "Advanced data analysis tools",
      color: "#00ffff",
    },
    {
      id: 3,
      image: slide3,
      title: "Secure Storage",
      subtitle: "Encrypted data storage system",
      color: "#ffff00",
    },
    {
      id: 4,
      image: slide4,
      title: "Multi-Platform",
      subtitle: "Cross-platform compatibility",
      color: "#ff5500",
    },
    {
      id: 5,
      image: slide5,
      title: "Real-time Sync",
      subtitle: "Instant data synchronization",
      color: "#00ffaa",
    },
  ];

  const totalSlides = images.length;

  const goToSlide = useCallback(
    (index) => {
      const safeIndex = (index + totalSlides) % totalSlides;
      setCurrentIndex(safeIndex);
      if (isAutoPlaying) {
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 300);
      }
    },
    [totalSlides, isAutoPlaying]
  );

  const goToPrevSlide = useCallback(() => {
    setDirection(-1);
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNextSlide = useCallback(() => {
    setDirection(1);
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      goToNextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrevSlide();
      if (e.key === "ArrowRight") goToNextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevSlide, goToNextSlide]);

  // Calculate positions for 3D effect - Show 3 slides at a time
  const getSlidePosition = (index) => {
    const offset = index - currentIndex;
    // Show only 3 slides: center, left, and right
    if (Math.abs(offset) > 2) {
      return {
        scale: 0.5,
        opacity: 0,
        blur: 10,
        zIndex: 0,
        x: offset < 0 ? "-120%" : "120%",
        brightness: 0.2,
      };
    }
    if (offset === 0) {
      // Center slide
      return {
        scale: 1,
        opacity: 1,
        blur: 0,
        zIndex: 30,
        x: "0%",
        brightness: 1,
      };
    } else if (offset === -1 || offset === 1) {
      // Immediate left/right slides
      return {
        scale: 0.75,
        opacity: 0.6,
        blur: 3,
        zIndex: 20,
        x: offset === -1 ? "-60%" : "60%",
        brightness: 0.6,
      };
    } else if (offset === -2 || offset === 2) {
      // Far left/right slides (barely visible)
      return {
        scale: 0.6,
        opacity: 0.3,
        blur: 6,
        zIndex: 10,
        x: offset === -2 ? "-90%" : "90%",
        brightness: 0.4,
      };
    }
  };

  const slideWidth = { xs: "200px", md: "300px" };
  const slideHeight = { xs: "250px", md: "350px" };
  return (
    <DashboardLayout>
      {/* Grid overlay */}
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

      {/* Centering wrapper - Full viewport height */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 6 },
          zIndex: 2,
        }}
      >
        {/* Main container */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "1200px",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 10, md: 16 },
          }}
        >
          <Box sx={{ pb: { xs: 4, md: 6 } }}>
            {/* Logo and Text Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={image}
                alt="PDMS Logo"
                sx={{
                  width: 120,
                  height: 120,
                  mb: 3,
                  boxShadow: "0 10px 30px rgba(65, 196, 243, 0.4)",
                  border: "2px solid rgba(65, 196, 243, 0.3)",
                  p: 1,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  color: "#41c4f3ff",
                  fontFamily: "Time News Roman",
                  fontWeight: "bold",
                  mb: 1,
                  textAlign: "center",
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  textShadow: "0 0 20px rgba(65, 196, 243, 0.5)",
                }}
              >
                Profile Data Management System
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  mb: 0,
                  color: "rgba(255, 255, 255, 0.7)",
                  fontWeight: 300,
                  fontSize: "1rem",
                  maxWidth: "600px",
                  fontFamily: "Time News Roman",
                }}
              >
                Developed by Computing Technology Department
              </Typography>
            </motion.div>
          </Box>
          {/* Slider container - Reduced size */}
          <Box
            sx={{
              position: "relative",
              height: { xs: "250px", md: "350px" },
              width: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              perspective: "100px",
              overflow: "visible",
              pt: { xs: 2, md: 4 },
              mb: { xs: 6, md: 8 },
            }}
          >
            {/* Slides */}
            <AnimatePresence mode="wait">
              {images.map((slide, index) => {
                const position = getSlidePosition(index);
                const isCenter = index === currentIndex;
                return (
                  <motion.div
                    key={slide.id}
                    initial={{ scale: 0.8, opacity: 0, x: direction > 0 ? 100 : -100 }}
                    animate={{
                      scale: position.scale,
                      opacity: position.opacity,
                      x: position.x,
                      filter: `blur(${position.blur}px) brightness(${position.brightness})`,
                    }}
                    exit={{ scale: 0.8, opacity: 0, x: direction > 0 ? -100 : 100 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.6,
                    }}
                    style={{
                      position: "absolute",
                      width: slideWidth,
                      height: slideHeight,
                      zIndex: position.zIndex,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Slide card */}
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "20px",
                        overflow: "hidden",
                        position: "relative",
                        cursor: isCenter ? "default" : "pointer",
                        transformStyle: "preserve-3d",
                        transform: isCenter ? "translateZ(30px)" : "translateZ(0)",
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: isCenter
                            ? "translateZ(40px) scale(1.02)"
                            : "translateZ(15px) scale(1.05)",
                        },
                      }}
                      onClick={() => !isCenter && goToSlide(index)}
                    >
                      {/* Main image */}
                      <Box
                        component="img"
                        src={slide.image}
                        alt={slide.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      {/* Overlay gradient */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%)",
                        }}
                      />
                      {/* Title overlay (only for center slide) */}
                      {isCenter && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              p: { xs: 2, md: 3 },
                              background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                            }}
                          >
                            <Typography
                              variant="h5"
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                mb: 0.5,
                                fontSize: { xs: "1rem", md: "1.5rem" },
                                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                              }}
                            >
                              {slide.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: slide.color,
                                fontWeight: 300,
                                fontSize: { xs: "0.7rem", md: "0.9rem" },
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              {slide.subtitle}
                            </Typography>
                          </Box>
                        </motion.div>
                      )}
                      {/* Glow effect for center slide */}
                      {isCenter && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "-2px",
                            left: "-2px",
                            right: "-2px",
                            bottom: "-2px",
                            borderRadius: "22px",
                            background: `radial-gradient(circle at center, ${slide.color}30 0%, transparent 70%)`,
                            filter: "blur(15px)",
                            opacity: 0.4,
                            zIndex: -1,
                            animation: `${pulseAnimation} 3s ease-in-out infinite`,
                          }}
                        />
                      )}
                      {/* Border effect */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: "20px",
                          border: `2px solid ${isCenter ? slide.color : "rgba(255,255,255,0.1)"}`,
                          boxShadow: isCenter
                            ? `0 0 40px ${slide.color}60, inset 0 0 30px ${slide.color}30`
                            : "0 0 15px rgba(0,0,0,0.5), inset 0 0 15px rgba(255,255,255,0.05)",
                          pointerEvents: "none",
                        }}
                      />
                    </Box>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Navigation arrows */}
            <IconButton
              onClick={goToPrevSlide}
              sx={{
                position: "absolute",
                left: { xs: "5px", md: "20px" },
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.7)",
                color: "#00ffff",
                border: "1px solid #00ffff",
                width: { xs: 40, md: 50 },
                height: { xs: 40, md: 50 },
                zIndex: 40,
                "&:hover": {
                  background: "rgba(0, 255, 255, 0.2)",
                  transform: "translateY(-50%) scale(1.1)",
                },
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: { xs: 24, md: 30 } }} />
            </IconButton>

            <IconButton
              onClick={goToNextSlide}
              sx={{
                position: "absolute",
                right: { xs: "5px", md: "20px" },
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.7)",
                color: "#ff00ff",
                border: "1px solid #ff00ff",
                width: { xs: 40, md: 50 },
                height: { xs: 40, md: 50 },
                zIndex: 40,
                "&:hover": {
                  background: "rgba(255, 0, 255, 0.2)",
                  transform: "translateY(-50%) scale(1.1)",
                },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: { xs: 24, md: 30 } }} />
            </IconButton>
          </Box>

          {/* Pagination dots */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1.5,
              mt: { xs: 2, md: 3 },
            }}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => goToSlide(index)}
                sx={{
                  cursor: "pointer",
                  position: "relative",
                  "&::before": {
                    content: `'""'`,
                    position: "absolute",
                    top: "-6px",
                    left: "-6px",
                    right: "-6px",
                    bottom: "-6px",
                    borderRadius: "50%",
                    background:
                      index === currentIndex
                        ? `radial-gradient(circle, ${images[currentIndex].color}30, transparent 70%)`
                        : "transparent",
                    opacity: index === currentIndex ? 1 : 0,
                    transition: "opacity 0.3s",
                  },
                }}
              >
                {index === currentIndex ? (
                  <CircleIcon
                    sx={{
                      fontSize: 20,
                      color: images[currentIndex].color,
                      animation: `${floatAnimation} 2s ease-in-out infinite`,
                      filter: `drop-shadow(0 0 8px ${images[currentIndex].color})`,
                    }}
                  />
                ) : (
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        color: "rgba(255,255,255,0.6)",
                        transform: "scale(1.5)",
                      },
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
