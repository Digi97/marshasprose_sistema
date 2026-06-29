import React, { Component, createRef } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import {
  Container, Row, Col, Button, Modal, Form,
  Card, Table, Badge, Nav,
} from "react-bootstrap";
import { withTranslation } from "react-i18next";
import crypto from "crypto-js";
import moment from "moment-timezone";
import AppUtil from "../../../AppUtil/AppUtil";
import alertSuccess from "../common/SweetAlert";
import Swal from "sweetalert2";
import ActionButtons from "../common/ActionButtons";

DataTable.use(DT);

// 1 = CXC (Cuenta por Cobrar), 2 = CXP (Cuenta por Pagar)
const TIPO_CUENTA_CXC = 1;
const TIPO_CUENTA_CXP = 2;

// Tipo_movimiento del detalle
const TIPO_MOV_LABELS = {
  1: "Abono",
  2: "Pago Total",
  3: "Ajuste",
  4: "Nota Crédito",
};

const ESTADO_LABELS = { 1: "Activo", 2: "Pagada", 0: "Inactivo" };
const ESTADO_VARIANT = { 1: "primary", 2: "success", 0: "secondary" };

class Accounts extends Component {
  constructor(props) {
    super(props);
    this.user = null;
    this.datatableRef = createRef();

    this.state = {
      // list
      cuentas: [],
      filtroTipo: "",

      // catalogs (lazy-loaded)
      currencies: [],
      payment_methods: [],
      clientes: [],
      proveedores: [],
      cost_center: [],

      // create/edit encabezado modal
      show: false,
      isView: false,
      processing: false,
      encabezado: this._emptyEncabezado(),

      // detail modal
      showDetail: false,
      cuentaDetalle: null,
      activeTab: "info",

      // pago (cuenta_detalle) modal
      showPagoModal: false,
      pago: this._emptyPago(),

      user: {},
    };
  }

  _emptyEncabezado() {
    return {
      id: 0,
      Referencia: "",
      Vigencia_inicial: moment().format("YYYY-MM-DD"),
      Vigencia_final: moment().add(30, "days").format("YYYY-MM-DD"),
      Total: "",
      Monto_Proyeccion: "",
      impuesto: 0,
      subtotal: "",
      Descuento: 0,
      Tipo_moneda_id: "",
      Medio_pago_id: "",
      Tipo_cuentas_id: "",
      Cuentas_Contables_id: "",
      Centro_Costos_id: "",
      Clientes_id: "",
      Proveedor_id: "",
      Gastos_id: null,
      Ingresos_id: null,
      Facturas_id: null,
      Estado: 1,
      Usuarios_Usuario_id: 0,
    };
  }

  _emptyPago() {
    return {
      Cuenta_Encabezado_id: 0,
      Tipo_movimiento: 1,
      monto: "",
      Medio_pago_id: "",
      referencia_pago: "",
      Observaciones: "",
    };
  }

  // ─── lifecycle ───────────────────────────────────────────────────────────────

  componentDidMount() {
    this.getUserInfo();
    this.getCuentas();
  }

  getUserInfo = () => {
    let bytes = crypto.AES.decrypt(
      sessionStorage.getItem("user"),
      "@marsh_contable"
    );
    this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
    this.setState({ user: this.user });
  };

  // ─── catalogs (lazy) ─────────────────────────────────────────────────────────

  _loadCatalogs = () => {
    AppUtil.getAPI("catalogos/tipo_moneda").then((r) =>
      this.setState({ currencies: r ? r.data : [] })
    );
    AppUtil.getAPI("catalogos/medio_pago").then((r) =>
      this.setState({ payment_methods: r ? r.data : [] })
    );
    AppUtil.getAPI("catalogos/centro_costos").then((r) =>
      this.setState({ cost_center: r ? r.data : [] })
    );
    AppUtil.getAPI("clientes").then((r) =>
      this.setState({ clientes: r ? r.data : [] })
    );
    AppUtil.getAPI("proveedor").then((r) =>
      this.setState({ proveedores: r ? r.data : [] })
    );
  };

