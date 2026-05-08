
import Home from "./screen/components/Home/Home.js";
import Profile from "screen/components/Profile/profile.js";
import Settings from "./screen/components/Settings/Settings.js";

import Invoice from "./screen/components/Modules/Invoice.js";
import Spent from "./screen/components/Modules/Spent.js";

import crypto from "crypto-js";


export const dashboardRoutes = (t) => [
  {
    path: "/",
    name: t("home"),
    icon: "fas fa-folder",
    component: Home,
    layout: "/home",
  },
    {
    path: "/invoice",
    name: t("invoice"),
    icon: "fas fa-file",
    component: Invoice,
    layout: "/home",
  },
  {
    path: "/spent",
    name: t("spent"),
    icon: "fas fa-file",
    component: Spent,
    layout: "/home",
  },
   {
    path: "/",
    name: t("customers_providers"),
    icon: "fas fa-user",
    component: Home,
    layout: "/home/customers",
  },
   {
    path: "/",
    name: t("accounts"),
    icon: "fas fa-file",
    component: Home,
    layout: "/home/accounts",
  },
  {
    path: "/profile",
    name: t("users"),
    icon: "fas fa-user",
    component: Profile,
    layout: "/home",
  },
  {
    path: "/settings",
    name: t("settings"),
    icon: "fas fa-cog",
    component: Settings,
    layout: "/home",
  }
];


//export default dashboardRoutes;
