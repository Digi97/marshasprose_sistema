
import Home from "./screen/components/Home/Home.js";
import Profile from "screen/components/Profile/profile.js";
import Settings from "./screen/components/Settings/Settings.js";

import crypto from "crypto-js";


const dashboardRoutes = [
  {
    path: "/",
    name: "Inicio",
    icon: "fas fa-folder",
    component: Home,
    layout: "/home",
  },
    {
    path: "/",
    name: "Facturación",
    icon: "fas fa-file",
    component: Home,
    layout: "/home/invoice",
  },
  {
    path: "/",
    name: "Gastos",
    icon: "fas fa-file",
    component: Home,
    layout: "/home/spent",
  },
   {
    path: "/",
    name: "Clientes/Proveedores",
    icon: "fas fa-user",
    component: Home,
    layout: "/home/customers",
  },
   {
    path: "/",
    name: "Cuentas",
    icon: "fas fa-file",
    component: Home,
    layout: "/home/accounts",
  },
  {
    path: "/profile",
    name: "Usuarios",
    icon: "fas fa-user",
    component: Profile,
    layout: "/home",
  },
  {
    path: "/settings",
    name: "Ajustes",
    icon: "fas fa-cog",
    component: Settings,
    layout: "/home",
  }
];


export default dashboardRoutes;
