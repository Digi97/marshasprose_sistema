import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
DataTable.use(DT);

class Presupuestary_Category extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      presupuestary_category: {
        id: 0,
        nombre: "",
        tipo_categoria: ""
      },
      presupuestaryCategoryList: []
    };
  }

  getPresupuestaryCategory = () =>
    AppUtil.getAPI(`catalogos/categoria_presupuestaria`, sessionStorage.getItem('token')).then(response => {
      let presupuestaryCategoryList = response ? response.data : [];
      this.setState({ presupuestaryCategoryList });
    });

  getPresupuestaryCategoryById = (id) =>
    AppUtil.getAPI(`catalogos/categoria_presupuestaria/${id}`, sessionStorage.getItem('token')).then(response => {
      let presupuestary_category = response ? response.data : {};
      this.setState({ presupuestary_category, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    presupuestary_category: { id: 0, nombre: "", tipo_categoria: "" }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      presupuestary_category: {
        ...this.state.presupuestary_category,
        [e.target.name]: e.target.value,
      },
    });
  };

  savePresupuestaryCategory = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.presupuestary_category.id === 0) {
        AppUtil.postAPI(`catalogos/categoria_presupuestaria`, this.state.presupuestary_category).then(response => {
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
        AppUtil.putAPI(`catalogos/categoria_presupuestaria/${this.state.presupuestary_category.id}`, this.state.presupuestary_category).then(response => {
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
    let { presupuestary_category } = this.state;
    if (!AppUtil.isValidText(presupuestary_category.nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_nombre"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(presupuestary_category.tipo_categoria)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_tipo_categoria"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getPresupuestaryCategory();
  }

  ActionButtons = (rowData) => {
    return (
      <Row className="m-2">
        <Col lg="12" sm="12">
          <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getPresupuestaryCategoryById(rowData.id)}>
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
              <h1>{t("presupuestary_category")}</h1>
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
              data={this.state.presupuestaryCategoryList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'nombre', title: t("name") },
                { data: 'tipo_categoria', title: t("description") },
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
            <Form onSubmit={this.savePresupuestaryCategory}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("presupuestary_category")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="nombre" required maxLength={100} value={this.state.presupuestary_category.nombre} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("description")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("description")} type="text" onChange={this._saveStateVariable} name="tipo_categoria" required maxLength={100} value={this.state.presupuestary_category.tipo_categoria} />
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

export default withTranslation()(Presupuestary_Category)
