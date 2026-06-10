import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";

import AppUtil from "../../../../AppUtil/AppUtil";
import { url } from "screen/components/services/api";
import { withTranslation } from "react-i18next";
DataTable.use(DT);

class Cabys_Code extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      cabys_code: {
        id: 0,
        codigo: "",
        nombre: "",
        nombreImpuesto:"",
        impuesto_id: 0
      },
    
      taxes:[],
      token:""
    };
  }


     getTaxType = () =>
    AppUtil.getAPI(`catalogos/impuesto`).then(
      (response) => {
        let taxes = response ? response.data : [];
        this.setState({ taxes });
      },
    );

  getCabysCodeById = (id) =>
    AppUtil.getAPI(`catalogos/codigos_cabys/${id}`).then(response => {
      let cabys_code = response ? response.data : {};
      this.setState({ cabys_code, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    cabys_code: { id: 0, codigo: "", nombre: "", Impuesto_id: 0 }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      cabys_code: {
        ...this.state.cabys_code,
        [e.target.name]: e.target.value,
      },
    });
  };

  saveCabysCode = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.cabys_code.id === 0) {
        AppUtil.postAPI(`catalogos/codigos_cabys`, this.state.cabys_code).then(response => {
          if (response) {
            let data = response ? response.data : [];
            if (Number.isInteger(data)) {
              this.setState({ error: true, errorMsg: t("created_successfully"), color: "alert alert-success" }, () => { window.location.reload(); });
            } else {
              this.setState({ error: true, errorMsg: t(response.message), color: "alert alert-warning" });
            }
          } else {
            this.setState({ error: true, errorMsg: t('please_verify_data'), color: "alert alert-danger" });
          }
        });
      } else {
        AppUtil.putAPI(`catalogos/codigos_cabys/${this.state.cabys_code.id}`, this.state.cabys_code).then(response => {
          if (response) {
            let data = response ? response.data : [];
            if (Number.isInteger(data)) {
              this.setState({ error: true, errorMsg: t("updated_successfully"), color: "alert alert-success" }, () => { window.location.reload(); });
            } else {
              this.setState({ error: true, errorMsg: t(response.message), color: "alert alert-warning" });
            }
          } else {
            this.setState({ error: true, errorMsg: t('please_verify_data'), color: "alert alert-danger" });
          }
        });
      }
    }
  };

  validateForm = (t) => {
    let { cabys_code } = this.state;
    if (!AppUtil.isValidText(cabys_code.codigo)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_codigo"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(cabys_code.nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_nombre"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
   // this.getCabysCode();
    let token = sessionStorage.getItem("sessionId");
    this.setState({token});
    this.getTaxType()
  }

  ActionButtons = (rowData) => {
    return (
      <Row className="m-2">
        <Col lg="12" sm="12">
          <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getCabysCodeById(rowData.id)}>
            <i className="fas fa-pen" />
          </Button>
        </Col>
      </Row>
    );
  };

  render() {
    const { t } = this.props;
    let {token} = this.state;
    return (
      <>
        <Container fluid>
          <Row>
            <Col lg="6" sm="12">
              <h1>{t("cabys_code")}</h1>
            </Col>
            <Col lg="6" sm="12">
              <Row>
                <Col lg="6" sm="12">
                  <Button className="btn-fill btn-rounded bg-blue" onClick={this.toggleShow}>{t("create")}</Button>
                </Col>
                <Col lg="6" sm="12">
                  <Button className="btn-fill btn-rounded bg-blue" onClick={() => this.props.navigate(-1)}>{t("cancel")}</Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
           {token === "" ? <div></div> :<DataTable
              ajax={{url:`${url}catalogos/codigos_cabys`,
                type:'GET',
              
                headers:{
                'Accept': "application/json",
               "Content-Type": "application/json; charset=UTF-8", 
                 "X-Session-Id": token 
              },
         
                dataSrc: function(json){     
                
                json.recordsTotal = json.data.recordsTotal;
                json.recordsFiltered = json.data.recordsFiltered;
                json.draw = json.data.draw;
                return json.data.data;
                },
                dataType:"json",
                processing:true,
              }}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'codigo', title: t("code") },
                { data: 'nombre', title: t("name") },
                { data: 'nombreImpuesto', title: t("tax") },
                { title: t("action"), data: null, orderable: false, searchable: false, defaultContent:'' },
              ]}
              className="display table cell-border compact stripe"
              slots={{ 4: (cellData, rowData) => this.ActionButtons(rowData, cellData) }}          
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
                layout: {  topEnd: "search", bottomStart: 'info', bottomEnd: "paging" },
                crossDomain:true,
                processing:true,
                serverSide:true,
                searching:true
              }}
            />}
          </Row>

          <Modal show={this.state.show} onHide={this.toggleShow} backdrop="static" keyboard={false} size="lg" className="max-z-index">
            <Form onSubmit={this.saveCabysCode}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("cabys_code")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("code")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("code")} type="text" onChange={this._saveStateVariable} name="codigo" required maxLength={100} value={this.state.cabys_code.codigo} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="nombre" required maxLength={200} value={this.state.cabys_code.nombre} />
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("tax")}</label>
                       <Form.Group>
                                          <Form.Select placeholder={t("tax")} onChange={this._saveStateVariable} name="impuesto_id" required >
                                                  <option value="">{t("select_option")}</option>
                                            {this.state.taxes?.map((item, key) =>(item.id === this.state.cabys_code.impuesto_id  ? <option value={item.id} selected defaultValue key={key}>{item.nombre}</option> :  <option value={item.id} key={key}>{item.nombre}</option>))}                     
                                         </Form.Select>
                                     
                                     </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" className="btn-rounded" onClick={this.toggleShow}>{t("close")}</Button>
                {this.state.processing ? <div className="lds-dual-ring-2"></div> : <Button variant="primary" className="btn-fill btn-rounded" type="submit">{t("save")}</Button>}
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </>
    );
  }
}

export default withTranslation()(Cabys_Code)
