import React, { Component,createRef } from "react";

import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import {Container, Row, Col,  Button, Modal, Form} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { url } from "screen/components/services/api";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";
import Select from "react-select";
import { withTranslation } from "react-i18next";
import moment from 'moment-timezone'
import alertSuccess from "../common/SweetAlert";
import ActionButtons from '../common/ActionButtons'
import SlideDown from '../common/SlideDown'

DataTable.use(DT);

class Spent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: [],
      show: false,
      isView:false,
      processing: true,
     

      // Objeto principal del gasto
      spent: {
        id: 0,
        doc_Referencia: "",
        categoria_gasto_id: 0,
        tipo_documento_id: 0,
        medio_pago_id: 0,
        proveedor_id: 0,
        descripcion: "",
        subtotal: 0,
        impuesto: 0,
        total: 0,
        usuarios_Usuario_id: 0,
        createElectronicDoc:1, //delete on send
        descuento:0,
        tipo_moneda_id:0,
        presupuesto_id:"",
        condicion_venta_id: 0,
        dias_credito: ""
      },
      AuxLine:{
        total:"",
        subtotal:"",
        descuento:"",
        impuesto:"",
        porcentaje:0,
        cantidad:1
      },

      // Líneas de detalle
      lines: [],

      // Catálogos
      categories: [],
      paymentMethods: [],
      providers: [],
      commercialCodes: [],
      taxes:[],
      defaultTax:0,
      currency:[],
      saleConditions: [],
      token: "",
      dropGP:[]
    };
    this.user = null;
    this.datatableRef = createRef();
    this.impuestoSelectRef = createRef(); 
  }


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


  componentDidMount() {
    this.getUserInfo();
  
  }


  getUserInfo = () => {
    let bytes = crypto.AES.decrypt(
      sessionStorage.getItem("user"),
      "@marsh_contable"
    );
    this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));

    
    this.setState({
      token: sessionStorage.getItem("sessionId"),
      spent: {
        ...this.state.spent,
        usuarios_Usuario_id: this.user.usuario_id,
      },
      defaultTax: this.user.impuestoDefault
    }, ()=>{
  this.getCategories();
    this.getTaxes();
    this.getPaymentMethods();
    this.getProviders();
    this.getCommercialCodes();
this.getCurrency();
this.getCategories_dropdown();
this.getSaleConditions();


    });
  };

  toggleShow = () =>
    this.setState({
      show: !this.state.show,
     isView:false,
      lines: [],
      spent: {
        id: 0,
        doc_Referencia: "",
        categoria_gasto_id: 0,
        tipo_documento_id: 0,
        medio_pago_id: 0,
        proveedor_id: 0,
        descripcion: "",
        subtotal: 0,
        impuesto: 0,
        total: 0,
        descuento:0,
        usuarios_Usuario_id: this.user ? this.user.usuario_id : 0,
        createElectronicDoc:1,
        tipo_moneda_id:0,
        presupuesto_id:"",
        condicion_venta_id: 0,
        dias_credito: ""
      },
    }, ()=> this._triggerDefaultTax());

  // Actualiza campos del objeto principal spent
