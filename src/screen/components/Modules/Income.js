import React, { Component, createRef } from "react";

import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { url } from "screen/components/services/api";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";
import Select from "react-select";
import { withTranslation } from "react-i18next";
import moment from "moment-timezone";
import alertSuccess from "../common/SweetAlert";
import ActionButtons from "../common/ActionButtons";
import SlideDown from "../common/SlideDown";

DataTable.use(DT);

class Income extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tableData: [],
            show: false,
            isView: false,
            processing: true,

            // Objeto principal del ingreso
            income: {
                id: 0,
                codigo: "",
                tipo_moneda_id: 0,
                estado_Factura_id: 1,
                medio_pago_id: 0,
                clientes_id: 0,
                subtotal: 0,
                impuesto: 0,
                total: 0,
                descuento: 0,
                cambio_venta: localStorage.getItem("dolar_venta"),
                cambio_compra: localStorage.getItem("dolar_compra"),
                usuarios_Usuario_id: 0,
                facturas_id: null,
                createElectronicDoc: 0,
                condicion_venta_id: 0,
                banco_id: "",
                dias_credito: "",
            },

            AuxLine: {
                total: "",
                subtotal: "",
                descuento: "",
                impuesto: "",
                porcentaje: 0,
                cantidad: 1,
            },

            // Líneas de detalle
            lines: [],

            // Catálogos
            customers: [],
            paymentMethods: [],
            commercialCodes: [],
            taxes: [],
            currency: [],
            invoiceStates: [],
            saleConditions: [],
            token: "",
            bancos: [],
        };

        this.user = null;
        this.datatableRef = createRef();
        this.impuestoSelectRef = createRef();
    }

    componentDidMount() {
        this.getUserInfo();
    }

    getBanks = () =>
        AppUtil.getAPI("bancos").then((response) => {
            const bancos = response ? response.data : [];
            this.setState({ bancos });
        });

    getSaleConditions = () =>
        AppUtil.getAPI("catalogos/condicion_venta").then((response) => {
            this.setState({ saleConditions: response ? response.data : [] });
        });

    _triggerDefaultTax = () => {
        const { defaultTax } = this.state;

        if (!defaultTax || !this.impuestoSelectRef.current) return;

        const select = this.impuestoSelectRef.current;

        // Buscar el índice de la opción con el defaultTax
        const index = Array.from(select.options).findIndex(
            (opt) => parseInt(opt.value) === defaultTax
        );

        if (index !== -1) {
            // Setear el valor del select
            select.selectedIndex = index;

            // Crear evento sintético y disparar _calculaInput
            const event = {
                target: select,
            };

            this._calculaInput(event, true);
        }
    };

    getUserInfo = () => {
        let bytes = crypto.AES.decrypt(
            sessionStorage.getItem("user"),
            "@marsh_contable"
        );
        this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));

        this.setState(
            {
                token: sessionStorage.getItem("sessionId"),
                income: {
                    ...this.state.income,
                    usuarios_Usuario_id: this.user.usuario_id,
                },
                defaultTax: this.user.impuestoDefault,
            },
            () => {
                this.getCustomers();
                this.getTaxes();
                this.getPaymentMethods();
                this.getCommercialCodes();
                this.getCurrency();
                this.getInvoiceStates();
            }
        );
    };

    toggleShow = () =>
        this.setState(
            {
                show: !this.state.show,
                lines: [],
                income: {
                    id: 0,
                    codigo: "",
                    tipo_moneda_id: 0,
                    estado_Factura_id: 1,
                    medio_pago_id: 0,
                    clientes_id: 0,
                    subtotal: 0,
                    impuesto: 0,
                    total: 0,
                    descuento: 0,
                    cambio_venta: localStorage.getItem("dolar_venta"),
                    cambio_compra: localStorage.getItem("dolar_compra"),
                    usuarios_Usuario_id: this.user ? this.user.usuario_id : 0,
                    facturas_id: null,
                    banco_id: "",
                },
                isView: false,
            },
            () => {
                this.getBanks();
                this.getSaleConditions();
                this._triggerDefaultTax();
            }
        );

    // Actualiza campos del objeto principal income
    _saveStateVariable = async (e) => {
        const { name, type, checked, value } = e.target;
        await this.setState({
            income: {
                ...this.state.income,
                [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
            },
        });
    };

    // Actualiza el cliente desde react-select
    _saveCustomer = (selectedOption) => {
        this.setState({
            income: {
                ...this.state.income,
                clientes_id: selectedOption ? selectedOption.id : 0,
            },
        });
    };

    // 
    // LÍNEAS DE DETALLE
    // 

    addLine = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const formData = new FormData(e.target);

        const newLine = {
            codigo_comercial_id:
                parseInt(formData.get("codigo_comercial")) || 0,
            detalle: formData.get("detalle"),
            subtotal: parseFloat(formData.get("subtotal")) || 0,
            impuesto: parseFloat(formData.get("impuesto")) || 0,
            descuento: parseFloat(formData.get("descuento")) || 0,
            total: parseFloat(formData.get("total")) || 0,
            ingresos_id: 0, // se asigna tras guardar el encabezado
            cantidad: parseFloat(formData.get("cantidad")) || 0,
            codigo_comercial:
                formData.get("codigo_comercial_label") ||
                formData.get("codigo_comercial"),
        };

        this.setState(
            (prevState) => ({
                lines: [...prevState.lines, newLine],
                AuxLine: {
                    total: "",
                    subtotal: "",
                    descuento: "",
                    impuesto: "",
                    porcentaje: 0,
                    cantidad: 1,
                },
            }),
            () => this._recalcularTotales()
        );

        e.target.reset();
    };

    removeLine = (index) => {
        this.setState(
            (prevState) => ({
                lines: prevState.lines.filter((_, i) => i !== index),
            }),
            () => this._recalcularTotales()
        );
    };

    _recalcularTotales = () => {
        const { lines } = this.state;
        const subtotal = lines.reduce((acc, l) => acc + l.subtotal, 0);
        const impuesto = lines.reduce((acc, l) => acc + l.impuesto, 0);
        const total = lines.reduce((acc, l) => acc + l.total, 0);
        const descuento = lines.reduce((acc, l) => acc + l.descuento, 0);

        this.setState((prevState) => ({
            income: {
                ...prevState.income,
                subtotal,
                impuesto,
                total,
                descuento,
            },
        }));
    };

    _calculaInput = (e, isSelect = false) => {
        let { name, type, value, selectedIndex } = e.target;
        if (isSelect) {
            const index = selectedIndex;
            const optionElement = e.target.options[index];
            const taxOption = optionElement.getAttribute("attr");
            name = "porcentaje";
            value = taxOption;
        }

        this.setState(
            { AuxLine: { ...this.state.AuxLine, [name]: value } },
            () => {
                let { AuxLine } = this.state;
                let subtotal = isNaN(AuxLine.subtotal) ? 0 : AuxLine.subtotal,
                    tax = isNaN(AuxLine.porcentaje) ? 0 : AuxLine.porcentaje,
                    impuesto = 0,
                    total = 0,
                    cantidad = isNaN(AuxLine.cantidad) ? 1 : AuxLine.cantidad,
                    descuento = isNaN(AuxLine.descuento)
                        ? 0
                        : AuxLine.descuento;

                impuesto = (subtotal * cantidad - descuento) * (tax / 100);
                total = subtotal * cantidad - descuento + impuesto;

                AuxLine.total = total;
                AuxLine.impuesto = impuesto;
                this.setState({ AuxLine });
            }
        );
    };

    // 
    // CATÁLOGOS
    // 

    getCustomers = () => {
        const { t } = this.props;
        AppUtil.getAPI("clientes_dp").then((response) => {
            if (response) {
                const customers = response ? response.data : [];
                this.setState({ customers, processing: false });
            } else {
                alertSuccess(t(response.message), "error", t);
            }
        });
    };

    getPaymentMethods = () =>
        AppUtil.getAPI("catalogos/medio_pago").then((response) => {
            const paymentMethods = response ? response.data : [];
            this.setState({ paymentMethods });
        });

    getCurrency = () =>
        AppUtil.getAPI("catalogos/tipo_moneda").then((response) => {
            const currency = response ? response.data : [];
            this.setState({ currency });
        });

    getCommercialCodes = () =>
        AppUtil.getAPI("catalogos/codigo_comercial").then((response) => {
            const commercialCodes = response ? response.data : [];
            this.setState({ commercialCodes });
        });

    getTaxes = () =>
        AppUtil.getAPI("catalogos/impuesto").then((response) => {
            let taxes = response ? response.data : [];
            this.setState({ taxes });
        });

    getInvoiceStates = () =>
        AppUtil.getAPI("catalogos/estado_factura").then((response) => {
            const invoiceStates = response ? response.data : [];
            this.setState({ invoiceStates });
        });

    // 
    // CONSULTAR POR ID (edición)
    // 

    getIncomeById = (id, isView = false) => {
        const { t } = this.props;

        AppUtil.getAPI(`ingresos/${id}`).then((response) => {
            if (response.codeStatus === 200) {
                const income = response.data;
                const lines = income.ingresosDetalle || [];

                this.setState(
                    {
                        income,
                        lines,
                        show: true,
                        isView,
                    },
                    () => {
                        this.getBanks();
                        this.getSaleConditions();
                    }
                );
            } else {
                alertSuccess(t(response.message), "error", t);
            }
        });
    };

    // 
    // GUARDAR (crear o actualizar)
    // 

    validateForm = (t) => {
        let { income } = this.state;

        if (!AppUtil.isValidText(income.codigo)) {
            alertSuccess(t("invalid_string_form_codigo"), "warning", t);
            return false;
        }
        if (!income.clientes_id) {
            alertSuccess(t("invalid_string_form_clientes_id"), "warning", t);
            return false;
        }
        if (!income.medio_pago_id) {
            alertSuccess(t("invalid_string_form_medio_pago_id"), "warning", t);
            return false;
        }
        if (!income.tipo_moneda_id) {
            alertSuccess(t("invalid_string_form_tipo_moneda_id"), "warning", t);
            return false;
        }
        return true;
    };

    saveIncome = () => {
        const { t } = this.props;
        const { income, lines } = this.state;

        if (!this.validateForm(t)) {
            return;
        }

        if (lines.length === 0) {
            alertSuccess(t("lines_required"), "warning", t);
            return;
        }

        this.setState({ processing: true });

        income.Ingresos_Detalle = this.state.lines;

        if (income.id === 0) {
            // ── CREAR
            AppUtil.postAPI("ingresos", income).then((response) => {
                if (response.codeStatus === 200) {
                    alertSuccess(
                        t("record_created_successfully"),
                        "success",
                        t
                    );
                    this.toggleShow();
                    this.setState({ processing: false });

                    if (this.datatableRef.current?.dt()) {
                        this.datatableRef.current.dt().ajax.reload(null, false);
                    }
                } else {
                    alertSuccess(t(response.message), "error", t);
                    this.setState({ processing: false });
                }
            });
        } else {
            // ── ACTUALIZAR
            AppUtil.putAPI(`ingresos/${income.id}`, income).then((response) => {
                if (response.codeStatus === 200) {
                    alertSuccess(t("updated_successfully"), "success", t);
                    this.toggleShow();
                    this.setState({ processing: false });

                    if (this.datatableRef.current?.dt()) {
                        this.datatableRef.current.dt().ajax.reload(null, false);
                    }
                } else {
                    alertSuccess(t(response.message), "error", t);
                    this.setState({ processing: false });
                }
            });
        }
    };

    // 
    // BOTONES DE ACCIÓN
    // 

    ActionButtons = (rowData) => {
        return (
            <ActionButtons
                viewAction={() => this.getIncomeById(rowData.id, true)}
                editAction={() => this.getIncomeById(rowData.id)}
            />
        );
    };

    // 
    // RENDER
    // 

    render() {
        const { t } = this.props;
        const {
            income,
            lines,
            customers,
            paymentMethods,
            commercialCodes,
            isView,
            processing,
            token,
            taxes,
            AuxLine,
            invoiceStates,
            bancos,
            saleConditions,
        } = this.state;

        return (
            <>
                <Container fluid>
                    <Row className="m-2">
                        <Col lg="6" sm="12">
                            <h1>{t("income")}</h1>
                        </Col>
                        <Col lg="6" sm="12">
                            <Button onClick={this.toggleShow}>
                                {t("create")}
                            </Button>
                        </Col>
                    </Row>

                    {/* ── DATATABLE ── */}
                    <Row>
                        {token === "" ? (
                            <div />
                        ) : (
                            <DataTable
                                ref={this.datatableRef}
                                ajax={{
                                    url: `${url}ingresos`,
                                    type: "GET",
                                    headers: {
                                        Accept: "application/json",
                                        "Content-Type":
                                            "application/json; charset=UTF-8",
                                        "X-Session-Id": token,
                                    },
                                    dataSrc: function (json) {
                                        return json.data || [];
                                    },
                                    dataType: "json",
                                }}
                                columns={[
                                    { data: "id", title: t("id") },
                                    { data: "codigo", title: t("code") },
                                    { data: "cliente", title: t("customer") },
                                    {
                                        data: "fecha",
                                        title: t("date"),
                                        render: (data, type, row) => {
                                            return moment(
                                                `${row.fecha}`
                                            ).format(
                                                `${this.user.formatoFecha.toUpperCase()}`
                                            );
                                        },
                                    },
                                    { data: "usuario", title: t("created_by") },
                                    {
                                        data: "subtotal",
                                        title: t("subtotal"),
                                        render: function (data, type, row) {
                                            return `${row.tipo_moneda} ${data}`;
                                        },
                                    },
                                    {
                                        data: "impuesto",
                                        title: t("tax"),
                                        render: function (data, type, row) {
                                            return `${row.tipo_moneda} ${data}`;
                                        },
                                    },
                                    {
                                        data: "total",
                                        title: t("total"),
                                        render: function (data, type, row) {
                                            return `${row.tipo_moneda} ${data}`;
                                        },
                                    },
                                    {
                                        data: "estado_factura",
                                        title: t("status"),
                                    },
                                    {
                                        title: t("action"),
                                        data: null,
                                        orderable: false,
                                        searchable: false,
                                        defaultContent: "",
                                    },
                                ]}
                                className="display table cell-border compact stripe"
                                slots={{
                                    9: (cellData, rowData) =>
                                        this.ActionButtons(rowData),
                                }}
                                options={{
                                    language: {
                                        zeroRecords: t("zeroRecords"),
                                        emptyTable: t("emptyTable"),
                                        search: t("search"),
                                        paginate: t("paginate"),
                                        searchPlaceholder:
                                            t("searchPlaceholder"),
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
                        )}
                    </Row>

                    {/* ── MODAL ── */}
                    <Modal
                        show={this.state.show}
                        onHide={this.toggleShow}
                        backdrop="static"
                        keyboard={false}
                        size="lg"
                        scrollable
                    >
                        <Modal.Header closeButton>
                            <h3 className="tituloFerias">
                                {income.id === 0
                                    ? t("create")
                                    : isView
                                      ? t("view")
                                      : t("edit")}
                            </h3>
                        </Modal.Header>

                        <Modal.Body>
                            {/* Código */}
                            <Row className="m-2">
                                <Col sm="12" xl="4">
                                    <label>{t("code")}</label>
                                    <Form.Group>
                                        <Form.Control
                                            placeholder={t("code")}
                                            type="text"
                                            onChange={this._saveStateVariable}
                                            name="codigo"
                                            required
                                            maxLength={150}
                                            value={income.codigo}
                                            disabled={isView}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Estado factura */}
                                <Col sm="12" xl="4">
                                    <label className="txt-darkblue">
                                        {t("invoice_status")}
                                    </label>
                                    <Form.Group>
                                        <Form.Select
                                            name="estado_Factura_id"
                                            onChange={this._saveStateVariable}
                                            value={income.estado_Factura_id}
                                            required
                                            disabled={isView}
                                        >
                                            <option value="">
                                                {t("select_option")}
                                            </option>
                                            {invoiceStates.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.nombre}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col sm="12" xl="4">
                                    <label className="txt-darkblue">
                                        {t("payment_method")}
                                    </label>
                                    <Form.Group>
                                        <Form.Select
                                            name="medio_pago_id"
                                            onChange={this._saveStateVariable}
                                            value={income.medio_pago_id}
                                            required
                                            disabled={isView}
                                        >
                                            <option value="">
                                                {t("select_option")}
                                            </option>
                                            {paymentMethods.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.descripcion}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Medio de pago / Moneda */}
                            <Row className="m-2">
                                <Col sm="12" xl="4">
                                    <label className="txt-darkblue">
                                        {t("currency")}
                                    </label>
                                    <Form.Group>
                                        <Form.Select
                                            name="tipo_moneda_id"
                                            onChange={this._saveStateVariable}
                                            value={income.tipo_moneda_id}
                                            required
                                            disabled={isView}
                                        >
                                            <option value="">
                                                {t("select_option")}
                                            </option>
                                            {this.state.currency.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.nombre}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col sm="12" xl="4">
                                    <label className="txt-darkblue">
                                        {t("bank_accounts")}
                                    </label>
                                    <Form.Group>
                                        <Form.Select
                                            name="banco_id"
                                            onChange={this._saveStateVariable}
                                            value={income.banco_id}
                                            required
                                            disabled={isView}
                                        >
                                            <option value="">
                                                {t("select_option")}
                                            </option>
                                            {bancos.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.nombre_banco} -{" "}
                                                    {item.simbolo}
                                                    {item.saldo_actual}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col sm="12" xl="4">
                                    <label className="txt-darkblue">
                                        {t("sale_condition")}
                                    </label>
                                    <Form.Group>
                                        <Form.Select
                                            name="condicion_venta_id"
                                            onChange={this._saveStateVariable}
                                            value={income.condicion_venta_id}
                                            required
                                            disabled={isView}
                                        >
                                            <option value="">
                                                {t("select_option")}
                                            </option>
                                            {saleConditions.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                    selected={
                                                        income.condicion_venta_id ===
                                                        item.id
                                                    }
                                                >
                                                    {item.descripcion}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="m-2">
                                <Col sm="12" xl="12">
                                    <label className="txt-darkblue">
                                        {t("customer")}
                                    </label>
                                    {this.state.processing ? (
                                        t("loading")
                                    ) : (
                                        <Select
                                            options={customers}
                                            name="clientes_id"
                                            onChange={(value) =>
                                                this.setState({
                                                    income: {
                                                        ...this.state.income,
                                                        clientes_id: value.id,
                                                    },
                                                })
                                            }
                                            getOptionValue={(option) =>
                                                option.id
                                            }
                                            getOptionLabel={(option) =>
                                                `${option.nombre} ${option.apellido1}`
                                            }
                                            disabled={isView}
                                            defaultValue={() =>
                                                customers?.find(
                                                    (opt) =>
                                                        opt.id ===
                                                        income.clientes_id
                                                )
                                            }
                                            isSearchable={true}
                                        />
                                    )}
                                </Col>
                            </Row>

                            <SlideDown
                                show={parseInt(income.condicion_venta_id) === 2} //id de compra a credito
                                value={income.dias_credito}
                                onChange={this._saveStateVariable}
                                disabled={isView}
                                t={t}
                            />

                           {/* <Row className="m-2">
                                <Col sm="12" xl="12">
                                    <Form.Group>
                                        <Form.Check // prettier-ignore
                                            type="checkbox"
                                            id="createElectronicDoc"
                                            label={t("create_electronic_doc")}
                                            name="createElectronicDoc"
                                            onChange={this._saveStateVariable}
                                            checked={
                                                income.createElectronicDoc === 1
                                                    ? true
                                                    : false
                                            }
                                            disabled={isView}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>*/}

                            {/* ── SECCIÓN DE DETALLES ── */}
                            <div className="card mt-3 shadow-lg">
                                <Form onSubmit={this.addLine}>
                                    {!isView && (
                                        <div>
                                            <Row className="m-2">
                                                <Col sm="12" xl="4">
                                                    <label className="txt-darkblue">
                                                        {t("comercial_code")}
                                                    </label>
                                                    <Form.Group>
                                                        <Form.Select
                                                            name="codigo_comercial"
                                                            required
                                                        >
                                                            <option value="">
                                                                {t(
                                                                    "select_option"
                                                                )}
                                                            </option>
                                                            {commercialCodes.map(
                                                                (item) => (
                                                                    <option
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        value={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.codigo
                                                                        }{" "}
                                                                        -{" "}
                                                                        {
                                                                            item.nombre
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>

                                                <Col sm="12" xl="4">
                                                    <label className="txt-darkblue">
                                                        {t("detail")}
                                                    </label>
                                                    <Form.Group>
                                                        <Form.Control
                                                            placeholder={t(
                                                                "detail"
                                                            )}
                                                            type="textarea"
                                                            name="detalle"
                                                            required
                                                            maxLength={200}
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col sm="12" xl="4">
                                                    <label className="txt-darkblue">
                                                        {t("qty")}
                                                    </label>
                                                    <Form.Group>
                                                        <Form.Control
                                                            placeholder={t(
                                                                "qty"
                                                            )}
                                                            type="number"
                                                            name="cantidad"
                                                            required
                                                            min={0}
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                this._calculaInput(
                                                                    e
                                                                )
                                                            }
                                                            value={
                                                                AuxLine.cantidad
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="m-2">
                                                <Col sm="12" xl="4">
                                                    <label className="txt-darkblue">
                                                        {t("subtotal")}
                                                    </label>
                                                    <Form.Group>
                                                        <Form.Control
                                                            placeholder={t(
                                                                "subtotal"
                                                            )}
                                                            type="number"
                                                            name="subtotal"
                                                            required
                                                            min={0}
                                                            step="0.01"
                                                            onChange={(e) =>
                                                                this._calculaInput(
                                                                    e
                                                                )
                                                            }
                                                            value={
                                                                AuxLine.subtotal
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>

                                                <Col sm="12" xl="4">
                                                    <label className="txt-darkblue">
                                                        {t("tax")}
                                                    </label>
                                                    <Form.Select
                                                        aria-label="Impuesto"
                                                        name="impuesto_id"
                                                        onChange={(e) =>
                                                            this._calculaInput(
                                                                e,
                                                                true
                                                            )
                                                        }
                                                        required
                                                        ref={
                                                            this
                                                                .impuestoSelectRef
                                                        }
                                                    >
                                                        <option value="">
                                                            {t("select_option")}
                                                        </option>
                                                        {taxes?.map(
                                                            (item, key) =>
                                                                item.id ===
                                                                this.state
                                                                    .defaultTax ? (
                                                                    <option
                                                                        value={
                                                                            item.id
                                                                        }
                                                                        selected
                                                                        attr={
                                                                            item.porcentaje
                                                                        }
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        {
                                                                            item.nombre
                                                                        }
                                                                    </option>
                                                                ) : (
                                                                    <option
                                                                        attr={
                                                                            item.porcentaje
                                                                        }
                                                                        value={
                                                                            item.id
                                                                        }
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        {
                                                                            item.nombre
                                                                        }
                                                                    </option>
                                                                )
                                                        )}
                                                    </Form.Select>
                                                </Col>

                                                <Col sm="12" xl="4">
                                                    <label className="txt-darkblue">
                                                        {t("discount")}
                                                    </label>
                                                    <Form.Group>
                                                        <Form.Control
                                                            placeholder={t(
                                                                "discount"
                                                            )}
                                                            type="number"
                                                            name="descuento"
                                                            min={0}
                                                            onChange={(e) =>
                                                                this._calculaInput(
                                                                    e
                                                                )
                                                            }
                                                            step="0.01"
                                                            value={
                                                                AuxLine.descuento
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="m-2">
                                                <Col sm="12" xl="6">
                                                    <label className="txt-darkblue">
                                                        {t("tax")}
                                                    </label>
                                                    <Form.Group>
                                                        <Form.Control
                                                            placeholder={t(
                                                                "tax"
                                                            )}
                                                            type="number"
                                                            name="impuesto"
                                                            required
                                                            readOnly
                                                            onChange={(e) =>
                                                                this._calculaInput(
                                                                    e
                                                                )
                                                            }
                                                            min={0}
                                                            step="0.01"
                                                            value={
                                                                AuxLine.impuesto
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm="12" xl="6">
                                                    <label className="txt-darkblue">
                                                        {t("total")}
                                                    </label>
                                                    <Form.Group>
                                                        <Form.Control
                                                            placeholder={t(
                                                                "total"
                                                            )}
                                                            type="number"
                                                            name="total"
                                                            onChange={(e) =>
                                                                this._calculaInput(
                                                                    e
                                                                )
                                                            }
                                                            required
                                                            min={0}
                                                            step="0.01"
                                                            readOnly
                                                            value={
                                                                AuxLine.total
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="m-2">
                                                <Col sm="12" xl="12">
                                                    <Button
                                                        variant="primary"
                                                        type="submit"
                                                    >
                                                        {t("add_line")}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}

                                    {/* ── TABLA DE LÍNEAS ── */}
                                    <Row className="m-3">
                                        <Col sm="12" xl="12">
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>{t("code")}</th>
                                                        <th>{t("detail")}</th>
                                                        <th>{t("subtotal")}</th>
                                                        <th>{t("discount")}</th>
                                                        <th>{t("tax")}</th>
                                                        <th>{t("total")}</th>
                                                        <th>{t("action")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lines.length > 0 &&
                                                        lines.map(
                                                            (line, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        {index +
                                                                            1}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            line.codigo_comercial_id
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            line.detalle
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            line.subtotal
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            line.descuento
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            line.impuesto
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            line.total
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {!isView && (
                                                                            <Button
                                                                                variant="danger"
                                                                                onClick={() =>
                                                                                    this.removeLine(
                                                                                        index
                                                                                    )
                                                                                }
                                                                            >
                                                                                <i className="fas fa-trash" />
                                                                            </Button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                </tbody>
                                                {lines.length > 0 && (
                                                    <tfoot>
                                                        <tr className="table-info fw-bold">
                                                            <td colSpan={3}>
                                                                {t("totals")}
                                                            </td>
                                                            <td>
                                                                {income.subtotal.toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                            <td>
                                                                {income.descuento.toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                            <td>
                                                                {income.impuesto.toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                            <td>
                                                                {income.total.toFixed(
                                                                    2
                                                                )}
                                                            </td>
                                                            <td />
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </Table>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button
                                variant="light"
                                className="btn-rounded"
                                onClick={this.toggleShow}
                            >
                                {t("close")}
                            </Button>
                            {processing ? (
                                <div className="lds-dual-ring-2" />
                            ) : (
                                !isView && (
                                    <Button
                                        variant="primary"
                                        onClick={this.saveIncome}
                                    >
                                        {t("save")}
                                    </Button>
                                )
                            )}
                        </Modal.Footer>
                    </Modal>
                </Container>
            </>
        );
    }
}

export default withTranslation()(Income);
