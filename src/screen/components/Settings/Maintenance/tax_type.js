import React, { Component } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
import ActionButtons from '../../common/ActionButtons'
DataTable.use(DT);

class Tax_Type extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      tax_type: {
        id: 0,
        nombre: "",
        porcentaje: 0,
        codigo: "",
        tarifaIVACodigo: "",
        tarifaIVANombre: "",
      },
      taxTypeList: [],
    };
  }

  getTaxType = () =>
    AppUtil.getAPI(`catalogos/impuesto`).then(
      (response) => {
        let taxTypeList = response ? response.data : [];
        this.setState({ taxTypeList });
      },
    );

  getTaxTypeById = (id) =>
    AppUtil.getAPI(
      `catalogos/impuesto/${id}`,
    ).then((response) => {
      let tax_type = response ? response.data : {};
      this.setState({ tax_type, show: true });
    });

  //#region Funciones internas
  toggleShow = () =>
    this.setState({
      show: !this.state.show,
      tax_type: { id: 0, nombre: "", porcentaje: 0, codigo: "" },
    });

  _saveStateVariable = async (e) => {
    await this.setState({
      tax_type: {
        ...this.state.tax_type,
        [e.target.name]: e.target.value,
      },
    });
  };

  saveTaxType = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.tax_type.id === 0) {
        AppUtil.postAPI(`catalogos/impuesto`, this.state.tax_type).then(
          (response) => {
            
            if (response) {
              let data = response ? response.data : [];
              if (Number.isInteger(data)) {
                this.setState(
                  {
                    error: true,
                    errorMsg: t("created_successfully"),
                    color: "alert alert-success",
                  },
                  () => {
                    window.location.reload();
                  },
                );
              } else {
                this.setState({
                  error: true,
                  errorMsg: t(response.message),
                  color: "alert alert-warning",
                });
              }
            } else {
              this.setState({
                error: true,
                errorMsg: t("please_verify_data"),
                color: "alert alert-danger",
              });
            }
          },
        );
      } else {
        AppUtil.putAPI(
          `catalogos/impuesto/${this.state.tax_type.id}`,
          this.state.tax_type,
        ).then((response) => {
          

          if (response) {
            let data = response ? response.data : [];
            if (Number.isInteger(data)) {
              this.setState(
                {
                  error: true,
                  errorMsg: t("updated_successfully"),
                  color: "alert alert-success",
                },
                () => {
                  window.location.reload();
                },
              );
            } else {
              this.setState({
                error: true,
                errorMsg: t(response.message),
                color: "alert alert-warning",
              });
            }
          } else {
            this.setState({
              error: true,
              errorMsg: t("please_verify_data"),
              color: "alert alert-danger",
            });
          }
        });
      }
    }
  };

  validateForm = (t) => {
    let { tax_type } = this.state;
    if (!AppUtil.isValidText(tax_type.nombre)) {
      this.setState({
        error: true,
        errorMsg: t("invalid_string_form_nombre"),
        color: "alert alert-warning",
      });
      return false;
    }
    if (!AppUtil.isValidText(tax_type.codigo)) {
      this.setState({
        error: true,
        errorMsg: t("invalid_string_form_codigo"),
        color: "alert alert-warning",
      });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getTaxType();
  }


                ActionButtons = (rowData) => (
      <ActionButtons 
      editAction={() => this.getTaxTypeById(rowData.id)}
      />
    );


  render() {
    const { t } = this.props;
    return (
      <>
        <Container fluid>
          <Row>
            <Col lg="6" sm="12">
              <h1>{t("tax_type")}</h1>
            </Col>
            <Col lg="6" sm="12">
              <Row>
                <Col lg="6" sm="12">
                  <Button
                    className=" "
                    onClick={this.toggleShow}
                  >
                    {t("create")}
                  </Button>
                </Col>
                <Col lg="6" sm="12">
                  <Button
                    className=" "
                    onClick={() => this.props.navigate(-1)}
                  >
                    {t("cancel")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
            <DataTable
              data={this.state.taxTypeList}
              columns={[
                { data: "id", title: t("id") },
                { data: "codigo", title: t("code") },
                { data: "nombre", title: t("name") },
                { data: "porcentaje", title: t("percentage") },
                { data: "tarifaIVACodigo", title: t("iva_tax_code") },
                { data: "tarifaIVANombre", title: t("iva_tax_name") },
                {
                  title: t("action"),
                  data: null,
                  orderable: false,
                  searchable: false,
                },
              ]}
              className="display table cell-border compact stripe"
              slots={{
                6: (cellData, rowData) => this.ActionButtons(rowData, cellData),
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
                  topStart: "pageLength",
                  topEnd: "search",
                  bottomStart: "info",
                  bottomEnd: "paging",
                },
              }}
            />
          </Row>

          <Modal
            show={this.state.show}
            onHide={this.toggleShow}
            backdrop="static"
            keyboard={false}
            size="lg"
            
          >
            <Form onSubmit={this.saveTaxType}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("tax_type")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">
                  {this.state.errorMsg}
                </div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("name")}</label>
                    <Form.Group>
                      <Form.Control
                        placeholder={t("name")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="nombre"
                        required
                        maxLength={100}
                        value={this.state.tax_type.nombre}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("code")}</label>
                    <Form.Group>
                      <Form.Control
                        placeholder={t("code")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="codigo"
                        required
                        maxLength={2}
                        value={this.state.tax_type.codigo}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("percentage")}</label>
                    <Form.Group>
                      <Form.Control
                        placeholder={t("percentage")}
                        type="number"
                        onChange={this._saveStateVariable}
                        name="porcentaje"
                        required
                        value={this.state.tax_type.porcentaje}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("iva_tax_code")}</label>
                    <Form.Group>
                      <Form.Control
                        placeholder={t("iva_tax_code")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="tarifaIVACodigo"
                        maxLength={2}
                        value={this.state.tax_type.tarifaIVACodigo}
                      />
                    </Form.Group>
                  </Col>
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("iva_tax_name")}</label>
                    <Form.Group>
                      <Form.Control
                        placeholder={t("iva_tax_name")}
                        onChange={this._saveStateVariable}
                        name="tarifaIVANombre"
                        value={this.state.tax_type.tarifaIVANombre}
                      />
                    </Form.Group>
                  </Col>
                </Row>
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
                    className=""
                    type="submit"
                  >
                    {t("save")}
                  </Button>
                )}
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </>
    );
  }
}

export default withTranslation()(Tax_Type);
