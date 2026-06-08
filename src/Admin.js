import React from "react";
import { useLocation, Route, Routes, useNavigate } from "react-router-dom";

import AdminNavbar from "./screen/components/Layouts/Navbar";
import Footer from "./screen/components/Layouts/Footer";
import Sidebar from "./screen/components/Layouts/Header";

import Profile from "./screen/components/Profile/profile";
import NewProfile from "./screen/components/Profile/newProfile";

//#region Mantenimientos
import Currency from "./screen/components/Settings/Maintenance/currency";
import Accounting_account from "./screen/components/Settings/Maintenance/accounting_account";
import Activity_Code from "./screen/components/Settings/Maintenance/activity_code";
import Cabys_Code from "./screen/components/Settings/Maintenance/cabys_code";
import Comercial_Code from "./screen/components/Settings/Maintenance/comercial_code";
import Cost_Center from "./screen/components/Settings/Maintenance/cost_center";
import Document_Type from "./screen/components/Settings/Maintenance/document_type";
import Expenses_Category from "./screen/components/Settings/Maintenance/expenses_category";
import File_Type from "./screen/components/Settings/Maintenance/file_type";
import Invoice_Status from "./screen/components/Settings/Maintenance/invoice_status";
import Measurement_Unity from "./screen/components/Settings/Maintenance/measurement_unity";
import Payment_Method from "./screen/components/Settings/Maintenance/payment_method";
import Permissions from "./screen/components/Settings/Maintenance/permissions";
import Presupuestary_Category from "./screen/components/Settings/Maintenance/presupuestary_category";
import Rol from "./screen/components/Settings/Maintenance/rol";
import Sale_Condition from "./screen/components/Settings/Maintenance/sale_condition";
import Tax_Type from "./screen/components/Settings/Maintenance/tax_type";
import Type_Accounting_Account from "./screen/components/Settings/Maintenance/type_accounting_account";

//#endregion

import NotFound from "./screen/components/common/404.js";
import { useJwt } from "react-jwt";
import dashboardRoutes from "./routes.js";
import crypto from "crypto-js";

import { useTranslation } from "react-i18next";

function Admin() {
  const { t } = useTranslation();
  const routes = dashboardRoutes(t);

  const mainPanel = React.useRef(null);
  const location = useLocation();

  //se valida si el token es valido aun
  const { decodedToken, isExpired } = useJwt(sessionStorage.getItem("token"));
  let dateNow = new Date();
  if (decodedToken != null) {
    sessionStorage.setItem("expire_tkn", parseFloat(decodedToken.exp));
    if (decodedToken.exp * 1000 < dateNow.getTime()) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("expire_tkn");
      sessionStorage.setItem("expired", true);
      window.location.replace("/");
    }
  }

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/home") {
        return (
          <Route path={prop.path} key={key} element={<prop.component />} />
        );
      } else {
        return null;
      }
    });
  };
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }
  }, [location]);

  //  {getRoutes(routes)}
  /*    <Route
      path={'/home'}

      element={<Home />}
    />*/
  return (
    <>
      <div className="wrapper">
        <Sidebar color={"white"} routes={routes} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar />
          <div className="content">
            <Routes>
              {getRoutes(routes)}
              <Route path={"/home/profile"} element={<Profile />} />
              <Route path={"/home/new-profile"} element={<NewProfile />} />
              {/*Mantenimientos */}
              <Route
                path={"/settings/maintenance/currency"}
                element={<Currency navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/activity_code"}
                element={<Activity_Code navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/payment_method"}
                element={<Payment_Method navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/accounting_account"}
                element={<Accounting_account navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/type_accounting_account"}
                element={<Type_Accounting_Account navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/invoice_status"}
                element={<Invoice_Status navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/rol"}
                element={<Rol navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/presupuestary_category"}
                element={<Presupuestary_Category navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/file_type"}
                element={<File_Type navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/tax_type"}
                element={<Tax_Type navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/sale_condition"}
                element={<Sale_Condition navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/document_type"}
                element={<Document_Type navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/expenses_category"}
                element={<Expenses_Category navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/measurement_unity"}
                element={<Measurement_Unity navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/comercial_code"}
                element={<Comercial_Code navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/cabys_code"}
                element={<Cabys_Code navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/cost_center"}
                element={<Cost_Center navigate={useNavigate()} />}
              />
              <Route
                path={"/settings/maintenance/permissions"}
                element={<Permissions navigate={useNavigate()} />}
              />

              {/* 404 not found para los no reconocidos en home */}
              <Route path="/home/*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Admin;
