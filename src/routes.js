import Profile from "layouts/profile";
import Home from "layouts/home";
import FBProfile from "layouts/fbprofile";
import FBSearch from "layouts/fbsearch";
import Linking from "layouts/linking";
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    route: "/",
    component: <Home />,
  },
  {
    type: "collapse",
    name: "FB Profile",
    key: "fb_profile",
    icon: <Icon fontSize="small">facebook</Icon>,
    route: "/fbprofile",
    component: <FBProfile />,
  },
  {
    type: "collapse",
    name: "FB Search",
    key: "fb_search",
    icon: <Icon fontSize="small">search</Icon>,
    route: "/fbsearch",
    component: <FBSearch />,
  },
  {
    type: "collapse",
    name: "Linking",
    key: "linking",
    icon: <Icon fontSize="small">link</Icon>,
    route: "/linking",
    component: <Linking />,
  },
];

export default routes;
