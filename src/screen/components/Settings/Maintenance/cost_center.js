import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
DataTable.use(DT);

class Cost_Center extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      cost_center: {
        id: 0,
        codigo: "",
        Nombre: "",
        Seudonimo: ""
      },
      costCenterList: []
    };
  }

  getCostCenter = () =>
    AppUtil.getAPI(`catalogos/centro_costos`, sessionStorage.getItem('token')).then(response => {
      let costCenterList = response ? response.data : [];
      this.setState({ costCenterList });
    });

  getCostCenterById = (id) =>
    AppUtil.getAPI(`catalogos/centro_costos/${id}`, sessionStorage.getItem('token')).then(response => {
      let cost_center = response ? response.data : {};
      this.setState({ cost_center, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    cost_center: { id: 0, codigo: "", Nombre: "", Seudonimo: "" }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      cost_center: {
        ...this.state.cost_center,
        [e.target.name]: e.target.value,
      },
    });
  };

  saveCostCenter = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.cost_center.id === 0) {
        AppUtil.postAPI(`catalogos/centro_costos`, this.state.cost_center).then(response => {
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
        AppUtil.putAPI(`catalogos/centro_costos/${this.state.cost_center.id}`, this.state.cost_center).then(response => {
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
    let { cost_center } = this.state;
    if (!AppUtil.isValidText(cost_center.codigo)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_codigo"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(cost_center.Nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_Nombre"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(cost_center.Seudonimo)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_Seudonimo"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getCostCenter();
  }

  ActionButtons = (rowData) => {
    return (
      <Row className="m-2">
        <Col lg="12" sm="12">
          <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getCostCenterById(rowData.id)}>
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
              <h1>{t("cost_center")}</h1>
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
              data={this.state.costCenterList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'codigo', title: t("code") },
                { data: 'Nombre', title: t("name") },
                { data: 'Seudonimo', title: t("pseudonym") },
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

          <Modal show={this.state.show} onHide={this.toggleShow} backdrop="static" keyboard={false} size="lg" className="max-z-index">
            <Form onSubmit={this.saveCostCenter}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("cost_center")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("code")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("code")} type="text" onChange={this._saveStateVariable} name="codigo" required maxLength={45} value={this.state.cost_center.codigo} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="Nombre" required maxLength={150} value={this.state.cost_center.Nombre} />
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("pseudonym")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("pseudonym")} type="text" onChange={this._saveStateVariable} name="Seudonimo" required maxLength={45} value={this.state.cost_center.Seudonimo} />
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

export default withTranslation()(Cost_Center)
