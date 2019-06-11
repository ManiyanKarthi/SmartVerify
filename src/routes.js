// @material-ui/icons
import Person from "@material-ui/icons/Person";


import DashboardPage from "views/Dashboard/Dashboard.jsx";
import UserProfile from "views/UserProfile/UserProfile.jsx";



const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Employee Bill Submission",
    icon: Person,
    component: DashboardPage,
    layout: "/admin"
  },
  {
    path: "/user",
    name: "Finance Bill Verification",
    icon: Person,
    component: UserProfile,
    layout: "/admin"
  }
];

export default dashboardRoutes;
