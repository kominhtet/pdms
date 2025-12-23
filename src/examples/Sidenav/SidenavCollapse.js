/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

// @mui material components
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Custom styles for the SidenavCollapse
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "examples/Sidenav/styles/sidenavCollapse";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

function SidenavCollapse({ icon, name, active, collapse, noCollapse, ...rest }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();

  // Check if any sub-item is currently active
  const hasActiveSubItem =
    collapse && collapse.some((subItem) => location.pathname === subItem.route);
  const [open, setOpen] = useState(hasActiveSubItem);

  const handleToggle = () => {
    setOpen(!open);
  };

  // Update open state when location changes
  useEffect(() => {
    if (collapse) {
      const hasActiveSubItem = collapse.some((subItem) => location.pathname === subItem.route);
      setOpen(hasActiveSubItem);
    }
  }, [location.pathname, collapse]);

  return (
    <>
      <ListItem
        component="li"
        onClick={collapse ? handleToggle : undefined}
        sx={{ cursor: collapse ? "pointer" : "default" }}
      >
        <MDBox
          {...rest}
          sx={(theme) =>
            collapseItem(theme, {
              active,
              transparentSidenav,
              whiteSidenav,
              darkMode,
              sidenavColor,
            })
          }
        >
          <ListItemIcon
            sx={(theme) =>
              collapseIconBox(theme, { transparentSidenav, whiteSidenav, darkMode, active })
            }
          >
            {typeof icon === "string" ? (
              <Icon sx={(theme) => collapseIcon(theme, { active })}>{icon}</Icon>
            ) : (
              icon
            )}
          </ListItemIcon>

          <ListItemText
            primary={name}
            sx={(theme) =>
              collapseText(theme, {
                miniSidenav,
                transparentSidenav,
                whiteSidenav,
                active,
              })
            }
          />
          {collapse && (
            <Icon sx={{ marginLeft: "auto" }}>{open ? "expand_less" : "expand_more"}</Icon>
          )}
        </MDBox>
      </ListItem>
      {collapse && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {collapse.map((subItem) => {
              const isSubItemActive = location.pathname === subItem.route;
              return (
                <NavLink key={subItem.key} to={subItem.route} style={{ textDecoration: "none" }}>
                  <ListItem component="li">
                    <MDBox
                      sx={(theme) =>
                        collapseItem(theme, {
                          active: isSubItemActive,
                          transparentSidenav,
                          whiteSidenav,
                          darkMode,
                          sidenavColor,
                        })
                      }
                    >
                      <ListItemIcon
                        sx={(theme) =>
                          collapseIconBox(theme, {
                            transparentSidenav,
                            whiteSidenav,
                            darkMode,
                            active: isSubItemActive,
                          })
                        }
                      >
                        {typeof subItem.icon === "string" ? (
                          <Icon sx={(theme) => collapseIcon(theme, { active: isSubItemActive })}>
                            {subItem.icon}
                          </Icon>
                        ) : (
                          subItem.icon
                        )}
                      </ListItemIcon>

                      <ListItemText
                        primary={subItem.name}
                        sx={(theme) =>
                          collapseText(theme, {
                            miniSidenav,
                            transparentSidenav,
                            whiteSidenav,
                            active: isSubItemActive,
                          })
                        }
                      />
                    </MDBox>
                  </ListItem>
                </NavLink>
              );
            })}
          </List>
        </Collapse>
      )}
    </>
  );
}

// Setting default values for the props of SidenavCollapse
SidenavCollapse.defaultProps = {
  active: false,
  noCollapse: false,
};

// Typechecking props for the SidenavCollapse
SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  collapse: PropTypes.array,
  noCollapse: PropTypes.bool,
};

export default SidenavCollapse;
