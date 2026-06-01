import React, { Component, createRef } from "react";

import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Tabs,
  Form,
  Tab,
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
        Doc_Referencia: "",
        categoria_gasto_id: 0,
        Tipo_documento_id: 0,
        Medio_pago_id: 0,
        Proveedor_id: 0,
        Descripcion: "",
        Subtotal: 0,
        Impuesto: 0,
        Total: 0,
        Usuarios_Usuario_id: 0,
      },

      // Líneas de detalle
      lines: [],

      // Catálogos
      categories: [],
      docTypes: [],
      paymentMethods: [],
      providers: [],
      commercialCodes: [],

      token: "",
    };

    this.modalTopRef = createRef();
    this.user = null;
  }


  componentDidMount() {
    this.getUserInfo();
    this.getCategories();
    this.getDocTypes();
    this.getPaymentMethods();
    this.getProviders();
    this.getCommercialCodes();
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
      token: sessionStorage.getItem("token"),
      spent: {
        ...this.state.spent,
        Usuarios_Usuario_id: this.user.usuario_id,
      },
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
        usuarios_Usuario_id: this.user ? this.user.usuario_id : 0,
      },
    });

  // Actualiza campos del objeto principal spent
  _saveStateVariable = async (e) => {
    const { name, value } = e.target;
    await this.setState({
      spent: {
        ...this.state.spent,
        [name]: value,
      },
    });
  };

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
      // Para mostrar en tabla
      _codigo_label: formData.get("codigo_comercial_label") || formData.get("codigo_comercial"),
    };

    // Recalcular totales del encabezado
    this.setState(
      (prevState) => ({
        lines: [...prevState.lines, newLine],
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
    const subtotal = lines.reduce((acc, l) => acc + l.Subtotal, 0);
    const impuesto = lines.reduce((acc, l) => acc + l.Impuesto, 0);
    const total = lines.reduce((acc, l) => acc + l.Total, 0);

    this.setState((prevState) => ({
      spent: {
        ...prevState.spent,
        Subtotal: subtotal,
        Impuesto: impuesto,
        Total: total,
      },
    }));
  };

  getCategories = () =>
    AppUtil.getAPI("catalogos/categoria_gasto", sessionStorage.getItem("token")).then(
      (response) => {
        const categories = response ? response.data : [];
        this.setState({ categories });
      }
    );

  getDocTypes = () =>
    AppUtil.getAPI("catalogos/tipo_documento", sessionStorage.getItem("token")).then(
      (response) => {
        const docTypes = response ? response.data : [];
        this.setState({ docTypes });
      }
    );

  getPaymentMethods = () =>
    AppUtil.getAPI("catalogos/medio_pago", sessionStorage.getItem("token")).then(
      (response) => {
        const paymentMethods = response ? response.data : [];
        this.setState({ paymentMethods });
      }
    );

  getProviders = () =>{
       const { t } = this.props;

    AppUtil.getAPI("proveedor", sessionStorage.getItem("token")).then(
      (response) => {

        if(response)
        {
          //doble data porque se obtiene como objeto listo de datatable
          const data = response ? response.data.data : [];
          const providers = data.map((p) => ({
            value: p.id,
            label: `${p.nombre} ${p.apellido1}`,
          }));
          this.setState({ providers, processing: false });
        } else{
          this.setState({ error: true, errorMsg: t(response.message), color: "alert alert-warning", });
        }

      
      }
    );
  }

  getCommercialCodes = () =>
    AppUtil.getAPI("catalogos/codigo_comercial", sessionStorage.getItem("token")).then(
      (response) => {
        console.log(response);
        
        const commercialCodes = response ? response.data : [];
        this.setState({ commercialCodes });
      }
    );

  // ─────────────────────────────────────────────
  // CONSULTAR POR ID (para edición)
  // ─────────────────────────────────────────────

  getSpentById = (id) => {
    const { t } = this.props;

    AppUtil.getAPI(`gastos/${id}`, sessionStorage.getItem("token")).then(
      (response) => {
        if (response.codeStatus === 200) {
          const spentData = response.data;

          // Cargar detalles del gasto
          AppUtil.getAPI(
            `gastos_detalles/gasto/${id}`,
            sessionStorage.getItem("token")
          ).then((detailResponse) => {
            const lines =
              detailResponse && detailResponse.codeStatus === 200
                ? detailResponse.data
                : [];

            this.setState({
              spent: {
                id: spentData.id,
                Doc_Referencia: spentData.Doc_Referencia,
                Descripcion: spentData.Descripcion,
                Categoria_gasto_id: spentData.Categoria_gasto_id,
                Tipo_documento_id: spentData.Tipo_documento_id,
                Medio_pago_id: spentData.Medio_pago_id,
                Proveedor_id: spentData.Proveedor_id,
                Subtotal: spentData.Subtotal,
                Impuesto: spentData.Impuesto,
                Total: spentData.Total,
                Usuarios_Usuario_id: spentData.Usuarios_Usuario_id,
              },
              lines,
              show: true,
              error: false,
            });
          });
        } else {
          this.setState({ error: true, errorMsg: t(response.message), color: "alert alert-warning", });
        }
      }
    );
  };

  // ─────────────────────────────────────────────
  // GUARDAR (crear o actualizar)
  // ─────────────────────────────────────────────

  saveSpent = () => {
    const { t } = this.props;
    const { spent, lines } = this.state;

    // Validaciones básicas
    if (!spent.Doc_Referencia) {
      this.scrollToTop();
      this.setState({
        error: true,
        errorMsg: t("reference_required"),
        color: "alert alert-warning",
      });
      return;
    }

    if (spent.Categoria_gasto_id === 0) {
      this.scrollToTop();
      this.setState({
        error: true,
        errorMsg: t("category_required"),
        color: "alert alert-warning",
      });
      return;
    }

    if (spent.Proveedor_id === 0) {
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

    spent.lines = this.state.lines; //asignamos las lineas para crear 
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

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  render() {
    const { t } = this.props;
    const {
      spent,
      lines,
      categories,
      docTypes,
      paymentMethods,
      providers,
      commercialCodes,
      error,
      errorMsg,
      color,
      processing,
      token,
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

          {/* ── DATATABLE ── */}
          <Row>
            {token === "" ? (
              <div />
            ) : (
              <DataTable
                ajax={{
                  url: `${url}gastos`,
                  type: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=UTF-8",
                  },
                  dataSrc: function (json) {
                    return json.data || [];
                  },
                  dataType: "json",
                }}
                columns={[
                  { data: "id",            title: t("id") },
                  { data: "Doc_Referencia", title: t("reference") },
                  { data: "Proveedor",      title: t("provider") },
                  { data: "Subtotal",       title: t("subtotal") },
                  { data: "Impuesto",       title: t("tax") },
                  { data: "Total",          title: t("total") },
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
                  6: (cellData, rowData) => this.ActionButtons(rowData),
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

          {/* ── MODAL ── */}
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

              {/* Alerta */}
              {error && (
                <Alert
                  className={color}
                  onClose={() => this.setState({ error: false })}
                  dismissible
                >
                  {errorMsg}
                </Alert>
              )}

                  {/* Referencia */}
                  <Row className="m-2">
                    <Col sm="12" xl="6">
                      <label>{t("reference")}</label>
                      <Form.Group>
                        <Form.Control
                          placeholder={t("reference")}
                          type="text"
                          onChange={this._saveStateVariable}
                          name="Doc_Referencia"
                          required
                          maxLength={150}
                          value={spent.Doc_Referencia}
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
                          name="Descripcion"
                          required
                          maxLength={800}
                          value={spent.Descripcion}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Categoría / Tipo documento */}
                  <Row className="m-2">
                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("category")}</label>
                      <Form.Group>
                        <Form.Select
                          name="Categoria_gasto_id"
                          onChange={this._saveStateVariable}
                          value={spent.Categoria_gasto_id}
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

                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("doc_type")}</label>
                      <Form.Group>
                        <Form.Select
                          name="Tipo_documento_id"
                          onChange={this._saveStateVariable}
                          value={spent.tipo_documento_id}
                          required
                        >
                          <option value="">{t("select_option")}</option>
                          {docTypes.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Medio pago */}
                  <Row className="m-2">
                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">
                        {t("payment_method")}
                      </label>
                      <Form.Group>
                        <Form.Select
                          name="Medio_pago_id"
                          onChange={this._saveStateVariable}
                          value={spent.Medio_pago_id}
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
                  </Row>

                  {/* Proveedor */}
                  <Row className="m-2">
                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">{t("provider")}</label>
                      <Select
                        options={providers}
                        name="proveedor_id"
                        onChange={this._saveProvider}
                        value={
                          providers.find(
                            (p) => p.value === spent.Proveedor_id
                          ) || null
                        }
                        placeholder={`-- ${t("select_option")} --`}
                      />
                    </Col>
                    
                  </Row>

                  {/* ── SECCIÓN DE DETALLES ── */}
                  <div className="well mt-3">
                    <Form onSubmit={this.addLine}>
                      <Row className="m-2">
                        <Col sm="12" xl="6">
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

                        <Col sm="12" xl="6">
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
                            />
                          </Form.Group>
                        </Col>

                        <Col sm="12" xl="4">
                          <label className="txt-darkblue">{t("tax")}</label>
                          <Form.Group>
                            <Form.Control
                              placeholder={t("tax")}
                              type="number"
                              name="impuesto"
                              required
                              min={0}
                              step="0.01"
                            />
                          </Form.Group>
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
                              required
                              min={0}
                              step="0.01"
                              defaultValue={0}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row className="m-2">
                        <Col sm="12" xl="6">
                          <label className="txt-darkblue">{t("total")}</label>
                          <Form.Group>
                            <Form.Control
                              placeholder={t("total")}
                              type="number"
                              name="total"
                              required
                              min={0}
                              step="0.01"
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
                                    <td>{line.Codigo_comercial_id}</td>
                                    <td>{line.Detalle}</td>
                                    <td>{line.Subtotal}</td>
                                    <td>{line.Descuento}</td>
                                    <td>{line.Impuesto}</td>
                                    <td>{line.Total}</td>
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
                                  <td>{spent.Subtotal.toFixed(2)}</td>
                                  <td>-</td>
                                  <td>{spent.Impuesto.toFixed(2)}</td>
                                  <td>{spent.Total.toFixed(2)}</td>
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