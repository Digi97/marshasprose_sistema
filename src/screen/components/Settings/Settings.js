import React from "react";
import { Container, Row, Col, Tabs, Tab, Button, Form } from "react-bootstrap";
import AppUtil from "../../../AppUtil/AppUtil.js";

import Toast from "../common/Toast.js";

import Select from "react-select";

import { withTranslation } from "react-i18next";
//TODO: agregar informacion de conexion a smtp para obtener facturas
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: true,
      alert: {
        show: false,
        variant: "success",
        title: "",
        body: "",
      },
      editing: false,
      empresa: {
        emp_id: 1,
        nombre_empresa: "",
        correo_empresa: "",
        ruta_nas: "",
        numero_sucursal: 0,
        formato_fecha: "dd-mm-yyyy",
        ruta_llave_factura: "",
        pin_llave: "",
        ruta_logo: "",
        terminal: 0,
        codigo_seguridad: "",
        identificacion: "",
        codigo_actividad_id: null,
        tipo_identificacion_id: 0,
        impuesto_id: null,
      },
      taxes: [],
      identificationType: [],
      activityCode: [],
    };
  }

  //#region opciones_selects
  getEmpresaById = () => {
    const { t } = this.props;

    AppUtil.getAPI(`empresa/1`, sessionStorage.getItem("token")).then(
      (response) => {
        if (response) {
          if (response.codeStatus === 200) {
            let empresa = response ? response.data : [];

            this.setState({ empresa, processing: false });
          } else {
            this.setState({
              error: true,
              errorMsg: t(response.message),
              color: "alert alert-warning",
            });
          }
        }
      },
    );
  };

  getTaxes = () =>
    AppUtil.getAPI(`catalogos/impuesto`, sessionStorage.getItem("token")).then(
      (response) => {
        let taxes = response ? response.data : [];
        this.setState({ taxes });
      },
    );

  getIdentificationType = () =>
    AppUtil.getAPI(`tipo_identificacion`, sessionStorage.getItem("token")).then(
      (response) => {
        let identificationType = response ? response.data : [];
        this.setState({ identificationType });
      },
    );

  getActivityCode = () =>
    AppUtil.getAPI(
      `catalogos/codigo_actividad`,
      sessionStorage.getItem("token"),
    ).then((response) => {
      let activityCode = response ? response.data : [];
      this.setState({ activityCode });
    });

  _saveStateVariable = async (e) => {
    const { name, type, checked, value } = e.target;

    await this.setState({
      empresa: {
        ...this.state.empresa,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      },
    });
  };

  logCatalogInfo = async () => {
    await this.getTaxes();
    await this.getIdentificationType();
    await this.getActivityCode();
  };
  //#endregion

  //#region actualizacion
  saveEmpresa = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();
    AppUtil.putAPI(`empresa/1`, this.state.empresa).then((response) => {
      console.log(response);
      if (response) {
        let user = response ? response.data : [];

        if (Number.isInteger(user)) {
          this.setState(
            {
              error: true,
              errorMsg: t("updated_successfully"),
              color: "alert alert-success",
            },
            () => {
              window.location.reload();
            },
          );
        } else {
          this.setState({
            error: true,
            errorMsg: t(response.message),
            color: "alert alert-warning",
          });
        }
      } else {
        this.setState({
          error: true,
          errorMsg: t("please_verify_data"),
          color: "alert alert-danger",
        });
      }

      // this.setState({user});
    });
  };
  //#endregion
  componentDidMount() {
    this.logCatalogInfo().then(() => {
      this.getEmpresaById();
    });
  }

  _setProcessing = (processing) => this.setState({ processing });

  render() {
    let {
      processing,
      alert,
      empresa,
      identificationType,
      activityCode,
      taxes,
    } = this.state;
    const { t } = this.props;

    return (
      <>
        <Toast
          onClose={() => this.setState({ alert: { show: false } })}
          variant={alert.variant}
          show={alert.show}
          title={alert.title}
          body={alert.body}
        />

        <Container fluid>
          <Form onSubmit={this.saveEmpresa}>
            <Tabs className="mb-3">
              <Tab
                eventKey="question"
                title={
                  <span>
                    <i className="fas fa-building"></i> {t("business")}
                  </span>
                }
              >
                <h4 className="txt-blue">{t("business_info")}</h4>
                <div className="well">
                  <Form.Group>
                    <Form.Label className="txt-darkblue">
                      {t("name")}
                    </Form.Label>
                    <Form.Control
                      placeholder={t("name")}
                      name="nombre_empresa"
                      onChange={this._saveStateVariable}
                      required
                      value={empresa.nombre_empresa}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="txt-darkblue">
                      {t("email")}
                    </Form.Label>
                    <Form.Control
                      placeholder={t("email")}
                      name="correo_empresa"
                      onChange={this._saveStateVariable}
                      required
                      value={empresa.correo_empresa}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="txt-darkblue">{t("nas")}</Form.Label>
                    <Form.Control
                      placeholder={t("nas")}
                      name="ruta_nas"
                      onChange={this._saveStateVariable}
                      required
                      value={empresa.ruta_nas}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="txt-darkblue">
                      {t("date_format")}
                    </Form.Label>
                    <Form.Control
                      placeholder={t("date_format")}
                      name="Formato_fecha"
                      onChange={this._saveStateVariable}
                      required
                      value={empresa.formato_fecha}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="txt-darkblue">
                      {t("identification_type")}
                    </Form.Label>
                    {processing ? (
                      t("loading")
                    ) : (
                      <Select
                        options={identificationType}
                        name="tipo_identificacion_id"
                        onChange={(value) =>
                          this.setState({
                            empresa: {
                              ...this.state.empresa,
                              tipo_identificacion_id: value,
                            },
                          })
                        }
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.nombre}
                        defaultValue={() =>
                          identificationType?.find(
                            (opt) => opt.id === empresa.tipo_identificacion_id,
                          )
                        }
                        isSearchable={true}
                      />
                    )}
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="txt-darkblue">
                      {t("identification")}
                    </Form.Label>
                    <Form.Control
                      placeholder={t("identification")}
                      name="identificacion"
                      onChange={this._saveStateVariable}
                      required
                      value={empresa.identificacion}
                    ></Form.Control>
                  </Form.Group>
                </div>
              </Tab>
              {/*TAB AJUSTES FACTURACION ELECTRÓNICA*/}
              <Tab
                eventKey="evaluations"
                title={
                  <span>
                    <i className="fas fa-file"></i> {t("electronic_invoice")}
                  </span>
                }
              >
                <div className="well">
                  <h4 className="txt-blue">{t("electronic_invoice")}</h4>

                  <Row>
                    <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("terminal")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("terminal")}
                          name="terminal"
                          onChange={this._saveStateVariable}
                          required
                          value={empresa.terminal}
                          type="number"
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                    <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("invoice_key")}
                        </Form.Label>
                        <Form.Control
                          type="file"
                          placeholder={t("invoice_key")}
                          name="Ruta_llave_factura"
                          onChange={this._saveStateVariable}
                          value={empresa.ruta_llave_factura}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                    <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("pin")}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          max={9999}
                          placeholder={t("pin")}
                          name="pin_llave"
                          onChange={this._saveStateVariable}
                          required
                          value={empresa.pin_llave}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                    <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("security_code")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("security_code")}
                          name="codigo_seguridad"
                          onChange={this._saveStateVariable}
                          required
                          max={99999999}
                          value={empresa.codigo_seguridad}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                    <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("activity_code")}
                        </Form.Label>

                        {processing ? (
                          t("loading")
                        ) : (
                          <Select
                            options={activityCode}
                            value={empresa.codigo_actividad}
                            name="codigo_actividad"
                            onChange={(value) =>
                              this.setState({
                                empresa: {
                                  ...this.state.empresa,
                                  codigo_actividad: value,
                                },
                              })
                            }
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.nombre_actividad}
                            isSearchable={true}
                            defaultValue={() =>
                              activityCode?.find(
                                (opt) => opt.id === empresa.codigo_actividad_id,
                              )
                            }
                          />
                        )}
                      </Form.Group>
                    </Col>

                    <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("default_tax")}
                        </Form.Label>
                        {processing ? (
                          t("loading")
                        ) : (
                          <Select
                            options={taxes}
                            name="impuesto_id"
                            onChange={(value) =>
                              this.setState({
                                empresa: {
                                  ...this.state.empresa,
                                  impuesto_id: value,
                                },
                              })
                            }
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.nombre}
                            defaultValue={() =>
                              taxes?.find(
                                (opt) => opt.id === empresa.impuesto_id,
                              )
                            }
                          />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Tab>

              <Tab
                eventKey="catalogs"
                title={
                  <span>
                    <i className="fas fa-check"></i> {t("catalogs")}
                  </span>
                }
              >
                <div className="well">
                  <div className="list-group">
                    <a
                      href="/home/settings/maintenance/currency"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("currency")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("currency_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/activity_code"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("activity_code")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("activity_code_description")}</p>
                    </a>
                    <a
                      href="/home/settings/maintenance/payment_method"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("payment_method")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("payment_method_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/accounting_account"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("accounting_account")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("accounting_account_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/type_accounting_account"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("type_accounting_account")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">
                        {t("type_accounting_account_description")}
                      </p>
                    </a>

                    <a
                      href="/home/settings/maintenance/invoice_status"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("invoice_status")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("invoice_status_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/rol"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("rol")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("rol_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/presupuestary_category"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("presupuestary_category")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">
                        {t("presupuestary_category_description")}
                      </p>
                    </a>

                    <a
                      href="/home/settings/maintenance/file_type"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("file_type")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("file_type_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/tax_type"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("tax_type")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("tax_type_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/sale_condition"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("sale_condition")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("sale_condition_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/document_type"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("document_type")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("document_type_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/expenses_category"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("expenses_category")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("expenses_category_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/measurement_unity"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("measurement_unity")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("measurement_unity_description")}</p>
                    </a>
                    <a
                      href="/home/settings/maintenance/comercial_code"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("comercial_code")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("comercial_code_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/cabys_code"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("cabys_code")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("cabys_code_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/cost_center"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("cost_center")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("cost_center_description")}</p>
                    </a>
                    <a
                      href="/home/settings/maintenance/permissions"
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">{t("permissions")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p class="mb-1">{t("permissions_description")}</p>
                    </a>
                  </div>
                </div>
              </Tab>
            </Tabs>

            <Button
              className="btn-rounded btn-fill bg-darkblue"
              type="submit"
              disabled={processing}
            >
              {processing ? <div className="lds-dual-ring"></div> : t("save")}
            </Button>
          </Form>
        </Container>
      </>
    );
  }
}

export default withTranslation()(Settings);
