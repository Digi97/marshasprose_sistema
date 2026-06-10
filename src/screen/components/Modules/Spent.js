import React, { Component, createRef } from "react";

import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  
  Form,
  
  Alert,
} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { url } from "screen/components/services/api";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";
import Select from "react-select";
import { withTranslation } from "react-i18next";

DataTable.use(DT);

class Spent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: [],
      show: false,
      processing: true,
      error: false,
      errorMsg: "",
      color: "",

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
        tipo_moneda_id:0
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
      token: "",
    };

    this.modalTopRef = createRef();
    this.user = null;
  }


  componentDidMount() {
    this.getUserInfo();
  
  }

  scrollToTop = () => {
    if (this.modalTopRef.current) {
      this.modalTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

    });
  };

  toggleShow = () =>
    this.setState({
      show: !this.state.show,
      error: false,
      errorMsg: "",
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
        tipo_moneda_id:0
      },
    });

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
          this.setState({ error: true, errorMsg: t(response.message), color: "alert alert-warning", });
        }

      
      }
    );
  }

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

  getSpentById = (id) => {
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
              error: false,
            });

        } else {
          this.setState({ error: true, errorMsg: t(response.message), color: "alert alert-warning", });
        }
      }
    );
  };

  saveSpent = () => {
    const { t } = this.props;
    const { spent, lines } = this.state;



    // Validaciones básicas
    if (!spent.doc_Referencia) {
      this.scrollToTop();
      this.setState({
        error: true,
        errorMsg: t("reference_required"),
        color: "alert alert-warning",
      });
      return;
    }

    if (spent.categoria_gasto_id === 0) {
      this.scrollToTop();
      this.setState({
        error: true,
        errorMsg: t("category_required"),
        color: "alert alert-warning",
      });
      return;
    }

    if (spent.proveedor_id === 0) {
      this.scrollToTop();
      this.setState({
        error: true,
        errorMsg: t("provider_required"),
        color: "alert alert-warning",
      });
      return;
    }

    if (lines.length === 0) {
      this.scrollToTop();
      this.setState({
        error: true,
        errorMsg: t("lines_required"),
        color: "alert alert-warning",
      });
      return;
    }

    this.setState({ processing: true });

    spent.Gastos_Detalles = this.state.lines; //asignamos las lineas para crear 

    spent.tipo_documento_id = spent.createElectronicDoc ===1 ? 6 : 12; //factura electronica de compra o GASTO sin documento

    if (spent.id === 0) {
      //  CREAR
      AppUtil.postAPI("gastos", spent).then((response) => {
        if (response.codeStatus === 200) {
      
          // Guardar los detalles con el id del gasto recién creado
       this.scrollToTop();
          this.setState({
            error: true,
            errorMsg: t("record_created_successfully"),
            color: "alert alert-success",
            processing: false,
          });

          //this._saveDetails(detallesConId, true);
        } else {
          this.scrollToTop();
          this.setState({
            error: true,
            errorMsg: t(response.message),
            color: "alert alert-warning",
            processing: false,
          });
        }
      });
    } else {
      // ACTUALIZAR 
      AppUtil.putAPI(`gastos/${spent.id}`, spent).then((response) => {
        if (response.codeStatus === 200) 
          {
          
             this.scrollToTop();
          this.setState({
            error: true,
            errorMsg: t("record_created_successfully"),
            color: "alert alert-success",
            processing: false,
          });

          //this._saveDetails(detallesConId, false);
        } else {
          this.scrollToTop();
          this.setState({
            error: true,
            errorMsg: t(response.message),
            color: "alert alert-warning",
            processing: false,
          });
        }
      });
    }
  };

  
  ActionButtons = (rowData) => {
    return (
      <Row className="m-2">
        <Col lg="12" sm="12">
          <Button
            variant="info"
            className="btn-fill btn-rounded"
            onClick={() => this.getSpentById(rowData.id)}
          >
            <i className="fas fa-pen" />
          </Button>
        </Col>
      </Row>
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
      error,
      errorMsg,
      color,
      processing,
      token,
      taxes,
      AuxLine
    } = this.state;

    return (
      <>
        <Container fluid>

          <Row>
            <Col lg="6" sm="12">
              <h1>{t("spent")}</h1>
            </Col>
            <Col lg="6" sm="12">
              <Row>
                <Col lg="3" sm="12">
                  <Button
                    className="btn-fill btn-rounded bg-blue"
                    onClick={this.toggleShow}
                  >
                    {t("create")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
            {token === "" ? (
              <div />
            ) : (
              <DataTable
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
                  { data: "fecha",      title: t("date") },
                  { data: "usuario",      title: t("created_by") },
                  { data: "subtotal", title: t("subtotal"), render:function(data, type,row){ return `${data} ${row.tipo_moneda}` } },
                  { data: "impuesto", title: t("tax"), render:function(data, type,row){ return `${data} ${row.tipo_moneda}` }},
                  { data: "total", title: t("total"), render:function(data, type,row){ return `${data} ${row.tipo_moneda}`} },
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
            className="max-z-index"
            scrollable
          >
            <Modal.Header closeButton>
              <h3 className="tituloFerias">
                {spent.id === 0 ? t("create_spent") : t("edit_spent")}
              </h3>
            </Modal.Header>

            <Modal.Body>
              {/* Ref al tope para scroll en error */}
              <div ref={this.modalTopRef} />
              {error && (
                <Alert
                  className={color}
                  onClose={() => this.setState({ error: false })}
                  dismissible
                >
                  {errorMsg}
                </Alert>
              )}

                  <Row className="m-2">
                    <Col sm="12" xl="6">
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
                        />
                      </Form.Group>
                    </Col>
                
                    <Col sm="12" xl="6">
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
                        />
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



                  </Row>

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
                                                      />
                                              </Form.Group>
              
                    </Col>
                    </Col>
                             
                  </Row>

                  {/* ── SECCIÓN DE DETALLES ── */}
                  <div className="well mt-3">
                    <Form onSubmit={this.addLine}>
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
                                 <Form.Select aria-label="Impuesto" name="impuesto_id" onChange={(e) => this._calculaInput(e,true) } required>
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
                            className="btn-fill btn-rounded"
                            type="submit"
                          >
                            {t("add_line")}
                          </Button>
                        </Col>
                      </Row>

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
                                        className="btn-fill btn-rounded"
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
                <Button
                  variant="primary"
                  className="btn-fill btn-rounded"
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