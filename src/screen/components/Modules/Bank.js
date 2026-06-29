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
import ActionButtons from "../common/ActionButtons";
import RenderActive from "../common/renderActive";
DataTable.use(DT);

const TIPO_CUENTA_OPTIONS = ["Corriente", "Ahorros", "Inversión", "Otro"];

class Bank extends Component {
  constructor(props) {
    super(props);
    this.user = null;
    this.datatableRef = createRef();

    this.state = {
      bancos: [],
      currencies: [],
      cost_center: [],
      presupuestary_category: [],

      // create/edit modal
      show: false,
      isView: false,
      processing: false,
      banco: this._emptyBanco(),

      // view detail modal
      showDetail: false,
      bancoDetalle: null,
      movimientos: [],

      // movements filter (inside detail modal)
      activeTab: "info",
      filtroMes: "",
      filtroAnio: String(new Date().getFullYear()),
      movimientosFiltrados: [],
      loadingMovimientos: false,

      user: {},
    };
  }

  _emptyBanco() {
    return {
      id: 0,
      nombre_banco: "",
      numero_cuenta: "",
      tipo_cuenta: "",
      saldo_inicial: "",
      tipo_moneda_id: "",
      Centro_Costos_id: "",
      Categoria_presupuestaria_id: "",
      Usuarios_Usuario_id: 0,
      estado: 1,
    };
  }

  // ─── lifecycle ──────────────────────────────────────────────────────────────

  componentDidMount() {
    this.getUserInfo();
    this.getBancos();

  }

  getUserInfo = () => {
    let bytes = crypto.AES.decrypt(
      sessionStorage.getItem("user"),
      "@marsh_contable"
    );
    this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
    this.setState({ user: this.user });
  };

  // ─── API calls ───────────────────────────────────────────────────────────────

  getBancos = () =>
    AppUtil.getAPI("bancos").then((response) =>{
      console.log(response);
      
      this.setState({ bancos: response ? response.data : [] })}
    );

  getCurrencies = () =>
    AppUtil.getAPI("catalogos/tipo_moneda").then((response) =>
      this.setState({ currencies: response ? response.data : [] })
    );

  getCostCenter = () =>
    AppUtil.getAPI("catalogos/centro_costos").then((response) =>
      this.setState({ cost_center: response ? response.data : [] })
    );

  getCategories = () =>
    AppUtil.getAPI("catalogos/categoria_presupuestaria").then((response) =>
      this.setState({ presupuestary_category: response ? response.data : [] })
    );

  getBancoById = (id, isView = false) =>
    AppUtil.getAPI(`bancos/${id}`).then((response) => {
      if (!response || !response.data) return;
      const { banco } = response.data;
      this.setState({
        banco: {
          id: banco.id,
          nombre_banco: banco.nombre_banco,
          numero_cuenta: banco.numero_cuenta,
          tipo_cuenta: banco.tipo_cuenta,
          saldo_inicial: banco.saldo_inicial,
          tipo_moneda_id: banco.tipo_moneda_id,
          centro_Costos_id: banco.centro_Costos_id || "",
          categoria_presupuestaria_id: banco.categoria_presupuestaria_id || "",
          usuarios_Usuario_id: banco.usuarios_Usuario_id,
          estado: banco.estado,
        },
        show: true,
        isView,
      }, ()=> { 
        
        //cargamos la info para dibujar correctamente el dropdown
        this.getCurrencies();
    this.getCostCenter();
    this.getCategories();});
    });

  getBancoDetalle = (id) =>
    AppUtil.getAPI(`bancos/${id}`).then((response) => {
      if (!response || !response.data) return;
      const { banco, movimientos } = response.data;
      this.setState({
        bancoDetalle: banco,
        movimientos: movimientos || [],
        showDetail: true,
        activeTab: "info",
        filtroMes: "",
        filtroAnio: String(new Date().getFullYear()),
        movimientosFiltrados: [],
      });
    });

