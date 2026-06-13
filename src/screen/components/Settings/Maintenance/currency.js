import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
import ActionButtons from '../../common/ActionButtons'
DataTable.use(DT);


class Currency extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      currency: {
        id: 0,
        codigo_moneda: "",
        nombre: "",
        simbolo:""
      },
      currencyList: []
    };
  }

  getCurrency = () =>
    AppUtil.getAPI(`catalogos/tipo_moneda`).then(response => {
      let currencyList = response ? response.data : [];
    
      
      this.setState({ currencyList });
    });

  getCurrencyById = (id) =>
    AppUtil.getAPI(`catalogos/tipo_moneda/${id}`).then(response => {
      let currency = response ? response.data : {};
      this.setState({ currency, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    currency: { id: 0, codigo_moneda: "", nombre: "" }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      currency: {
        ...this.state.currency,
        [e.target.name]: e.target.value,
      },
    });
  };

  saveCurrency = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.currency.id === 0) {
        AppUtil.postAPI(`catalogos/tipo_moneda`, this.state.currency).then(response => {
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
        AppUtil.putAPI(`catalogos/tipo_moneda/${this.state.currency.id}`, this.state.currency).then(response => {
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
    let { currency } = this.state;
    if (!AppUtil.isValidText(currency.codigo_moneda)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_codigo_moneda"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(currency.nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_nombre"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getCurrency();
  }

  ActionButtons = (rowData) => (
      <ActionButtons 
      editAction={() => this.getCurrencyById(rowData.id)}
      />
    );

  render() {
    const { t } = this.props;
    return (
      <>
        <Container fluid>
          <Row>
            <Col lg="6" sm="12">
              <h1>{t("currency")}</h1>
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
              data={this.state.currencyList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'codigo_moneda', title: t("code") },
                { data: 'nombre', title: t("currency") },
                { data: 'simbolo', title: t("symbol") },
                { title: t("action"), data: null, orderable: false, searchable: false },
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
                layout: { topStart: "pageLength", topEnd: "search", bottomStart: 'info', bottomEnd: "paging" }
              }}
            />
          </Row>

          <Modal show={this.state.show} onHide={this.toggleShow} backdrop="static" keyboard={false} size="lg" >
            <Form onSubmit={this.saveCurrency}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("currency")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label>{t("code")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("code")} type="text" onChange={this._saveStateVariable} name="codigo_moneda" required maxLength={3} value={this.state.currency.codigo_moneda} />
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="6">
                    <label>{t("symbol")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("symbol")} type="text" onChange={this._saveStateVariable} name="simbolo" required maxLength={3} value={this.state.currency.simbolo} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("currency")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="nombre" required maxLength={20} value={this.state.currency.nombre} />
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

export default withTranslation()(Currency)
