import React, { Component } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { withTranslation } from "react-i18next";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";
import alertSuccess from "../common/SweetAlert";

class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            processing: false,
            user: {
                usuario_id: 0,
                empresa: "",
                Nombre: "",
                apellido1: "",
                apellido2: "",
                correo: "",
                contrasena: "",
                id_Empleado: "",
                roles_id: 0,
                activo: false,
            },
        };

        this.currentUser = null;
    }

    //#region Funciones internas

    _saveStateVariable = async (e) => {
        const { name, type, checked, value } = e.target;
        await this.setState({
            user: {
                ...this.state.user,
                [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
            },
        });
    };

    getUserInfo = () => {
        let bytes = crypto.AES.decrypt(
            sessionStorage.getItem("user"),
            "@marsh_contable"
        );
        this.currentUser = JSON.parse(bytes.toString(crypto.enc.Utf8));
        this.getUserById(this.currentUser.usuario_id);
    };

    getUserById = (id) => {
        AppUtil.getAPI(`users/${id}`).then((response) => {
            let user = response ? response.data : {};
            this.setState({ user });
        });
    };

    saveUser = (e) => {
        const { t } = this.props;
        let { user } = this.state;

        e.preventDefault();
        e.stopPropagation();

        this.setState({ processing: true });

        const payload = { ...user };
        if (!payload.contrasena) {
            delete payload.contrasena;
        }

        AppUtil.putAPI(`users/${user.usuario_id}`, payload).then((response) => {
            this.setState({ processing: false });
            if (response && Number.isInteger(response.data)) {
                alertSuccess(t("updated_successfully"), "success", t);
                this.getUserById(user.usuario_id);
            } else {
                alertSuccess(t(response?.message ?? "error"), "error", t);
            }
        });
    };

    componentDidMount() {
        this.getUserInfo();
    }

    //#endregion

    render() {
        const { t } = this.props;
        let { user, processing } = this.state;

        return (
            <Container fluid>
                <Row>
                    <Col lg="6" sm="12">
                        <h1>{t("profile")}</h1>
                    </Col>
                </Row>

                <Row className="justify-content-center mt-3">
                    <Col lg="8" sm="12">
                        <Card>
                            <Card.Body>
                                <Form onSubmit={this.saveUser}>
                                    <Row className="m-2">
                                        <Col sm="12" xl="6">
                                            <label>{t("name")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("name")}
                                                    type="text"
                                                    onChange={this._saveStateVariable}
                                                    name="Nombre"
                                                    required
                                                    value={user.Nombre || user.nombre || ""}
                                                    maxLength={100}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col sm="12" xl="6">
                                            <label>{t("lastname")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("lastname")}
                                                    type="text"
                                                    onChange={this._saveStateVariable}
                                                    name="apellido1"
                                                    required
                                                    maxLength={100}
                                                    value={user.apellido1 || ""}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="m-2">
                                        <Col sm="12" xl="6">
                                            <label>{t("secondlastname")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("secondlastname")}
                                                    type="text"
                                                    onChange={this._saveStateVariable}
                                                    name="apellido2"
                                                    maxLength={100}
                                                    value={user.apellido2 || ""}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col sm="12" xl="6">
                                            <label>{t("email")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("email")}
                                                    type="email"
                                                    onChange={this._saveStateVariable}
                                                    name="correo"
                                                    required
                                                    maxLength={100}
                                                    value={user.correo || ""}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="m-2">
                                        <Col sm="12" xl="6">
                                            <label>{t("password")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("password")}
                                                    type="password"
                                                    onChange={this._saveStateVariable}
                                                    name="contrasena"
                                                    maxLength={20}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col sm="12" xl="6">
                                            <label>{t("employeeid")}</label>
                                            <Form.Group>
                                                <Form.Control
                                                    placeholder={t("employeeid")}
                                                    type="text"
                                                    onChange={this._saveStateVariable}
                                                    name="id_Empleado"
                                                    maxLength={20}
                                                    value={user.id_Empleado || ""}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="m-2 mt-4">
                                        <Col sm="12" className="d-flex justify-content-end">
                                            {processing ? (
                                                <div className="lds-dual-ring-2"></div>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                >
                                                    {t("save")}
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withTranslation()(Profile);