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
            <h1>Cuentas</h1>
          </Col>

        </Row>

        <Row>
        
        </Row>
        
      </Container>
    </>
  );
}

export default Home;
