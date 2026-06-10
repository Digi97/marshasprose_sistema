import React, { Component } from "react";

import axios from "axios";
import { url, host } from "../services/api";
import logo from "../../../assets/PNG/LogoOficial.jpg";
import crypto from "crypto-js";
import { withTranslation } from "react-i18next";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        Correo: "",
        Contrasena: "",
      },
      error: false,
      errorMsg: "",
      color: "",
      charging: false,
    };
  }

  //previene que recargue pagina
  //cuando se da boton iniciar sesion
  preventSubmit(e) {
    e.preventDefault();
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

  componentDidMount() {
    let exp = sessionStorage.getItem("expired");
    if (exp) {
      sessionStorage.removeItem("expired");
      this.setState({
        error: true,
        errorMsg: "Su sesión ha caducado",
        color: "alert alert-danger",
      });
    }
    let closed = sessionStorage.getItem("closed");
    if (closed) {
      sessionStorage.removeItem("closed");
      this.setState({
        error: true,
        errorMsg: "Su sesión se ha cerrado con éxito",
        color: "alert alert-success",
      });
    }
    setTimeout(() => {
      this.setState({
        error: false,
        errorMsg: "",
        color: "",
      });
    }, "3000");
  }

  //se maneja la autenticacion del usuario
  login = () => {
    const { t } = this.props;
    //   window.location.href = "/home/";

    if (this.state.form.Correo !== "" && this.state.form.Contrasena !== "") {
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
              this.setState({
                error: true,
                errorMsg: t(response.data.message),
                charging: false,
                color: "alert alert-danger",
              });
            }
          } else {
            this.setState({
              error: true,
              errorMsg: t("invalid_username_or_password"),
              charging: false,
              color: "alert alert-danger",
            });
          }
        })
        .catch((error) => {
          this.setState({
            error: true,
            errorMsg: error.message,
            color: "alert alert-danger",
            charging: false,
          });
        });
    } else {
      this.setState({
        error: true,
        errorMsg: t("all_inputs_required"),
        charging: false,
        color: "alert alert-danger",
      });
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
            {this.state.error === true && (
              <div className={this.state.color} role="alert">
                {this.state.errorMsg}
              </div>
            )}
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
