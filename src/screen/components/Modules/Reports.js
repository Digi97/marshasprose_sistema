import React, {Component} from "react";
import { withTranslation } from "react-i18next";
import { Card, Container, Row, Col, Modal, Form, Button, Table } from "react-bootstrap";
import crypto from "crypto-js";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Select from "react-select";
import AppUtil from "../../../AppUtil/AppUtil";



class Report extends Component {

constructor(props) {
        super(props);

        this.state = {
          dashboardInfo:{},
          showUserFilterModal: false,
          showUserPreviewModal: false,
          showReportIGFModal:false,
          showReportIGFPreview:false,
          userFilters: {
            fechaCreacionDesde: "",
            fechaCreacionHasta: "",
            tipoPermiso: "",
            fechaBloqueoDesde: "",
            fechaBloqueoHasta: "",
          },
          customerSupplierFilters:{
              fechaCreacionDesde: "",
            fechaCreacionHasta: "",
            exonerado:false,
            estado:true
            
          },
          ingresoGastosFacturaFilters:{
             fechaCreacionDesde: "",
            fechaCreacionHasta: "",
            clientes_id: "",
            proveedor_id: "",
            categoriaGastoId:"",
            tipoDocumentoId:"",
            medioPagoId:""



          },
          userReportData: [],
          loadingReport: false,
          roles:[],
          doc_type:[],
          customers:[],
          supplier:[],
          showClienteProveedorFilterModal:false,
          isSupplier:false,
          reportName:"Report",
          isPresupuesto:false, 
          isGasto:false, 
          isFactura:false,
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

    toggleUserFilterModal = () => {  this.setState({ showUserFilterModal: !this.state.showUserFilterModal }, ()=>{ this.getRoles() });}


    toggleIFGFilterModal = (isGasto = false, isFactura = false, isPresupuesto = false) => {  this.setState({ showReportIGFModal: !this.state.showReportIGFModal, isGasto, isFactura, isPresupuesto }, ()=>{ 

       

        if(isGasto)
        {
            this.getProviders();
        } else{
            this.getCustomers();
        }
      
        this.getDocType();
        this.getCategorySpent();
        this.getMedioPago();
    

    
    }); 
}

    getCustomers = () => AppUtil.getAPI("clientes_dp", ).then((response) => {
                const customers      = response ? response.data.data : [];
                this.setState({ customers, processing: false });
            });

   getProviders = () => AppUtil.getAPI("proveedor", ).then((response) => {
                const supplier      = response ? response.data.data : [];
                this.setState({ supplier, processing: false });
            });
                 



        getRoles = () => AppUtil.getAPI(`catalogos/roles`).then((response) => {
                let roles = response ? response.data : [];
                this.setState({ roles });
            });

    
 getDocType = () => AppUtil.getAPI(`catalogos/tipo_documento`).then((response) => {
                let doc_type = response ? response.data : [];
                this.setState({ doc_type }); });

             getCategorySpent = () =>
            AppUtil.getAPI(`catalogos/categoria_gasto`).then((response) => {
                let categoriaGasto = response ? response.data : [];
                this.setState({ categoriaGasto });
            });
             getMedioPago = () =>
            AppUtil.getAPI(`catalogos/medio_pago`).then((response) => {
                let medioPago = response ? response.data : [];
                this.setState({ medioPago });
            });


    toggleUserPreviewModal = () => {
        this.setState({ showUserPreviewModal: !this.state.showUserPreviewModal });
    }

    handleFilterChange = (e) => {
        const { name, value } = e.target;
        this.setState({ userFilters: { ...this.state.userFilters, [name]: value } });
    }

       handleCustomerFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState({ customerSupplierFilters: { ...this.state.customerSupplierFilters, 
           [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        
        
        } });
    }

        handleIFGFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState({ customerSupplierFilters: { ...this.state.customerSupplierFilters, 
           [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        
        
        } });
    }

    //#region  seccion_busqueda reportes

    fetchUserReport = () => {
        const { userFilters } = this.state;
        this.setState({ loadingReport: true });

        const params = new URLSearchParams();
        if (userFilters.fechaCreacionDesde) params.append("fechaCreacionDesde", userFilters.fechaCreacionDesde);
        if (userFilters.fechaCreacionHasta) params.append("fechaCreacionHasta", userFilters.fechaCreacionHasta);
        if (userFilters.tipoPermiso)        params.append("tipoPermiso", userFilters.tipoPermiso);
        if (userFilters.fechaBloqueoDesde)  params.append("fechaBloqueoDesde", userFilters.fechaBloqueoDesde);
        if (userFilters.fechaBloqueoHasta)  params.append("fechaBloqueoHasta", userFilters.fechaBloqueoHasta);

        const qs = params.toString();
        AppUtil.getAPI(`reportes/usuarios/filtro${qs ? `?${qs}` : ""}`).then((response) => {
            const raw = response ? (response.data ?? response) : [];
            const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.usuarios) ? raw.usuarios : []);

            
            this.setState({
                userReportData: data,
                loadingReport: false,
                showUserFilterModal: false,
                showUserPreviewModal: true,
                  reportName: raw.titulo
            });
        });
    }


