import React, { Component } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import {
    Container,
    Row,
    Col,
    Button,
    Modal,
    Form,
    Table,
} from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
import ActionButtons from '../../common/ActionButtons'

DataTable.use(DT);

class Rol extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            processing: false,
            rol: {
                id: 0,
                descripcion: "",
            },
            rolList: [],
            permissions: [],
            permission_x_rol: [],
            nombrePermiso: "",
            permisos_id: 0,
        };
    }

    getRol = () =>
        AppUtil.getAPI(`catalogos/roles`).then(
            (response) => {
                let rolList = response ? response.data : [];
                this.setState({ rolList });
            }
        );

    getPermissions = () =>
        AppUtil.getAPI(
            `catalogos/permisos`
        ).then((response) => {
            let permissions = response ? response.data : [];
            this.setState({ permissions });
        });

    getPermissionsPerRol = (id) =>
        AppUtil.getAPI(
            `catalogos/permisos_x_rol/${id}`
        ).then((response) => {
            let permission_x_rol = response ? response.data : [];
            this.setState({ permission_x_rol });
        });

    getRolById = (id) =>
        AppUtil.getAPI(
            `catalogos/roles/${id}`
        ).then((response) => {
            let rol = response ? response.data : {};
            let permission_x_rol = rol.permisosRol;
            delete rol.permisosRol;

            this.setState({ rol, show: true, permission_x_rol });
        });

    //#region Funciones internas
    toggleShow = () =>
        this.setState({
            show: !this.state.show,
            rol: { id: 0, descripcion: "" },
        });

    removeLine = (index) => {
        this.setState((prevState) => ({
            permission_x_rol: prevState.permission_x_rol.filter(
                (_, i) => i !== index
            ),
        }));
    };

    _saveStateVariable = async (e) => {
        await this.setState({
            rol: {
                ...this.state.rol,
                [e.target.name]: e.target.value,
            },
        });
    };

    saveRol = (e) => {
        const { t } = this.props;
        e.preventDefault();
        e.stopPropagation();

        let { rol, permission_x_rol } = this.state;

        rol.PermisosRol = permission_x_rol;

        if (this.validateForm(t)) {
            if (rol.id === 0) {
                AppUtil.postAPI(`catalogos/roles`, rol).then((response) => {
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
                                }
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
            } else {
                AppUtil.putAPI(`catalogos/roles/${rol.id}`, rol).then(
                    (response) => {
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
                                    }
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
                    }
                );
            }
        }
    };

    validateForm = (t) => {
        let { rol } = this.state;
        if (!AppUtil.isValidText(rol.descripcion)) {
            this.setState({
                error: true,
                errorMsg: t("invalid_string_form_descripcion"),
                color: "alert alert-warning",
            });
            return false;
        }
        return true;
    };

    addLine = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Obtener el label (texto) de la opción seleccionada
        //const NombrePermiso = selectPermiso.options[selectPermiso.selectedIndex].text;

        const newLine = {
            permisos_id: this.state.permisos_id,
            nombrePermiso: this.state.nombrePermiso,
            roles_id: parseInt(this.state.rol.id) || 0,
        };

        // Recalcular totales del encabezado
        this.setState((prevState) => ({
            permission_x_rol: [...prevState.permission_x_rol, newLine],
        }));
    };

    //#endregion fin funciones internas

    componentDidMount() {
        this.getRol();
        this.getPermissions();
    }

              ActionButtons = (rowData) => (
      <ActionButtons 
      editAction={() => this.getRolById(rowData.id)}
      />
    );



    render() {
        const { t } = this.props;
        let { permissions, permission_x_rol } = this.state;
        return (
            <>
                <Container fluid>
                    <Row>
                        <Col lg="6" sm="12">
                            <h1>{t("rol")}</h1>
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
                            data={this.state.rolList}
                            columns={[
                                { data: "id", title: t("id") },
                                { data: "descripcion", title: t("name") },
                                {
                                    title: t("action"),
                                    data: null,
                                    orderable: false,
                                    searchable: false,
                                },
                            ]}
                            className="display table cell-border compact stripe"
                            slots={{
                                2: (cellData, rowData) =>
                                    this.ActionButtons(rowData, cellData),
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
                        <Modal.Header closeButton>
                            <h3 className="tituloFerias">{t("rol")}</h3>
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
                                            name="descripcion"
                                            required
                                            maxLength={100}
                                            value={this.state.rol.descripcion}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form onSubmit={this.addLine}>
                                <Row className="m-4">
                                    <Col sm="12" xl="12">
                                        <label>{t("permission")}</label>
                                        <Form.Group>
                                            <Form.Select
                                                name="permiso_id"
                                                onChange={(e) => {
                                                    const selectedOption =
                                                        e.target.options[
                                                            e.target
                                                                .selectedIndex
                                                        ];
                                                    this.setState({
                                                        permisos_id:
                                                            parseInt(
                                                                e.target.value
                                                            ) || 0,
                                                        nombrePermiso:
                                                            selectedOption.text,
                                                    });
                                                }}
                                                required
                                            >
                                                <option value="">
                                                    {t("select_option")}
                                                </option>
                                                {permissions?.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                        disabled={permission_x_rol.some(
                                                            (p) =>
                                                                p.permisos_id ===
                                                                item.id
                                                        )}
                                                    >
                                                        {item.nombre}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col sm="12" xl="12">
                                        <Button
                                            variant="primary"
                                            className=""
                                            type="submit"
                                        >
                                            {t("add")}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>

                            <Row className="m-3">
                                <Col sm="12" xl="12">
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{t("name")}</th>
                                                <th>{t("action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {permission_x_rol.length > 0 &&
                                                permission_x_rol.map(
                                                    (line, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                {
                                                                    line.nombrePermiso
                                                                }
                                                            </td>

                                                            <td>
                                                                <Button
                                                                    variant="danger"
                                                                    className=""
                                                                    onClick={() =>
                                                                        this.removeLine(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fas fa-trash" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                        </tbody>
                                    </Table>
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
                                    onClick={this.saveRol}
                                >
                                    {t("save")}
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal>
                </Container>
            </>
        );
    }
}

export default withTranslation()(Rol);
