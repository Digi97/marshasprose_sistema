import React, { Component } from "react";

import axios from "axios";
import { url } from "../services/api";
import logo from "../../../assets/PNG/LogoOficial.jpg";
import crypto from "crypto-js";
import { withTranslation } from "react-i18next";
import alertSuccess from "../common/SweetAlert";
import AppUtil from "../../../AppUtil/AppUtil";
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        Correo: "",
        Contrasena: "",
      },
     
      charging: false,
    };
  }

    //se obtiene la info de los inputs
  getInputData = async (e) => {
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
    });
  };


  //previene que recargue pagina
  //cuando se da boton iniciar sesion


  stopLoading = () => this.setState({ charging: false})
  preventSubmit(e) {
    e.preventDefault();
  }


  componentDidMount() {
      const { t } = this.props;
    let exp = sessionStorage.getItem("expired");
    if (exp) {
      sessionStorage.removeItem("expired");
            alertSuccess(t("session_expired"), "warning", t);
   
    }
    let closed = sessionStorage.getItem("closed");
    if (closed) {
      sessionStorage.removeItem("closed");

      alertSuccess(t("session_ended"), "success", t);
   
    }
  }

  validateForm = (t) => {
    let { form } = this.state;
    if (!AppUtil.isEmail(form.Correo)) {
            alertSuccess(t("invalid_string_form_Correo"), "warning", t);
     
      return false;
    }
    if (!AppUtil.isValidPassword(form.Contrasena)) 
      {
      alertSuccess(t("invalid_string_form_Contrasena"), "warning", t);
      return false;
    }
    return true;
  };

  //se maneja la autenticacion del usuario
  login = () => {
    const { t } = this.props;
    //   window.location.href = "/home/";

    if (this.validateForm(t)) 
      {
      this.setState({
        charging: true,
      });
      let url_api = url + "login";

      axios
        .post(url_api, this.state.form, {
          // Configuration Object
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
        })
        .then((response) => {
          if (response.status === 200) {
            if (response.data.codeStatus === 200) {
              //se guarda el usuario en session
              //y se encripta la informacion del usuario prueba31@test.com
              let user = crypto.AES.encrypt(
                JSON.stringify(response.data.data),
                "@marsh_contable",
              ).toString();
              sessionStorage.setItem("sessionId", response.data.message);
              sessionStorage.setItem("user", user);
              //se redirecciona a main

              window.location.href = "/home/";
            } else {
      alertSuccess(t(response.data.message), "error", t);
      this.stopLoading();

            }
          } else {
      alertSuccess(t("invalid_username_or_password"), "error", t);
this.stopLoading();

          }
        })
        .catch((error) => {
            alertSuccess(t(error.message), "error", t);
   this.stopLoading();
        });
    } else {

       // alertSuccess(t("all_inputs_required"), "error", t);
 this.stopLoading();
    }
  };

  render() {
    const { t } = this.props;
    return (
      <div className="global-container m-0 vh-100 row justify-content-center align-items-center">
        <div className="card login-form box">
          <div className="card-body">
            <div className="text-center m-5">
              <img src={logo} alt="Logo" width={400} />
            </div>
            <h4 className="card-title text-center blue-text-login">
              {t("system_name")}
            </h4>
            <br></br>
            <hr className="hr-login"></hr>
      
            <div className="card-text">
              {/* <div className="alert alert-danger alert-dismissible fade show" role="alert">Incorrect username or password.</div> */}
              <form onSubmit={this.preventSubmit}>
                <div className="form-group">
                  <label
                    htmlFor="exampleInputEmail1"
                    className="text-color-recovery"
                  >
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    id="email"
                    name="Correo"
                    aria-describedby="emailHelp"
                    placeholder="nombre@ejemplo.com"
                    onChange={this.getInputData}
                    maxLength={200}
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor="exampleInputPassword1"
                    className="text-color-recovery"
                  >
                    {t("password")}
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    id="password"
                    name="Contrasena"
                    placeholder="***********"
                    onChange={this.getInputData}
                    maxLength={200}
                  />
                </div>
                <div className="d-flex justify-content-center">
                  {!this.state.charging && (
                    <button
                      type="submit"
                      id="action-btn"
                      className="btn btn-primary btn-block blue-button-login col-sm-12 col-md-12 col-xs-12 w-100"
                      onClick={this.login}
                    >
                      {t("login")}
                    </button>
                  )}
                  {this.state.charging && (
                    <button
                      type="submit"
                      id="action-btn"
                      className="btn btn-primary btn-block blue-button-login col-sm-12 col-md-12 col-xs-12 w-100"
                    >
                      <div className="lds-dual-ring"></div>
                    </button>
                  )}
                </div>
                <div className="sign-up">
                  {t("forgot_password")}{" "}
                  <a href="/recovery" className="blue-text-login">
                    {t("recover")}
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(Login);