_saveStateVariable = async (e) => {

      const {name, type, checked, value} = e.target;
    await this.setState({ spent: { ...this.state.spent, [name]: type ==="checkbox" ? (checked? 1:0): value }});
    }

  // Actualiza el proveedor desde react-select
  _saveProvider = (selectedOption) => {
    this.setState({
      spent: {
        ...this.state.spent,
        Proveedor_id: selectedOption ? selectedOption.value : 0,
      },
    });
  };


  addLine = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData(e.target);

    const newLine = {
      codigo_comercial_id: parseInt(formData.get("codigo_comercial")) || 0,
      detalle: formData.get("detalle"),
      subtotal: parseFloat(formData.get("subtotal")) || 0,
      impuesto: parseFloat(formData.get("impuesto")) || 0,
      descuento: parseFloat(formData.get("descuento")) || 0,
      total: parseFloat(formData.get("total")) || 0,
      medio_pago_id: parseInt(formData.get("medio_pago")) || 0,
      gastos_id: 0, // se asigna tras guardar el encabezado
      cantidad:parseFloat(formData.get("cantidad")) || 0,//agrgamos uno por defecto
      codigo_comercial: formData.get("codigo_comercial_label") || formData.get("codigo_comercial"),
    };


    // Recalcular totales del encabezado
    this.setState(
      (prevState) => ({
        lines: [...prevState.lines, newLine],
        AuxLine:{
        total:"",
        subtotal:"",
        descuento:"",
        impuesto:"",
        porcentaje:0
      },
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
    
    const subtotal = lines.reduce((acc, l) => acc + l.subtotal, 0);
    const impuesto = lines.reduce((acc, l) => acc + l.impuesto, 0);
    const total = lines.reduce((acc, l) => acc + l.total, 0);
    const descuento = lines.reduce((acc, l) => acc + l.descuento, 0);

    this.setState((prevState) => ({
      spent: {
        ...prevState.spent,
        subtotal,
        impuesto,
        total,
        descuento
      },
    }));
  };

  _calculaInput = (e, isSelect= false) =>{

 
   let {name, type, value, selectedIndex} = e.target;
    if(isSelect)
    {
      const index = selectedIndex;
      const optionElement = e.target.options[index];
      const taxOption = optionElement.getAttribute('attr');
      name = 'porcentaje'
      value = taxOption
      }
          
    
   
     this.setState({ AuxLine: { ...this.state.AuxLine, [name]: value }}, () =>{

    let {AuxLine} = this.state;
    let subtotal = isNaN(AuxLine.subtotal) ? 0 :AuxLine.subtotal,
     tax = isNaN(AuxLine.porcentaje) ? 0 : AuxLine.porcentaje , 
     impuesto =0,
     total = 0, 
     cantidad = isNaN(AuxLine.cantidad) ? 1 : AuxLine.cantidad , 
     descuento = isNaN(AuxLine.descuento)? 0 :AuxLine.descuento ;

     impuesto = ((subtotal*cantidad)-descuento) * (tax/100)
     total = ((subtotal*cantidad)-descuento) + impuesto;

    AuxLine.total = total;
    AuxLine.impuesto = impuesto
    this.setState({AuxLine})


     });
    
  }

  getCategories = () =>
    AppUtil.getAPI("catalogos/categoria_gasto").then(
      (response) => {
        const categories = response ? response.data : [];
        this.setState({ categories });
      }
    );



  getPaymentMethods = () =>
    AppUtil.getAPI("catalogos/medio_pago").then(
      (response) => {
        const paymentMethods = response ? response.data : [];
        this.setState({ paymentMethods });
      }
    );


    getCurrency = () =>
    AppUtil.getAPI("catalogos/tipo_moneda").then(
      (response) => {
        const currency = response ? response.data : [];
        this.setState({ currency });
      }
    );

        getCategories_dropdown = () =>
    AppUtil.getAPI(`gestion_presupuestaria_dropdown/${moment().year()}`).then(
      (response) => {
        const dropGP = response ? response.data : [];
        this.setState({ dropGP });
      }
    );

  getProviders = () =>{
       const { t } = this.props;

    AppUtil.getAPI("proveedor").then(
      (response) => {

        if(response)
        {
          //doble data porque se obtiene como objeto listo de datatable
          const providers = response ? response.data.data : [];
        
          this.setState({ providers, processing: false });
        } else{
             alertSuccess(t(response.message),"error",t);
  
        }

      
      }
    );
  }

  getSaleConditions = () =>
    AppUtil.getAPI("catalogos/condicion_venta").then((response) => {
      this.setState({ saleConditions: response ? response.data : [] });
    });

  getCommercialCodes = () =>
    AppUtil.getAPI("catalogos/codigo_comercial").then(
      (response) => {
      
        
        const commercialCodes = response ? response.data : [];
        this.setState({ commercialCodes });
      }
    );

    getTaxes = () =>
    AppUtil.getAPI(`catalogos/impuesto`).then(
      (response) => {
        let taxes = response ? response.data : [];
        this.setState({ taxes });
      },
    );

  getSpentById = (id, isView = false)  => {
    const { t } = this.props;

    AppUtil.getAPI(`gastos/${id}`).then(
      (response) => {
        if (response.codeStatus === 200) {
          const spent = response.data;
          spent.createElectronicDoc = spent.tipo_documento_id === 6 ? 1:0; 
          const lines = spent.gastosDetalle;

          this.setState({
              spent,
              lines,
              show: true,
              isView
            });

        } else {
             alertSuccess(t(response.message),"error",t);

        }
      }
    );
  };

  validateForm = (t) => {
    let { spent } = this.state;

    if (!AppUtil.isValidText(spent.doc_Referencia)) {
      alertSuccess(t("invalid_string_form_doc_referencia"), "warning", t);
      return false;
    }
    if (!AppUtil.isValidText(spent.descripcion)) {
      alertSuccess(t("invalid_string_form_descripcion"), "warning", t);
      return false;
    }
    if (!spent.categoria_gasto_id) {
      alertSuccess(t("invalid_string_form_categoria_gasto_id"), "warning", t);
      return false;
    }
    if (!spent.medio_pago_id) {
      alertSuccess(t("invalid_string_form_medio_pago_id"), "warning", t);
      return false;
    }
    if (!spent.tipo_moneda_id) {
      alertSuccess(t("invalid_string_form_tipo_moneda_id"), "warning", t);
      return false;
    }
    if (!spent.proveedor_id) {
      alertSuccess(t("invalid_string_form_proveedor_id"), "warning", t);
      return false;
    }
    if (spent.presupuesto_id === "") {
      alertSuccess(t("invalid_string_form_presupuesto_id"), "warning", t);
      return false;
    }
    return true;
  };

  saveSpent = () => {
    const { t } = this.props;
    const { spent, lines } = this.state;

    if (!this.validateForm(t)) {
      return;
    }
  
    if (lines.length === 0) {
      alertSuccess(t("lines_required"),"warning",t);
      return;
    }

    this.setState({ processing: true });

    spent.Gastos_Detalles = this.state.lines; //asignamos las lineas para crear 

    spent.tipo_documento_id = spent.createElectronicDoc ===1 ? 6 : 12; //factura electronica de compra o GASTO sin documento

    if (spent.id === 0) {
      //  CREAR
      AppUtil.postAPI("gastos", spent).then((response) => {
        if (response.codeStatus === 200) {
      
          alertSuccess(t("record_created_successfully"),"success",t);
          this.toggleShow()
            this.setState({ processing: false });
          // Guardar los detalles con el id del gasto recién creado
        if (this.datatableRef.current?.dt()) 
          {
             this.datatableRef.current.dt().ajax.reload(null, false);
        }

        } else {

           alertSuccess(t(response.message),"error",t);
                 this.setState({ processing: false });
  
        }
      });
    } else {
      // ACTUALIZAR 
      AppUtil.putAPI(`gastos/${spent.id}`, spent).then((response) => {
        if (response.codeStatus === 200) 
          {
          
                     alertSuccess(t("record_created_successfully"),"success",t);
 
          this.toggleShow()
            this.setState({ processing: false });
          // Guardar los detalles con el id del gasto recién creado
        if (this.datatableRef.current?.dt()) 
          {
             this.datatableRef.current.dt().ajax.reload(null, false);
        }
    

          //this._saveDetails(detallesConId, false);
        } else {

                       alertSuccess(t(response.message),"error",t);
                this.setState({ processing: false });
        }
      });
    }
  };

  
  ActionButtons = (rowData) => {
    return (

      <ActionButtons
        viewAction={() => this.getSpentById(rowData.id, true)}
        editAction={() => this.getSpentById(rowData.id)}
      />
    );
  };

  render() {
    const { t } = this.props;
    const {
      spent,
      lines,
      categories,
      paymentMethods,
      providers,
      commercialCodes,
  isView,
      processing,
      token,
      taxes,
      AuxLine, dropGP, saleConditions
    } = this.state;

    return (
      <>
        <Container fluid>

          <Row className="m-2">
            <Col lg="6" sm="12">
              <h1>{t("spent")}</h1>
            </Col>
            <Col lg="6" sm="12">
             
                  <Button
                    onClick={this.toggleShow}
                  >
                    {t("create")}
                  </Button>
                
            </Col>
          </Row>

          <Row>
            {token === "" ? (
              <div />
            ) : (
              <DataTable
              ref={this.datatableRef}
                ajax={{
                  url: `${url}gastos`,
                  type: "GET",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=UTF-8",
                      "X-Session-Id": token
                  },
                   dataSrc: function (json) {
                        json.recordsTotal = json.data.recordsTotal;
                        json.recordsFiltered = json.data.recordsFiltered;
                        json.draw = json.data.draw;
                        return json.data.data;
                      },
                  dataType: "json",
                }}
                columns={[
                  { data: "id", title: t("id") },
                  { data: "doc_Referencia", title: t("reference") },
                  { data: "proveedor",      title: t("provider") },
                  { data: "fecha",      title: t("date"), render: (data, type, row) =>{ return moment(`${row.fecha}`).format(`${this.user.formatoFecha.toUpperCase()}`)} },
                  { data: "usuario",      title: t("created_by") },
                  { data: "subtotal", title: t("subtotal"), render:function(data, type,row){ return `${row.tipo_moneda} ${data}` } },
                  { data: "impuesto", title: t("tax"), render:function(data, type,row){ return `${row.tipo_moneda} ${data}` }},
                  { data: "total", title: t("total"), render:function(data, type,row){ return `${row.tipo_moneda} ${data}` } },
                  {
                    title: t("action"),
                    data: null,
                    orderable: false,
                    searchable: false,
                    defaultContent: "",
                  },
                ]}
                className="display table cell-border compact stripe"
                slots={{
                  8: (cellData, rowData) => this.ActionButtons(rowData),
                }}
                options={{
                  language: {
                    zeroRecords: t("zeroRecords"),
                    emptyTable: t("emptyTable"),
                    search: t("search"),
                    paginate: t("paginate"),
                    searchPlaceholder: t("searchPlaceholder"),
                    info: t("info"),
                    lengthMenu: t("lengthMenu"),
                  },
                  layout: {
                    topStart: "pageLength",
                    topEnd: "search",
                    bottomStart: "info",
                    bottomEnd: "paging",
                  },
                }}
              />
            )}
          </Row>
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
                {spent.id === 0 ? t("create") : (isView ? t("view") :t("edit"))}
              </h3>
            </Modal.Header>

            <Modal.Body>
    
          

                  <Row className="m-2">
                    <Col sm="12" xl="4">
                      <label>{t("reference")}</label>
                      <Form.Group>
                        <Form.Control
                          placeholder={t("reference")}
                          type="text"
                          onChange={this._saveStateVariable}
                          name="doc_Referencia"
                          required
                          maxLength={150}
                          value={spent.doc_Referencia}
                          disabled={isView}
                        />
                      </Form.Group>
                    </Col>
                
                    <Col sm="12" xl="4">
                      <label>{t("description")}</label>
                      <Form.Group>
                        <Form.Control
                          placeholder={t("description")}
                          as="textarea"
                          rows={2}
                          onChange={this._saveStateVariable}
                          name="descripcion"
                          required
                          maxLength={800}
                          value={spent.descripcion}
                          disabled={isView}

                        />
                      </Form.Group>
                    </Col>

                    <Col sm="12" xl="4">
                      <label>{t("budget")}</label>
                      <Form.Group>
                        <Form.Select
                          name="presupuesto_id"
                          onChange={this._saveStateVariable}
                          value={spent.presupuesto_id}
                          required
                          disabled={isView}
                        >
                          <option value="">{t("select_option")}</option>
                          {dropGP.map((item) => (
                            <option key={item.id} value={item.id} disabled={item.monto ===0}>
                              {item.descripcion} {item.simbolo}{item.monto}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="m-2">
                    <Col sm="12" xl="4">
                      <label className="txt-darkblue">{t("category")}</label>
                      <Form.Group>
                        <Form.Select
                          name="categoria_gasto_id"
                          onChange={this._saveStateVariable}
                          value={spent.categoria_gasto_id}
                          required
                          disabled={isView}

                        >
                          <option value="">{t("select_option")}</option>
                          {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

  <Col sm="12" xl="4">
                      <label className="txt-darkblue">
                        {t("payment_method")}
                      </label>
                      <Form.Group>
                        <Form.Select
                          name="medio_pago_id"
                          onChange={this._saveStateVariable}
                          value={spent.medio_pago_id}
                          required
                          disabled={isView}

                        >
                          <option value="">{t("select_option")}</option>
                          {paymentMethods.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.descripcion}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>  

<Col sm="12" xl="4">
<label className="txt-darkblue">
                        {t("currency")}
                      </label>
                      <Form.Group>
                        <Form.Select
                          name="tipo_moneda_id"
                          onChange={this._saveStateVariable}
                          value={spent.tipo_moneda_id}
                          required
                          disabled={isView}

                        >
                          <option value="">{t("select_option")}</option>
                          {this.state.currency.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">{t("sale_condition")}</label>
                      <Form.Group>
                        <Form.Select
                          name="condicion_venta_id"
                          onChange={this._saveStateVariable}
                          value={spent.condicion_venta_id}
                          required
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

                  <SlideDown
                    show={parseInt(spent.condicion_venta_id) === 2}//id de compra a credito 
                    value={spent.dias_credito}
                    onChange={this._saveStateVariable}
                    disabled={isView}
                    t={t}
                  />

                  <Row className="m-2">
                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">{t("provider")}</label>
                  
    {this.state.processing ? (
                          t("loading")
                        ) : (
                          <Select
                            options={providers}
                            name="proveedor_id"
                            onChange={(value) => this.setState({ spent: { ...this.state.spent, proveedor_id: value.id}}) }
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => `${option.nombre} ${option.apellido1}`}
                          disabled={isView}

                            defaultValue={() =>
                              providers?.find(
                                (opt) => opt.id === spent.proveedor_id,
                              )
                            }
                            isSearchable={true}
                          />
                        )}
                      
                      <Col sm="12" xl="12">
                           <Form.Group>
                                                   <Form.Check // prettier-ignore
                                                      type="checkbox"
                                                      id="createElectronicDoc"
                                                      label={t("create_electronic_doc")}
                                                      name="createElectronicDoc"
                                                      onChange={this._saveStateVariable}
                                                      checked={spent.createElectronicDoc ===1 ? true:false}
                          disabled={isView}

                                                      />
                                              </Form.Group>
              
                    </Col>
                    </Col>
                             
                  </Row>

                  {/* ── SECCIÓN DE DETALLES ── */}
                  
                 <div className="card mt-3 shadow-lg">
                    <Form onSubmit={this.addLine}>
                       {!isView && <div>
                      <Row className="m-2">
                        <Col sm="12" xl="4">
                          <label className="txt-darkblue">
                            {t("comercial_code")}
                          </label>
                          <Form.Group>
                            <Form.Select name="codigo_comercial" required>
                              <option value="">
                                {t("select_option")}
                              </option>
                              {commercialCodes.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.codigo} - {item.nombre}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>

                        <Col sm="12" xl="4">
                          <label className="txt-darkblue">{t("detail")}</label>
                          <Form.Group>
                            <Form.Control
                              placeholder={t("detail")}
                              type="textarea"
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
                               min={0}
                              step="0.01"
                              onChange={(e)=> this._calculaInput(e)}
                              value={AuxLine.cantidad}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row className="m-2">
                        <Col sm="12" xl="4">
                          <label className="txt-darkblue">
                            {t("subtotal")}
                          </label>
                          <Form.Group>
                            <Form.Control
                              placeholder={t("subtotal")}
                              type="number"
                              name="subtotal"
                              required
                              min={0}
                              step="0.01"
                              onChange={(e)=> this._calculaInput(e)}
                              value={AuxLine.subtotal}
                            />
                          </Form.Group>
                        </Col>

                        <Col sm="12" xl="4">
                          <label className="txt-darkblue">{t("tax")}</label>
                                 <Form.Select aria-label="Impuesto" name="impuesto_id" onChange={(e) => this._calculaInput(e,true) } required ref={ this.impuestoSelectRef }>
                                   <option value="">{t("select_option")}</option>                                
                                    {taxes?.map((item, key) =>(item.id === this.state.defaultTax  ? <option value={item.id} selected attr={item.porcentaje} key={key}>{item.nombre}</option> :  <option attr={item.porcentaje} value={item.id} key={key}>{item.nombre}</option>))}
                                  </Form.Select>                          
                        </Col>

                        <Col sm="12" xl="4">
                          <label className="txt-darkblue">
                            {t("discount")}
                          </label>
                          <Form.Group>
                            <Form.Control
                              placeholder={t("discount")}
                              type="number"
                              name="descuento"
                              min={0}
                              onChange={(e)=> this._calculaInput(e)}
                              step="0.01"
                              value={AuxLine.descuento}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row className="m-2">
                        
                        <Col sm="12" xl="6">
                        <label className="txt-darkblue">{t("tax")}</label>
                        <Form.Group>
                            <Form.Control
                              placeholder={t("tax")}
                              type="number"
                              name="impuesto"
                              required
                              readOnly
                              onChange={(e)=> this._calculaInput(e)}
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
                              onChange={(e)=> this._calculaInput(e)}
                              required
                              min={0}
                              step="0.01"
                              readOnly
                              value={AuxLine.total}
                            />
                          </Form.Group>
                        </Col>

                      </Row>

                      <Row className="m-2">
                        <Col sm="12" xl="12">
                          <Button
                            variant="primary"
                            className=""
                            type="submit"
                          >
                            {t("add_line")}
                          </Button>
                        </Col>
                      </Row>
                      </div>}

                      {/* ── TABLA DE LÍNEAS ── */}
                      <Row className="m-3">
                        <Col sm="12" xl="12">
                          <Table striped bordered hover>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>{t("code")}</th>
                                <th>{t("detail")}</th>
                                <th>{t("subtotal")}</th>
                                <th>{t("discount")}</th>
                                <th>{t("tax")}</th>
                                <th>{t("total")}</th>
                                <th>{t("action")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lines.length > 0 &&
                                lines.map((line, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{line.codigo_comercial_id}</td>
                                    <td>{line.detalle}</td>
                                    <td>{line.subtotal}</td>
                                    <td>{line.descuento}</td>
                                    <td>{line.impuesto}</td>
                                    <td>{line.total}</td>
                                    <td>
                                      <Button
                                        variant="danger"
                                        className=""
                                        onClick={() => this.removeLine(index)}
                                      >
                                        <i className="fas fa-trash" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                            {/* Totales al pie */}
                            {lines.length > 0 && (
                              <tfoot>
                                <tr className="table-info fw-bold">
                                  <td colSpan={3}>{t("totals")}</td>
                                  <td>{spent.subtotal.toFixed(2)}</td>
                                  <td>{spent.descuento.toFixed(2)}</td>
                                  <td>{spent.impuesto.toFixed(2)}</td>
                                  <td>{spent.total.toFixed(2)}</td>
                                  <td />
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
              <Button
                variant="light"
                className="btn-rounded"
                onClick={this.toggleShow}
              >
                {t("close")}
              </Button>
              {processing ? (
                <div className="lds-dual-ring-2" />
              ) : (
              !isView &&  <Button
                  variant="primary"
                  className=""
                  onClick={this.saveSpent}
                >
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

export default withTranslation()(Spent);