  _loadPaymentCatalogs = () => {
    if (!this.state.payment_methods.length)
      AppUtil.getAPI("catalogos/medio_pago").then((r) =>
        this.setState({ payment_methods: r ? r.data : [] })
      );
  };

  // ─── API — Cuenta_Encabezado ─────────────────────────────────────────────────

  getCuentas = (tipoCuentaId = "") => {
    const qs = tipoCuentaId ? `?tipoCuentaId=${tipoCuentaId}` : "";
    AppUtil.getAPI(`cuenta_encabezado${qs}`).then((response) => {
      console.log(response);
      this.setState({ cuentas: response ? response.data : [] });
    });
  };

  getCuentaById = (id, isView = false) =>
    AppUtil.getAPI(`cuenta_encabezado/${id}`).then((response) => {
      if (!response || !response.data) return;
      const ce = response.data;
      this.setState(
        {
          encabezado: {
            id: ce.id,
            Referencia: ce.Referencia,
            Vigencia_inicial: moment(ce.Vigencia_inicial).format("YYYY-MM-DD"),
            Vigencia_final: moment(ce.Vigencia_final).format("YYYY-MM-DD"),
            Total: ce.Total,
            Monto_Proyeccion: ce.Monto_Proyeccion,
            impuesto: ce.impuesto,
            subtotal: ce.subtotal,
            Descuento: ce.Descuento,
            Tipo_moneda_id: ce.Tipo_moneda_id,
            Medio_pago_id: ce.Medio_pago_id,
            Tipo_cuentas_id: ce.Tipo_cuentas_id,
            Cuentas_Contables_id: ce.Cuentas_Contables_id || "",
            Centro_Costos_id: ce.Centro_Costos_id || "",
            Clientes_id: ce.Clientes_id || "",
            Proveedor_id: ce.Proveedor_id || "",
            Gastos_id: ce.Gastos_id,
            Ingresos_id: ce.Ingresos_id,
            Facturas_id: ce.Facturas_id,
            Estado: ce.Estado,
            Usuarios_Usuario_id: ce.Usuarios_Usuario_id,
          },
          show: true,
          isView,
        },
        this._loadCatalogs
      );
    });

  openDetalle = (id) =>
    AppUtil.getAPI(`cuenta_encabezado/${id}`).then((response) => {
      if (!response || !response.data) return;
      this.setState({
        cuentaDetalle: response.data,
        showDetail: true,
        activeTab: "info",
      });
    });

  saveCuentaEncabezado = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { t } = this.props;
    const { encabezado } = this.state;

    if (!AppUtil.isValidText(encabezado.Referencia)) {
      alertSuccess(t("invalid_string_form_Referencia"), "warning", t);
      return;
    }
    if (!encabezado.Tipo_moneda_id) {
      alertSuccess(t("invalid_value_form_Tipo_moneda_id"), "warning", t);
      return;
    }
    if (!encabezado.Medio_pago_id) {
      alertSuccess(t("invalid_value_form_Medio_pago_id"), "warning", t);
      return;
    }
    if (!encabezado.Tipo_cuentas_id) {
      alertSuccess(t("invalid_value_form_Tipo_cuentas_id"), "warning", t);
      return;
    }
    if (!encabezado.Centro_Costos_id) {
      alertSuccess(t("invalid_value_form_Centro_Costos_id"), "warning", t);
      return;
    }
    if (
      parseInt(encabezado.Tipo_cuentas_id) === TIPO_CUENTA_CXC &&
      !encabezado.Clientes_id
    ) {
      alertSuccess(t("clientes_id_required_for_cxc"), "warning", t);
      return;
    }
    if (
      parseInt(encabezado.Tipo_cuentas_id) === TIPO_CUENTA_CXP &&
      !encabezado.Proveedor_id
    ) {
      alertSuccess(t("proveedor_id_required_for_cxp"), "warning", t);
      return;
    }

    const payload = {
      ...encabezado,
      Usuarios_Usuario_id: this.state.user.usuario_id,
      Clientes_id:
        parseInt(encabezado.Tipo_cuentas_id) === TIPO_CUENTA_CXC
          ? parseInt(encabezado.Clientes_id)
          : null,
      Proveedor_id:
        parseInt(encabezado.Tipo_cuentas_id) === TIPO_CUENTA_CXP
          ? parseInt(encabezado.Proveedor_id)
          : null,
    };

