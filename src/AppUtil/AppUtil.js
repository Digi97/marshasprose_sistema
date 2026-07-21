import { type } from "@testing-library/user-event/dist/type";
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

    isJson: function isJson(data) {
        try {

            if(typeof data === "object")
            {
                return data;
            }

            if(typeof data === "string")
            {
                let dataReturn = JSON.parse(data);
             return dataReturn;
            }
            return false;
          
        } catch (e) {
            console.error(e);
            return false;
        }
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
    sanitizeText: function sanitizeText(text) {
        if (typeof text !== "string") return text;
        return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¡!¿?\-_()%#]/g, "");
    },
    attachTextInputGuard: function attachTextInputGuard() {
        document.addEventListener(
            "input",
            function (e) {
                const target = e.target;
                if (!(target instanceof HTMLInputElement) || target.type !== "text") {
                    return;
                }

                const original = target.value;
                const sanitized = AppUtil.sanitizeText(original);
                if (sanitized === original) return;

                const caret = target.selectionStart ?? sanitized.length;
                const removedBeforeCaret =
                    original.slice(0, caret).length -
                    AppUtil.sanitizeText(original.slice(0, caret)).length;

                target.value = sanitized;

                const newCaret = Math.max(0, caret - removedBeforeCaret);
                target.setSelectionRange(newCaret, newCaret);
            },
            true
        );
    },
    attachNumberInputGuard: function attachNumberInputGuard() {
        document.addEventListener(
            "beforeinput",
            function (e) {
                const target = e.target;
                if (!(target instanceof HTMLInputElement) || target.type !== "number") {
                    return;
                }
                if (e.data == null) return; // borrado, corte, etc.

                if (!/^[0-9.]*$/.test(e.data)) {
                    e.preventDefault();
                    return;
                }

                if (e.data.includes(".") && target.value.includes(".")) {
                    let selectionCoversDot = false;
                    try {
                        selectionCoversDot = target.value
                            .slice(target.selectionStart, target.selectionEnd)
                            .includes(".");
                    } catch (err) {
                        selectionCoversDot = false;
                    }
                    if (!selectionCoversDot) {
                        e.preventDefault();
                    }
                }
            },
            true
        );
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
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd)
    },
    isValidDate: function isValidDate(date) {
        //usaremos este para validar fechas con formato YYYY-MM-DD (input type="date")
        if (typeof date !== "string") return false;

        let match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return false;

        let year = parseInt(match[1], 10);
        let month = parseInt(match[2], 10);
        let day = parseInt(match[3], 10);
        let parsed = new Date(year, month - 1, day);

        return (
            parsed.getFullYear() === year &&
            parsed.getMonth() === month - 1 &&
            parsed.getDate() === day
        );
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
    parseInvoiceXML: function parseInvoiceXML(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");

            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                return false;
            }

            const root = xmlDoc.documentElement;
            if (!root) {
                return false;
            }

            const getDirectChild = (parent, tag) => {
                if (!parent) return null;
                for (let i = 0; i < parent.children.length; i++) {
                    if (parent.children[i].tagName === tag) return parent.children[i];
                }
                return null;
            };

            const getText = (parent, tag) => {
                const el = getDirectChild(parent, tag);
                return el ? el.textContent.trim() : "";
            };

            const parsePersona = (node) => {
                if (!node) return null;
                const identificacion = getDirectChild(node, "Identificacion");
                const ubicacion = getDirectChild(node, "Ubicacion");
                const telefono = getDirectChild(node, "Telefono");

                return {
                    nombre: getText(node, "Nombre"),
                    nombreComercial: getText(node, "NombreComercial"),
                    tipoIdentificacion: getText(identificacion, "Tipo"),
                    numeroIdentificacion: getText(identificacion, "Numero"),
                    provincia: getText(ubicacion, "Provincia"),
                    canton: getText(ubicacion, "Canton"),
                    distrito: getText(ubicacion, "Distrito"),
                    otrasSenas: getText(ubicacion, "OtrasSenas"),
                    telefono: telefono ? `${getText(telefono, "CodigoPais")} ${getText(telefono, "NumTelefono")}`.trim() : "",
                    correo: getText(node, "CorreoElectronico"),
                };
            };

            const lineas = [];
            const detalleServicio = getDirectChild(root, "DetalleServicio");
            const lineaNodes = detalleServicio ? detalleServicio.getElementsByTagName("LineaDetalle") : [];

            for (let i = 0; i < lineaNodes.length; i++) {
                const linea = lineaNodes[i];
                const impuesto = getDirectChild(linea, "Impuesto");

                lineas.push({
                    numeroLinea: getText(linea, "NumeroLinea"),
                    codigoCabys: getText(linea, "CodigoCABYS"),
                    cantidad: parseFloat(getText(linea, "Cantidad")) || 0,
                    unidadMedida: getText(linea, "UnidadMedida"),
                    detalle: getText(linea, "Detalle"),
                    precioUnitario: parseFloat(getText(linea, "PrecioUnitario")) || 0,
                    subTotal: parseFloat(getText(linea, "SubTotal")) || 0,
                    baseImponible: parseFloat(getText(linea, "BaseImponible")) || 0,
                    impuestoTarifa: parseFloat(getText(impuesto, "Tarifa")) || 0,
                    impuestoMonto: parseFloat(getText(impuesto, "Monto")) || 0,
                    montoTotalLinea: parseFloat(getText(linea, "MontoTotalLinea")) || 0,
                });
            }

            const resumenFactura = getDirectChild(root, "ResumenFactura");
            const codigoTipoMoneda = getDirectChild(resumenFactura, "CodigoTipoMoneda");

            const resumen = {
                codigoMoneda: getText(codigoTipoMoneda, "CodigoMoneda"),
                tipoCambio: parseFloat(getText(codigoTipoMoneda, "TipoCambio")) || 0,
                totalGravado: parseFloat(getText(resumenFactura, "TotalGravado")) || 0,
                totalExento: parseFloat(getText(resumenFactura, "TotalExento")) || 0,
                totalVenta: parseFloat(getText(resumenFactura, "TotalVenta")) || 0,
                totalDescuentos: parseFloat(getText(resumenFactura, "TotalDescuentos")) || 0,
                totalVentaNeta: parseFloat(getText(resumenFactura, "TotalVentaNeta")) || 0,
                totalImpuesto: parseFloat(getText(resumenFactura, "TotalImpuesto")) || 0,
                totalOtrosCargos: parseFloat(getText(resumenFactura, "TotalOtrosCargos")) || 0,
                totalComprobante: parseFloat(getText(resumenFactura, "TotalComprobante")) || 0,
            };

            return {
                tipoDocumento: root.tagName,
                clave: getText(root, "Clave"),
                numeroConsecutivo: getText(root, "NumeroConsecutivo"),
                fechaEmision: getText(root, "FechaEmision"),
                condicionVenta: getText(root, "CondicionVenta"),
                emisor: parsePersona(getDirectChild(root, "Emisor")),
                receptor: parsePersona(getDirectChild(root, "Receptor")),
                lineas,
                resumen,
            };
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    randomHexColor: function randomHexColor(opacity = 0.6) {
        return Array.from({ length: 1 }, () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        });
    },
    createReference:function createReference(texto)
    {
      const prefijo = String(texto).trim().slice(0, 3).toUpperCase();
    const numero = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefijo}-${numero}`;

    }
};

export default AppUtil;
