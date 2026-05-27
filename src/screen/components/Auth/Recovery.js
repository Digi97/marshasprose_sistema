import React, { Component } from "react";


import axios from "axios";
import { url } from "../services/api";
import logo from "../../../assets/PNG/LogoOficial.jpg";
import { Navigate, redirect } from "react-router-dom";
import { withTranslation } from 'react-i18next';

// clase de recuperacion contraseña (se ingresa el corrreo)
class Recovery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      errorMsg: "",
      nextPage: false,
      charging: false,
      correo:"",
      maskedCorreo:"",
       verification_code: "",
       redirect:false
    };
  }



  //previene que recargue pagina
  //cuando se da boton iniciar sesion
  preventSubmit(e) {
    e.preventDefault();
  }
  //se maneja la recuperacion de contraseña
  recovery = () => {
       const { t } = this.props;
    if (this.state.correo !== "") {
      this.setState({
        charging: true
      });
      axios.post(`${url}login/recover`,{correo: this.state.correo})
        .then((response) => {
          if (response.status === 200) 
          {
            if (response.data.codeStatus ===200)
            {
              this.setState({
                nextPage: true,
                error: false,
                errorMsg: "",
                charging: false,
                maskedCorreo:response.data.data.correo
              })
            }
            else 
            {
            this.setState({
              error: true,
              errorMsg: t(response.data.message),
              charging: false
            });
          } 
          
          }
        })
        .catch((error) => {
          console.error(error);
          
          this.setState({
            error: true,
            errorMsg: "Ha ocurrido un problema favor intentelo nuevamente",
            charging: false
          });
        });
    } else {
      this.setState({
        error: true,
        errorMsg: "Debe llenar el campo de correo electrónico",
        charging: false
      })
    }
  };

  //se verifica que el código de verificación sea valido
  verifyCode = () => {
         const { t } = this.props;

    if (this.state.verification_code !== "") 
      {
      this.setState({
        charging: true
      });
      axios
        .post(`${url}login/validate-code`, {codigo_recupera_clave: this.state.verification_code, correo: this.state.correo})
        .then((response) => {
   
          
          if (response.data.codeStatus ===200) 
            {
              sessionStorage.setItem("correo", this.state.correo)
              this.setState({redirect: true});
          } else {
            this.setState({
              error: true,
              errorMsg: t(response.data.message),
              charging: false
            });
          }
        })
        .catch((error) => {
          this.setState({
            error: true,
            errorMsg: "Ha ocurrido un problema favor intentelo nuevamente",
            charging: false
          });
        });
    } else {
      this.setState({
        error: true,
        errorMsg: "El campo de código de verificación es requerido",
        charging: false
      })
    }
  };

  goBack = () => {
    window.location.href = '/';
  }

  render() {
         const { t } = this.props;

          if (this.state.redirect) { return <Navigate to="/change-password" />; }

    return (
      <div className="global-container m-0 vh-100 row justify-content-center align-items-center">
        <div className="card login-form box">
          <div className="card-body">
            <div>
            <a onClick={this.goBack}>
              <i className="fas fa-angle-left blue-text-login"></i>
              <span className="blue-text-login">{t("back")}</span>
            </a>
            </div>
            <div className="text-center m-5">
              <img src={logo} alt="Logo" width={350} />
            </div>
            <h3 className="card-title text-center blue-text-login h4">{t("restablish_password")}</h3>
            {this.state.nextPage === false && (
              <div>
                <div>
                  <small className="text-center text-color-recovery">
                    {t("mail_to_restablish")}
                  </small >
                </div>
                {this.state.error === true &&
                  <div className="alert alert-danger" role="alert">
                    {this.state.errorMsg}
                  </div>
                }
                <div className="card-text">
                  {/* <div className="alert alert-danger alert-dismissible fade show" role="alert">Incorrect username or password.</div> */}
                  <form onSubmit={this.preventSubmit}>
                    {/**PRIMER PASO DE CAMBIO DE CONTRASEÑA */}
                    <div className="form-group">
                      <label htmlFor="exampleInputEmail1" className="text-color-recovery">
                        {t("email")}
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        id="correo"
                        name="correo"
                        aria-describedby="emailHelp"
                        placeholder="nombre@ejemplo.com"
                        maxLength={200}
                        onChange={(e)=> this.setState({correo:e.target.value})}
                      />
                    </div>
                    <br></br>
                    <div className="d-flex justify-content-center">
                      {!this.state.charging &&
                        <button
                          type="submit"
                          id="action-btn"
                          className="btn btn-primary btn-block col-md-12 background-button-recovery w-100"
                          onClick={this.recovery}
                        >
                          {t("continue")}
                        </button>
                      }
                      {this.state.charging &&
                        <button
                          type="submit"
                          id="action-btn"
                          className="btn btn-primary btn-block background-button-recovery col-sm-12 col-md-12 col-xs-12 w-100"
                        >
                          <div className="lds-dual-ring"></div>
                        </button>
                      }
                    </div>
                  </form>
                </div>
              </div>
            )}
            {this.state.nextPage === true && (
              <div>
                <div>
                  <p className="text-center text-color-recovery">
                    {t("mail_change_pwd")} {this.state.maskedCorreo}
                  </p>
                </div>
                {this.state.error === true &&
                  <div className="alert alert-danger" role="alert">
                    {this.state.errorMsg}
                  </div>
                }
                <div className="form-group">
                  <label htmlFor="exampleInputEmail1">
                    {t("verification_code")}
                  </label>
                  <input
                    type="verification_code"
                    className="form-control form-control-sm"
                    id="verification_code"
                    name="verification_code"
                    aria-describedby="codeHelp"
                    placeholder="Ingresa el código"
                    onChange={(e)=> this.setState({ verification_code:e.target.value})}
                  />
                </div>
                <div className="d-flex justify-content-center w-100">
                  {!this.state.charging &&
                    <a
                      type="submit"
                      id="action-btn"
                      className="btn btn-primary btn-block col-md-12 background-button-recovery"
                      onClick={this.verifyCode}
                    >
                      {t("continue")}
                    </a>
                  }
                  {this.state.charging &&
                    <button
                      type="submit"
                      id="action-btn"
                      className="btn btn-primary btn-block background-button-recovery col-sm-12 col-md-12 col-xs-12 w-100"
                    >
                      <div className="lds-dual-ring"></div>
                    </button>
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(Recovery);
