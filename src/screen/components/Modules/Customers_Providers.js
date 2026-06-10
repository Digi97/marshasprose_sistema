import React, { Component, createRef  } from "react";

import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import {Container, Row, Col, Button, Modal, Tabs, Form, Tab} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { url } from "screen/components/services/api";
import crypto from "crypto-js";

import AppUtil from "../../../AppUtil/AppUtil";
import Select from "react-select";
import { withTranslation } from "react-i18next";
import permissions from "../../../permission.json";
DataTable.use(DT);

class Customer_Provider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: [],
      show: false,
        isProvider: false,
      processing: true,
      customer_provider: {
        id: 0,
        identificacion: "",
        tipo_identificacion_id: 0,
        nombre: "",
        apellido1: "",
        apellido2: "",
        correo: "",
        distrito_id: 0,
        canton_id: 0,
        provincia_id: 0,
        codigo_actividad: 0,
        estado: true,
        fecha_creacion: "",
        fecha_actualizacion: "",
        exonerado: false,
        otrasSenas: "",
      },
      telefonos: [],
      token: "",
      identificationType: [],
      province: [],
      canton: [],
      district: [],
      activityCode:[],
      clientAdmin:false,
      providerAdmin:false
    };
     this.modalTopRef = createRef();
  }

  //#region Funciones internas

  scrollToTop = () => {
        if (this.modalTopRef.current) {
            this.modalTopRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }
    _saveStateVariable = async (e) => {
    const { name, type, checked, value } = e.target;

    await this.setState({
      customer_provider: {
        ...this.state.customer_provider,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      },
    });
  };
  toggleShow = (isCustomer = true) =>
    this.setState({ show: !this.state.show,    
      isCustomer,
      customer_provider: {
        id: 0,
        identificacion: "",
        tipo_identificacion_id: 0,
        nombre: "",
        apellido1: "",
        apellido2: "",
        correo: "",
        distrito_id: 0,
        canton_id: 0,
        provincia_id: 0,
        codigo_actividad: 0,
        estado: true,
        fecha_creacion: "",
        fecha_actualizacion: "",
        exonerado: false,
        otrasSenas: "",
      } });


  addPhone = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData(e.target);

    const telefonos = {
      numero: formData.get("numero"),
      codigo_pais: formData.get("codigo_pais"),
      telefono_principal: formData.get("telefono_principal") == 'on' ? 1: 0
    };

  
    this.setState((prevState) => ({
      telefonos: [...prevState.telefonos, telefonos],
    }));
    e.target.reset();

    // agregar conexion a axios
  };

  removeLine = (index) => {
    this.setState((prevState) => ({
      telefonos: prevState.telefonos.filter((line, i) => i !== index),
    }));
  };

  saveCustomerProvider = (e) => {

     const { t } = this.props;

    e.preventDefault();
    e.stopPropagation();
    let {customer_provider,isProvider, telefonos} = this.state;

    if(telefonos.length === 0)
    {
      this.scrollToTop();
        this.setState({ error: true, errorMsg: t("phone_required"), color:"alert alert-warning" });
      return
    }

    let endpoint = isProvider ? `proveedor`: `clientes` ;
      
       customer_provider.estado = customer_provider.estado? 1 : 0;
       customer_provider.exonerado = customer_provider.exonerado ? 1:0;
       customer_provider.telefonos = telefonos;
    
       if(customer_provider.id === 0)//creacion
    {

      
       AppUtil.postAPI(endpoint, customer_provider).then(response => {
if(response.codeStatus === 200)
{
   let customer_provider = response ? response.data : [];
    if(Number.isInteger(customer_provider))
                {
                    this.setState({
                  error: true,
                  errorMsg: t("record_created_successfully"),
                  color:"alert alert-success"
                }, () => { window.location.reload(); });
              
          } 

} else
  {
  
    this.scrollToTop();
     this.setState({ error: true, errorMsg: t(response.message), color:"alert alert-warning" });
}
           })

    }
    else //actualizacion
    {    

       AppUtil.putAPI(`${endpoint}/${customer_provider.id}`, customer_provider).then(response => {

        if(response)
        {
          let customer_provider = response ? response.data : [];
                if(Number.isInteger(customer_provider))
                {
                    this.setState({
                  error: true,
                  errorMsg: t("updated_successfully"),
                  color:"alert alert-success"
                }, () => { window.location.reload(); });
                } 
                else
                  {
                    this.scrollToTop();
               this.setState({ error: true, errorMsg: t(response.message), color:"alert alert-warning" });
                }
        } 
        else
        {         
          this.scrollToTop();
        this.setState({
          error: true,
          errorMsg: t('please_verify_data'),
          color:"alert alert-danger"
        });
        }
           })
    }
  };

  getIdentificationType = () =>
    AppUtil.getAPI(`tipo_identificacion`).then(
      (response) => {
        let identificationType = response ? response.data : [];
        this.setState({ identificationType }); 
      },
    );

    getCensus = () => {

          let {customer_provider} = this.state;
      if(customer_provider.tipo_identificacion_id == 1)//buscamos sunicamente fisicos
      {

 AppUtil.getAPI(`catalogos/padron/${customer_provider.identificacion}`).then(
      (response) => {
        let person = response ? response.data : [];
if(person !== null)
{
        customer_provider.nombre = typeof(person.nombre) =="undefined" ? "" :person.nombre
        customer_provider.apellido1 = typeof(person.apellido1) =="undefined"?"": person.apellido1
        customer_provider.apellido2 = typeof(person.apellido2) =="undefined"?"": person.apellido2
        this.setState({ customer_provider }); 
}
        


      },
    );
      }

   


    }    
  getActivityCode = () =>
    AppUtil.getAPI(`catalogos/codigo_actividad`).then(
      (response) => {
        let activityCode = response ? response.data : [];
        this.setState({ activityCode, processing:false });
      },
    );
  getProvincia = () =>
    AppUtil.getAPI(`ubicacion/provincia`).then(
      (response) => {
        let province = response ? response.data : [];
        this.setState({ province });
      },
    );

  getCanton = (id = 1) =>
    AppUtil.getAPI(
      `ubicacion/canton/provincia/${id}`
    ).then((response) => {
      let canton = response ? response.data : [];
      this.setState({ canton });
    });

  getDistrito = (id = 1) =>
    AppUtil.getAPI(
      `ubicacion/distrito/canton/${id}`
    ).then((response) => {
      let district = response ? response.data : [];
      this.setState({ district });
    });

  _saveStateVariable = async (e) => {

       const {name, type, checked, value} = e.target;

    if (name === "provincia_id") 
    {
      this.getCanton(value);
    }

    if (name === "canton_id") {
      this.getDistrito(value);
    }


    await this.setState({
            customer_provider: {
              ...this.state.customer_provider,
              [name]: type ==="checkbox" ? (checked? 1:0): value,
            },
          });
  };



  //#endregion fin funciones internas

  componentDidMount() {
    this.getIdentificationType();
    this.getUserInfo();
    this.getProvincia();
    this.getActivityCode();
    
  }

  getUserInfo = () => {
    let bytes = crypto.AES.decrypt(
      sessionStorage.getItem("user"),
      "@marsh_contable",
    );
    this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
   const permisos = this.user.permisos; 
  let clientAdmin = permisos.indexOf(permissions.UsuarioMantenimientoClientes) === -1 ? false : true;
  let providerAdmin = permisos.indexOf(permissions.UsuarioMantenimientoProveedores) === -1 ? false : true;
    
    this.setState({ user: this.user, token: sessionStorage.getItem("sessionId"), clientAdmin, providerAdmin });
  };


  getCustomerProviderById = (id, isCustomer = true) => {


     const { t } = this.props;
      let url = isCustomer ? `clientes/${id}` : `proveedor/${id}`;


        AppUtil.getAPI(url).then(response => {
          if(response.codeStatus === 200)
          {
          let customer_provider = response ? response.data : [];  
          let telefonos =    customer_provider.telefonos;

          customer_provider.exonerado = customer_provider.exonerado  ==1 ? true: false;
          customer_provider.estado = customer_provider.estado ==1 ? true: false;

          delete customer_provider.telefonos;


          this.setState({customer_provider, telefonos, show:true, isProvider: !isCustomer}, ()=>{
            this.getActivityCode();
            this.getCanton(customer_provider.provincia_id);
            this.getDistrito(customer_provider.canton_id);
            
          });
          } 
          else  
          {
   this.setState({ error: true, errorMsg: t(response.message), color:"alert alert-warning" });
          }
          
   
    });



  }



   ActionButtonsCustomers = (rowData) => {
      return (
          <Row className="m-2">
            <Col lg="12" sm="12">
                 <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getCustomerProviderById(rowData.id)}><i className="fas fa-pen" /></Button>
            </Col>
          </Row>
      );
  };

  
   ActionButtonsProviders = (rowData) => {
      return (
          <Row className="m-2">
            <Col lg="12" sm="12">
                 <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getCustomerProviderById(rowData.id,false)}><i className="fas fa-pen" /></Button>
            </Col>
          </Row>
      );
  };

  render() {
    const { t } = this.props;
    let{customer_provider, token, clientAdmin, providerAdmin} = this.state;
    
    return (
      <>
        <Container fluid>
          <Tabs
            id="controlled-tab-example"
            className="mb-3 txt-blue"
            defaultActiveKey="customer"
          >
        {clientAdmin && <Tab
              eventKey="customer"
              title={t("customer")}
              className="txt-darkblue"
            >
              <Row>
                <Col lg="6" sm="12">
                  <h1>{t("customer")}</h1>
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
                    <Col lg="2" sm="12">
                      <Button className="btn-fill btn-rounded bg-blue">
                        {t("clean")}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                {/*SECCION DE CLIENTES */}
                {token === "" ? (
                  <div></div>
                ) : (
                  <DataTable
                    ajax={{
                      url: `${url}clientes`,
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
                      processing: true,
                    }}
                    columns={[
                      { data: "id", title: t("id") },
                      { data: "identificacion", title: t("identification") },
                      { data: "tipo_identificacion", title: t("identification_type")},
                      { data: "nombre", title: t("name"),  render:function(data, type,row){ return `${row.nombre} ${row.apellido1} ${row.apellido2}` }  },
                     { data: "correo", title: t("email") },
                      { data: "estado", title: t("status"), render:function(data, type,row){ return data ==1 ? t("active"): t("inactive") } },
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
                      6: (cellData, rowData) =>
                        this.ActionButtonsCustomers(rowData, cellData),
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
                        topEnd: "search",
                        bottomStart: "info",
                        bottomEnd: "paging",
                      },
                      crossDomain: true,
                      processing: true,
                      serverSide: true,
                      searching: true,
                    }}
                  />
                )}
              </Row>
            </Tab>}

          {providerAdmin &&  <Tab
              eventKey="provider"
              title={t("provider")}
              className="txt-darkblue"
            >
              <Row>
                <Col lg="6" sm="12">
                  <h1>{t("provider")}</h1>
                </Col>
                <Col lg="6" sm="12">
                  <Row>
                    <Col lg="3" sm="12">
                      <Button
                        className="btn-fill btn-rounded bg-blue"
                        onClick={()=> this.toggleShow(false)}
                      >
                        {t("create")}
                      </Button>
                    </Col>
                    <Col lg="2" sm="12">
                      <Button
                        className="btn-fill btn-rounded bg-blue"
                        onClick={()=> {}}
                      >
                        {t("clean")}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                {/*SECCION DE PROVEEDORES */}
                {token === "" ? (
                  <div></div>
                ) : (
                  <DataTable
                    ajax={{
                      url: `${url}proveedor`,
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
                      processing: true,
                    }}
                    columns={[
                      { data: "id", title: t("id") },
                      { data: "identificacion", title: t("identification") },
                      { data: "tipo_identificacion", title: t("identification_type") },
                      { data: "nombre", title: t("name"),  render:function(data, type,row){ return `${row.nombre} ${row.apellido1} ${row.apellido2}` }  },
                      { data: "correo", title: t("email") },
                      { data: "estado", title: t("status"), render:function(data, type,row){ return data ===1 ? t("active"): t("inactive") } },
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
                      6: (cellData, rowData) =>
                        this.ActionButtonsProviders(rowData, cellData),
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
                        topEnd: "search",
                        bottomStart: "info",
                        bottomEnd: "paging",
                      },
                      crossDomain: true,
                      processing: true,
                      serverSide: true,
                      searching: true,
                    }}
                  />
                )}
              </Row>
            </Tab>}
          </Tabs>
          <Modal
            show={this.state.show}
            onHide={this.toggleShow}
            backdrop="static"
            keyboard={false}
            size="lg"
            className="max-z-index"
          >
            <Modal.Header closeButton>
              <h3 className=" tituloFerias">{this.state.isProvider ? t('provider'): t("customer")}</h3>
            </Modal.Header>
             <div ref={this.modalTopRef} />
            {this.state.error === true && (
              <div className={this.state.color} role="alert">
                {this.state.errorMsg}
              </div>
            )}
            <Modal.Body>        
              <Row className="m-2">
                <Col sm="12" xl="6">
                  <label className="txt-darkblue">
                    {t("identification_type")}
                  </label>
                  <Form.Group>
                    <Form.Select
                      placeholder={t("identification_type")}
                      onChange={this._saveStateVariable}
                      name="tipo_identificacion_id"
                      required
                    >
                      <option value="">{t("select_option")}</option>
                      {this.state.identificationType?.map((item, key) =>
                        item.id ===
                        customer_provider.tipo_identificacion_id ? (
                          <option
                            value={item.id}
                            selected
                            defaultValue
                            key={key}
                          >
                            {item.nombre}
                          </option>
                        ) : (
                          <option value={item.id} key={key}>
                            {item.nombre}
                          </option>
                        ),
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm="12" xl="6">
                  <label>{t("identification")}</label>
                  <Form.Group>
                    <Form.Control
                      placeholder={t("identification")}
                      type="text"
                      onChange={this._saveStateVariable}
                      name="identificacion"
                      required
                      maxLength={20}
                      value={customer_provider.identificacion}
                      onBlur={this.getCensus}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="6">
                  <label className="txt-darkblue">{t("activity_code")}</label>
                   {this.state.processing ? (
                      t("loading")
                    ) : (
                      <Select
                        options={this.state.activityCode}
                        name="codigo_actividad_id"
                        onChange={(value) => this.setState({ customer_provider: { ...this.state.customer_provider, codigo_actividad_id: value.id}}) }
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => `${option.codigo_actividad1} - ${option.nombre_actividad}`}
                        defaultValue={() =>
                          this.state.activityCode?.find(
                            (opt) => opt.id === this.state.customer_provider.codigo_actividad_id,
                          )
                        }
                        isSearchable={true}
                      />
                    )}
                </Col>

                <Col sm="12" xl="6">
                  <label>{t("name")}</label>
                  <Form.Group>
                    <Form.Control
                      placeholder={t("name")}
                      type="text"
                      onChange={this._saveStateVariable}
                      name="nombre"
                      value={customer_provider.nombre}
                      required
                      maxLength={250}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="m-2">
                <Col sm="12" xl="6">
                  <label>{t("lastname")}</label>
                  <Form.Group>
                    <Form.Control
                      placeholder={t("lastname")}
                      type="text"
                      onChange={this._saveStateVariable}
                      name="Apellido1"
                      required
                      value={customer_provider.apellido1}
                      maxLength={100}
                    ></Form.Control>
                  </Form.Group>
                </Col>

                <Col sm="12" xl="6">
                  <label>{t("secondlastname")}</label>
                  <Form.Group>
                    <Form.Control
                      placeholder={t("secondlastname")}
                      type="text"
                      onChange={this._saveStateVariable}
                      name="Apellido2"
                      required
                      maxLength={100}
                      value={customer_provider.apellido2}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="12">
                  <label className="txt-darkblue">{t("email")}</label>
                  <Form.Group>
                    <Form.Control
                      placeholder={t("email")}
                      type="mail"
                      onChange={this._saveStateVariable}
                      name="correo"
                      required
                      value={customer_provider.correo}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="4">
                  <label className="txt-darkblue">{t("province")}</label>
                  <Form.Group>
                    <Form.Select
                      placeholder={t("province")}
                      onChange={this._saveStateVariable}
                      name="provincia_id"
                      required
                    >
                      <option value="">{t("select_option")}</option>
                      {this.state.province?.map((item, key) =>
                        item.id ===
                        this.state.customer_provider.provincia_id ? (
                          <option
                            value={item.id}
                            selected
                            defaultValue
                            key={key}
                          >
                            {item.nombre}
                          </option>
                        ) : (
                          <option value={item.id} key={key}>
                            {item.nombre}
                          </option>
                        ),
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col sm="12" xl="4">
                  <label className="txt-darkblue">{t("canton")}</label>
                  <Form.Group>
                    <Form.Select
                      placeholder={t("canton")}
                      onChange={this._saveStateVariable}
                      name="canton_id"
                      required
                    >
                      <option value="">{t("select_option")}</option>
                      {this.state.canton?.map((item, key) =>
                        item.id === this.state.customer_provider.canton_id ? (
                          <option
                            value={item.id}
                            selected
                            defaultValue
                            key={key}
                          >
                            {item.nombre}
                          </option>
                        ) : (
                          <option value={item.id} key={key}>
                            {item.nombre}
                          </option>
                        ),
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col sm="12" xl="4">
                  <label className="txt-darkblue">{t("district")}</label>
                  <Form.Group>
                    <Form.Select
                      placeholder={t("district")}
                      onChange={this._saveStateVariable}
                      name="distrito_id"
                      required
                    >
                      <option value="">{t("select_option")}</option>
                      {this.state.district?.map((item, key) =>
                        item.id === this.state.customer_provider.distrito_id ? (
                          <option
                            value={item.id}
                            selected
                            defaultValue
                            key={key}
                          >
                            {item.nombre}
                          </option>
                        ) : (
                          <option value={item.id} key={key}>
                            {item.nombre}
                          </option>
                        ),
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="12">
                  <label className="txt-darkblue">{t("address")}</label>
                  <Form.Group>
                    <Form.Control
                      placeholder={t("address")}
                      type="textarea"
                      onChange={this._saveStateVariable}
                      name="otrasSenas"
                      required
                      value={customer_provider.otrasSenas}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="m-2">
                <Col sm="12" xl="4">
                  <Form.Check // prettier-ignore
                    type="checkbox"
                    id="exonerado"
                    label={t("exonerated")}
                    name="exonerado"
                    onChange={this._saveStateVariable}
                    checked={customer_provider.exonerado}
                  />
                </Col>

                <Col sm="12" xl="4">
                  <Form.Check // prettier-ignore
                    type="checkbox"
                    id="estado"
                    label={t("active")}
                    name="estado"
                    onChange={this._saveStateVariable}
                    checked={customer_provider.estado}
                  />
                </Col>
              </Row>
           
              <div className="well">
                <Form onSubmit={this.addPhone}>
                  <Row className="m-2">
                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("code")}</label>
                      <Form.Group>
                        <Form.Control
                          placeholder={"+506"}
                          type="number"
                          name="codigo_pais"
                          required
                          maxLength={4}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("number")}</label>
                      <Form.Group>
                        <Form.Control
                          placeholder={t("number")}
                          type="number"
                          name="numero"
                          required
                          maxLength={20}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="m-2">
                    <Col sm="12" xl="6">
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="telefono_principal"
                        label={t("main")}
                        name="telefono_principal"
                        checked={this.state.telefonos?.findIndex(t => t.telefono_principal === 1) ===-1 }
                      />
                    </Col>
                    <Col sm="12" xl="6">
                      <Button
                        variant="primary"
                        className="btn-fill btn-rounded"
                        type="submit"
                      >
                        {t("add_phone")}
                      </Button>
                    </Col>
                  </Row>

                  <Row className="m-3">
                    <Col sm="12" xl="12">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>{t("id")}</th>
                            <th>{t("code")}</th>
                            <th>{t("number")}</th>
                            <th>{t("main")}</th>
                            <th>{t("action")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.telefonos.length > 0 &&
                            this.state.telefonos.map((line, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{line.codigo_pais}</td>
                                <td>{line.numero}</td>
                                <td>{line.telefono_principal === 1 ? t("yes") : t("no")}</td>
                                <td>
                                  <Button
                                    variant="danger"
                                    className="btn-fill btn-rounded"
                                    onClick={() => this.removeLine(index)}
                                  >
                                    {" "}
                                    <i className="fas fa-trash" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
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
              {this.state.processing ? (
                <div className="lds-dual-ring-2"></div>
              ) : (
                <Button
                  variant="primary"
                  className="btn-fill btn-rounded"
                  type="submit"
                  onClick={this.saveCustomerProvider}
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

export default withTranslation()(Customer_Provider);
