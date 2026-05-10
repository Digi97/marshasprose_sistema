import React from "react";
import {
  useLocation,
  Route,
  Routes
} from "react-router-dom";

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


//#endregion 


import NotFound from './screen/components/common/404.js'
import { useJwt } from "react-jwt";
import {dashboardRoutes}from "./routes.js";
import crypto from "crypto-js";

import { useTranslation } from "react-i18next";



function Admin() {

    const { t } = useTranslation();
  const routes = dashboardRoutes(t);
  
    const mainPanel = React.useRef(null);
      const location = useLocation();
/*
  //se valida si el token es valido aun
  const { decodedToken, isExpired } = useJwt(sessionStorage.getItem("token"));
  let dateNow = new Date();
  if (decodedToken != null) {
    sessionStorage.setItem('expire_tkn', parseFloat(decodedToken.exp));
    if (decodedToken.exp * 1000 < dateNow.getTime()) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("expire_tkn");
      sessionStorage.setItem("expired", true);
      window.location.replace("/");
    }
  }


  const navigation = useNavigate();
  const params = useParams();

  let bytes = crypto.AES.decrypt(
    sessionStorage.getItem("user"),
      "@virtual_cr"
    );
  let userDecrypt = JSON.parse(bytes.toString(crypto.enc.Utf8));

  let user = userDecrypt.roles[0].name;
*/

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {

      if (prop.layout === "/home") {
        return (
          <Route path={prop.path} key={key}  element={<prop.component />} />
        );
      } 
      else 
        {
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
              <Route path={"/maintenance/currency"} element={<Currency />} />
              <Route path={"/maintenance/activity_code"} element={<Activity_Code />} />
              <Route path={"/home/maintenance/payment_method"} element={<NewProfile />} />
              <Route path={"/maintenance/accounting_account"} element={<Accounting_account />} />
              <Route path={"/home/maintenance/type_accounting_account"} element={<NewProfile />} />
              <Route path={"/home/maintenance/invoice_status"} element={<NewProfile />} />
              <Route path={"/home/maintenance/rol"} element={<NewProfile />} />
              <Route path={"/home/maintenance/presupuestary_category"} element={<NewProfile />} />
              <Route path={"/home/maintenance/file_type"} element={<NewProfile />} />
              <Route path={"/home/maintenance/tax_type"} element={<NewProfile />} />
              <Route path={"/home/maintenance/sale_condition"} element={<NewProfile />} />
              <Route path={"/home/maintenance/document_type"} element={<NewProfile />} />
              <Route path={"/home/maintenance/expenses_category"} element={<NewProfile />} />
              <Route path={"/home/maintenance/measurement_unity"} element={<NewProfile />} />
              <Route path={"/maintenance/comercial_code"} element={<Comercial_Code />} />
              <Route path={"/maintenance/cabys_code"} element={<Cabys_Code />} />
              <Route path={"/home/maintenance/cost_center"} element={<NewProfile />} />
              <Route path={"/home/maintenance/permissions"} element={<NewProfile />} />



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
