import React, { Component, createRef } from "react";

import logo from "../../../assets/PNG/LogoOficial.jpg";
import { withTranslation } from "react-i18next";
import alertSuccess from "../common/SweetAlert";
import AppUtil from "AppUtil/AppUtil";
import crypto from "crypto-js";

class OTP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      digits: ["", "", "", "", "", ""],
      charging: false,
    
    };
    this.inputs = Array(6)
      .fill(null)
      .map(() => createRef());
      this.user = null;
  }

  preventSubmit = (e) => {
    e.preventDefault();
  };

  handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const digits = [...this.state.digits];
    digits[index] = value;
    this.setState({ digits }, () => {
      if (value && index < 5) {
        this.inputs[index + 1].current.focus();
      }
    });
  };

  handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !this.state.digits[index] && index > 0) {
      this.inputs[index - 1].current.focus();
    }
  };

  handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const digits = [...this.state.digits];
    pasted.split("").forEach((char, i) => {
      digits[i] = char;
    });
    this.setState({ digits }, () => {
      const lastFilled = Math.min(pasted.length, 5);
      this.inputs[lastFilled].current.focus();
    });
  };

  stopLoading = () => this.setState({ charging: false });

  submit = () => {
    const { t } = this.props;
    const code = this.state.digits.join("");

    if (code.length < 6) {
      alertSuccess(t("all_inputs_required"), "error", t);
      return;
    }

    this.setState({ charging: true });


    AppUtil.postAPI("otp", {OTP: code, Usuarios_Usuario_id: this.user.usuario_id}).then((response) =>{

      if (response.codeStatus === 200) 
        {
          sessionStorage.setItem("otp_valid", "true")
          window.location.href = "/home/";
        } 
        else 
          {
          alertSuccess(t(response.message), "error", t);
          this.stopLoading();
        }

    })

    
  };


  componentDidMount() {
    this.getUserInfo();
  }
   getUserInfo = () => {
          let bytes = crypto.AES.decrypt(
              sessionStorage.getItem("user"),
              "@marsh_contable"
          );
          this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
        }

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
            <br />
            <hr className="hr-login" />
            <div className="card-text">
              <form onSubmit={this.preventSubmit}>
                <p className="text-center text-color-recovery mb-3">
                  {t("enter_otp_code")}
                </p>
                <div
                  className="d-flex justify-content-center gap-2 mb-4"
                  onPaste={this.handlePaste}
                >
                  {this.state.digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={this.inputs[index]}
                      type="text"
                      inputMode="numeric"
                      className="form-control form-control-sm text-center"
                      style={{ width: "48px", fontSize: "1.4rem", fontWeight: "bold" }}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => this.handleChange(index, e)}
                      onKeyDown={(e) => this.handleKeyDown(index, e)}
                    />
                  ))}
                </div>
                <div className="d-flex justify-content-center">
                  {!this.state.charging && (
                    <button
                      type="submit"
                      id="action-btn"
                      className="btn btn-primary btn-block blue-button-login col-sm-12 col-md-12 col-xs-12 w-100"
                      onClick={this.submit}
                    >
                      {t("send")}
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
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(OTP);
