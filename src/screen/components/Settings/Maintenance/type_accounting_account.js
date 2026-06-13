import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
import ActionButtons from '../../common/ActionButtons'
DataTable.use(DT);

class Type_Accounting_Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      type_accounting_account: {
        id: 0,
        nombre: "",
        naturaleza: ""
      },
      typeAccountingAccountList: []
    };
  }

  getTypeAccountingAccount = () =>
    AppUtil.getAPI(`catalogos/tipo_cuenta_contable`).then(response => {
      let typeAccountingAccountList = response ? response.data : [];
      this.setState({ typeAccountingAccountList });
    });

  getTypeAccountingAccountById = (id) =>
    AppUtil.getAPI(`catalogos/tipo_cuenta_contable/${id}`).then(response => {
      let type_accounting_account = response ? response.data : {};
      this.setState({ type_accounting_account, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    type_accounting_account: { id: 0, nombre: "", naturaleza: "" }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      type_accounting_account: {
        ...this.state.type_accounting_account,
        [e.target.name]: e.target.value,
      },
    });
  };

  saveTypeAccountingAccount = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.type_accounting_account.id === 0) {
        AppUtil.postAPI(`catalogos/tipo_cuenta_contable`, this.state.type_accounting_account).then(response => {
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
        AppUtil.putAPI(`catalogos/tipo_cuenta_contable/${this.state.type_accounting_account.id}`, this.state.type_accounting_account).then(response => {
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
    let { type_accounting_account } = this.state;
    if (!AppUtil.isValidText(type_accounting_account.nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_nombre"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(type_accounting_account.naturaleza)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_naturaleza"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getTypeAccountingAccount();
  }


                ActionButtons = (rowData) => (
      <ActionButtons 
      editAction={() => this.getTypeAccountingAccountById(rowData.id)}
      />
    );

  

  render() {
    const { t } = this.props;
    return (
      <>
        <Container fluid>
          <Row>
            <Col lg="6" sm="12">
              <h1>{t("type_accounting_account")}</h1>
            </Col>
            <Col lg="6" sm="12">
              <Row>
                <Col lg="6" sm="12">
                  <Button className=" " onClick={this.toggleShow}>{t("create")}</Button>
                </Col>
                <Col lg="6" sm="12">
                  <Button className=" " onClick={() => this.props.navigate(-1)}>{t("cancel")}</Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
            <DataTable
              data={this.state.typeAccountingAccountList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'nombre', title: t("name") },
                { data: 'naturaleza', title: t("nature") },
                { title: t("action"), data: null, orderable: false, searchable: false },
              ]}
              className="display table cell-border compact stripe"
              slots={{ 3: (cellData, rowData) => this.ActionButtons(rowData, cellData) }}
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

          <Modal show={this.state.show} onHide={this.toggleShow} backdrop="static" keyboard={false} size="lg" >
            <Form onSubmit={this.saveTypeAccountingAccount}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("type_accounting_account")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="nombre" required maxLength={100} value={this.state.type_accounting_account.nombre} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("nature")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("nature")} type="text" onChange={this._saveStateVariable} name="naturaleza" required maxLength={100} value={this.state.type_accounting_account.naturaleza} />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="light" className="btn-rounded" onClick={this.toggleShow}>{t("close")}</Button>
                {this.state.processing ? <div className="lds-dual-ring-2"></div> : <Button variant="primary" className="" type="submit">{t("save")}</Button>}
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </>
    );
  }
}

export default withTranslation()(Type_Accounting_Account)
