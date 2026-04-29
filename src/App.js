
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";


import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "./Admin.js";
import Login from "./screen/components/Auth/Login";
import Recovery from "./screen/components/Auth/Recovery";
import ChangePassword from "./screen/components/Auth/ChangePassword";

function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" exact element={ <Login />}  />
      <Route path="/recovery" exact element={ <Recovery />}  />
      <Route path="/change-password" exact element={ <ChangePassword /> } />
      {
        /*(sessionStorage.getItem('token') === null ? <Route path="/home/*" element={ <Navigate replace to="/" />}  /> :<Route path="/home/*" element={<AdminLayout />} /> )*/
      }
<Route path="/home/" exact element={<AdminLayout />} />

    </Routes>
  </BrowserRouter>
  );
}

export default App;


