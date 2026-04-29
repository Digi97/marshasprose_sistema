import React, { Component } from "react";


import axios from "axios";
import { url } from "../services/api";
import logo from "../../../assets/img/logo.png";

// clase de recuperacion contraseña (se ingresa el corrreo)
class Recovery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        email: "",
        verification_code: ""
      },
      error: false,
      errorMsg: "",
      nextPage: false,
      charging: false
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

  //se maneja la recuperacion de contraseña
  recovery = () => {
    if (this.state.form.email !== "") {
      this.setState({
        charging: true
      });
      let url_api = url + "request-password";
      axios
        .post(url_api, this.state.form)
        .then((response) => {
          if (response.status === 200) {
            this.setState({
              nextPage: true,
              error: false,
              errorMsg: "",
              charging: false
            })
          } else {
            this.setState({
              error: true,
              errorMsg: "Usuario o contraseña incorrectos",
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
        errorMsg: "Debe llenar el campo de correo electrónico",
        charging: false
      })
    }
  };

  //se verifica que el código de verificación sea valido
  verifyCode = () => {
    if (this.state.form.code !== "") {
      this.setState({
        charging: true
      });
      let url_api = url + "validate-code";
      axios
        .post(url_api, this.state.form)
        .then((response) => {
          if (response.data.data) {
            sessionStorage.setItem('code', this.state.form.verification_code);
            window.location.href = "/change-password";
          } else {
            this.setState({
              error: true,
              errorMsg: "Código de verificación incorrecto",
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
    return (
      <div className="global-container m-0 vh-100 row justify-content-center align-items-center">
        <div className="card login-form box">
          <div className="card-body">
            <div>
            <a onClick={this.goBack}>
              <i className="fas fa-angle-left blue-text-login"></i>
              <span className="blue-text-login">Volver</span>
            </a>
            </div>
            <div className="text-center m-5">
              <img src={logo} alt="Logo" />
            </div>
            <h3 className="card-title text-center blue-text-login h4">Restablecer Contraseña</h3>
            {this.state.nextPage === false && (
              <div>
                <div>
                  <small className="text-center text-color-recovery">
                    Para restablecer su contraseña introduzca su correo
                    electrónico
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
                    <div className="form-group">
                      <label htmlFor="exampleInputEmail1" className="text-color-recovery">
                        Direccion de correo electrónico
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        id="email"
                        name="email"
                        aria-describedby="emailHelp"
                        placeholder="nombre@ejemplo.com"
                        maxLength={200}
                        onChange={this.getInputData.bind(this)}
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
                          Continuar
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
                    Para cambiar tu contraseña ingresa el código de verificación enviado a {this.state.form.email}
                  </p>
                </div>
                {this.state.error === true &&
                  <div className="alert alert-danger" role="alert">
                    {this.state.errorMsg}
                  </div>
                }
                <div className="form-group">
                  <label htmlFor="exampleInputEmail1">
                    Código de verificación
                  </label>
                  <input
                    type="verification_code"
                    className="form-control form-control-sm"
                    id="verification_code"
                    name="verification_code"
                    aria-describedby="codeHelp"
                    placeholder="Ingresa el código"
                    onChange={this.getInputData.bind(this)}
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
                      Continuar
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

export default Recovery;
