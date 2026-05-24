import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
DataTable.use(DT);
//TODO ARREGLAR NUEVO CAMPO DE TIPO MONEDA 

class Accounting_account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      accountingAccount: {
        id: 0,
        Codigo: "",
        nombre: "",
        Tipo_Cuenta_Contable_id: 0,
        Usuarios_Usuario_id: 0,
        Estado: false,
        Saldo_inicial: 0,
        Saldo_actual: 0,
        tipo_moneda_id:0
      },
      currencyList:[],
      accountingAccountList: []
    };
  }

  getAccountingAccount = () =>
    AppUtil.getAPI(`catalogos/cuentas_contables`, sessionStorage.getItem('token')).then(response => {
      let accountingAccountList = response ? response.data : [];
      this.setState({ accountingAccountList });
    });
     getCurrency = () =>
    AppUtil.getAPI(`catalogos/tipo_moneda`, sessionStorage.getItem('token')).then(response => {
      let currencyList = response ? response.data : [];
      console.log(currencyList);
      
      this.setState({ currencyList });
    });

  getAccountingAccountById = (id) =>
    AppUtil.getAPI(`catalogos/cuentas_contables/${id}`, sessionStorage.getItem('token')).then(response => {
      let accountingAccount = response ? response.data : {};
      this.setState({ accountingAccount, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    accountingAccount: { id: 0, Codigo: "", nombre: "", Tipo_Cuenta_Contable_id: 0, Usuarios_Usuario_id: 0, Estado: false, Saldo_inicial: 0, Saldo_actual: 0 }
  });

  _saveStateVariable = async (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    await this.setState({
      accountingAccount: {
        ...this.state.accountingAccount,
        [e.target.name]: value,
      },
    });
  };

  saveAccountingAccount = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.accountingAccount.id === 0) {
        AppUtil.postAPI(`catalogos/cuentas_contables`, this.state.accountingAccount).then(response => {
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
        AppUtil.putAPI(`catalogos/cuentas_contables/${this.state.accountingAccount.id}`, this.state.accountingAccount).then(response => {
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
    let { accountingAccount } = this.state;
    if (!AppUtil.isValidText(accountingAccount.Codigo)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_Codigo"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(accountingAccount.nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_nombre"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getCurrency();
    this.getAccountingAccount();
  }

  ActionButtons = (rowData) => {
    return (
      <Row className="m-2">
        <Col lg="12" sm="12">
          <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getAccountingAccountById(rowData.id)}>
            <i className="fas fa-pen" />
          </Button>
        </Col>
      </Row>
    );
  };

  render() {
    const { t } = this.props;
    return (
      <>
        <Container fluid>
          <Row>
            <Col lg="6" sm="12">
              <h1>{t("accounting_account")}</h1>
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
            <DataTable
              data={this.state.accountingAccountList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'Codigo', title: t("code") },
                { data: 'nombre', title: t("name") },
                { data: 'Tipo_Cuenta_Contable_id', title: t("type_accounting_account") },
                { data: 'Estado', title: t("active") },
                { data: 'Saldo_inicial', title: t("inicial_amount") },
                { data: 'Saldo_actual', title: t("current_amount") },
                { title: t("action"), data: null, orderable: false, searchable: false },
              ]}
              className="display table cell-border compact stripe"
              slots={{ 7: (cellData, rowData) => this.ActionButtons(rowData, cellData) }}
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
                layout: { topStart: "pageLength", topEnd: "search", bottomStart: 'info', bottomEnd: "paging" }
              }}
            />
          </Row>

          <Modal show={this.state.show} onHide={this.toggleShow} backdrop="static" keyboard={false} size="lg" className="max-z-index">
            <Form onSubmit={this.saveAccountingAccount}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("accounting_account")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("code")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("code")} type="text" onChange={this._saveStateVariable} name="Codigo" required maxLength={100} value={this.state.accountingAccount.Codigo} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="nombre" required maxLength={200} value={this.state.accountingAccount.nombre} />
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("type_accounting_account")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("type_accounting_account")} type="number" onChange={this._saveStateVariable} name="Tipo_Cuenta_Contable_id" required value={this.state.accountingAccount.Tipo_Cuenta_Contable_id} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("inicial_amount")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("inicial_amount")} type="number" onChange={this._saveStateVariable} name="Saldo_inicial" required value={this.state.accountingAccount.Saldo_inicial} />
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("current_amount")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("current_amount")} type="number" onChange={this._saveStateVariable} name="Saldo_actual" required value={this.state.accountingAccount.Saldo_actual} />
                    </Form.Group>
                  </Col>

                   <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("currency")}</label>
                    <Form.Group>
                      <Form.Select placeholder={t("currency")} 
                      onChange={this._saveStateVariable} name="tipo_moneda_id" required >
                           {currencyList?.map((item, key) =>(item.id === accountingAccount.tipo_moneda_id  ? <option value={item.id} selected defaultValue key={key}>{item.nombre}</option> :  <option value={item.id} key={key}>{item.nombre}</option>))}
                         
                        </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="12">
                    <Form.Group>
                      <Form.Check type="checkbox" id="Estado" label={t("active")} name="Estado" onChange={this._saveStateVariable} checked={this.state.accountingAccount.Estado} />
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

export default withTranslation()(Accounting_account)
