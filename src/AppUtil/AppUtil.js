import Axios from "axios";

import { url } from "screen/components/services/api";
//const proxy = ""; //"https://cors-anywhere.herokuapp.com/";
const sessionId = sessionStorage.getItem("sessionId");

const AppUtil = {
    postAPI: async function postAPI(endpoint, dataPost) {
        try {
            let response = await Axios.post(`${url}${endpoint}`, dataPost, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-Session-Id": sessionId,
                },
            });

            let dataRet = response.data;
            return dataRet;
        } catch (e) {
            if (e.response?.status === 401) {
                sessionStorage.setItem("expired", true);

                window.location.href = "/";
                return;
            }
            console.error(e);
            console.error(e.response);
            return false;
        }
    },
    putAPI: async function putAPI(endpoint, dataPost) {
        try {
            let response = await Axios.put(`${url}${endpoint}`, dataPost, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=UTF-8",

                    "X-Session-Id": sessionId,
                },
            });

            let dataRet = response.data;
            return dataRet;
        } catch (e) {
            if (e.response?.status === 401) {
                sessionStorage.setItem("expired", true);

                window.location.href = "/";
                return;
            }
            console.error(e.response);
            return false;
            // throw new Exception(e);
        }
    },
    getAPI: async function getAPI(endpoint) {
  
        
        try {
            let response = await Axios.get(`${url}${endpoint}`, {
                headers: {
                    "X-Session-Id": sessionId,
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=UTF-8",
                },
            });

            let dataRet = response.data;
            return dataRet;
        } catch (e) {
            
            
            if (e.response?.status === 401) {
                sessionStorage.setItem("expired", true);

                window.location.href = "/";
                return;
            }

            console.error(e.response); 

            return false;
        }
    },
    deleteAPI: async function deleteAPI(endpoint) {
        try {
            let response = await Axios.delete(`${url}${endpoint}`, {
                headers: {
                    "X-Session-Id": sessionId,
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=UTF-8",
                },
            });
            let dataRet = response.data;
            return dataRet;
        } catch (e) {
            if (e.response?.status === 401) {
                sessionStorage.setItem("expired", true);
                window.location.href = "/";
                return;
            }

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
        let isValidText = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¡!¿?\-_()%#]+$/;
        return isValidText.test(text);
    },
    isNumberEntero: function isNumberEntero(value) {
        //usaremos este para validar numeros de códigos que sean necesarios enteros
        return /^\d+$/.test(value);
    },
    isNumeric: function isNumeric(value) {
        //usaremos este para validar montos
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    isValidPassword: function isValidPassword(pwd)
    {
        return /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[\W_]).+$/.test(pwd)
    },


    reloadPage: function reloadPage() {
        setTimeout(function () {
            window.location.reload(false);
        }, 3000);
    },
    formatNumber: function formatNumber(number, isInteger = false) {
        if (number === null || number === undefined || isNaN(number))
            return "0.00";

        return parseFloat(number).toLocaleString("en-US", {
            minimumFractionDigits: isInteger ? 0 : 2,
            maximumFractionDigits: isInteger ? 0 : 2,
        });
    },
    randomHexColor: function randomHexColor(opacity = 0.6) {
        return Array.from({ length: 1 }, () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        });
    },
};

export default AppUtil;
