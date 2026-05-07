import React, {Component} from "react";

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
// react-bootstrap components
import {
  Container,
  Row,
  Col,
  Button,Modal,Tabs, Form, Tab, Dropdown, Well
 } from "react-bootstrap";

import Table from 'react-bootstrap/Table';


DataTable.use(DT);


    

 export default class Spent extends Component {
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
  processing: false
    }
  }




    toggleShow = () => this.setState({show: !this.state.show})


     render(){
      return (
    <>
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <h1>Gastos</h1>
          </Col>
          <Col lg="6" sm="12">
          <Button
              className="btn-fill btn-rounded bg-blue"
              onClick={this.toggleShow}>
                Crear
            </Button>
            <Button
              className="btn-fill btn-rounded bg-blue"
              onClick={this.toggleShow}>
                Limpiar
            </Button>
               <Button
              className="btn-fill btn-rounded bg-blue"
              onClick={this.toggleShow}>
                Cancelar
            </Button>
          </Col>

        </Row>

        <Row>
          		<DataTable
              data={this.state.tableData} 
              className="display table cell-border compact stripe"
              pagination 
               options={{
                language: {
                  zeroRecords:"No hay registros para mostrar",
                  emptyTable:"No hay registros para mostrar",
                  rowsPerPageText:"Filas por página",
                  rangeSeparatorText:"de",
                  selectAllRowsItemText:"Todos",
                  search:"Buscar:",
                  paginate:"Paginación",
                  searchPlaceholder:"Buscar...",
                  info:"Mostrando _START_ de _END_ de _TOTAL_ entradas",
                  lengthMenu: "Mostrar _MENU_ Entradas",
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
          <Form onSubmit={this.submitFair}>

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">Registrar Nuevo Gasto</h3>
          </Modal.Header>
          <Modal.Body>
          <Tabs
            id="controlled-tab-example"
          
            className="mb-3 txt-blue"
            defaultActiveKey="info"
            >

               <Tab eventKey="info" title="Información de Gasto" className="txt-darkblue">
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>Referencia</label>
                   <Form.Group>
                     <Form.Control
                        placeholder="Número de referencia"
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
                      <label className="txt-darkblue">Categoría</label>
                       <Form.Group>
                          <Form.Select aria-label="Categoría" name="categories_id" onChange={this.getInputEvaluation} required>
                            <option value="">-- Seleccione una opción --</option>
                          {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                            </Form.Select>
                       </Form.Group>
                     </Col>

                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">Tipo Documento</label>
                     <Form.Group>
                      <Form.Select aria-label="Tipo Documento" name="categories_id" onChange={this.getInputEvaluation} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                     </Form.Group>
                     </Col>

                   </Row>

                   <Row className="m-2">
                     <Col sm="12" xl="12">
                       <label className="txt-darkblue">Medio Pago</label>
                      <Form.Group>
                         <Form.Select aria-label="Medio Pago" name="categories_id" onChange={this.getInputEvaluation} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
                    </Row>

                  <Row className="m-2">
                     <Col sm="12" xl="12">
                       <label className="txt-darkblue">Proveedor</label>
                 <Dropdown>
                  <Dropdown.Toggle>Proveedor</Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Form.Control
                      autoFocus
                      className="mx-3 my-2 w-auto"
                      placeholder="Buscar..."
                      onChange={(e) => {}}
                      value={""}
                    />
                    <Dropdown.Item key={""}>-- Seleccione una opción --</Dropdown.Item>
                    {/*options
                      .filter(opt => opt.toLowerCase().includes(filter.toLowerCase()))
                      .map(opt => <Dropdown.Item key={opt}>{opt}</Dropdown.Item>)
                    */
                    
                    }
                  </Dropdown.Menu>
                </Dropdown>
                </Col>
                    <div className="well">
      
                        <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">Código Comercial</label>
                      <Form.Group>
                         <Form.Select aria-label="Código Comercial" name="categories_id" onChange={this.getInputEvaluation} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
                  
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">Subtotal</label>
                        <Form.Group>
                          <Form.Control
                          placeholder="Subtotal"
                          type="text"
                          onChange={this.getInputData}
                          name="name"
                          required
                          maxLength={200}
                          />
                      </Form.Group>
                      </Col>
                    </Row>

                   <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">Tipo Impuesto</label>
                      <Form.Group>
                         <Form.Select aria-label="Tipo Impuesto" name="categories_id" onChange={this.getInputEvaluation} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
               
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">Impuesto</label>
                        <Form.Group>
                          <Form.Control
                          placeholder="Impuesto"
                          type="text"
                          onChange={this.getInputData}
                          name="name"
                          required
                          maxLength={3}
                          />
                      </Form.Group>
                      </Col>
                    </Row>

                    
                  <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">Total</label>
                        <Form.Group>
                          <Form.Control
                          placeholder="Total"
                          type="text"
                          onChange={this.getInputData}
                          name="name"
                          required
                          maxLength={200}
                          />
                      </Form.Group>
                      </Col>
                    </Row>

                  <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">Detalle</label>
                        <Form.Group>
                          <Form.Control
                          placeholder="Detalle"
                          type="text"
                          onChange={this.getInputData}
                          name="name"
                          required
                          maxLength={200}
                          />
                      </Form.Group>
                      </Col>
                 
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">Descuento</label>
                        <Form.Group>
                          <Form.Control
                          placeholder="Descuento"
                          type="text"
                          onChange={this.getInputData}
                          name="name"
                          required
                          maxLength={200}
                          />
                      </Form.Group>
                      </Col>
                    </Row>
                    <Row className="m-2">
                           <Col sm="12" xl="12">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Código</th>
                          <th>Descripción</th>
                          <th>Subtotal</th>
                          <th>Descuento</th>
                          <th>Impuesto</th>
                          <th>Total</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody></tbody>
                </Table>

                           </Col>
                    </Row>





                    </div>
              </Row>

               </Tab>
   

         </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-rounded" onClick={this.toggleShow}>
              Cerrar
            </Button>
            {this.state.processing ? <div className="lds-dual-ring-2"></div> : <Button variant="primary" className="btn-fill btn-rounded" type="submit">Guardar</Button>}
          </Modal.Footer>
          </Form>
        </Modal>
        
      </Container>
    </>
  );


     }
}

