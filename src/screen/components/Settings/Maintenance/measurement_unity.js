import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
DataTable.use(DT);

class Measurement_Unity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      measurement_unity: {
        id: 0,
        Codigo: "",
        nombre: ""
      },
      measurementUnityList: []
    };
  }

  getMeasurementUnity = () =>
    AppUtil.getAPI(`catalogos/unidad_medida`, sessionStorage.getItem('token')).then(response => {
      let measurementUnityList = response ? response.data : [];
      this.setState({ measurementUnityList });
    });

  getMeasurementUnityById = (id) =>
    AppUtil.getAPI(`catalogos/unidad_medida/${id}`, sessionStorage.getItem('token')).then(response => {
      let measurement_unity = response ? response.data : {};
      this.setState({ measurement_unity, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    measurement_unity: { id: 0, Codigo: "", nombre: "" }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      measurement_unity: {
        ...this.state.measurement_unity,
        [e.target.name]: e.target.value,
      },
    });
  };

  saveMeasurementUnity = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.measurement_unity.id === 0) {
        AppUtil.postAPI(`catalogos/unidad_medida`, this.state.measurement_unity).then(response => {
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
        AppUtil.putAPI(`catalogos/unidad_medida/${this.state.measurement_unity.id}`, this.state.measurement_unity).then(response => {
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
    let { measurement_unity } = this.state;
    if (!AppUtil.isValidText(measurement_unity.Codigo)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_Codigo"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(measurement_unity.nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_nombre"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getMeasurementUnity();
  }

  ActionButtons = (rowData) => {
    return (
      <Row className="m-2">
        <Col lg="12" sm="12">
          <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getMeasurementUnityById(rowData.id)}>
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
              <h1>{t("measurement_unity")}</h1>
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
              data={this.state.measurementUnityList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'Codigo', title: t("code") },
                { data: 'nombre', title: t("name") },
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
            <Form onSubmit={this.saveMeasurementUnity}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("measurement_unity")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("code")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("code")} type="text" onChange={this._saveStateVariable} name="Codigo" required maxLength={45} value={this.state.measurement_unity.Codigo} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="nombre" required maxLength={150} value={this.state.measurement_unity.nombre} />
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

export default withTranslation()(Measurement_Unity)