    if (encabezado.id === 0) {
      AppUtil.postAPI("cuenta_encabezado", payload).then((response) => {
        if (response?.codeStatus === 200) {
          alertSuccess(t("record_created_successfully"), "success", t);
          this.toggleShow();
          this.getCuentas(this.state.filtroTipo);
        } else {
          alertSuccess(t(response?.message || "please_verify_data"), "error", t);
        }
      });
    } else {
      AppUtil.putAPI(`cuenta_encabezado/${encabezado.id}`, payload).then(
        (response) => {
          if (response?.codeStatus === 200) {
            alertSuccess(t("updated_successfully"), "success", t);
            this.toggleShow();
            this.getCuentas(this.state.filtroTipo);
          } else {
            alertSuccess(
              t(response?.message || "please_verify_data"),
              "error",
              t
            );
          }
        }
      );
    }
  };

  deleteCuentaEncabezado = async (id) => {
    const { t } = this.props;
    const result = await Swal.fire({
      icon: "warning",
      title: t("are_you_sure"),
      text: t("this_action_will_delete_the_record"),
      showCancelButton: true,
      confirmButtonColor: "#000f47",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yes_delete"),
      cancelButtonText: t("cancel"),
    });
    if (!result.isConfirmed) return;
    AppUtil.deleteAPI(`cuenta_encabezado/${id}`).then((response) => {
      if (response?.codeStatus === 200) {
        alertSuccess(t("deleted_successfully"), "success", t);
        this.getCuentas(this.state.filtroTipo);
      } else {
        alertSuccess(t(response?.message || "please_verify_data"), "error", t);
      }
    });
  };

  // ─── API — Cuenta_Detalle (pagos) ────────────────────────────────────────────

  openPagoModal = (encabezadoId) => {
    this._loadPaymentCatalogs();
    this.setState({
      showPagoModal: true,
      pago: { ...this._emptyPago(), Cuenta_Encabezado_id: encabezadoId },
    });
  };

  savePago = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { t } = this.props;
    const { pago, cuentaDetalle } = this.state;

    if (!pago.monto || parseFloat(pago.monto) <= 0) {
      alertSuccess(t("monto_must_be_greater_than_zero"), "warning", t);
      return;
    }
    if (!pago.Medio_pago_id) {
      alertSuccess(t("invalid_value_form_Medio_pago_id"), "warning", t);
      return;
    }

    const payload = {
      ...pago,
      monto: parseFloat(pago.monto),
      Usuarios_Usuario_id: this.state.user.usuario_id,
    };

    AppUtil.postAPI("cuenta_detalle", payload).then((response) => {
      if (response?.codeStatus === 200) {
        alertSuccess(t("record_created_successfully"), "success", t);
        this.setState({ showPagoModal: false, pago: this._emptyPago() });
        // refresh detail
        if (cuentaDetalle) this.openDetalle(cuentaDetalle.id);
        this.getCuentas(this.state.filtroTipo);
      } else {
        alertSuccess(t(response?.message || "please_verify_data"), "error", t);
      }
    });
  };

  deletePago = async (id) => {
    const { t } = this.props;
    const result = await Swal.fire({
      customClass: { container: "swal-above-modal" },
      didOpen: () => {
        const el = document.querySelector(".swal-above-modal");
        if (el) el.style.zIndex = "9999";
      },
      icon: "warning",
      title: t("are_you_sure"),
      text: t("this_action_will_delete_the_record"),
      showCancelButton: true,
      confirmButtonColor: "#000f47",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yes_delete"),
      cancelButtonText: t("cancel"),
    });
    if (!result.isConfirmed) return;
    AppUtil.deleteAPI(`cuenta_detalle/${id}`).then((response) => {
      if (response?.codeStatus === 200) {
        alertSuccess(t("deleted_successfully"), "success", t);
        if (this.state.cuentaDetalle)
          this.openDetalle(this.state.cuentaDetalle.id);
      } else {
        alertSuccess(t(response?.message || "please_verify_data"), "error", t);
      }
    });
  };

  // ─── form helpers ────────────────────────────────────────────────────────────

  toggleShow = () =>
    this.setState(
      { show: !this.state.show, encabezado: this._emptyEncabezado(), isView: false },
      () => {
        if (this.state.show) this._loadCatalogs();
      }
    );

  _saveEncabezado = (e) => {
    const { name, type, checked, value } = e.target;
    this.setState((prev) => ({
      encabezado: {
        ...prev.encabezado,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      },
    }));
  };

  _savePago = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      pago: { ...prev.pago, [name]: value },
    }));
  };

  _setFiltro = (tipo) => {
    this.setState({ filtroTipo: tipo });
    this.getCuentas(tipo);
  };

  // ─── render helpers ──────────────────────────────────────────────────────────

  ActionButtons = (rowData) => (
    <ActionButtons
      viewAction={() => this.openDetalle(rowData.id)}
      editAction={() => this.getCuentaById(rowData.id)}
      deleteAction={() => this.deleteCuentaEncabezado(rowData.id)}
    />
  );

  _badgeEstado = (estado) => (
    <Badge bg={ESTADO_VARIANT[estado] || "secondary"}>
      {ESTADO_LABELS[estado] || estado}
    </Badge>
  );

  _detallesTable = (detalles, t, encabezadoId) => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <p className="fw-bold mb-0">{t("payments")}</p>
        <Button
          size="sm"
          variant="success"
          onClick={() => this.openPagoModal(encabezadoId)}
        >
          <i className="fas fa-plus me-1" />
          {t("add_payment")}
        </Button>
      </div>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>{t("date")}</th>
            <th>{t("movement_type")}</th>
            <th>{t("amount")}</th>
            <th>{t("previous_balance")}</th>
            <th>{t("posterior_balance")}</th>
            <th>{t("payment_method")}</th>
            <th>{t("reference")}</th>
            <th>{t("observations")}</th>
            <th>{t("action")}</th>
          </tr>
        </thead>
        <tbody>
          {(!detalles || detalles.length === 0) && (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                {t("emptyTable")}
              </td>
            </tr>
          )}
          {(detalles || []).map((d) => (
            <tr key={d.id}>
              <td>{moment(d.fecha_movimiento).format("DD/MM/YYYY")}</td>
              <td>
                <Badge bg="info">{TIPO_MOV_LABELS[d.Tipo_movimiento] || d.Tipo_movimiento_texto}</Badge>
              </td>
              <td className="text-end">{AppUtil.formatNumber(d.monto)}</td>
              <td className="text-end">{AppUtil.formatNumber(d.saldo_anterior)}</td>
              <td className="text-end">{AppUtil.formatNumber(d.saldo_posterior)}</td>
              <td>{d.Medio_pago}</td>
              <td>{d.referencia_pago}</td>
              <td>{d.Observaciones}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => this.deletePago(d.id)}
                >
                  <i className="fas fa-trash" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );

  // ─── render ──────────────────────────────────────────────────────────────────

  render() {
    const { t } = this.props;
    const {
      cuentas, filtroTipo,
      currencies, payment_methods, clientes, proveedores, cost_center,
      show, isView, encabezado,
      showDetail, cuentaDetalle, activeTab,
      showPagoModal, pago,
    } = this.state;

    const esCXC = parseInt(encabezado.Tipo_cuentas_id) === TIPO_CUENTA_CXC;
    const esCXP = parseInt(encabezado.Tipo_cuentas_id) === TIPO_CUENTA_CXP;

    const totalPendiente = cuentas
      .filter((c) => c.Estado === 1)
      .reduce((s, c) => s + (c.Total || 0), 0);

    return (
      <>
        <Container fluid>
          {/* ── Header ── */}
          <Row className="mb-3">
            <Col lg="6" sm="12">
              <h1>{t("accounts")}</h1>
            </Col>
            <Col lg="6" sm="12" className="text-end">
              <Button onClick={this.toggleShow}>{t("create")}</Button>
            </Col>
          </Row>

          {/* ── Summary cards ── */}
          <Row className="m-2 mb-3">
            <Col lg="4" sm="6" className="mb-3">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs="8">
                      <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                        {t("total_accounts")}
                      </p>
                      <h5 className="mb-0 fw-bold">{cuentas.length}</h5>
                    </Col>
                    <Col xs="4" className="text-end">
                      <div style={{
                        backgroundColor: "#4e73df20", borderRadius: "50%",
                        width: "50px", height: "50px", display: "flex",
                        alignItems: "center", justifyContent: "center", marginLeft: "auto",
                      }}>
                        <i className="fas fa-file-invoice-dollar" style={{ color: "#4e73df", fontSize: "20px" }} />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col lg="4" sm="6" className="mb-3">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs="8">
                      <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                        {t("active_accounts")}
                      </p>
                      <h5 className="mb-0 fw-bold">
                        {cuentas.filter((c) => c.Estado === 1).length}
                      </h5>
                    </Col>
                    <Col xs="4" className="text-end">
                      <div style={{
                        backgroundColor: "#1cc88a20", borderRadius: "50%",
                        width: "50px", height: "50px", display: "flex",
                        alignItems: "center", justifyContent: "center", marginLeft: "auto",
                      }}>
                        <i className="fas fa-hourglass-half" style={{ color: "#1cc88a", fontSize: "20px" }} />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col lg="4" sm="6" className="mb-3">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs="8">
                      <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                        {t("paid_accounts")}
                      </p>
                      <h5 className="mb-0 fw-bold">
                        {cuentas.filter((c) => c.Estado === 2).length}
                      </h5>
                    </Col>
                    <Col xs="4" className="text-end">
                      <div style={{
                        backgroundColor: "#f6c23e20", borderRadius: "50%",
                        width: "50px", height: "50px", display: "flex",
                        alignItems: "center", justifyContent: "center", marginLeft: "auto",
                      }}>
                        <i className="fas fa-check-double" style={{ color: "#f6c23e", fontSize: "20px" }} />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ── Filter tabs ── */}
          <Row className="m-2 mb-2">
            <Col>
              <Button
                variant={filtroTipo === "" ? "dark" : "outline-dark"}
                size="sm"
                className="me-2"
                onClick={() => this._setFiltro("")}
              >
                {t("all")}
              </Button>
              <Button
                variant={filtroTipo === String(TIPO_CUENTA_CXC) ? "primary" : "outline-primary"}
                size="sm"
                className="me-2"
                onClick={() => this._setFiltro(String(TIPO_CUENTA_CXC))}
              >
                {t("accounts_receivable")}
              </Button>
              <Button
                variant={filtroTipo === String(TIPO_CUENTA_CXP) ? "danger" : "outline-danger"}
                size="sm"
                onClick={() => this._setFiltro(String(TIPO_CUENTA_CXP))}
              >
                {t("accounts_payable")}
              </Button>
            </Col>
          </Row>

          {/* ── DataTable ── */}
          <Row>
            <DataTable
              ref={this.datatableRef}
              data={cuentas}
              columns={[
                { data: "Referencia", title: t("reference") },
                {
                  data: "Cliente", title: t("entity"),
                  render: (data, type, row) => row.Cliente || row.Proveedor || "—",
                },
                { data: "Tipo_cuenta", title: t("account_type") },
                {
                  data: "Total", title: t("total"),
                  render: (data, type, row) =>
                    `${row.Simbolo || ""} ${AppUtil.formatNumber(data)}`,
                },
                {
                  data: "Vigencia_final", title: t("due_date"),
                  render: (data) => moment(data).format("DD/MM/YYYY"),
                },
                {
                  data: "Estado", title: t("status"),
                  render: (data) => {
                    const v = ESTADO_VARIANT[data] || "secondary";
                    const l = ESTADO_LABELS[data] || data;
                    return `<span class="badge bg-${v}">${l}</span>`;
                  },
                },
                {
                  title: t("action"), data: null,
                  orderable: false, searchable: false,
                },
              ]}
              className="display table cell-border compact stripe"
              slots={{ 6: (cellData, rowData) => this.ActionButtons(rowData) }}
              options={{
                language: {
                  zeroRecords: t("zeroRecords"),
                  emptyTable: t("emptyTable"),
                  search: t("search"),
                  paginate: t("paginate"),
                  info: t("info"),
                  lengthMenu: t("lengthMenu"),
                  searchPlaceholder: t("searchPlaceholder"),
                },
                layout: {
                  topStart: "pageLength",
                  topEnd: "search",
                  bottomStart: "info",
                  bottomEnd: "paging",
                },
              }}
            />
          </Row>
        </Container>

        {/* ════════════════════════════════════════════
            Modal Create / Edit — Cuenta_Encabezado
        ════════════════════════════════════════════ */}
        <Modal
          show={show}
          onHide={this.toggleShow}
          backdrop="static"
          keyboard={false}
          size="xl"
        >
          <Form onSubmit={this.saveCuentaEncabezado}>
            <Modal.Header closeButton>
              <h3 className="tituloFerias">
                {encabezado.id === 0 ? t("create_account") : t("edit_account")}
              </h3>
            </Modal.Header>
            <Modal.Body>
              <Row className="m-2">
                <Col sm="12" xl="6">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("reference")}</Form.Label>
                    <Form.Control
                      type="text"
                      name="Referencia"
                      placeholder={t("reference")}
                      value={encabezado.Referencia}
                      onChange={this._saveEncabezado}
                      maxLength={200}
                      required
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" xl="3">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("account_type")}</Form.Label>
                    <Form.Select
                      name="Tipo_cuentas_id"
                      value={encabezado.Tipo_cuentas_id}
                      onChange={this._saveEncabezado}
                      required
                      disabled={isView || encabezado.id > 0}
                    >
                      <option value="">{t("select_option")}</option>
                      <option value={TIPO_CUENTA_CXC}>{t("accounts_receivable")}</option>
                      <option value={TIPO_CUENTA_CXP}>{t("accounts_payable")}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm="12" xl="3">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("currency")}</Form.Label>
                    <Form.Select
                      name="Tipo_moneda_id"
                      value={encabezado.Tipo_moneda_id}
                      onChange={this._saveEncabezado}
                      required
                      disabled={isView}
                    >
                      <option value="">{t("select_option")}</option>
                      {currencies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.Nombre || c.nombre} ({c.Simbolo})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Cliente o Proveedor según tipo */}
              {esCXC && (
                <Row className="m-2">
                  <Col sm="12">
                    <Form.Group className="mb-3">
                      <Form.Label>{t("client")}</Form.Label>
                      <Form.Select
                        name="Clientes_id"
                        value={encabezado.Clientes_id}
                        onChange={this._saveEncabezado}
                        required
                        disabled={isView}
                      >
                        <option value="">{t("select_option")}</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.Nombre} {c.Apellido1}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}
              {esCXP && (
                <Row className="m-2">
                  <Col sm="12">
                    <Form.Group className="mb-3">
                      <Form.Label>{t("provider")}</Form.Label>
                      <Form.Select
                        name="Proveedor_id"
                        value={encabezado.Proveedor_id}
                        onChange={this._saveEncabezado}
                        required
                        disabled={isView}
                      >
                        <option value="">{t("select_option")}</option>
                        {proveedores.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.Nombre} {p.Apellido1}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <Row className="m-2">
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("begin_period")}</Form.Label>
                    <Form.Control
                      type="date"
                      name="Vigencia_inicial"
                      value={encabezado.Vigencia_inicial}
                      onChange={this._saveEncabezado}
                      required
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("due_date")}</Form.Label>
                    <Form.Control
                      type="date"
                      name="Vigencia_final"
                      value={encabezado.Vigencia_final}
                      onChange={this._saveEncabezado}
                      required
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("payment_method")}</Form.Label>
                    <Form.Select
                      name="Medio_pago_id"
                      value={encabezado.Medio_pago_id}
                      onChange={this._saveEncabezado}
                      required
                      disabled={isView}
                    >
                      <option value="">{t("select_option")}</option>
                      {payment_methods.map((mp) => (
                        <option key={mp.id} value={mp.id}>
                          {mp.descripcion}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("cost_center")}</Form.Label>
                    <Form.Select
                      name="Centro_Costos_id"
                      value={encabezado.Centro_Costos_id}
                      onChange={this._saveEncabezado}
                      required
                      disabled={isView}
                    >
                      <option value="">{t("select_option")}</option>
                      {cost_center.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.Nombre || cc.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("subtotal")}</Form.Label>
                    <Form.Control
                      type="number"
                      name="subtotal"
                      placeholder="0.00"
                      value={encabezado.subtotal}
                      onChange={this._saveEncabezado}
                      min={0}
                      step="0.01"
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("tax")}</Form.Label>
                    <Form.Control
                      type="number"
                      name="impuesto"
                      placeholder="0.00"
                      value={encabezado.impuesto}
                      onChange={this._saveEncabezado}
                      min={0}
                      step="0.01"
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("discount")}</Form.Label>
                    <Form.Control
                      type="number"
                      name="Descuento"
                      placeholder="0.00"
                      value={encabezado.Descuento}
                      onChange={this._saveEncabezado}
                      min={0}
                      step="0.01"
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("total")}</Form.Label>
                    <Form.Control
                      type="number"
                      name="Total"
                      placeholder="0.00"
                      value={encabezado.Total}
                      onChange={this._saveEncabezado}
                      min={0}
                      step="0.01"
                      required
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" xl="4">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("projected_amount")}</Form.Label>
                    <Form.Control
                      type="number"
                      name="Monto_Proyeccion"
                      placeholder="0.00"
                      value={encabezado.Monto_Proyeccion}
                      onChange={this._saveEncabezado}
                      min={0}
                      step="0.01"
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {encabezado.id > 0 && (
                <Row className="m-2">
                  <Col sm="12" xl="3">
                    <Form.Group className="mb-3">
                      <Form.Label>{t("status")}</Form.Label>
                      <Form.Select
                        name="Estado"
                        value={encabezado.Estado}
                        onChange={this._saveEncabezado}
                        disabled={isView}
                      >
                        <option value={1}>{t("active")}</option>
                        <option value={2}>{t("paid")}</option>
                        <option value={0}>{t("inactive")}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={this.toggleShow}>{t("close")}</Button>
              {!isView && (
                <Button variant="primary" type="submit">{t("save")}</Button>
              )}
            </Modal.Footer>
          </Form>
        </Modal>

        {/* ════════════════════════════════════════════
            Modal Detail — info + abonos/pagos
        ════════════════════════════════════════════ */}
        <Modal
          show={showDetail}
          onHide={() => this.setState({ showDetail: false })}
          backdrop="static"
          keyboard={false}
          size="xl"
          scrollable
        >
          <Modal.Header closeButton>
            <h3 className="tituloFerias">
              {cuentaDetalle?.Referencia} — {t("account_detail")}
            </h3>
          </Modal.Header>
          <Modal.Body>
            {cuentaDetalle && (
              <>
                <Nav
                  variant="tabs"
                  activeKey={activeTab}
                  onSelect={(k) => this.setState({ activeTab: k })}
                  className="mb-3"
                >
                  <Nav.Item>
                    <Nav.Link eventKey="info">{t("information")}</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="payments">{t("payments")}</Nav.Link>
                  </Nav.Item>
                </Nav>

                {/* ── Info tab ── */}
                {activeTab === "info" && (
                  <Row className="m-2">
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("reference")}</small>
                      <p className="fw-bold mb-1">{cuentaDetalle.Referencia}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("account_type")}</small>
                      <p className="fw-bold mb-1">{cuentaDetalle.Tipo_cuenta}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("entity")}</small>
                      <p className="fw-bold mb-1">
                        {cuentaDetalle.Cliente || cuentaDetalle.Proveedor || "—"}
                      </p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("currency")}</small>
                      <p className="fw-bold mb-1">{cuentaDetalle.Tipo_moneda}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("payment_method")}</small>
                      <p className="fw-bold mb-1">{cuentaDetalle.Medio_pago}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("cost_center")}</small>
                      <p className="fw-bold mb-1">{cuentaDetalle.Centro_costo}</p>
                    </Col>
                    <Col sm="12" xl="3" className="mb-2">
                      <small className="text-muted">{t("begin_period")}</small>
                      <p className="fw-bold mb-1">
                        {moment(cuentaDetalle.Vigencia_inicial).format("DD/MM/YYYY")}
                      </p>
                    </Col>
                    <Col sm="12" xl="3" className="mb-2">
                      <small className="text-muted">{t("due_date")}</small>
                      <p className="fw-bold mb-1">
                        {moment(cuentaDetalle.Vigencia_final).format("DD/MM/YYYY")}
                      </p>
                    </Col>
                    <Col sm="12" xl="3" className="mb-2">
                      <small className="text-muted">{t("total")}</small>
                      <p className="fw-bold mb-1">
                        {cuentaDetalle.Simbolo} {AppUtil.formatNumber(cuentaDetalle.Total)}
                      </p>
                    </Col>
                    <Col sm="12" xl="3" className="mb-2">
                      <small className="text-muted">{t("pending_balance")}</small>
                      <p className={`fw-bold mb-1 ${cuentaDetalle.Saldo_pendiente > 0 ? "text-danger" : "text-success"}`}>
                        {cuentaDetalle.Simbolo} {AppUtil.formatNumber(cuentaDetalle.Saldo_pendiente)}
                      </p>
                    </Col>
                    {cuentaDetalle.DiasVencido > 0 && (
                      <Col sm="12" className="mb-2">
                        <Badge bg="danger">
                          {t("overdue_days")}: {cuentaDetalle.DiasVencido}
                        </Badge>
                      </Col>
                    )}
                    <Col sm="12" className="mb-2">
                      <small className="text-muted">{t("status")}</small>
                      <div>{this._badgeEstado(cuentaDetalle.Estado)}</div>
                    </Col>
                  </Row>
                )}

                {/* ── Payments tab ── */}
                {activeTab === "payments" && (
                  <Row className="m-2">
                    <Col sm="12">
                      {this._detallesTable(
                        cuentaDetalle.Detalles,
                        t,
                        cuentaDetalle.id
                      )}
                    </Col>
                  </Row>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              onClick={() => this.setState({ showDetail: false })}
            >
              {t("close")}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ════════════════════════════════════════════
            Modal Add Pago — Cuenta_Detalle
        ════════════════════════════════════════════ */}
        <Modal
          show={showPagoModal}
          onHide={() => this.setState({ showPagoModal: false })}
          backdrop="static"
          keyboard={false}
          size="md"
        >
          <Form onSubmit={this.savePago}>
            <Modal.Header closeButton>
              <h3 className="tituloFerias">{t("add_payment")}</h3>
            </Modal.Header>
            <Modal.Body>
              <Row className="m-1">
                <Col sm="12" className="mb-3">
                  <Form.Label>{t("movement_type")}</Form.Label>
                  <Form.Select
                    name="Tipo_movimiento"
                    value={pago.Tipo_movimiento}
                    onChange={this._savePago}
                    required
                  >
                    {Object.entries(TIPO_MOV_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="12" className="mb-3">
                  <Form.Label>{t("amount")}</Form.Label>
                  <Form.Control
                    type="number"
                    name="monto"
                    placeholder="0.00"
                    value={pago.monto}
                    onChange={this._savePago}
                    min={0.01}
                    step="0.01"
                    required
                  />
                </Col>
                <Col sm="12" className="mb-3">
                  <Form.Label>{t("payment_method")}</Form.Label>
                  <Form.Select
                    name="Medio_pago_id"
                    value={pago.Medio_pago_id}
                    onChange={this._savePago}
                    required
                  >
                    <option value="">{t("select_option")}</option>
                    {payment_methods.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="12" className="mb-3">
                  <Form.Label>{t("reference")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="referencia_pago"
                    placeholder={t("reference")}
                    value={pago.referencia_pago}
                    onChange={this._savePago}
                    maxLength={200}
                  />
                </Col>
                <Col sm="12" className="mb-3">
                  <Form.Label>{t("observations")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Observaciones"
                    placeholder={t("observations")}
                    value={pago.Observaciones}
                    onChange={this._savePago}
                    maxLength={500}
                  />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="light"
                onClick={() => this.setState({ showPagoModal: false })}
              >
                {t("close")}
              </Button>
              <Button variant="success" type="submit">
                {t("save")}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </>
    );
  }
}

export default withTranslation()(Accounts);
