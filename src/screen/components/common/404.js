import React from "react";
import logo from "../../../assets/SVG/NotFound.svg";
// react-bootstrap components
import {
  Container,
  Row,
} from "react-bootstrap";




function Error404() {
  return (
    <>
      <Container fluid>
        <Row>
            <center>
              <h2>Error 404</h2>
            </center>
            
              <img src={logo} alt="Error 404" />
        </Row>      
      </Container>
    </>
  );
}

export default Error404;
