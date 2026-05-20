
import Home from "./screen/components/Home/Home.js";
import Users from "screen/components/Modules/Users.js";
import Settings from "./screen/components/Settings/Settings.js";

import Invoice from "./screen/components/Modules/Invoice.js";
import Spent from "./screen/components/Modules/Spent.js";
import Customers_Providers from "./screen/components/Modules/Customers_Providers.js";

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
    path: "/customers_providers",
    name: t("customers_providers"),
    icon: "fas fa-user",
    component: Customers_Providers,
    layout: "/home",
  },
   {
    path: "/",
    name: t("accounts"),
    icon: "fas fa-file",
    component: Home,
    layout: "/home/accounts",
  },
     {
    path: "/budget_management",
    name: t("budget_management"),
    icon: "fas fa-money-bill",
    component: Home,
    layout: "/home",
  },
  {
    path: "/users",
    name: t("users"),
    icon: "fas fa-user",
    component: Users,
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
