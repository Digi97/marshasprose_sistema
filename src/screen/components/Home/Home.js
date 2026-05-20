import React, {useState} from "react";

// react-bootstrap components
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Modal,
  Tabs,
  Tab
} from "react-bootstrap";




function Home() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
    const [key, setKey] = useState('info');
  return (
    <>
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <h1>Inicio </h1>
          </Col>

        </Row>

        <Row>
        
        </Row>
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
          size="lg
          centered"
          >
          <Modal.Header closeButton>
            <Modal.Title><h2 className="text-align-center">Nueva Feria de Negocios</h2></Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
            defaultActiveKey="info"
            >
           <Tab eventKey="info" title="Información General">
            <Row>
              <Col sm="12" xl="6">
                <label>Nombre de la feria de negocios</label>
               <Form.Group>
                 <Form.Control
                    placeholder="Nombre de la feria de negocios"
                    type="text">
                   </Form.Control>
               </Form.Group>
               </Col>
               <Col sm="12" xl="6">
                 <label>Creador de la feria</label>
                  <Form.Group>
                    <Form.Control
                      placeholder="Creador de la feria"
                      type="text">
                    </Form.Control>
                  </Form.Group>
                </Col>
             </Row>

             <Row>
               <Col sm="12" xl="6">
                 <label>Categoría</label>
                <Form.Group>
                  <Form.Control
                     placeholder="Categoría"
                     type="text">
                    </Form.Control>
                </Form.Group>
                </Col>
                <Col sm="12" xl="6">
                  <label>Fecha de inicio</label>
                   <Form.Group>
                     <Form.Control
                       placeholder="Fecha de inicio"
                       type="text">
                     </Form.Control>
                   </Form.Group>
                 </Col>
              </Row>
              <Row>
                <Col sm="12" xl="6">
                  <label>Fecha de fin</label>
                 <Form.Group>
                   <Form.Control
                      placeholder="Fecha de fin"
                      type="text">
                     </Form.Control>
                 </Form.Group>
                 </Col>
                 <Col sm="12" xl="6">
                   <label>Archivo</label>
                    <Form.Group>
                      <Form.Control
                        placeholder="Archivo"
                        type="text">
                      </Form.Control>
                    </Form.Group>
                  </Col>
               </Row>

               <Row>
                 <Col sm="12" xl="12">
                   <label>Descripción de la feria</label>
                  <Form.Group>
                    <Form.Control
                       placeholder="Descripción de la feria"
                       type="text">
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
                    id="foro-preguntas"
                    label="Foro de preguntas y respuestas de los diferentes usuarios"
                  />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col sm="12" xl="12">
                 <Form.Group>
                   <Form.Check
                     type="switch"
                     id="fechas-foro"
                     label="Fechas de respuesta de foro"
                   />
                   </Form.Group>
                 </Col>
               </Row>

               <Row>
                 <Col sm="12" xl="12">
                  <Form.Group>
                    <Form.Check
                      type="switch"
                      id="foro"
                      label="Foro"
                    />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col sm="12" xl="12">
                   <Form.Group>
                     <Form.Check
                       type="switch"
                       id="ideas-negocio"
                       label="Ideas de negocios"
                     />
                     </Form.Group>
                   </Col>
                 </Row>
                 <Row>
                   <Col sm="12" xl="12">
                    <Form.Group>
                      <Form.Check
                        type="switch"
                        id="evaluacion"
                        label="Evaluación"
                      />
                      </Form.Group>
                    </Col>
                  </Row>

           </Tab>
         </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={handleClose}>
              Cerrar
            </Button>
            <Button variant="success" className="btn-fill">Guardar</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default Home;
