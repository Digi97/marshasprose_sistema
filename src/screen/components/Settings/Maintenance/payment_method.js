import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
DataTable.use(DT);

class Payment_Method extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      payment_method: {
        id: 0,
        codigo: "",
        descripcion: ""
      },
      paymentMethodList: []
    };
  }

  getPaymentMethod = () =>
    AppUtil.getAPI(`catalogos/medio_pago`).then(response => {
      let paymentMethodList = response ? response.data : [];
      this.setState({ paymentMethodList });
    });

  getPaymentMethodById = (id) =>
    AppUtil.getAPI(`catalogos/medio_pago/${id}`).then(response => {
      let payment_method = response ? response.data : {};
      this.setState({ payment_method, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    payment_method: { id: 0, codigo: "", descripcion: "" }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      payment_method: {
        ...this.state.payment_method,
        [e.target.name]: e.target.value,
      },
    });
  };

  savePaymentMethod = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.payment_method.id === 0) {
        AppUtil.postAPI(`catalogos/medio_pago`, this.state.payment_method).then(response => {
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
        AppUtil.putAPI(`catalogos/medio_pago/${this.state.payment_method.id}`, this.state.payment_method).then(response => {
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
    let { payment_method } = this.state;
    if (!AppUtil.isValidText(payment_method.codigo)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_codigo"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(payment_method.descripcion)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_descripcion"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getPaymentMethod();
  }

  ActionButtons = (rowData) => {
    return (
      <Row className="m-2">
        <Col lg="12" sm="12">
          <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getPaymentMethodById(rowData.id)}>
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
              <h1>{t("payment_method")}</h1>
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
              data={this.state.paymentMethodList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'codigo', title: t("code") },
                { data: 'descripcion', title: t("name") },
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

          <Modal show={this.state.show} onHide={this.toggleShow} backdrop="static" keyboard={false} size="lg" className="max-z-index">
            <Form onSubmit={this.savePaymentMethod}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("payment_method")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("code")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("code")} type="text" onChange={this._saveStateVariable} name="codigo" required maxLength={5} value={this.state.payment_method.codigo} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="descripcion" required maxLength={150} value={this.state.payment_method.descripcion} />
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

export default withTranslation()(Payment_Method)
