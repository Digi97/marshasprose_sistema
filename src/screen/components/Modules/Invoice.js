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



const ferias = [
  {
    nombre:"Feria 1",
    descripcion: "Lorem ipsum dolor sit amet",
    encargado: "Encargado 01",
    empresa:"Empresa 01",
    img: "https://www.iebschool.com/blog/wp-content/uploads/2019/09/IT-BUSINESS-PARTNER.jpg"
  },
  {
    nombre:"Feria 2",
    descripcion: "Lorem ipsum dolor sit amet",
    encargado: "Encargado 02",
    empresa:"Empresa 02",
    img: "https://murinightmarket.com/wp-content/uploads/2021/07/Business.jpg"
  },
  {
    nombre:"Feria 3",
    descripcion: "Lorem ipsum dolor sit amet",
    encargado: "Encargado 03",
    empresa:"Empresa 03",
    img: "https://www.patriotsoftware.com/wp-content/uploads/2019/03/craft-financial-business-plan-1.jpg"
  },
  {
    nombre:"Feria 4",
    descripcion: "Lorem ipsum dolor sit amet",
    encargado: "Encargado 04",
    empresa:"Empresa 04",
    img: "https://www.esan.edu.pe/images/blog/2018/10/05/1500x844-business-intelligence-analytics.jpg"
  },
  {
    nombre:"Feria 5",
    descripcion: "Lorem ipsum dolor sit amet",
    encargado: "Encargado 05",
    empresa:"Empresa 05",
    img: "https://www.callbell.eu/wp-content/uploads/2020/09/social-media-factory-ninja-academy-2.jpg"
  },
  {
    nombre:"Feria 6",
    descripcion: "Lorem ipsum dolor sit amet",
    encargado: "Encargado 06",
    empresa:"Empresa 06",
    img: "https://www.iebschool.com/blog/wp-content/uploads/2019/09/IT-BUSINESS-PARTNER.jpg"
  }
];

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
            <h1>Facturas</h1>
          </Col>

        </Row>

        <Row>
        
        </Row>
        
      </Container>
    </>
  );
}

export default Home;
