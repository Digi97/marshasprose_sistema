import React, {Component} from "react";

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button,Modal,Tabs, Form, Tab} from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import Select from 'react-select'
import { withTranslation } from "react-i18next";
DataTable.use(DT);


class Invoice extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [],
  show:false,
  showAcceptance:false,
  processing: false,
  invoice:{
    id:0,
    clave:"",
    consecutivo_electronico:"",
    fecha:"",
    consecutivo:0,
    tipo_moneda_id:0,
    Estado_Factura:0,
    tipo_documento:0,
    subtotal:0,
    impuesto:0,
    total:0,
    descuento:0,
    impuesto_id:0,
    cambio_venta:0,
    cambio_compra:0,
    cliente_id:0,
    condicion_venta_id:0,
    medio_pago:0,
 
  },
     lines:[]

    }
  }



//#region Funciones internas
    toggleShow = () => this.setState({show: !this.state.show})
    toggleShowInvoiceAcceptance = () => this.setState({showAcceptance: !this.state.showAcceptance})

    addLine = (e) => {
      e.preventDefault();
      e.stopPropagation();

        const formData = new FormData(e.target);

        const line = {
            categories_id: formData.get("categories_id"),
            tipo_documento: formData.get("tipo_documento"),
            medio_pago: formData.get("medio_pago"),
            proveedor: formData.get("proveedor"),
            codigo_comercial: formData.get("codigo_comercial"),
            detalle: formData.get("detalle"),
            subtotal: parseFloat(formData.get("subtotal")) || 0,
            impuesto: parseFloat(formData.get("impuesto")) || 0,
            descuento: parseFloat(formData.get("descuento")) || 0,
            total: parseFloat(formData.get("total")) || 0,
        };

        this.setState((prevState) => ({
            lines: [...prevState.lines, line]
        }));   
              e.target.reset();

              // agregar conexion a axios

    }

    removeLine = (index) =>{
    this.setState((prevState) => ({
        lines: prevState.lines.filter((line, i) => i !== index)
    }));

    }

    _saveStateVariable = async (e) => {
    await this.setState({
            question: {
              ...this.state.question,
              [e.target.name]: e.target.value,
            },
          });

    }


    saveSpent = () => {
      
    }

    //#endregion fin funciones internas


     render(){
       const { t } = this.props;
      return (
    <>
      <Container fluid>
        <Tabs id="controlled-tab-example" className="mb-3 txt-blue" defaultActiveKey="invoice">
          <Tab eventKey="invoice" title={t("invoice")} className="txt-darkblue">
          <Row>
          <Col lg="6" sm="12">
            <h1>{t("invoice")}</h1>
          </Col>
          <Col lg="6" sm="12">
            <Row>
              <Col lg="3" sm="12">
                <Button
                  className="btn-fill btn-rounded bg-blue"
                  onClick={this.toggleShow}>
                    {t("create")}
                </Button>
              </Col>
              <Col lg="2" sm="12">
                <Button
                className="btn-fill btn-rounded bg-blue"
                onClick={this.toggleShow}>
                  {t("clean")}
              </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          		<DataTable
                data={this.state.tableData} 
                className="display table cell-border compact stripe"
               
                options={{
                language: {
                  zeroRecords:t("zeroRecords"),
                  emptyTable:t("emptyTable"),
                  rowsPerPageText:t("rowsPerPageText"),
                  rangeSeparatorText:t("rangeSeparatorText"),
                  selectAllRowsItemText:t("selectAllRowsItemText"),
                  search:t("search"),
                  paginate:t("paginate"),
                  searchPlaceholder:t("searchPlaceholder"),
                  info:t("info"),
                  lengthMenu: t("lengthMenu"),
                },
                layout:{
                  topStart:"pageLength",
                  topEnd:"search",
                  bottomStart: 'info',
                  bottomEnd:"paging"
                }
               }}
              >
              <thead>
                <tr>
                  <th>{t("id")}</th>
                  <th>{t("key")}</th>
                  <th>{t("consecutive")}</th>
                  <th>{t("date")}</th>
                  <th>{t("currency")}</th>
                  <th>{t("invoice_status")}</th>
                  <th>{t("doc_type")}</th>
                  <th>{t("subtotal")}</th>
                  <th>{t("tax")}</th>
                  <th>{t("discount")}</th>
                  <th>{t("total")}</th>
                  <th>{t("customer")}</th>
                  <th>{t("action")}</th>
                </tr>
              </thead>
            </DataTable>
        
        </Row>


          </Tab>
        
        <Tab eventKey="invoice_acceptance" title={t("invoice_acceptance")} className="txt-darkblue">
                   <Row>
          <Col lg="6" sm="12">
            <h1>{t("invoice_acceptance")}</h1>
          </Col>
          <Col lg="6" sm="12">
            <Row>
              <Col lg="3" sm="12">
                <Button
                  className="btn-fill btn-rounded bg-blue"
                  onClick={this.toggleShowInvoiceAcceptance}>
                    {t("create")}
                </Button>
              </Col>
              <Col lg="2" sm="12">
                <Button
                className="btn-fill btn-rounded bg-blue"
                onClick={this.toggleShow}>
                  {t("clean")}
              </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>
          		<DataTable
                data={this.state.tableData} 
                className="display table cell-border compact stripe"
               
                options={{
                language: {
                  zeroRecords:t("zeroRecords"),
                  emptyTable:t("emptyTable"),
                  rowsPerPageText:t("rowsPerPageText"),
                  rangeSeparatorText:t("rangeSeparatorText"),
                  selectAllRowsItemText:t("selectAllRowsItemText"),
                  search:t("search"),
                  paginate:t("paginate"),
                  searchPlaceholder:t("searchPlaceholder"),
                  info:t("info"),
                  lengthMenu: t("lengthMenu"),
                },
                layout:{
                  topStart:"pageLength",
                  topEnd:"search",
                  bottomStart: 'info',
                  bottomEnd:"paging"
                }
               }}
              >
              <thead>
                <tr>
                  <th>{t("id")}</th>
                  <th>{t("key")}</th>
                  <th>{t("consecutive")}</th>
                  <th>{t("date")}</th>
                  <th>{t("currency")}</th>
                  <th>{t("invoice_status")}</th>
                  <th>{t("provider")}</th>
                  <th>{t("action")}</th>
                </tr>
              </thead>
            </DataTable>
        
        </Row>
               </Tab>
        </Tabs>
      

             <Modal
              show={this.state.show}
              onHide={this.toggleShow}
              backdrop="static"
              keyboard={false}
              size="lg"
              className="max-z-index"
          >
     

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("invoice")}</h3>
          </Modal.Header>
          <Modal.Body>
          <Tabs
            id="controlled-tab-example"
          
            className="mb-3 txt-blue"
            defaultActiveKey="info"
            >

               <Tab eventKey="info" title={t("invoice")} className="txt-darkblue">
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label>{t("key")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("key")}
                        type="text"
                        onChange={this.getInputData}
                        name="clave"
                        required
                        maxLength={50}
                        readOnly
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                  <Col sm="12" xl="6">
                    <label>{t("consecutive")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("consecutive")}
                        type="text"
                        onChange={this.getInputData}
                        name="consecutivo"
                        required
                        maxLength={45}
                        readOnly
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>


                 </Row>

                 <Row className="m-2">

                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("date")}</label>
                       <Form.Group>
                         <Form.Control
                          placeholder={t("date")}
                          type="date"
                          onChange={this.getInputData}
                          name="fecha"
                          required
                          readOnly
                          
                          />
                       </Form.Group>
                     </Col>

                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("currency")}</label>
                     <Form.Group>
                      <Form.Select aria-label="Tipo_Moneda_id" name="Tipo_Moneda_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                     </Form.Group>
                     </Col>

                   </Row>

                   <Row className="m-2">
                     <Col sm="12" xl="12">
                       <label className="txt-darkblue">{t("payment_method")}</label>
                      <Form.Group>
                         <Form.Select aria-label="Medio Pago" name="medio_pago_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
                    </Row>

                  <Row className="m-2">

                     <Col sm="12" xl="12">
                       <label className="txt-darkblue">{t("customer")}</label>
                    <Select options={this.state.invoice.cliente_id} name="cliente_id" onChange={this._saveStateVariable} />
                </Col>



                    <div className="well">
                      <Form onSubmit={this.addLine}>
                        
      
                        <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("comercial_code")}</label>
                      <Form.Group>
                         <Form.Select aria-label={t("comercial_code")} name="codigo_comercial" required>
                              <option value="">-- Seleccione una opción --</option>
                              <option value="1">test</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("detail")}</label>
                        <Form.Group>
                          <Form.Control
                          placeholder={t("detail")}
                          type="text"
                          name="detalle"
                          required
                          maxLength={200}
                          />
                      </Form.Group>
                      </Col>
                  
                 
                    </Row>

                   <Row className="m-2">


                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("tax_type")}</label>
                      <Form.Group>
                         <Form.Select aria-label={t("tax_type")} name="tipo_documento" required>
                              <option value="">-- Seleccione una opción --</option>
                              <option value="1">IVA</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>

                      <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("subtotal")}</label>
                        <Form.Group>
                          <Form.Control
                          placeholder={t("subtotal")}
                          type="number"
                          name="subtotal"
                          required
                          maxLength={200}
                          />
                      </Form.Group>
                      </Col>
               

                    </Row>

              <Row className="m-2">    
                 <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("tax")}</label>
                        <Form.Group>
                          <Form.Control
                          placeholder={t("tax")}
                          type="number"  
                          name="impuesto"
                          required
                          maxLength={3}
                          readOnly
                          />
                      </Form.Group>
                      </Col>

       
                              
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("discount")}</label>
                        <Form.Group>
                          <Form.Control
                          placeholder={t("discount")}
                          type="number"       
                          name="descuento"
                          required
                          maxLength={200}
                          />
                      </Form.Group>
                      </Col>
               </Row>

                    
                  <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("total")}</label>
                        <Form.Group>
                          <Form.Control
                          placeholder={t("total")}
                          type="number"
                          name="total"
                          required
                          maxLength={200}
                          readOnly
                          />
                      </Form.Group>
                      </Col>
                      <Col sm="12" xl="6">
                        <Button variant="primary" className="btn-fill btn-rounded" type="submit">{t("add_line")}</Button>
                      </Col>


                    </Row>


                  
                    <Row className="m-3">
                           <Col sm="12" xl="12">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>{t("cabys_code")}</th>
                          <th>{t("comercial_code")}</th>
                          <th>{t("detail")}</th>
                          <th>{t("subtotal")}</th>
                          <th>{t("discount")}</th>
                          <th>{t("tax")}</th>
                          <th>{t("total")}</th>
                          <th>{t("action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                       {this.state.lines.length > 0 && (
                        this.state.lines.map((line, index) => (
                          <tr key={index}>
                              <td>{index +1}</td>
                              <td>{line.codigo_cabys}</td>
                               <td>{line.codigo_comercial}</td>
                              <td>{line.detalle}</td>
                              <td>{line.subtotal}</td>
                              <td>{line.descuento}</td>
                              <td>{line.impuesto}</td>
                              <td>{line.total}</td>
                              <td><Button variant="danger" className="btn-fill btn-rounded" onClick={() => this.removeLine(index)}> <i className="fas fa-trash" /></Button></td>
                          </tr>
                ))
              )}


                      </tbody>
                </Table>

                           </Col>
                    </Row>


                      </Form>
                    </div>
              </Row>

               </Tab>
   

         </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-rounded" onClick={this.toggleShow}>
              {t("close")}
            </Button>
            {this.state.processing ? <div className="lds-dual-ring-2"></div> : <Button variant="primary" className="btn-fill btn-rounded" type="submit">{t("save")}</Button>}
          </Modal.Footer>
         
        </Modal>



          <Modal
              show={this.state.showAcceptance}
              onHide={this.toggleShowInvoiceAcceptance}
              backdrop="static"
              keyboard={false}
              size="lg"
              className="max-z-index"
          >
     

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("invoice_acceptance")}</h3>
          </Modal.Header>
          <Modal.Body>    
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label>{t("xml_file")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("xml_file")}
                        type="file"
                        accept=".xml"
                        onChange={this.getInputData}
                        name="archivo_aceptacion"
                        required
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
                 </Row>
          </Modal.Body>
          <Modal.Footer>

            <Button variant="light" className="btn-rounded" onClick={this.toggleShowInvoiceAcceptance}>
              {t("close")}
            </Button>
            {this.state.processing ? <div className="lds-dual-ring-2"></div> : <Button variant="primary" className="btn-fill btn-rounded" type="submit">{t("save")}</Button>}
          </Modal.Footer>
         
        </Modal>
        
      </Container>
    </>
  );


     }
}

 export default withTranslation()(Invoice)
