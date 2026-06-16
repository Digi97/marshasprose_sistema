import React, {Component} from "react";
import { withTranslation } from "react-i18next";
import { Card, Container, Row, Col} from "react-bootstrap";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";


class Report extends Component { 

constructor(props) {
        super(props);

        this.state = {
          dashboardInfo:{}
        };

        this.user = null;
    }
    componentDidMount() {  this.getUserInfo(); }

    getUserInfo = () => {
        let bytes = crypto.AES.decrypt(
            sessionStorage.getItem("user"),
            "@marsh_contable"
        );

    
        this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));

      
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
                    <Card className="shadow-sm border-0" onClick={() => console.log("test")}>
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("user_report")}
                                    </p>
                                 
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
                            <small className="text-success" role="button">                              
                               <i className="fas fa-download" style={{ color: "#4e73df", fontSize: "20px" }} />  {t("download")}
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
                                        {t("report_customer")}
                                    </p>
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
                            <small className="text-success" role="button">                              
                               <i className="fas fa-download" style={{ color: "#4e73df", fontSize: "20px" }} />  {t("download")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("report_providers")}
                                    </p>
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
                            <small className="text-success" role="button">                              
                               <i className="fas fa-download" style={{ color: "#4e73df", fontSize: "20px" }} />  {t("download")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

               
                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("report_invoice")}
                                    </p>
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
                                        <i className="fas fa-file" style={{ color: "#1cc88a", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                           <hr className="my-2" />
                            <small className="text-success" role="button">                              
                               <i className="fas fa-download" style={{ color: "#4e73df", fontSize: "20px" }} />  {t("download")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("report_spent")}
                                    </p>
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
                                        <i className="fas fa-chart-area" style={{ color: "#1cc88a", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                           <hr className="my-2" />
                            <small className="text-success" role="button">                              
                               <i className="fas fa-download" style={{ color: "#4e73df", fontSize: "20px" }} />  {t("download")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

               
               <Col lg="4" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("report_budget")}
                                    </p>
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
                                        <i className="fas fa-dollar" style={{ color: "#1cc88a", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                           <hr className="my-2" />
                            <small className="text-success" role="button">                              
                               <i className="fas fa-download" style={{ color: "#4e73df", fontSize: "20px" }} />  {t("download")}
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

export default withTranslation()(Report);