        fetchCustomerSupplierReport = () => {
        const { customerSupplierFilters , isSupplier} = this.state;
     
        
        this.setState({ loadingReport: true });

        const params = new URLSearchParams();
        if (customerSupplierFilters.fechaCreacionDesde) params.append("fechaCreacionDesde", customerSupplierFilters.fechaCreacionDesde);
        if (customerSupplierFilters.fechaCreacionHasta) params.append("fechaCreacionHasta", customerSupplierFilters.fechaCreacionHasta);
        if (customerSupplierFilters.estado) params.append("estado", customerSupplierFilters.estado);
        if (customerSupplierFilters.exonerado) params.append("exonerado", customerSupplierFilters.exonerado);


        const qs = params.toString();
        AppUtil.getAPI(isSupplier ? `reportes/proveedores/filtro${qs ? `?${qs}` : ""}` : `reportes/clientes/filtro${qs ? `?${qs}` : ""}`).then((response) => {
   
            const raw = response ? (response.data ?? response) : [];
            const data = isSupplier ? (Array.isArray(raw) ? raw : (Array.isArray(raw?.proveedores) ? raw.proveedores : [])): (Array.isArray(raw) ? raw : (Array.isArray(raw?.clientes) ? raw.clientes : []));
                     
            this.setState({
                userReportData: data,
                loadingReport: false,
                showClienteProveedorFilterModal: false,
                showUserPreviewModal: true,
                isSupplier: false,
                reportName: raw.titulo

            });
        });
    }



    fetchIFGReport = () => {
        const { ingresoGastosFacturaFilters , isPresupuesto, isGasto, isFactura} = this.state;
     
        
        this.setState({ loadingReport: true });

        const params = new URLSearchParams();
       
         if (ingresoGastosFacturaFilters.fechaCreacionDesde) params.append("fechaCreacionDesde", ingresoGastosFacturaFilters.fechaCreacionDesde);
        if (ingresoGastosFacturaFilters.fechaCreacionHasta) params.append("fechaCreacionHasta", ingresoGastosFacturaFilters.fechaCreacionHasta);
        if (ingresoGastosFacturaFilters.clientes_id) params.append("clienteId", ingresoGastosFacturaFilters.clientes_id);
        if (ingresoGastosFacturaFilters.proveedor_id) params.append("proveedorId", ingresoGastosFacturaFilters.proveedor_id);
        if (ingresoGastosFacturaFilters.categoriaGastoId) params.append("categoriaGastoId", ingresoGastosFacturaFilters.categoriaGastoId);
        if (ingresoGastosFacturaFilters.tipoDocumentoId) params.append("tipoDocumentoId", ingresoGastosFacturaFilters.tipoDocumentoId);
        if (ingresoGastosFacturaFilters.medioPagoId) params.append("medioPagoId", ingresoGastosFacturaFilters.medioPagoId);


        let conection = "";
         const qs = params.toString();

        if(isGasto)
        {
            conection = `reportes/gastos/filtro${qs ? `?${qs}` : ""}`
        }

          if(isFactura)
        {
            conection = `reportes/facturas/filtro${qs ? `?${qs}` : ""}`
        }

        if(isPresupuesto)
        {
            conection = `reportes/gestion_presupuestaria/filtro${qs ? `?${qs}` : ""}`
        }


       
        AppUtil.getAPI(conection).then((response) => {
   
            const raw = response ? (response.data ?? response) : [];
            const data = isFactura ? (Array.isArray(raw) ? raw : (Array.isArray(raw?.facturas) ? raw.facturas : [])):(isGasto ? (Array.isArray(raw) ? raw : (Array.isArray(raw?.gastos) ? raw.gastos : [])) : (Array.isArray(raw) ? raw : (Array.isArray(raw?.detalles) ? raw.detalles : [])) );
                     
            this.setState({
                userReportData: data,
                loadingReport: false,
                showUserPreviewModal: true,
                isSupplier: false,
                reportName: raw.titulo,
                isFactura: false, 
                isGasto:false,
                isPresupuesto:false,
                showReportIGFModal:false


            });
        });
    }
    


