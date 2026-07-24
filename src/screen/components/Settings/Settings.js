import React, {Component} from "react";
import { Container, Row, Col, Tabs, Tab, Button, Form } from "react-bootstrap";
import AppUtil from "../../../AppUtil/AppUtil.js";
import Toast from "../common/Toast.js";
import Select from "react-select";
import { withTranslation } from "react-i18next";


import alertSuccess from "../common/SweetAlert.js";

class Settings extends Component {
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
        provincia_id:0,
        canton_id:0,
        distrito_id:0
      },
      taxes: [],
      identificationType: [],
      activityCode: [],

    };

  }

  //#region opciones_selects


  getEmpresaById = () => {
    const { t } = this.props;

    AppUtil.getAPI(`empresa/1`).then(
      (response) => {
        if (response) {
          if (response.codeStatus === 200) {
            let empresa = response ? response.data : [];
        
            
            this.setState({ empresa, processing: false });
          } else {
            alertSuccess(t(response.message), "error", t);

          }
        }
      },
    );
  };

  getTaxes = () =>
    AppUtil.getAPI(`catalogos/impuesto`).then(
      (response) => {
        let taxes = response ? response.data : [];
        this.setState({ taxes });
      },
    );

  getIdentificationType = () =>
    AppUtil.getAPI(`tipo_identificacion`).then(
      (response) => {
        let identificationType = response ? response.data : [];
        this.setState({ identificationType });
      },
    );

  getActivityCode = () =>
    AppUtil.getAPI(
      `catalogos/codigo_actividad`
    ).then((response) => {
      let activityCode = response ? response.data : [];
      this.setState({ activityCode });
    });

  _saveStateVariable = async (e) => {
    const { name, type, checked, value } = e.target;

    
        if (name === "provincia_id") {
            this.getCanton(value);
        }

        if (name === "canton_id") {
            this.getDistrito(value);
        }

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
    console.log(this.state.empresa);
    
    AppUtil.putAPI(`empresa/1`, this.state.empresa).then((response) => {
    
      if (response) {
        let user = response ? response.data : [];

        if (Number.isInteger(user)) {
            alertSuccess(t("updated_successfully"), "success", t);

        } else {
            alertSuccess(t(response.message), "error", t);

        }
      } else {

            alertSuccess(t("please_verify_data"), "error", t);

      }

      // this.setState({user});
    });
  };


  uploadLlave = (archivo) => {
    const { t } = this.props;

    if (!archivo) return;

    AppUtil.fileToBase64(archivo, (error, base64) => {
      if (error) {
        alertSuccess(t("error"), "error", t);
        return;
      }

      const base64Content = base64.split(",")[1];

      AppUtil.postAPI(`empresa/upload-llave`, {
        file: base64Content,
        fileName: archivo.name,
      }).then((response) => {
        if (response && response.codeStatus === 200) {
          alertSuccess(t("file_saved"), "success", t);
        } else {
          alertSuccess(t(response?.message ?? "error"), "error", t);
        }
      });
    });
  };


  //#endregion
  componentDidMount() {
    this.logCatalogInfo().then(() => {
      this.getEmpresaById();
       this.getProvincia();
       this.getCanton(this.state.empresa.provincia_id)
       this.getDistrito(this.state.empresa.canton_id)
    });
  }



   getProvincia = () =>
          AppUtil.getAPI(`ubicacion/provincia`).then((response) => {
              let province = response ? response.data : [];
              this.setState({ province });
          });
  
      getCanton = (id = 1) =>
          AppUtil.getAPI(`ubicacion/canton/provincia/${id}`).then((response) => {
              let canton = response ? response.data : [];
              this.setState({ canton });
          });
  
      getDistrito = (id = 1) =>
          AppUtil.getAPI(`ubicacion/distrito/canton/${id}`).then((response) => {
              let district = response ? response.data : [];
              this.setState({ district });
          });




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
               
                <div className="card mt-3 shadow-lg">
                  <div className="m-3">
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
                      type="url"
                      value={empresa.ruta_nas}
                    ></Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="txt-darkblue">
                      {t("date_format")}
                    </Form.Label>
                   

