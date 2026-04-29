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

import { useJwt } from "react-jwt";

import routes from "./routes.js";

import crypto from "crypto-js";

function Admin() {

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

              <Route path={"/profile"} element={<Profile />} />
              <Route path={"/new-profile"} element={<NewProfile />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Admin;
