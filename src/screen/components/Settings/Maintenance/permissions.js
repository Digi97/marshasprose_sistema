import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form} from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
import ActionButtons from '../../common/ActionButtons'
DataTable.use(DT);

class Permissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      processing: false,
      permissions: {
        id: 0,
        Nombre: "",
        descripcion: ""
      },
      permissionsList: []
    };
  }

  getPermissions = () =>
    AppUtil.getAPI(`catalogos/permisos`).then(response => {
      let permissionsList = response ? response.data : [];
      this.setState({ permissionsList });
    });

   
  getPermissionsById = (id) =>
    AppUtil.getAPI(`catalogos/permisos/${id}`).then(response => {
      let permissions = response ? response.data : {};
      this.setState({ permissions, show: true });
    });

  //#region Funciones internas
  toggleShow = () => this.setState({
    show: !this.state.show,
    permissions: { id: 0, Nombre: "", descripcion: "" }
  });

  _saveStateVariable = async (e) => {
    await this.setState({
      permissions: {
        ...this.state.permissions,
        [e.target.name]: e.target.value,
      },
    });
  };

  savePermissions = (e) => {
    const { t } = this.props;
    e.preventDefault();
    e.stopPropagation();

    if (this.validateForm(t)) {
      if (this.state.permissions.id === 0) {
        AppUtil.postAPI(`catalogos/permisos`, this.state.permissions).then(response => {
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
        AppUtil.putAPI(`catalogos/permisos/${this.state.permissions.id}`, this.state.permissions).then(response => {
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
    let { permissions } = this.state;
    if (!AppUtil.isValidText(permissions.Nombre)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_Nombre"), color: "alert alert-warning" });
      return false;
    }
    if (!AppUtil.isValidText(permissions.descripcion)) {
      this.setState({ error: true, errorMsg: t("invalid_string_form_descripcion"), color: "alert alert-warning" });
      return false;
    }
    return true;
  };
  //#endregion fin funciones internas

  componentDidMount() {
    this.getPermissions();
  }

  
          ActionButtons = (rowData) => (
      <ActionButtons 
      editAction={() => this.getPermissionsById(rowData.id)}
      />
    );


  render() {
    const { t } = this.props;
    return (
      <>
        <Container fluid>
          
 <Row>
            <Col lg="6" sm="12">
              <h1>{t("permissions")}</h1>
            </Col>
            <Col lg="6" sm="12">
              <Row>               
                <Col lg="6" sm="12">
                  <Button className=" " onClick={() => this.props.navigate(-1)}>{t("cancel")}</Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row>
            <DataTable
              data={this.state.permissionsList}
              columns={[
                { data: 'id', title: t("id") },
                { data: 'nombre', title: t("name") },
                { data: 'descripcion', title: t("description") },
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
            <Form onSubmit={this.savePermissions}>
              <Modal.Header closeButton>
                <h3 className="tituloFerias">{t("permissions")}</h3>
              </Modal.Header>
              {this.state.error === true && (
                <div className={this.state.color} role="alert">{this.state.errorMsg}</div>
              )}
              <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("name")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("name")} type="text" onChange={this._saveStateVariable} name="Nombre" required maxLength={100} value={this.state.permissions.Nombre} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("description")}</label>
                    <Form.Group>
                      <Form.Control placeholder={t("description")} type="text" onChange={this._saveStateVariable} name="descripcion" required maxLength={200} value={this.state.permissions.descripcion} />
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

export default withTranslation()(Permissions)
