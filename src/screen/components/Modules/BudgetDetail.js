import React, { Component, createRef } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { Container, Row, Col, Button } from "react-bootstrap";
import { withTranslation } from "react-i18next";
import moment from "moment-timezone";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";

DataTable.use(DT);

class BudgetDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            movements: [],
        };
        this.datatableRef = createRef();
        this.user = null;
    }



        getUserInfo = () => {
           let bytes = crypto.AES.decrypt(
             sessionStorage.getItem("user"),
             "@marsh_contable",
           );
           this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
           
           this.setState({ user: this.user, token: sessionStorage.getItem("sessionId") });
         };

    componentDidMount() {
             this.getUserInfo();
        const { gestionID } = this.props;
        if (gestionID) {
            this.getMovements(gestionID);
        }
    }

    getMovements = (gestionID) => {
        AppUtil.getAPI(`gestion_p_detalle/gestion/${gestionID}`).then((response) => {
            let movements = response ? response.data : [];
      
            
            this.setState({ movements });
        });
    };

    render() {
        const { t } = this.props;
        const { movements } = this.state;

        return (
            <>
                <Container fluid>
                    <Row className="mb-3">
                        <Col lg="6" sm="12">
                            <h1>{t("budget_detail")}</h1>
                        </Col>
                        <Col lg="6" sm="12" className="d-flex justify-content-end align-items-center">
                            <Button variant="secondary" onClick={() => this.props.navigate(-1)}>
                                <i className="fas fa-arrow-left" /> {t("back")}
                            </Button>
                        </Col>
                    </Row>

                    <Row>
                        <DataTable
                            ref={this.datatableRef}
                            data={movements}
                            columns={[
                                { data: "id",                      title: t("id") },
                                { data: "monto",                   title: t("amount") },
                                { data: "detalle_presupuesto",     title: t("budget_detail_col") },
                                { data: "categoria_presupuestaria",title: t("category") },
                                { data: "gastos_id",               title: t("spent") },
                                { data: "facturas_id",             title: t("invoice") },
                                { data: "ingresos_id",             title: t("income") },
                                { data: "monto_ejecutado",         title: t("amount_executed") },
                                {
                                    data: "fecha_registro",
                                    title: t("date"),
                                    render: (data) =>
                                        data ? moment(data).format(this.user.formatoFecha.toUpperCase()) : "",
                                },
                                { data: "observaciones",           title: t("detail") },
                            ]}
                            className="display table cell-border compact stripe"
                            options={{
                                language: {
                                    zeroRecords:       t("zeroRecords"),
                                    emptyTable:        t("emptyTable"),
                                    search:            t("search"),
                                    paginate:          t("paginate"),
                                    searchPlaceholder: t("searchPlaceholder"),
                                    info:              t("info"),
                                    lengthMenu:        t("lengthMenu"),
                                },
                                layout: {
                                    topStart:    "pageLength",
                                    topEnd:      "search",
                                    bottomStart: "info",
                                    bottomEnd:   "paging",
                                },
                            }}
                        />
                    </Row>
                </Container>
            </>
        );
    }
}

export default withTranslation()(BudgetDetail);
