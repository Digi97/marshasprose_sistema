import React, { Component } from "react";

import axios from "axios";
import { url } from "../services/api";
import logo from "../../../assets/PNG/LogoOficial.jpg";
import { withTranslation } from 'react-i18next';
class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      correo:"",
      contrasena:"",
      contrasena_confirma:"",
      error: false,
      errorMsg: "",
      color: "",
      charging: false
    };
  }


  //previene que recargue pagina
  //cuando se da boton iniciar sesion
  preventSubmit(e) { e.preventDefault(); }



  //se maneja la recuperacion de contraseña
  changePassword = () => {
      const { t } = this.props;

    let {correo, contrasena, contrasena_confirma} = this.state;


    if(correo === "")
    {
        this.setState({
          error: true,
          errorMsg: t("invalid_format_Correo"),
          color: "alert alert-warning",

        });
        return;
    }


    if ( contrasena !== contrasena_confirma) 
      {
          this.setState({
          error: true,
          errorMsg: t("password_and_confirmation_no_match"),
          color: "alert alert-warning",
        });
        return;
      }

      this.setState({
        charging: true
      });
      let send = {
        correo,
        contrasena,
        contrasena_confirma
      }

      console.log(send);
      
      axios
        .post(`${url}login/confirm-change-password`, send)
        .then((response) => {
                console.log(response);
          if (response.data.codeStatus ===200) 
            {
        this.setState({
  error: true,
  errorMsg: t("password_changed_successfully"),
  color: "alert alert-success",
  charging: true
}, ()=>{setTimeout(() => {
  window.location.href = "/";
}, 3000); });


            window.location.href = "/";
          } else {
            this.setState({
              error: true,
              errorMsg: t(response.data.message),
              color: "alert alert-danger",
              charging: false
            });
          }
        })
        .catch((error) => {
          console.error(error);
          
          this.setState({
            error: true,
            errorMsg: t("something_went_wrong"),
            color: "alert alert-danger",
            charging: false
          });
        });


  };
componentDidMount() {

  const correo =  sessionStorage.getItem("correo")
  if(correo == null)
    {
       window.location.href = '/recovery';
    } else
    {
  this.setState({ correo }, ()=>{
sessionStorage.removeItem("correo")
  });
    }


 
}


  goBack = () => {
    window.location.href = '/recovery';
  }
  //renderiza la vista de cabiar contraseña (input contraseña, confirmar contraseña y correo)
  render() {
             const { t } = this.props;
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
              <img src={logo} alt="Logo" width={300}/>
            </div>
            <h3 className="card-title text-center blue-text-login h4">{t("change_pwd")}</h3>
            <div>
              <small className="text-color-recovery">
                {t("pwd_security_parameter")}
              </small >
            </div>
            <div>
              <div>
              </div>
              {this.state.error === true &&
                <div className={this.state.color} role="alert">
                  {this.state.errorMsg}
                </div>
              }
              <div className="card-text">
                {/* <div className="alert alert-danger alert-dismissible fade show" role="alert">Incorrect username or password.</div> */}
                <form onSubmit={this.preventSubmit}>
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
                      onChange={(e) => this.setState({correo: e.target.value})}
                      maxLength={200}
                      value={this.state.correo||''}
                      required
                      readOnly
                      
                    />
                    
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputEmail1" className="text-color-recovery">
                      {t("new_pwd")}
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-sm input-field"
                      id="contrasena"
                      name="contrasena"
                      aria-describedby="passwordHelp"
                      placeholder="*********"
                      onChange={(e) => this.setState({contrasena: e.target.value})}
                      maxLength={200}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputEmail1" className="text-color-recovery">
                      {t("confirm_pwd")}
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-sm input-field"
                      id="contrasena_confirma"
                      name="contrasena_confirma"
                      aria-describedby="confirm_passwordHelp"
                      placeholder="*********"
                     onChange={(e) => this.setState({contrasena_confirma: e.target.value})}
                      maxLength={200}
                    />
                  </div>
                  <div className="d-flex justify-content-center">
                    {!this.state.charging &&
                      <button
                        type="submit"
                        id="action-btn"
                        className="btn btn-primary btn-block col-md-12 background-button-recovery w-100"
                        onClick={this.changePassword}
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
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(ChangePassword);