        _saveCustomer = (selectedOption) => this.setState({ ingresoGastosFacturaFilters: { ...this.state.ingresoGastosFacturaFilters,clientes_id: selectedOption ? selectedOption.id : 0 }});
   
        _saveSupplier= (selectedOption) => this.setState({ ingresoGastosFacturaFilters: { ...this.state.ingresoGastosFacturaFilters,proveedor_id: selectedOption ? selectedOption.id : 0 }});
   

    //#endregion

//#region exportado_reportes

 exportToExcel = (nombreReporte = "Report.xlsx",data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  XLSX.writeFile(workbook, nombreReporte);
};

exportToPDF = (NombreReporte = "Report.pdf", data) => {
  const doc = new jsPDF();
  const tableData = data.map(item => Object.values(item));
  const headers = Object.keys(data[0]);

autoTable(doc, {
    head:       [headers],
    body:       tableData,
    startY:     40,
    styles:     { fontSize: 8 },
    headStyles: { fillColor: [31, 62, 95] },
});
doc.save(NombreReporte);

};

//#endregion

render(){

        const { t } = this.props;
        const { showUserFilterModal, showUserPreviewModal, userFilters, userReportData, loadingReport, roles, showClienteProveedorFilterModal, showReportIGFModal,
supplier, customers, isGasto, isFactura, doc_type, categoriaGasto, medioPago,ingresoGastosFacturaFilters,isSupplier

         } = this.state;

        const previewColumns = userReportData.length > 0 ? Object.keys(userReportData[0]) : [];

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
                            <small className="text-success" role="button" onClick={this.toggleUserFilterModal}>
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
                            <small className="text-success" role="button" onClick={()=> this.setState({ showClienteProveedorFilterModal: !this.state.showClienteProveedorFilterModal })}>
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
                            <small className="text-success" role="button" onClick={()=> this.setState({ showClienteProveedorFilterModal: !this.state.showClienteProveedorFilterModal, isSupplier: true })}>

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
                            <small className="text-success" role="button" onClick={() => this.toggleIFGFilterModal( false, true, false)}>
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
                            <small className="text-success" role="button" onClick={()=>this.toggleIFGFilterModal(true, false, false)}>
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
                            <small className="text-success" role="button" onClick={()=>this.toggleIFGFilterModal(false, false, true)}>
                               <i className="fas fa-download" style={{ color: "#4e73df", fontSize: "20px" }} />  {t("download")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>
</Container>

{/* ══ MODAL FILTROS — REPORTE USUARIOS ══ */}
<Modal
    show={showUserFilterModal}
    onHide={this.toggleUserFilterModal}
    backdrop="static"
    keyboard={false}
    size="md"
    centered
>
    <Modal.Header closeButton>
        <h5 className="tituloFerias">{t("user_report_filters")}</h5>
    </Modal.Header>
    <Modal.Body>
        <Row className="mb-3">
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_creation_date_from")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaCreacionDesde"
                    value={userFilters.fechaCreacionDesde}
                    onChange={this.handleFilterChange}
                />
            </Col>
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_creation_date_to")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaCreacionHasta"
                    value={userFilters.fechaCreacionHasta}
                    onChange={this.handleFilterChange}
                />
            </Col>
        </Row>
        <Row className="mb-3">
            <Col sm="12">
                <Form.Label>{t("rol")}</Form.Label>
        

 <Form.Group>
                                            <Form.Select
                                                aria-label="Roles_id"
                                                name="roles_id"
                                                onChange={
                                                    this.handleFilterChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    {t("select_option")}
                                                </option>
                                                {
                                                roles?.map((item, key) => ( <option value={item.id}  key={key}> {item.descripcion}</option> ))
                                            }
                                            </Form.Select>
                                        </Form.Group>

            </Col>
        </Row>
        <Row className="mb-3">
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_block_date_from")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaBloqueoDesde"
                    value={userFilters.fechaBloqueoDesde}
                    onChange={this.handleFilterChange}
                />
            </Col>
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_block_date_to")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaBloqueoHasta"
                    value={userFilters.fechaBloqueoHasta}
                    onChange={this.handleFilterChange}
                />
            </Col>
        </Row>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="light" onClick={this.toggleUserFilterModal}>
            {t("close")}
        </Button>
        {loadingReport ? (
            <div className="lds-dual-ring-2" />
        ) : (
            <Button variant="primary" onClick={this.fetchUserReport}>
                {t("consult")}
            </Button>
        )}
    </Modal.Footer>
</Modal>

{/* ══ MODAL PREVIEW — REPORTE USUARIOS ══ */}
<Modal
    show={showUserPreviewModal}
    onHide={this.toggleUserPreviewModal}
    backdrop="static"
    keyboard={false}
    size="xl"
    scrollable
>
    <Modal.Header closeButton>
        <h5 className="tituloFerias">{t("report_preview")}</h5>
    </Modal.Header>
    <Modal.Body>
        {userReportData.length === 0 ? (
            <p className="text-center text-muted">{t("no_results")}</p>
        ) : (
            <div style={{ overflowX: "auto" }}>
                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            {previewColumns.map((col) => (
                                <th key={col} style={{ whiteSpace: "nowrap" }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {userReportData.map((row, i) => (
                            <tr key={i}>
                                {previewColumns.map((col) => (
                                    <td key={col}>{row[col] ?? ""}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        )}
    </Modal.Body>
    <Modal.Footer>
        <Button variant="light" onClick={this.toggleUserPreviewModal}>
            {t("close")}
        </Button>

        <Button variant="success" onClick={()=>this.exportToExcel(`${this.state.reportName}.xlsx`, this.state.userReportData)}>
            {t("excel")}
        </Button>
            <Button variant="danger" onClick={()=> this.exportToPDF(`${this.state.reportName}.pdf`, this.state.userReportData)}>
            {t("pdf")}
        </Button>
    </Modal.Footer>
</Modal>



{/* MODAL FILTROS — REPORTE CLIENTES Y PROVEEDORES */}
<Modal
    show={showClienteProveedorFilterModal}
    onHide={() => {this.setState({ showClienteProveedorFilterModal: !this.state.showClienteProveedorFilterModal, isSupplier:false}) }}
    backdrop="static"
    keyboard={false}
    size="md"
    centered
>
    <Modal.Header closeButton>
        <h5 className="tituloFerias">{t("customer_report_filters")}</h5>
    </Modal.Header>
    <Modal.Body>
        <Row className="mb-3">
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_creation_date_from")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaCreacionDesde"
                    value={userFilters.fechaCreacionDesde}
                    onChange={this.handleCustomerFilterChange}
                />
            </Col>
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_creation_date_to")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaCreacionHasta"
                    value={userFilters.fechaCreacionHasta}
                    onChange={this.handleCustomerFilterChange}
                />
            </Col>
        </Row>

        <Row className="mb-3">

             <Col sm="12" xl="6">
             
                <Form.Check
                    type="checkbox"
                    name="estado"
                    value={userFilters.estado}
                    onChange={this.handleCustomerFilterChange}
                    label={t("status")}
                />
            </Col>
            {!isSupplier && 
            <Col sm="12" xl="6">
                <Form.Check
                    type="checkbox"
                    name="exonerado"
                    value={userFilters.exonerado}
                    onChange={this.handleCustomerFilterChange}
                    label={t("exonerated")}
                />
            </Col>}

        </Row>

    </Modal.Body>
    <Modal.Footer>
        <Button variant="light" onClick={() => {this.setState({ showClienteProveedorFilterModal: !this.state.showClienteProveedorFilterModal, isSupplier:false}) }}>
            {t("close")}
        </Button>
        {loadingReport ? (
            <div className="lds-dual-ring-2" />
        ) : (
            <Button variant="primary" onClick={this.fetchCustomerSupplierReport}>
                {t("consult")}
            </Button>
        )}
    </Modal.Footer>
</Modal>



{/* MODAL FILTROS — IGF (Ingresos Gastos Facturas) */}
<Modal
    show={showReportIGFModal}
    onHide={() => {this.setState({ showReportIGFModal: !this.state.showReportIGFModal}) }}
    backdrop="static"
    keyboard={false}
    size="md"
    centered
>
    <Modal.Header closeButton>
        <h5 className="tituloFerias">{t("fgp_report_filters")}</h5>
    </Modal.Header>
    <Modal.Body>
        <Row className="mb-3">
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_creation_date_from")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaCreacionDesde"
                    value={ingresoGastosFacturaFilters.fechaCreacionDesde}
                    onChange={this.handleIFGFilterChange}
                />
            </Col>
            <Col sm="12" xl="6">
                <Form.Label>{t("filter_creation_date_to")}</Form.Label>
                <Form.Control
                    type="date"
                    name="fechaCreacionHasta"
                    value={ingresoGastosFacturaFilters.fechaCreacionHasta}
                    onChange={this.handleIFGFilterChange}
                />
            </Col>
        </Row>

        <Row className="mb-3">

            {isFactura && <Col sm="12" xl="12">
             
                <label className="txt-darkblue">{t("customer")}</label>
                                    <Select
                                        options={customers}
                                        onChange={this._saveCustomer}
                                        placeholder={`${t("select_option")}`}
                                        name="clientes_id"
                                        getOptionValue={(option) => option.id}                                   
                                        getOptionLabel={(option) => `${option.nombre} ${option.apellido1} ${option.apellido2}`}
                                      isSearchable={true}

                                    />
            </Col>}
            {isGasto && 
            <Col sm="12" xl="12">
                   <label className="txt-darkblue">{t("provider")}</label>
                                    <Select
                                        options={supplier}
                                        onChange={this._saveSupplier}
                                        placeholder={`${t("select_option")}`}
                                        name="proveedor_id"
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => `${option.nombre} ${option.apellido1} ${option.apellido2}`}                                     
                                      isSearchable={true}

                                    />
            </Col>}


        </Row>

       {isFactura && <Row className="mb-3">
            <Col sm="12">
                <Form.Label>{t("doc_type")}</Form.Label>
        

             <Form.Group>
                                            <Form.Select
                                                aria-label="tipoDocumentoId"
                                                name="tipoDocumentoId"
                                                onChange={
                                                    this.handleFilterChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    {t("select_option")}
                                                </option>
                                                {
                                                doc_type?.map((item, key) => ( <option value={item.id}  key={key}> {item.nombre}</option> ))
                                            }
                                            </Form.Select>
                                        </Form.Group>

            </Col>
        </Row>}



{isGasto && <Row className="mb-3">
            <Col sm="12">
                <Form.Label>{t("doc_type")}</Form.Label>
        

             <Form.Group>
                                            <Form.Select
                                                aria-label="categoriaGastoId"
                                                name="categoriaGastoId"
                                                onChange={
                                                    this.handleFilterChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    {t("select_option")}
                                                </option>
                                                {
                                                categoriaGasto?.map((item, key) => ( <option value={item.id}  key={key}> {item.nombre}</option> ))
                                            }
                                            </Form.Select>
                                        </Form.Group>

            </Col>
        </Row>}

        {(isGasto || isFactura) && <Row className="mb-3">
            <Col sm="12">
                <Form.Label>{t("doc_type")}</Form.Label>
        

             <Form.Group>
                                            <Form.Select
                                                aria-label="medioPagoId"
                                                name="medioPagoId"
                                                onChange={
                                                    this.handleFilterChange
                                                }
                                                required
                                            >
                                                <option value="">
                                                    {t("select_option")}
                                                </option>
                                                {
                                                medioPago?.map((item, key) => ( <option value={item.id}  key={key}> {item.descripcion}</option> ))
                                            }
                                            </Form.Select>
                                        </Form.Group>

            </Col>
        </Row>}
        

    </Modal.Body>
    <Modal.Footer>
        <Button variant="light" onClick={() => {this.setState({ showReportIGFModal: !this.state.showReportIGFModal}) }}>
            {t("close")}
        </Button>
        {loadingReport ? (
            <div className="lds-dual-ring-2" />
        ) : (
            <Button variant="primary" onClick={this.fetchIFGReport}>
                {t("consult")}
            </Button>
        )}
    </Modal.Footer>
</Modal>


</>

  );
}

}

export default withTranslation()(Report);
