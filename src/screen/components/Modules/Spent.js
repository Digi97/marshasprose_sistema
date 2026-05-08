import React, {Component} from "react";

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
// react-bootstrap components
import { Container,
  Row,
  Col,
  Button,Modal,Tabs, Form, Tab, Dropdown
 } from "react-bootstrap";

import Table from 'react-bootstrap/Table';
import Select from 'react-select'

import { withTranslation } from "react-i18next";


DataTable.use(DT);


    

class Spent extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [
    [ 'Tiger Nixon', 'System Architect' ],
    [ 'Garrett Winters', 'Accountant' ],
	// ...
  ],
  show:false,
  processing: false,
  spentDetail:[],
  providers:[
    
  { value: 1, label: 'Proveedor 1' },
  { value: 2, label: 'Proveedor 2' },
  { value: 3, label: 'Proveedor 3' }

  ],
  lines:[]
    }
  }



//#region Funciones internas
    toggleShow = () => this.setState({show: !this.state.show})

    addLine = (e) => {
      e.preventDefault();
      e.stopPropagation();

        const formData = new FormData(e.target);

        const newLine = {
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
            lines: [...prevState.lines, newLine]
        }));   
              e.target.reset();

    }

    removeLine = (index) =>{
    this.setState((prevState) => ({
        lines: prevState.lines.filter((line, i) => i !== index)
    }));

    }


    saveSpent = () => {


      
    }

    //#endregion fin funciones internas


     render(){
       const { t, i18n } = this.props;
      return (
    <>
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <h1>{t("spent")}</h1>
          </Col>
          <Col lg="6" sm="12">
          <Row>
            <Col lg="3" sm="12">
              <Button
                className="btn-fill btn-rounded bg-blue"
                onClick={this.toggleShow}>
                  {t("create_spent")}
              </Button>
            </Col>
            <Col lg="2" sm="12">
              <Button
              className="btn-fill btn-rounded bg-blue"
              onClick={this.toggleShow}>
                {t("clean")}
            </Button>
            </Col>
            <Col lg="2" sm="12">
              <Button
                className="btn-fill btn-rounded bg-blue"
                onClick={this.toggleShow}>
                  {t("cancel")}
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
                  <th>ID</th>
                  <th>Position</th>
                </tr>
              </thead>
            </DataTable>
        
        </Row>

             <Modal
              show={this.state.show}
              onHide={this.toggleShow}
              backdrop="static"
              keyboard={false}
              size="lg"
              className="max-z-index"
          >
     

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("create_spent")}</h3>
          </Modal.Header>
          <Modal.Body>
          <Tabs
            id="controlled-tab-example"
          
            className="mb-3 txt-blue"
            defaultActiveKey="info"
            >

               <Tab eventKey="info" title={t("spent_info")} className="txt-darkblue">
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("reference")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("reference")}
                        type="text"
                        onChange={this.getInputData}
                        name="name"
                        required
                        maxLength={200}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                 </Row>

                 <Row className="m-2">

                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("category")}</label>
                       <Form.Group>
                          <Form.Select aria-label="Categoría" name="categories_id" onChange={this.getInputEvaluation} required>
                            <option value="">-- Seleccione una opción --</option>
                          {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                            </Form.Select>
                       </Form.Group>
                     </Col>

                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">{t("doc_type")}</label>
                     <Form.Group>
                      <Form.Select aria-label="Tipo Documento" name="tipo_documento" onChange={this.getInputEvaluation} required>
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
                         <Form.Select aria-label="Medio Pago" name="medio_pago" onChange={this.getInputEvaluation} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
                    </Row>

                  <Row className="m-2">

                     <Col sm="12" xl="12">
                       <label className="txt-darkblue">{t("provider")}</label>
                    <Select options={this.state.providers} name="proveedor" />
                </Col>



                    <div className="well">
                      <Form onSubmit={this.addLine}>
                        
      
                        <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("comercial_code")}</label>
                      <Form.Group>
                         <Form.Select aria-label={t("comercial_code")} name="codigo_comercial" onChange={this.getInputEvaluation} required>
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
                         <Form.Select aria-label={t("tax_type")} name="tipo_documento" onChange={this.getInputEvaluation} required>
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
                       {this.state.lines.length > 0 && (
                        this.state.lines.map((line, index) => (
                          <tr key={index}>
                              <td>{index +1}</td>
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
        
      </Container>
    </>
  );


     }
}

 export default withTranslation()(Spent)
