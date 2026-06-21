
import React from "react";
import { useNavigate } from "react-router-dom";
import Home from "./screen/components/Home/Home.js";
import Users from "screen/components/Modules/Users.js";
import Settings from "./screen/components/Settings/Settings.js";
import Invoice from "./screen/components/Modules/Invoice.js";
import Spent from "./screen/components/Modules/Spent.js";
import Customers_Providers from "./screen/components/Modules/Customers_Providers.js";
import Budget from "./screen/components/Modules/Budget.js";
import Income from  "./screen/components/Modules/Income.js";
import Reports from  "./screen/components/Modules/Reports.js";

import crypto from "crypto-js";
import permissions from "./permission.json";

function BudgetWithNavigate() {
    const navigate = useNavigate();
    return <Budget navigate={navigate} />;
}


let dashboardRoutes = (t) =>{ 
  const permisos = getPermisosFromToken()
  
  const todasLasRutas  = [
  {
    path: "/",
    name: t("home"),
    icon: "fas fa-folder",
    component: Home,
    layout: "/home",
    permiso:null
  },
    {
    path: "/invoice",
    name: t("invoice"),
    icon: "fas fa-file",
    component: Invoice,
    layout: "/home",
    permiso:ROUTE_PERMISSIONS["/invoice"],
  },
   {
    path: "/income",
    name: t("income"),
    icon: "fas fa-line-chart",
    component: Income,
    layout: "/home",
    permiso:ROUTE_PERMISSIONS["/invoice"],
  },
  {
    path: "/spent",
    name: t("spent"),
    icon: "fas fa-file",
    component: Spent,
    layout: "/home",
    permiso:   ROUTE_PERMISSIONS["/spent"],

  },
   {
    path: "/customers_providers",
    name: t("customers_providers"),
    icon: "fas fa-user",
    component: Customers_Providers,
    layout: "/home",
    permiso:null
  },
   {
    path: "/",
    name: t("accounts"),
    icon: "fas fa-file",
    component: Home,
    layout: "/home/accounts",
    permiso:null
  },
     {
    path: "/budget_management",
    name: t("budget_management"),
    icon: "fas fa-money-bill",
    component: BudgetWithNavigate,
    layout: "/home",
    permiso:ROUTE_PERMISSIONS["/budget_management"]
  },
  {
    path: "/users",
    name: t("users"),
    icon: "fas fa-user",
    component: Users,
    layout: "/home",
    permiso:   ROUTE_PERMISSIONS["/users"],
  },
    {
    path: "/reports",
    name: t("reports"),
    icon: "fas fa-chart-area",
    component: Reports,
    layout: "/home",
    permiso:   null,
  },

  {
    path: "/settings",
    name: t("settings"),
    icon: "fas fa-cog",
    component: Settings,
    layout: "/home",
    permiso:   ROUTE_PERMISSIONS["/settings"],
  }
];

 // Filtrar rutas según permisos del usuario
    return todasLasRutas.filter(route =>
        route.permiso === null ||           // rutas públicas
        permisos.indexOf(route.permiso) !== -1  // tiene el permiso
    );
}

const ROUTE_PERMISSIONS = {
    "/invoice":              2,  // UsuarioFacturacion
    "/spent":                6,  // UsuarioGastosFacturas
    "/customers_providers":  7,  // UsuarioMantenimientoClientes
    "/budget_management":    9,  // UsuarioPresupuestos
    "/users":                1,  // AdministracionUsuarios
    "/settings":             10, // UsuarioMantenimiento
};


const getPermisosFromToken = () => {
  
    try {

  let bytes = crypto.AES.decrypt(
      sessionStorage.getItem("user"),
      "@marsh_contable",
    );
    const user = JSON.parse(bytes.toString(crypto.enc.Utf8));
 
   return user.permisos; 
/*
        const token  = sessionStorage.getItem("");
        if (!token) return [];
        const payload  = JSON.parse(atob(token.split(".")[1]));
        // El claim "permiso" puede ser string o array
        const permisos = payload.permiso;
        return Array.isArray(permisos)
            ? permisos.map(Number)
            : [Number(permisos)];*/
    } catch {
        return [];
    }
};


export default dashboardRoutes;