  cargarMovimientosPorPeriodo = () => {
    const { bancoDetalle, filtroMes, filtroAnio } = this.state;
    if (!bancoDetalle) return;
    this.setState({ loadingMovimientos: true });
    const params = [];
    if (filtroMes) params.push(`mes=${filtroMes}`);
    if (filtroAnio) params.push(`anio=${filtroAnio}`);
    const query = params.length ? `?${params.join("&")}` : "";
    AppUtil.getAPI(`bancos/${bancoDetalle.id}/movimientos${query}`).then(
      (response) => {
        this.setState({
          movimientosFiltrados: response?.data?.movimientos || [],
          loadingMovimientos: false,
        });
      }
    );
  };

  // ─── form helpers ────────────────────────────────────────────────────────────

  toggleShow = () =>
    this.setState({ show: !this.state.show, banco: this._emptyBanco(), isView: false }, ()=>{

      console.log(this.state.show);
      if(this.state.show)
      {
        this.getCurrencies();
        this.getCostCenter();
        this.getCategories();
      }
    })

  _saveStateVariable = (e) => {
    const { name, type, checked, value } = e.target;
    this.setState((prev) => ({
      banco: {
        ...prev.banco,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      },
    }));
  };

  validateForm = (t) => {
    const { banco } = this.state;
    if (!AppUtil.isValidText(banco.nombre_banco)) {
      alertSuccess(t("invalid_string_form_nombre_banco"), "warning", t);
      return false;
    }
    if (!AppUtil.isValidText(banco.numero_cuenta)) {
      alertSuccess(t("invalid_string_form_numero_cuenta"), "warning", t);
      return false;
    }
    if (!AppUtil.isValidText(banco.tipo_cuenta)) {
      alertSuccess(t("invalid_string_form_tipo_cuenta"), "warning", t);
      return false;
    }
    if (!banco.tipo_moneda_id) {
      alertSuccess(t("invalid_value_form_Tipo_moneda_id"), "warning", t);
      return false;
    }
    return true;
  };

  saveBanco = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { t } = this.props;
    if (!this.validateForm(t)) return;

    const banco = {
      ...this.state.banco,
      Usuarios_Usuario_id: this.state.user.usuario_id,
      moneda_simbolo:
        this.state.currencies.find((c) => c.id === parseInt(this.state.banco.tipo_moneda_id))
          ?.Simbolo || "",
    };

