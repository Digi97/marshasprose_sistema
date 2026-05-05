import React, {Component} from "react";

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
// react-bootstrap components
import {
  Container,
  Row,
  Col,
  Button,Modal,Tabs, Form, Tab
 } from "react-bootstrap";




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

               <Tab eventKey="info" title="Información General" className="txt-darkblue">
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
                      <label className="txt-darkblue">Fecha de inicio</label>
                       <Form.Group>
                         <Form.Control
                           placeholder="Fecha de inicio"
                           readOnly
                           type="date"
                           name="start_date"
                           onChange={this.getInputData}
                           required
                           >
                         </Form.Control>
                       </Form.Group>
                     </Col>

                    <Col sm="12" xl="6">
                      <label className="txt-darkblue">Fecha de fin</label>
                     <Form.Group>
                       <Form.Control
                          placeholder="Fecha de fin"
                          type="date"
                          name="end_date"
                          onChange={this.getInputData}
                          required
                          >
                         </Form.Control>
                     </Form.Group>
                     </Col>

                   </Row>

                   <Row className="m-2">
                     <Col sm="12" xl="12">
                       <label className="txt-darkblue">Descripción de la feria</label>
                      <Form.Group>
                        <Form.Control
                           placeholder="Descripción de la feria"
                           as="textarea"
                           style={{ height: '100px' }}
                           required
                           name="description"
                           onChange={this.getInputData}
                           >
                          </Form.Control>
                      </Form.Group>
                      </Col>
                    </Row>

               </Tab>
               <Tab eventKey="config" title="Configuración">
                 <Row>
                   <Col sm="12" xl="12">
                    <Form.Group>
                      <Form.Check
                        type="switch"
                        id="options_comments"
                        label="Foro de preguntas y respuestas de los diferentes usuarios"
                        name="options_comments"
                        onChange={this.getInputData}


                      />
                      </Form.Group>
                    </Col>
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

