import Axios from "axios";

import { url, host } from "screen/components/services/api";
//const proxy = ""; //"https://cors-anywhere.herokuapp.com/";
const token = sessionStorage.getItem("token");

const AppUtil = {
  postAPI: async function postAPI(endpoint, dataPost, tokenSent = token) {
    try {
      let response = await Axios.post(`${url}${endpoint}`, dataPost, {
        headers: {
          Authorization: `Bearer ${tokenSent}`,
          Accept: "application/json",
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": host,
          "Access-Control-Allow-Credentials": "true",
        },
      });

      let dataRet = response.data;
      return dataRet;
    } catch (e) {
      console.error(e.response.data);
      return false;
    }
  },
  putAPI: async function putAPI(endpoint, dataPost) {
    try {
      let response = await Axios.put(`${url}${endpoint}`, dataPost, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": host,
          "Access-Control-Allow-Credentials": "true",
        },
      });

      let dataRet = response.data;
      return dataRet;
    } catch (e) {
      console.error(e.response);
      return false;
      // throw new Exception(e);
    }
  },
  getAPI: async function getAPI(endpoint) {
    try {
      let response = await Axios.get(`${url}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": host,
          "Access-Control-Allow-Credentials": "true",
        },
      });

      let dataRet = response.data;
      return dataRet;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  deleteAPI: async function deleteAPI(endpoint) {
    try {
      let response = await Axios.delete(`${url}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json; charset=UTF-8",
        },
      });
      let dataRet = response.data;
      return dataRet;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  isJson: function isJson(data) {
    try {
      let dataReturn = JSON.parse(data);
      return dataReturn;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  fileToBase64: function fileToBase64(file, cb) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      cb(null, reader.result);
    };
    reader.onerror = function (error) {
      cb(error, null);
    };
  },

  isEmail: function isEmail(email) {
    let isValidEmail =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return isValidEmail.test(email);
  },
  isValidText: function isValidText(text) {
    let isValidText = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¡!¿?\-_()%]+$/;
    return isValidText.test(text);
  },
  isNumberEntero: function isValidText(value) {
    //usaremos este para validar numeros de códigos que sean necesarios enteros
    return /^\d+$/.test(value);
  },
  isNumeric: function isNumeric(value) {
    //usaremos este para validar montos
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  reloadPage: function reloadPage() {
    setTimeout(function () {
      window.location.reload(false);
    }, 3000);
  },
};

export default AppUtil;