    if (banco.id === 0) {
      AppUtil.postAPI("bancos", banco).then((response) => {
        if (response?.codeStatus === 200) {
          alertSuccess(t("record_created_successfully"), "success", t);
          this.toggleShow();
          this.getBancos();
        } else {
          alertSuccess(t(response?.message || "please_verify_data"), "error", t);
        }
      });
    } else {
      AppUtil.putAPI(`bancos/${banco.id}`, banco).then((response) => {
        if (response?.codeStatus === 200) {
          alertSuccess(t("updated_successfully"), "success", t);
          this.toggleShow();
          this.getBancos();
        } else {
          alertSuccess(t(response?.message || "please_verify_data"), "error", t);
        }
      });
    }
  };

  // ─── render helpers ──────────────────────────────────────────────────────────

  ActionButtons = (rowData) => (
    <ActionButtons
      viewAction={() => this.getBancoDetalle(rowData.id)}
      editAction={() => this.getBancoById(rowData.id)}
    />
  );


  _renderMovimientosTable = (lista, t) => (
    <Table striped bordered hover size="sm" className="mt-3">
      <thead>
        <tr>
          <th>{t("date")}</th>
          <th>{t("movement_type")}</th>
          <th>{t("description")}</th>
          <th>{t("amount")}</th>
          <th>{t("previous_balance")}</th>
          <th>{t("posterior_balance")}</th>
          <th>{t("reference")}</th>
        </tr>
      </thead>
      <tbody>
        {lista.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center text-muted">
              {t("emptyTable")}
            </td>
          </tr>
        )}
        {lista.map((m) => (
          <tr key={m.id}>
            <td>{moment(m.fecha_movimiento).format("DD/MM/YYYY")}</td>
            <td>
              <Badge bg={m.tipo_movimiento === 1 ? "success" : "danger"}>
                {m.tipo_movimiento === 1 ? t("income") : t("expense")}
              </Badge>
            </td>
            <td>{m.descripcion}</td>
            <td className="text-end">
              {m.Simbolo} {AppUtil.formatNumber(m.monto)}
            </td>
            <td className="text-end">
              {m.Simbolo} {AppUtil.formatNumber(m.saldo_anterior)}
            </td>
            <td className="text-end">
              {m.Simbolo} {AppUtil.formatNumber(m.saldo_posterior)}
            </td>
            <td>{m.referencia}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  // ─── render ──────────────────────────────────────────────────────────────────

  render() {
    const { t } = this.props;
    const {
      bancos, currencies, cost_center, presupuestary_category,
      banco, show, isView,
      showDetail, bancoDetalle, movimientos,
      activeTab, filtroMes, filtroAnio,
      movimientosFiltrados, loadingMovimientos,
    } = this.state;

    const MESES = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december",
    ];
    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
      <>
        <Container fluid>
          {/* ── Header ── */}
          <Row className="mb-3">
            <Col lg="6" sm="12">
              <h1>{t("bank_accounts")}</h1>
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
                      <h5 className="mb-0 fw-bold">{bancos.length}</h5>
                    </Col>
                    <Col xs="4" className="text-end">
                      <div style={{
                        backgroundColor: "#4e73df20", borderRadius: "50%",
                        width: "50px", height: "50px", display: "flex",
                        alignItems: "center", justifyContent: "center", marginLeft: "auto",
                      }}>
                        <i className="fas fa-university" style={{ color: "#4e73df", fontSize: "20px" }} />
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
                        {bancos.filter((b) => b.estado === 1).length}
                      </h5>
                    </Col>
                    <Col xs="4" className="text-end">
                      <div style={{
                        backgroundColor: "#1cc88a20", borderRadius: "50%",
                        width: "50px", height: "50px", display: "flex",
                        alignItems: "center", justifyContent: "center", marginLeft: "auto",
                      }}>
                        <i className="fas fa-check-circle" style={{ color: "#1cc88a", fontSize: "20px" }} />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* ── DataTable ── */}
          <Row>
            <DataTable
              data={bancos}
              columns={[
                { data: "nombre_banco", title: t("bank_name") },
                { data: "numero_cuenta", title: t("account_number") },
                { data: "tipo_cuenta", title: t("account_type") },
                { data: "tipo_moneda", title: t("currency") },
                {
                  data: "saldo_actual", title: t("current_balance"),
                  render: (data, type, row) =>
                    `${row.simbolo} ${AppUtil.formatNumber(data)}`,
                },
                { data: "estado", title: t("status")},
                {
                  title: t("action"), data: null,
                  orderable: false, searchable: false,
                },
              ]}
              className="display table cell-border compact stripe"
              slots={{ 6: (cellData, rowData) => this.ActionButtons(rowData), 5: (cellData, rowData) => RenderActive(cellData, t), }}
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
            Modal Create / Edit
        ════════════════════════════════════════════ */}
        <Modal
          show={show}
          onHide={this.toggleShow}
          backdrop="static"
          keyboard={false}
          size="lg"
        >
          <Form onSubmit={this.saveBanco}>
            <Modal.Header closeButton>
              <h3 className="tituloFerias">
                {banco.id === 0 ? t("create_bank_account") : t("edit_bank_account")}
              </h3>
            </Modal.Header>
            <Modal.Body>
              <Row className="m-2">
                <Col sm="12" xl="6">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("bank_name")}</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_banco"
                      placeholder={t("bank_name")}
                      value={banco.nombre_banco}
                      onChange={this._saveStateVariable}
                      maxLength={150}
                      required
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
                <Col sm="12" xl="6">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("account_number")}</Form.Label>
                    <Form.Control
                      type="text"
                      name="numero_cuenta"
                      placeholder={t("account_number")}
                      value={banco.numero_cuenta}
                      onChange={this._saveStateVariable}
                      maxLength={50}
                      required
                      disabled={isView}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl={banco.id===0 ? "4" : "6"}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("account_type")}</Form.Label>
                    <Form.Select
                      name="tipo_cuenta"
                      value={banco.tipo_cuenta}
                      onChange={this._saveStateVariable}
                      required
                      disabled={isView}
                    >
                      <option value="">{t("select_option")}</option>
                      {TIPO_CUENTA_OPTIONS.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm="12" xl={banco.id===0 ? "4" : "6"}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("currency")}</Form.Label>
                    <Form.Select
                      name="tipo_moneda_id"
                      value={banco.tipo_moneda_id}
                      onChange={this._saveStateVariable}
                      required
                      disabled={isView}
                    >
                      <option value="">{t("select_option")}</option>
                      {currencies.map((c) => (
                        banco.tipo_moneda_id === c.id ? <option key={c.id} value={c.id} selected>{c.Nombre || c.nombre}</option> :
                        <option key={c.id} value={c.id}>{c.Nombre || c.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                {banco.id === 0 && (
                  <Col sm="12" xl="4">
                    <Form.Group className="mb-3">
                      <Form.Label>{t("initial_balance")}</Form.Label>
                      <Form.Control
                        type="number"
                        name="saldo_inicial"
                        placeholder="0.00"
                        value={banco.saldo_inicial}
                        onChange={this._saveStateVariable}
                        min={0}
                        step="0.01"
                        disabled={isView}
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="6">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("cost_center")}</Form.Label>
                    <Form.Select
                      name="centro_Costos_id"
                      value={banco.centro_Costos_id}
                      onChange={this._saveStateVariable}
                      disabled={isView}
                    >
                      <option value="">{t("select_option")}</option>
                      {cost_center.map((cc) => (
                        banco.centro_Costos_id === cc.id ? <option key={cc.id} value={cc.id} selected>{cc.Nombre || cc.nombre}</option>:
                        <option key={cc.id} value={cc.id}>{cc.Nombre || cc.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm="12" xl="6">
                  <Form.Group className="mb-3">
                    <Form.Label>{t("presupuestary_category")}</Form.Label>
                    <Form.Select
                      name="categoria_presupuestaria_id"
                      value={banco.categoria_presupuestaria_id}
                      onChange={this._saveStateVariable}
                      disabled={isView}
                    >
                      <option value="">{t("select_option")}</option>
                      {presupuestary_category.map((cp) => (
                       cp.id === banco.categoria_presupuestaria_id ?  (<option defaultValue key={cp.id} value={cp.id} selected >{cp.nombre}</option>): 
                        (<option key={cp.id} value={cp.id}>{cp.nombre}</option>)
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {banco.id > 0 && (
                <Row className="m-2">
                  <Col sm="12" xl="4">
                    <Form.Group className="mb-3">
                      <Form.Label>{t("status")}</Form.Label>
                      <Form.Check
                        type="checkbox"
                        name="estado"
                        label={t("active")}
                        checked={banco.estado === 1}
                        onChange={this._saveStateVariable}
                        disabled={isView}
                      />
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
            Modal Detail — info + movimientos
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
              {bancoDetalle?.nombre_banco} — {t("bank_detail")}
            </h3>
          </Modal.Header>
          <Modal.Body>
            {bancoDetalle && (
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
                    <Nav.Link eventKey="movements">{t("movements")}</Nav.Link>
                  </Nav.Item>
                </Nav>

                {/* ── Info tab ── */}
                {activeTab === "info" && (
                  <Row className="m-2">
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("bank_name")}</small>
                      <p className="fw-bold mb-1">{bancoDetalle.nombre_banco}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("account_number")}</small>
                      <p className="fw-bold mb-1">{bancoDetalle.numero_cuenta}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("account_type")}</small>
                      <p className="fw-bold mb-1">{bancoDetalle.tipo_cuenta}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("currency")}</small>
                      <p className="fw-bold mb-1">{bancoDetalle.tipo_moneda}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("initial_balance")}</small>
                      <p className="fw-bold mb-1">
                        {bancoDetalle.Simbolo} {AppUtil.formatNumber(bancoDetalle.saldo_inicial)}
                      </p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("current_balance")}</small>
                      <p className="fw-bold mb-1 text-success">
                        {bancoDetalle.Simbolo} {AppUtil.formatNumber(bancoDetalle.saldo_actual)}
                      </p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("cost_center")}</small>
                      <p className="fw-bold mb-1">{bancoDetalle.centro_Costos || "—"}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("presupuestary_category")}</small>
                      <p className="fw-bold mb-1">{bancoDetalle.categoria_presupuestaria || "—"}</p>
                    </Col>
                    <Col sm="12" xl="4" className="mb-2">
                      <small className="text-muted">{t("status")}</small>
                        <p className="fw-bold mb-1"> {RenderActive(bancoDetalle.estado, t)}</p>
                     
                    </Col>

                    <Col sm="12" className="mt-3">
                      <p className="fw-bold">{t("last_movements")}</p>
                      {this._renderMovimientosTable(movimientos, t)}
                    </Col>
                  </Row>
                )}

                {/* ── Movements tab ── */}
                {activeTab === "movements" && (
                  <Row className="m-2">
                    <Col sm="12" xl="4" className="mb-3">
                      <Form.Label>{t("month")}</Form.Label>
                      <Form.Select
                        value={filtroMes}
                        onChange={(e) => this.setState({ filtroMes: e.target.value })}
                      >
                        <option value="">{t("all")}</option>
                        {MESES.map((key, i) => (
                          <option key={i + 1} value={i + 1}>{t(key)}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col sm="12" xl="4" className="mb-3">
                      <Form.Label>{t("year")}</Form.Label>
                      <Form.Select
                        value={filtroAnio}
                        onChange={(e) => this.setState({ filtroAnio: e.target.value })}
                      >
                        <option value="">{t("all")}</option>
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col sm="12" xl="4" className="mb-3 d-flex align-items-end">
                      <Button
                        variant="primary"
                        onClick={this.cargarMovimientosPorPeriodo}
                        disabled={loadingMovimientos}
                      >
                        {loadingMovimientos ? (
                          <span className="lds-dual-ring-2" />
                        ) : (
                          <><i className="fas fa-search me-1" />{t("search")}</>
                        )}
                      </Button>
                    </Col>

                    {movimientosFiltrados.length > 0 && (
                      <Col sm="12">
                        <Row className="mb-2">
                          <Col>
                            <Badge bg="success" className="me-2">
                              {t("income")}: {currencies.find(c => c.id === bancoDetalle?.tipo_moneda_id)?.Simbolo || ""}
                              {" "}{AppUtil.formatNumber(
                                movimientosFiltrados
                                  .filter((m) => m.tipo_movimiento === 1)
                                  .reduce((s, m) => s + (m.monto || 0), 0)
                              )}
                            </Badge>
                            <Badge bg="danger" className="me-2">
                              {t("expense")}: {currencies.find(c => c.id === bancoDetalle?.tipo_moneda_id)?.Simbolo || ""}
                              {" "}{AppUtil.formatNumber(
                                movimientosFiltrados
                                  .filter((m) => m.tipo_movimiento === 2)
                                  .reduce((s, m) => s + (m.monto || 0), 0)
                              )}
                            </Badge>
                          </Col>
                        </Row>
                        {this._renderMovimientosTable(movimientosFiltrados, t)}
                      </Col>
                    )}
                  </Row>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => this.setState({ showDetail: false })}>
              {t("close")}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default withTranslation()(Bank);
