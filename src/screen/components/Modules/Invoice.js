import React, { Component, createRef } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import {  Container,  Row,    Col,    Button,    Modal,    Tabs,    Tab,    Form} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { url } from "screen/components/services/api";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";
import Select from "react-select";
import { withTranslation } from "react-i18next";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import moment from 'moment-timezone'
import Tooltip from 'react-bootstrap/Tooltip';
import alertSuccess from "../common/SweetAlert";
import ActionButtons from "../common/ActionButtons";


DataTable.use(DT);

class Invoice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // ── Modal principal (crear/editar factura)
            show: false,
            isView:false,
            // ── Modal aceptación de facturas
            showAcceptance: false,

            processing: true,
   

            // ── Objeto principal de la factura (campos FacturasController)
            invoice: {
                id: 0,
                clave: "",
                consecutivo_electronico: "",
                consecutivo: 0,
                tipo_moneda_id: 0,
                estado_Factura_id: 1,
                tipo_documento_id: 1,
                subtotal: 0,
                impuesto: 0,
                total: 0,
                descuento: 0,
                impuesto_id: 0,
                cambio_venta: 0,
                cambio_compra: 0,
                clientes_id: 0,
                condicion_venta_id: 0,
                medio_pago_id: 0,
                usuarios_Usuario_id: 0,
            },

            // ── Líneas de detalle (Factura_Detalles)
            lines: [],

            // ── Helper para calcular línea activa
            AuxLine: {
                total: "",
                subtotal: "",
                descuento: 0,
                impuesto: "",
                porcentaje: 0,
                cantidad: 1,
            },

            // ── Archivo XML de aceptación
            archivoAceptacion: null,

            // ── Catálogos
            customers: [],
            paymentMethods: [],
            currencies: [],
            invoiceStates: [],
            docTypes: [],
            saleConditions: [],
            taxes: [],
            commercialCodes: [],
            cabyCodes: [],
            selectedCabys:[],
            dolar_compra:           localStorage.getItem("dolar_compra"),
            dolar_venta:           localStorage.getItem("dolar_venta"),
            defaultTax: 0,
            formatoFecha:"DD-MM-YYYY",
            token: "",
        };
        this.impuestoSelectRef = createRef(); 
        this.datatableRef = createRef();
        this.user = null;
    }

    componentDidMount() {
        this.getUserInfo();
    }

    getUserInfo = () => {
        let bytes = crypto.AES.decrypt(
            sessionStorage.getItem("user"),
            "@marsh_contable"
        );
        this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
       let formatoFecha = this.user.formatoFecha
      
        
        this.setState(
            {
                token: sessionStorage.getItem("sessionId"),
                invoice: {
                    ...this.state.invoice,
                    Usuarios_Usuario_id: this.user.usuario_id,
                },
                defaultTax: this.user.impuestoDefault,
                formatoFecha: formatoFecha.toUpperCase()
            },
            () => {
                this.getCustomers();
                this.getPaymentMethods();
                this.getCurrencies();
                this.getInvoiceStates();
                
                this.getSaleConditions();
                this.getTaxes();
                this.getCommercialCodes();
                this.getCabyCodes();
                
            }
        );
    };

    // Resetea el estado del modal
    _resetInvoice = () => ({
        id: 0,
        clave: "",
        consecutivo_electronico: "",
        consecutivo: 0,
        tipo_moneda_id: 0,
        estado_Factura_id: 1,
        tipo_documento_id: 1,
        subtotal: 0,
        impuesto: 0,
        total: 0,
        descuento: 0,
        impuesto_id: 0,
        cambio_venta: 0,
        cambio_compra: 0,
        clientes_id: 0,
        condicion_venta_id: 0,
        medio_pago_id: 0,
        usuarios_Usuario_id: this.user ? this.user.usuario_id : 0,
    });

    toggleShow = () =>{
        this.setState({
            show: !this.state.show,
           isView:false,
            lines: [],
            invoice: this._resetInvoice(),
            AuxLine: { total: "", subtotal: "", descuento: 0, impuesto: "", porcentaje: 0, cantidad: 1 },
        }, () => {this.getClave(); this._triggerDefaultTax()});
    }
    toggleShowAcceptance = () =>
        this.setState({
            showAcceptance: !this.state.showAcceptance,
            archivoAceptacion: null,
          
        });

    // Actualiza campos del objeto invoice
    _saveStateVariable = async (e) => {
        const { name, type, checked, value } = e.target;
        await this.setState({
            invoice: {
                ...this.state.invoice,
                [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
            },
        });
    };

    // Actualiza el cliente desde react-select
    _saveCustomer = (selectedOption) => {
        
        
        this.setState({
            invoice: {
                ...this.state.invoice,
                clientes_id: selectedOption ? selectedOption.id : 0,
            },
        });
    };


    _calculaInput = (e, isSelect = false) => {
        let { name, value, selectedIndex } = e.target;

        if (isSelect) {
            const optionElement = e.target.options[selectedIndex];
            const taxOption = optionElement.getAttribute("attr");
            name = "porcentaje";
            value = taxOption;
            
        }
       
        this.setState({ AuxLine: { ...this.state.AuxLine, [name]: value } }, () => {
            let { AuxLine } = this.state;


            let subtotal  = isNaN(AuxLine.subtotal) || AuxLine.subtotal ==="" ? 0 : parseFloat(AuxLine.subtotal);
            let tax       = isNaN(AuxLine.porcentaje) || AuxLine.porcentaje ==="" ? 0 : parseFloat(AuxLine.porcentaje);
            let cantidad  = isNaN(AuxLine.cantidad) || AuxLine.cantidad ==="" ? 1 : parseFloat(AuxLine.cantidad);
            let descuento = isNaN(AuxLine.descuento) || AuxLine.descuento === ""  ? 0 : parseFloat(AuxLine.descuento);

            let impuesto = ((subtotal * cantidad) - descuento) * (tax / 100);
            let total    = ((subtotal * cantidad) - descuento) + impuesto;

        
            AuxLine.impuesto = impuesto;
            AuxLine.total    = total;
            this.setState({ AuxLine });
        });
    };

    // ─────────────────────────────────────────────
    // LÍNEAS DE DETALLE
    // ─────────────────────────────────────────────

    addLine = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const {selectedCabys} = this.state; //obtenemos el cabyscode
        const formData = new FormData(e.target);
        const selectComercial = e.target.elements["codigo_comercial_id"];
        let cabys = selectedCabys.label.split(" - ")
      
        

        const newLine = {
            codigos_cabys_id:          parseInt(selectedCabys.value)    || 0,
            codigos_cabys_codigo:      cabys[0] || "",
            codigos_cabys_Impuesto_id: parseInt(selectedCabys.impuesto_id)          || 0,
            codigo_comercial_id:       parseInt(formData.get("codigo_comercial_id"))  || 0,
            codigo_comercial_label:    selectComercial ? selectComercial.options[selectComercial.selectedIndex].text : "",
            detalle:                   formData.get("detalle"),
            cantidad:                  parseFloat(formData.get("cantidad"))   || 1,
            subtotal:                  parseFloat(formData.get("subtotal"))   || 0,
            impuesto:                  parseFloat(formData.get("impuesto"))   || 0,
            descuento:                 parseFloat(formData.get("descuento"))  || 0,
            total:                     parseFloat(formData.get("total"))      || 0,
            Unidad_medida_id:          1, // por defecto
            Facturas_id:               0, // se asigna tras crear el encabezado
            impuesto_id: parseFloat(formData.get("impuesto_id"))      || 0,
        };

        this.setState(
            (prevState) => ({
                lines: [...prevState.lines, newLine],
                AuxLine: { total: "", subtotal: "", descuento: "", impuesto: "", porcentaje: 0, cantidad: 1 },
            }),
            () => this._recalcularTotales()
        );

        e.target.reset();
    };

    removeLine = (index) => {
        this.setState(
            (prevState) => ({
                lines: prevState.lines.filter((_, i) => i !== index),
            }),
            () => this._recalcularTotales()
        );
    };

    _recalcularTotales = () => {
        const { lines } = this.state;
        const subtotal  = lines.reduce((acc, l) => acc + l.subtotal,  0);
        const impuesto  = lines.reduce((acc, l) => acc + l.impuesto,  0);
        const total     = lines.reduce((acc, l) => acc + l.total,     0);
        const descuento = lines.reduce((acc, l) => acc + l.descuento, 0);

        this.setState((prevState) => ({
            invoice: { ...prevState.invoice, subtotal, impuesto, total, descuento },
        }));
    };

    // ─────────────────────────────────────────────
    // CATÁLOGOS
    // ─────────────────────────────────────────────

    getCustomers = () =>
        AppUtil.getAPI("clientes", ).then((response) => {
            const customers      = response ? response.data.data : [];
            this.setState({ customers, processing: false });
        });

    getPaymentMethods = () =>
        AppUtil.getAPI("catalogos/medio_pago", ).then((response) => {
            this.setState({ paymentMethods: response ? response.data : [] });
        });

    getCurrencies = () =>
        AppUtil.getAPI("catalogos/tipo_moneda").then((response) => {
            this.setState({ currencies: response ? response.data : [] });
        });

    getInvoiceStates = () =>
        AppUtil.getAPI("catalogos/estado_factura").then((response) => {
            this.setState({ invoiceStates: response ? response.data : [] });
        });


    getSaleConditions = () =>
        AppUtil.getAPI("catalogos/condicion_venta").then((response) => {
            this.setState({ saleConditions: response ? response.data : [] });
        });



    getCommercialCodes = () =>
        AppUtil.getAPI("catalogos/codigo_comercial").then((response) => {
            this.setState({ commercialCodes: response ? response.data : [] });
        });

    getCabyCodes = (input = "") =>{

        let cabyCodes = []

        if(input === "")
        {
             AppUtil.getAPI(`catalogos/codigos_cabys`).then((response) => {
            const data      = response ? response.data.data : [];
             cabyCodes = Array.isArray(data)
                ? data.map((c) => ({ value: c.id, label: `${c.codigo} - ${c.nombre}`, codigo: c.codigo, impuesto_id: c.impuesto_id }))
                : [];      
                 this.setState({ cabyCodes });         
        }); 
        } else{
              AppUtil.getAPI(`catalogos/codigos_cabys?search[value]=${input}`).then((response) => {
            const data      = response ? response.data.data : [];
             cabyCodes = Array.isArray(data)
                ? data.map((c) => ({ value: c.id, label: `${c.codigo} - ${c.nombre}`, codigo: c.codigo, impuesto_id: c.impuesto_id }))
                : [];     
                 this.setState({ cabyCodes });   
            
        });
        }
        
    }
   getClave = () =>{

    if(this.state.invoice.id === 0)
    {
     AppUtil.getAPI("facturas/clave").then((response) => {
            const data = response ? response.data : [];
            const clave = data.clave;
            const consecutivo_electronico = data.consecutivo;
               this.setState((prevState) => ({ invoice: { ...prevState.invoice, clave, consecutivo_electronico } }
               )
    
    );
});
    }

   
}
    // ─────────────────────────────────────────────
    // CONSULTAR POR ID (edición)
    // ─────────────────────────────────────────────

    getInvoiceById = (id, isView = false) => {
        const { t } = this.props;

        AppUtil.getAPI(`facturas/${id}`, ).then((response) => {
            if (response.codeStatus === 200) {
                const invoiceData = response.data;
                const lines       = invoiceData.factura_Detalles || [];
     
                
                delete invoiceData.factura_Detalles;

                this.setState({
                    invoice: {
                        id:                      invoiceData.id,
                        clave:                   invoiceData.clave,
                        consecutivo_electronico: invoiceData.consecutivo_electronico,
                        consecutivo:             invoiceData.consecutivo,
                        tipo_moneda_id:          invoiceData.tipo_moneda_id,
                        estado_Factura_id:       invoiceData.estado_factura_id,
                        tipo_documento_id:       invoiceData.tipo_documento_id,
                        subtotal:                invoiceData.subtotal,
                        impuesto:                invoiceData.impuesto,
                        total:                   invoiceData.total,
                        descuento:               invoiceData.descuento,
                        impuesto_id:             invoiceData.impuesto_id,
                        cambio_venta:            invoiceData.cambio_venta,
                        cambio_compra:           invoiceData.cambio_compra,
                        clientes_id:             invoiceData.clientes_id,
                        condicion_venta_id:      invoiceData.condicion_venta_id,
                        medio_pago_id:           invoiceData.medio_pago_id,
                        usuarios_Usuario_id:     this.user.usuario_id,
                    },
                    lines,
                    show:  true,
                    isView
                    
                });
            } else {
                alertSuccess(t(response.message),"error",t);
            }
        });
    };
    saveInvoice = () => {
        const { t } = this.props;
        const { invoice, lines, dolar_compra,dolar_venta } = this.state;

        // Validaciones
        if (!invoice.clave) {
            alertSuccess(t("key_required"),"warning",t);
            return;
        }
        if (invoice.clientes_id === 0) {
            alertSuccess(t("customer_required"),"warning",t);
      
            return;
        }
        if (invoice.Tipo_moneda_id === 0) {
        
            alertSuccess(t("currency_required"),"warning",t);
            return;
        }
        if (invoice.Condicion_venta_id === 0) {
            alertSuccess(t("sale_condition_required"),"warning",t);

            return;
        }
        if (invoice.Medio_pago_id === 0) {
            alertSuccess(t("payment_method_required"),"warning",t);

            return;
        }
        if (lines.length === 0) {
            alertSuccess(t("lines_required"),"warning",t);
            return;
        }

        this.setState({ processing: true });

        // Adjuntar líneas al payload
        const payload = { ...invoice, Factura_Detalles: lines, cambio_compra:dolar_compra, cambio_venta:dolar_venta };
        
        
        if (invoice.id === 0) {
            // ── CREAR
            AppUtil.postAPI("facturas", payload).then((response) => {
                if (response.codeStatus === 200) {

                     alertSuccess(t("updated_successfully"),"success",t);
          this.toggleShow()
            this.setState({ processing: false });
          // Guardar los detalles con el id del gasto recién creado
        if (this.datatableRef.current?.dt()) 
          {
             this.datatableRef.current.dt().ajax.reload(null, false);
        }
                } else {
             alertSuccess(t(response.message),"error",t);
                }
            });
        } else {
            // ── ACTUALIZAR
            AppUtil.putAPI(`facturas/${invoice.id}`, payload).then((response) => {
                if (response.codeStatus === 200) {
                    
                    alertSuccess(t("updated_successfully"),"success",t);
                              this.toggleShow()
            this.setState({ processing: false });
          // Guardar los detalles con el id del gasto recién creado
        if (this.datatableRef.current?.dt()) 
          {
             this.datatableRef.current.dt().ajax.reload(null, false);
        }
                } else {

                    alertSuccess(t(response.message),"error",t);
            
                }
            });
        }
    };

    // ─────────────────────────────────────────────
    // ACEPTACIÓN DE FACTURAS (XML)
    // ─────────────────────────────────────────────

    _handleFileChange = (e) => {
        this.setState({ archivoAceptacion: e.target.files[0] });
    };

    saveAcceptance = () => {
        const { t } = this.props;
        const { archivoAceptacion } = this.state;

        if (!archivoAceptacion) {
             alertSuccess(t("xml_file_required"),"error",t);
            return;
        }

        this.setState({ processing: true });

        const formData = new FormData();
        formData.append("archivo", archivoAceptacion);

        // Envío del XML al endpoint de aceptación
        fetch(`${url}facturas/aceptacion`, {
            method: "POST",
         
            body: formData,
        })
            .then((res) => res.json())
            .then((response) => {
                if (response.codeStatus === 200) {
                      alertSuccess(t("record_created_successfully"),"error",t);
           
                } else {
alertSuccess(t(response.message),"error",t);
        
                }
            })
            .catch(() => {
                alertSuccess(t("please_verify_data"),"error",t);
        
            });
    };

    // ─────────────────────────────────────────────
    // BOTONES DE ACCIÓN EN LA TABLA
    // ─────────────────────────────────────────────

    ActionButtons = (rowData) => (
        <ActionButtons 
            editAction ={() => this.getInvoiceById(rowData.id)}
            viewAction={() => this.getInvoiceById(rowData.id, true)}   
        />
    );

    
    OverlayBtn = (rowData) => (
        <Row className="m-2">
            <Col lg="12" sm="12">
 <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 400 }}
      overlay={  <Tooltip id="button-tooltip">
      {rowData.clave}
    </Tooltip>}
    >
      <Button variant="success"><i className="fas fa-info" /></Button>
    </OverlayTrigger>
     </Col>
        </Row>
        
    );

    getTaxes = () =>
    AppUtil.getAPI(`catalogos/impuesto`, sessionStorage.getItem("token")).then(
        (response) => {
            let taxes = response ? response.data : [];
            this.setState({ taxes }, () => {
                // ── Una vez que los taxes están en el estado
                // disparar el onChange del select con el impuesto default
               
            });
        }
    );

