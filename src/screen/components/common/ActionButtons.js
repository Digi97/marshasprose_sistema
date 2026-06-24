import React from "react";

import { Row, Col, Button} from "react-bootstrap";

const renderActive  =(props) => {

      return (
<Row className="m-2">
  <Col className="d-flex">
   {props.listAction && (
      <Button variant="info" onClick={props.listAction}>
        <i className="fas fa-list" />
      </Button>
    )}
    {props.viewAction && (
      <Button variant="info" onClick={props.viewAction}>
        <i className="fas fa-eye" />
      </Button>
    )}
    {props.editAction && (
      <Button variant="warning" onClick={props.editAction}>
        <i className="fas fa-pen" />
      </Button>
    )}
    {props.monthlyAction && (
      <Button variant="success" onClick={props.monthlyAction}>
        <i className="fas fa-calendar-alt" />
      </Button>
    )}
    {props.deleteAction && (
      <Button variant="danger" onClick={props.deleteAction}>
        <i className="fas fa-trash" />
      </Button>
    )}
  </Col>
</Row>
      );
  };

  export default renderActive