<Form.Select
                                                                placeholder={t("date_format")}
                                                                onChange={this._saveStateVariable}
                                                                name="Formato_fecha"
                                                                required
                                                                defaultValue={empresa.formato_fecha}
                    
                                                            >
                                                                <option value="" >{t("select_option")}</option>

                                                                <option value="DD-MM-YYYY" selected={empresa.formato_fecha === "DD-MM-YYYY"}>DD-MM-YYYY</option>
                                                                <option value="MM-DD-YYYY" selected={empresa.formato_fecha === "MM-DD-YYYY"}>MM-DD-YYYY</option>
                                                                <option value="YYYY-MM-DD" selected={empresa.formato_fecha === "YYYY-MM-DD"}>YYYY-MM-DD</option>
                                                                <option value="YYYY-DD-MM" selected={empresa.formato_fecha === "YYYY-DD-MM"}>YYYY-DD-MM</option>



                                                      
                                                            </Form.Select>





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
                <div className="card shadow-lg">
                  <div className="m-3">
                  <h4 className="txt-blue">{t("electronic_invoice")}</h4>

                  <Row>

                        <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("user_doc_elec")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("user_doc_elec")}
                          name="usuario_hacienda"
                          onChange={this._saveStateVariable}
                          required
                          value={empresa.usuario_hacienda}
                          type="text"
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                    
                        <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("pwd_doc_elec")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("pwd_doc_elec")}
                          name="contrasena_hacienda"
                          onChange={this._saveStateVariable}
                          
                          value={empresa.contrasena_hacienda}
                          type="password"
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                 


                    
                                                    <Col sm="12" xl="4">
                                                        <label className="txt-darkblue">
                                                            {t("province")}
                                                        </label>
                                                        <Form.Group>
                                                            <Form.Select
                                                                placeholder={t("province")}
                                                                onChange={this._saveStateVariable}
                                                                name="provincia_id"
                                                                required
                    
                                                            >
                                                                <option value="">
                                                                    {t("select_option")}
                                                                </option>
                                                                {this.state.province?.map(
                                                                    (item, key) =>
                                                                        item.id ===
                                                                        this.state.empresa
                                                                            ?.provincia_id ? (
                                                                            <option
                                                                                value={item.id}
                                                                                selected
                                                                                
                                                                                key={key}
                                                                            >
                                                                                {item.nombre}
                                                                            </option>
                                                                        ) : (
                                                                            <option
                                                                                value={item.id}
                                                                                key={key}
                                                                            >
                                                                                {item.nombre}
                                                                            </option>
                                                                        )
                                                                )}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                    
                                                    <Col sm="12" xl="4">
                                                        <label className="txt-darkblue">
                                                            {t("canton")}
                                                        </label>
                                                        <Form.Group>
                                                            <Form.Select
                                                                placeholder={t("canton")}
                                                                onChange={this._saveStateVariable}
                                                                name="canton_id"
                                                                required
                    
                                                            >
                                                                <option value="">
                                                                    {t("select_option")}
                                                                </option>
                                                                {this.state.canton?.map(
                                                                    (item, key) =>
                                                                        item.id ===
                                                                        this.state.empresa
                                                                            ?.canton_id ? (
                                                                            <option
                                                                                value={item.id}
                                                                                selected
                                                                                
                                                                                key={key}
                                                                            >
                                                                                {item.nombre}
                                                                            </option>
                                                                        ) : (
                                                                            <option
                                                                                value={item.id}
                                                                                key={key}
                                                                            >
                                                                                {item.nombre}
                                                                            </option>
                                                                        )
                                                                )}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                    
                                                    <Col sm="12" xl="4">
                                                        <label className="txt-darkblue">
                                                            {t("district")}
                                                        </label>
                                                        <Form.Group>
                                                            <Form.Select
                                                                placeholder={t("district")}
                                                                onChange={this._saveStateVariable}
                                                                name="distrito_id"
                                                                required
                    
                                                            >
                                                                <option value="">
                                                                    {t("select_option")}
                                                                </option>
                                                                {this.state.district?.map(
                                                                    (item, key) =>
                                                                        item.id ===
                                                                        this.state.empresa
                                                                            ?.distrito_id ? (
                                                                            <option
                                                                                value={item.id}
                                                                                selected
                                                                                
                                                                                key={key}
                                                                            >
                                                                                {item.nombre}
                                                                            </option>
                                                                        ) : (
                                                                            <option
                                                                                value={item.id}
                                                                                key={key}
                                                                            >
                                                                                {item.nombre}
                                                                            </option>
                                                                        )
                                                                )}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                         

   <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("phone_code")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("phone_code")}
                          name="codigo_Telefono"
                          onChange={this._saveStateVariable}
                          required
                          value={empresa.codigo_Telefono}
                          type="text"
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                                   <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("phone")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("phone")}
                          name="telefono"
                          onChange={this._saveStateVariable}
                          required
                          value={empresa.telefono}
                          type="text"
                        ></Form.Control>
                      </Form.Group>
                    </Col>


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
                          
                          accept=".p12"
                          onChange={(e) => this.uploadLlave(e.target.files[0])}
                        ></Form.Control>
                               {empresa.ruta_llave_factura !== "" && <span className={`badge_status badge-active`} > <i className={"fas fa-circle-file"} aria-hidden="true"></i> {t("file")}: {empresa.ruta_llave_factura} </span>}
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
                                  codigo_actividad_id: value.id,
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
                            onChange={(value) => this.setState({ empresa: {  ...this.state.empresa, impuesto_id: value.id,  }}) }
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
                </div>
              </Tab>

              <Tab eventKey="smtp" title={
                  <span>
                    <i className="fas fa-envelope"></i> {t("smtp")}
                  </span>
                }>
                  <Row className="">
                     
                    <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("smtp_mail")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("smtp_mail")}
                          name="correo_smtp"
                          onChange={this._saveStateVariable}
                          
                          type="email"
                          value={empresa.correo_smtp}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                      <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("smtp_pwd")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("smtp_pwd")}
                          name="contrasena_smtp"
                          onChange={this._saveStateVariable}
                          
                          type="password"
                          value={empresa.contrasena_smtp}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                          <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("smtp_provider")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("smtp_provider")}
                          name="proveedor_SMTP"
                          onChange={this._saveStateVariable}
                          
                          type="text"
                          value={empresa.proveedor_SMTP}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("port_smtp")}
                        </Form.Label>
                        <Form.Control
                          placeholder={"22"}
                          name="puerto_SMTP"
                          onChange={this._saveStateVariable}
                          
                          type="number"
                          value={empresa.puerto_SMTP}
                        ></Form.Control>
                      </Form.Group>
                    </Col>

                  <Col xl="12" sm="12" md="12">
                      <Form.Group>
                        <Form.Label className="txt-darkblue">
                          {t("subject_smtp")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("subject_smtp")}
                          name="asunto_SMTP"
                          onChange={this._saveStateVariable}
                          
                          type="text"
                          value={empresa.asunto_SMTP}
                        ></Form.Control>
                      </Form.Group>
                    </Col> 



                  </Row>


              </Tab>

              <Tab
                eventKey="catalogs"
                title={
                  <span>
                    <i className="fas fa-check"></i> {t("catalogs")}
                  </span>
                }
              >
                <div className="card shadow-lg">
                  <div className=" mt-3 list-group">
                    <a
                      href="/home/settings/maintenance/currency"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("currency")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("currency_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/activity_code"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("activity_code")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("activity_code_description")}</p>
                    </a>
                    <a
                      href="/home/settings/maintenance/payment_method"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("payment_method")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("payment_method_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/accounting_account"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("accounting_account")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("accounting_account_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/type_accounting_account"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("type_accounting_account")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">
                        {t("type_accounting_account_description")}
                      </p>
                    </a>

                    <a
                      href="/home/settings/maintenance/invoice_status"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("invoice_status")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("invoice_status_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/rol"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("rol")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("rol_description")}</p>
                    </a>

                    {/*<a
                      href="/home/settings/maintenance/presupuestary_category"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("presupuestary_category")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">
                        {t("presupuestary_category_description")}
                      </p>
                    </a>*/}

                    <a
                      href="/home/settings/maintenance/file_type"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("file_type")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("file_type_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/tax_type"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("tax_type")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("tax_type_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/sale_condition"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("sale_condition")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("sale_condition_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/document_type"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("document_type")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("document_type_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/expenses_category"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("expenses_category")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("expenses_category_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/measurement_unity"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("measurement_unity")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("measurement_unity_description")}</p>
                    </a>
                    <a
                      href="/home/settings/maintenance/comercial_code"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("comercial_code")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("comercial_code_description")}</p>
                    </a>

                    <a
                      href="/home/settings/maintenance/cabys_code"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("cabys_code")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("cabys_code_description")}</p>
                    </a>

                    {/*<a
                      href="/home/settings/maintenance/cost_center"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("cost_center")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("cost_center_description")}</p>
                    </a>*/}
                    <a
                      href="/home/settings/maintenance/permissions"
                      className="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">{t("permissions")}</h5>
                        <small>
                          <i className="fas fa-arrow-right"></i>
                        </small>
                      </div>
                      <p className="mb-1">{t("permissions_description")}</p>
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