_triggerDefaultTax = () => {
    const { defaultTax } = this.state;

    

    if (!defaultTax || !this.impuestoSelectRef.current) return;

    const select = this.impuestoSelectRef.current;

 

    // Buscar el índice de la opción con el defaultTax
    const index = Array.from(select.options).findIndex(
        (opt) => parseInt(opt.value) === defaultTax
    );
   
    if (index !== -1) {
        // Setear el valor del select
        select.selectedIndex = index;

        // Crear evento sintético y disparar _calculaInput
        const event = {
            target: select
        };
     
        this._calculaInput(event, true);
    }
};

  
    render() {
        const { t } = this.props;

        
        const {
            invoice,
            lines,
            customers,
            paymentMethods,
            currencies,
        
        
            saleConditions,
            taxes,
            commercialCodes,
            cabyCodes,
            isView,
            processing,
            token,
            AuxLine,
        } = this.state;

        return (
            <>
                <Container fluid>
                    <Tabs id="invoice-tabs" className="mb-3 txt-blue" defaultActiveKey="invoice">

                        {/* ══════════════════════════════════════════
                            TAB 1 — FACTURACIÓN
                        ══════════════════════════════════════════ */}
                        <Tab eventKey="invoice" title={t("invoice")} className="txt-darkblue">

                            {/* Header */}
                            <Row>
                                <Col lg="6" sm="12">
                                    <h1>{t("invoice")}</h1> 
                                   
                                </Col>
                                <Col lg="6" sm="12">
                                 
                                    <Row>
                                        <Col lg="3" sm="12">
                                           <Button className=" " onClick={this.toggleShow}>
                                                {t("create")}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            {/* DataTable */}
                            <Row>
                                {token === "" ? (
                                    <div />
                                ) : (
                                    <DataTable
                                    ref={ this.datatableRef}
                                        ajax={{
                                            url: `${url}facturas`,
                                            type: "GET",
                                            headers: {
                                                Accept: "application/json",
                                                "Content-Type": "application/json; charset=UTF-8",
                                                "X-Session-Id": token,
                                            },
                                            dataSrc: function (json) {
                                                return json.data || [];
                                            },
                                            dataType: "json",
                                                error: function (xhr) {
                  if (xhr.status === 401) {
                sessionStorage.setItem("expired", true);

                    window.location.href = "/";
                  }
                },
                                        }}
                                        columns={[
                                            { data: "id",                      title: t("id") },
                                            { title: t("key"), data:null, orderable: false, searchable:false, defaultContent:""},
                                            { data: "consecutivo_electronico", title: t("consecutive") },
                                            { data: "fecha",                   title: t("creation_date"),  render: (data, type, row) =>{ return moment(`${row.fecha}`).format(`${this.state.formatoFecha}`) } },
                                            { data: "cliente",                 title: t("customer") },
                                            { data: "tipo_moneda",             title: t("currency") },
                                            { data: "estado_factura",          title: t("invoice_status") },
                                            { data: "subtotal",                title: t("subtotal") },
                                            { data: "impuesto",                title: t("tax") },
                                            { data: "descuento",               title: t("discount") },
                                            { data: "total",                   title: t("total") },
                                            {
                                                title: t("action"),
                                                data: null,
                                                orderable: false,
                                                searchable: false,
                                                defaultContent: "",
                                            },
                                        ]}
                                        className="display table cell-border compact stripe"
                                        slots={{ 1: (cellData, rowData) => this.OverlayBtn(cellData),  11: (cellData, rowData) => this.ActionButtons(rowData) }}
                                        options={{
                                            language: {
                                                zeroRecords:       t("zeroRecords"),
                                                emptyTable:        t("emptyTable"),
                                                search:            t("search"),
                                                paginate:          t("paginate"),
                                                searchPlaceholder: t("searchPlaceholder"),
                                                info:              t("info"),
                                                lengthMenu:        t("lengthMenu"),
                                            },
                                            layout: {
                                                topStart:    "pageLength",
                                                topEnd:      "search",
                                                bottomStart: "info",
                                                bottomEnd:   "paging",
                                            },
                                        }}
                                    />
                                )}
                            </Row>
                        </Tab>

                        {/* ══════════════════════════════════════════
                            TAB 2 — ACEPTACIÓN DE FACTURAS
                        ══════════════════════════════════════════ */}
                        <Tab eventKey="invoice_acceptance" title={t("invoice_acceptance")} className="txt-darkblue">
                            <Row>
                                <Col lg="6" sm="12">
                                    <h1>{t("invoice_acceptance")}</h1>
                                </Col>
                                <Col lg="6" sm="12">
                                    <Row>
                                        <Col lg="3" sm="12">
                                            <Button className=" " onClick={this.toggleShowAcceptance}>
                                                {t("create")}
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Tab>

                    </Tabs>

                    {/* ══════════════════════════════════════════
                        MODAL — CREAR / EDITAR FACTURA
                    ══════════════════════════════════════════ */}
                    <Modal
                        show={this.state.show}
                        onHide={this.toggleShow}
                        backdrop="static"
                        keyboard={false}
                        size="lg"
                        
                        scrollable
                    >
                        <Modal.Header closeButton>
                            <h3 className="tituloFerias">
                                {invoice.id === 0 ? t("create_invoice") : t("edit_invoice")}
                            </h3>
                        </Modal.Header>

                        <Modal.Body>
                  

                  
                            {/* ── Clave y Consecutivo electrónico ── */}
                            <Row className="m-2">
                                <Col sm="12" xl="6">
                                    <label>{t("key")}</label>
                                    <Form.Group>
                                        <Form.Control
                                            placeholder={t("key")}
                                            type="text"
                                            readOnly
                                            onChange={this._saveStateVariable}
                                            name="clave"
                                            required
                                            maxLength={50}
                                            value={invoice.clave}
                                            disabled={isView}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm="12" xl="6">
                                    <label>{t("consecutive")}</label>
                                    <Form.Group>
                                        <Form.Control
                                            placeholder={t("consecutive")}
                                            type="text"
                                            readOnly
                                            onChange={this._saveStateVariable}
                                            name="consecutivo_electronico"
                                            required
                                            maxLength={45}
                                            value={invoice.consecutivo_electronico}
                                            disabled={isView}

                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* ── Tipo moneda / Condición venta ── */}
                            <Row className="m-2">
                                <Col sm="12" xl="6">
                                    <label className="txt-darkblue">{t("currency")}</label>
                                    <Form.Group>
                                        <Form.Select   name="tipo_moneda_id" onChange={this._saveStateVariable} value={invoice.tipo_moneda_id} required
                                        
                                            disabled={isView}
                                        >
                                            <option value="">{t("select_option")}</option>
                                            {currencies.map((item) => (
                                                <option key={item.id} value={item.id}>{item.nombre}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col sm="12" xl="6">
                                    <label className="txt-darkblue">{t("sale_condition")}</label>
                                    <Form.Group>
                                        <Form.Select name="condicion_venta_id" onChange={this._saveStateVariable} value={invoice.condicion_venta_id} required 
                                            disabled={isView}
                                        >
                                            <option value="">{t("select_option")}</option>
                                            {saleConditions.map((item) => (
                                                <option key={item.id} value={item.id}>{item.descripcion}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* ── Medio de pago / Tipo documento ── */}
                            <Row className="m-2">
                                <Col sm="12" xl="12">
                                    <label className="txt-darkblue">{t("payment_method")}</label>
                                    <Form.Group>
                                        <Form.Select name="medio_pago_id" onChange={this._saveStateVariable} value={invoice.medio_pago_id} required disabled={isView}>
                                            <option value="">{t("select_option")}</option>
                                            {paymentMethods.map((item) => (
                                                <option key={item.id} value={item.id}>{item.descripcion}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                      
                            </Row>

                            {/* ── Tipo de cambio ── */}
                            <Row className="m-2">
                                <Col sm="12" xl="6">
                                    <label className="txt-darkblue">{t("exchange_rate_sale")}</label>
                                    <Form.Group>
                                        <Form.Control
                                            placeholder={t("exchange_rate_sale")}
                                            type="number"
                                            name="cambio_venta"
                                            min={0}
                                            step="0.01"
                                            readOnly
                                            onChange={this._saveStateVariable}
                                            value={this.state.dolar_venta}
                                            disabled={isView}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm="12" xl="6">
                                    <label className="txt-darkblue">{t("exchange_rate_buy")}</label>
                                    <Form.Group>
                                        <Form.Control
                                            placeholder={t("exchange_rate_buy")}
                                            type="number"
                                            name="cambio_compra"
                                            min={0}
                                            step="0.01"
                                            readOnly
                                            onChange={this._saveStateVariable}
                                            value={this.state.dolar_compra}
                                            disabled={isView}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* ── Cliente (react-select) ── */}
                            <Row className="m-2">
                                <Col sm="12" xl="12">
                                    <label className="txt-darkblue">{t("customer")}</label>
                                    <Select
                                        options={customers}
                                        onChange={this._saveCustomer}
                                        placeholder={`${t("select_option")}`}
                                        name="clientes_id"
                                       // onChange={(value) => this.setState({ spent: { ...this.state.spent, proveedor_id: value.id}}) }
                                        getOptionValue={(option) => option.id}
                                        disabled={isView}
                                        getOptionLabel={(option) => `${option.nombre} ${option.apellido1} ${option.apellido2}`}
                                        defaultValue={() =>
                                          customers?.find(
                                            (opt) => opt.id === invoice.clientes_id,
                                          )
                                        }
                                      isSearchable={true}

                                    />
                                </Col>
                            </Row>

                            {/* ══ SECCIÓN DE LÍNEAS DE DETALLE ══ */}
                      <div className="card mt-3 shadow-lg">
                                <Form onSubmit={this.addLine}>
                         {!isView && <div>



                         
                                    {/* Código CABYS / Código Comercial */}
                                    <Row className="m-2">
                                        <Col sm="12" xl="6">
                                            <label className="txt-darkblue">{t("cabys_code")}</label>
                                            <Form.Group>
                                        <Select
                                        options={cabyCodes}
                                        
                                        onChange={(selectedCabys) => {
                                         this.setState({ selectedCabys })}}
                                    
                                        placeholder={`${t("select_option")}`}
                                        onInputChange={(value) => this.getCabyCodes(value) }
                                    />

                                            </Form.Group>
                                        </Col>
                                        <Col sm="12" xl="6">
                                            <label className="txt-darkblue">{t("comercial_code")}</label>
                                            <Form.Group>
                                                <Form.Select name="codigo_comercial_id" required>
                                                    <option value="">{t("select_option")}</option>
                                                    {commercialCodes.map((item) => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.codigo} - {item.nombre}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Detalle / Cantidad */}
                                    <Row className="m-2">
                                        <Col sm="12" xl="8">
                                            <label className="txt-darkblue">{t("detail")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("detail")}
                                                    type="text"
                                                    name="detalle"
                                                    required
                                                    maxLength={200}
                                                    
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm="12" xl="4">
                                            <label className="txt-darkblue">{t("qty")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("qty")}
                                                    type="number"
                                                    name="cantidad"
                                                    required
                                                    min={1}
                                                    step="0.01"
                                                    onChange={(e) => this._calculaInput(e)}
                                                    value={AuxLine.cantidad}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Subtotal / Impuesto / Descuento */}
                                    <Row className="m-2">
                                        <Col sm="12" xl="4">
                                            <label className="txt-darkblue">{t("subtotal")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("subtotal")}
                                                    type="number"
                                                    name="subtotal"
                                                    required
                                                    min={0}
                                                    step="0.01"
                                                    onChange={(e) => this._calculaInput(e)}
                                                    value={AuxLine.subtotal}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm="12" xl="4">
                                            <label className="txt-darkblue">{t("tax_type")}</label>
                                            <Form.Select name="impuesto_id" onChange={(e) => this._calculaInput(e, true)} required ref={this.impuestoSelectRef}>
                                                <option value="">{t("select_option")}</option>
                                                {taxes?.map((item, key) =>
                                                    item.id === this.state.defaultTax ? (
                                                        <option key={key} value={item.id} attr={item.porcentaje} selected>
                                                            {item.nombre}
                                                        </option>
                                                    ) : (
                                                        <option key={key} value={item.id} attr={item.porcentaje}>
                                                            {item.nombre}
                                                        </option>
                                                    )
                                                )}
                                            </Form.Select>
                                        </Col>
                                        <Col sm="12" xl="4">
                                            <label className="txt-darkblue">{t("discount")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("discount")}
                                                    type="number"
                                                    name="descuento"
                                                    min={0}
                                                    step="0.01"
                                                    onChange={(e) => this._calculaInput(e)}
                                                    value={AuxLine.descuento}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Impuesto calculado / Total */}
                                    <Row className="m-2">
                                        <Col sm="12" xl="6">
                                            <label className="txt-darkblue">{t("tax")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("tax")}
                                                    type="number"
                                                    name="impuesto"
                                                    readOnly
                                                    min={0}
                                                    step="0.01"
                                                    value={AuxLine.impuesto}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm="12" xl="6">
                                            <label className="txt-darkblue">{t("total")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("total")}
                                                    type="number"
                                                    name="total"
                                                    readOnly
                                                    min={0}
                                                    step="0.01"
                                                    value={AuxLine.total}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="m-2">
                                        <Col sm="12" xl="12">
                                            <Button variant="primary" className="" type="submit">
                                                {t("add_line")}
                                            </Button>
                                        </Col>
                                    </Row>
</div>}
                                    {/* Tabla de líneas */}
                                    <Row className="m-3">
                                        <Col sm="12" xl="12">
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>{t("cabys_code")}</th>
                                                        <th>{t("comercial_code")}</th>
                                                        <th>{t("detail")}</th>
                                                        <th>{t("qty")}</th>
                                                        <th>{t("subtotal")}</th>
                                                        <th>{t("discount")}</th>
                                                        <th>{t("tax")}</th>
                                                        <th>{t("total")}</th>
                                                        {!isView && <th>{t("action")}</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lines.length > 0 &&
                                                        lines.map((line, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{line.codigos_cabys_codigo}</td>
                                                                <td>{line.codigo_comercial_label}</td>
                                                                <td>{line.detalle}</td>
                                                                <td>{line.cantidad}</td>
                                                                <td>{line.subtotal}</td>
                                                                <td>{line.descuento}</td>
                                                                <td>{line.impuesto}</td>
                                                                <td>{line.total}</td>
                                                                {!isView && <td>
                                                                    <Button
                                                                        variant="danger"
                                                                        className=""
                                                                        onClick={() => this.removeLine(index)}
                                                                    >
                                                                        <i className="fas fa-trash" />
                                                                    </Button>
                                                                </td>}
                                                            </tr>
                                                        ))}
                                                </tbody>
                                                {lines.length > 0 && (
                                                    <tfoot>
                                                        <tr className="table-info fw-bold">
                                                            <td colSpan={5}>{t("totals")}</td>
                                                            <td>{(invoice.subtotal || 0).toFixed(2)}</td>
                                                            <td>{(invoice.descuento || 0).toFixed(2)}</td>
                                                            <td>{(invoice.impuesto || 0).toFixed(2)}</td>
                                                            <td>{(invoice.total || 0).toFixed(2)}</td>
                                                            {!isView && <td />}
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </Table>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="light" className="btn-rounded" onClick={this.toggleShow}>
                                {t("close")}
                            </Button>
                            {processing ? (
                                <div className="lds-dual-ring-2" />
                            ) : (
                                !isView && <Button variant="primary" className="" onClick={this.saveInvoice}>
                                    {t("save")}
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>

                    {/* ══════════════════════════════════════════
                        MODAL — ACEPTACIÓN DE FACTURAS (XML)
                    ══════════════════════════════════════════ */}
                    <Modal
                        show={this.state.showAcceptance}
                        onHide={this.toggleShowAcceptance}
                        backdrop="static"
                        keyboard={false}
                        size="lg"
                        
                    >
                        <Modal.Header closeButton>
                            <h3 className="tituloFerias">{t("invoice_acceptance")}</h3>
                        </Modal.Header>

                        <Modal.Body>
                            <div ref={this.modalTopRef} />
                   

                            <Row className="m-2">
                                <Col sm="12" xl="12">
                                    <label>{t("xml_file")}</label>
                                    <Form.Group>
                                        <Form.Control
                                            type="file"
                                            accept=".xml"
                                            name="archivo_aceptacion"
                                            onChange={this._handleFileChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="light" className="btn-rounded" onClick={this.toggleShowAcceptance}>
                                {t("close")}
                            </Button>
                            {processing ? (
                                <div className="lds-dual-ring-2" />
                            ) : (
                                <Button variant="primary" className="" onClick={this.saveAcceptance}>
                                    {t("save")}
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>

                </Container>
            </>
        );
    }
}

export default withTranslation()(Invoice);