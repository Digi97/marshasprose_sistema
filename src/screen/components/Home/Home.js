import React, {Component} from "react";
import { withTranslation } from "react-i18next";
import { Card, Container, Row, Col} from "react-bootstrap";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";

import { PieChart } from 'react-minimal-pie-chart';


class Home extends Component { 

constructor(props) {
        super(props);

        this.state = {
          dashboardInfo:{}
        };

        this.user = null;
    }
    componentDidMount() {  this.getUserInfo(); }
getDashboardInfo(){
  AppUtil.getAPI("home/dashboard").then((response) => {
        if (response && response.codeStatus === 200) 
          {

            let dashboardInfo = response.data;
            console.log(dashboardInfo);
            
          let arrayPonerColor = dashboardInfo.facturas_por_tipo_documento;

          for(let i = 0; i< arrayPonerColor.length; i++)
          {
            arrayPonerColor[i].color = AppUtil.randomHexColor()
          }
          
          dashboardInfo.facturas_por_tipo_documento = arrayPonerColor;

              localStorage.setItem("dolar_compra", dashboardInfo.tipo_cambio?.compra)
              localStorage.setItem("dolar_venta", dashboardInfo.tipo_cambio?.venta)
            
            this.setState({ dashboardInfo });
        }
    });
}

    getUserInfo = () => {
        let bytes = crypto.AES.decrypt(
            sessionStorage.getItem("user"),
            "@marsh_contable"
        );

    
        this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
        this.getDashboardInfo()
      
      }



render(){
    
        const { t } = this.props;
        let {dashboardInfo} = this.state;
  return(
<>
<Container fluid>
<Row className="m-2">

                {/* ── Card Usuarios ── */}
                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("total_users")}
                                    </p>
                                    <h3 className="fw-bold mb-0">{dashboardInfo.total_usuarios ?  AppUtil.formatNumber(dashboardInfo.total_usuarios, true): t("loading")}</h3>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#4e73df20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-users" style={{ color: "#4e73df", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-success">

                                {t("active_system")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ── Card Clientes ── */}
                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("total_customers")}
                                    </p>
                                    <h3 className="fw-bold mb-0">{dashboardInfo.total_clientes ? AppUtil.formatNumber(dashboardInfo.total_clientes, true): t("loading")}</h3>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#1cc88a20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-user-tie" style={{ color: "#1cc88a", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-success">                              
                                {dashboardInfo.totalClientesMesActual} {t("this_month")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ── Card Facturas ── */}
                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("total_invoice")}
                                    </p>
                                    <h3 className="fw-bold mb-0">{dashboardInfo.total_facturas ? AppUtil.formatNumber(dashboardInfo.total_facturas, true) : t("loading")}</h3>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#36b9cc20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-file-invoice" style={{ color: "#36b9cc", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-info">
                                <i className="fas fa-calendar me-1" />
                                {t("single_electronic_invoice")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ── Card Ganancias ── */}
                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("monthly_gains")}
                                    </p>
                                    <h3 className="fw-bold mb-0">{dashboardInfo.total_ganancias_mes ? AppUtil.formatNumber(dashboardInfo.total_ganancias_mes) : t("loading")}</h3>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#f6c23e20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-chart-area" style={{ color: "#f6c23e", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-warning">
                                <i className="fas fa-chart-line me-1" />
                                {t("current_month")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* ── Card Gastos ── */}
                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("monthly_spent")}
                                    </p>
                                    <h3 className="fw-bold mb-0">{dashboardInfo.total_gastos_mes ? AppUtil.formatNumber(dashboardInfo.total_gastos_mes): t("loading")}</h3>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#e74a3b20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-receipt" style={{ color: "#e74a3b", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-danger">
                                <i className="fas fa-calendar me-1" />
                                {t("current_month")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                                {/* ── Card Tipo Cambio ── */}
                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("exchange_rate_buy")}
                                    </p>
                                    <h3 className="fw-bold mb-0">{dashboardInfo.tipo_cambio ? AppUtil.formatNumber(dashboardInfo.tipo_cambio?.compra) : t("loading")}</h3>
                                </Col>
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("exchange_rate_sale")}
                                    </p>
                                    <h3 className="fw-bold mb-0">{dashboardInfo.tipo_cambio ? AppUtil.formatNumber(dashboardInfo.tipo_cambio?.venta): t("loading")}</h3>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#e74a3b20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-coins" style={{ color: "#e74a3b", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-danger">
                                <i className="fas fa-calendar me-1" />
                                {t("today")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>
</Container>


</>

  );
}

}

export default withTranslation()(Home);
