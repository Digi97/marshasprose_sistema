import Accordion from 'react-bootstrap/Accordion';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';

const AccordionTable = (props) => {
//Estas son las alertas del sitio que se muestra en todo el sitio
return (

    <Accordion.Item eventKey={props.eventKey}>
      <Accordion.Header>{props.Title}</Accordion.Header>
      <Accordion.Body>
        <BootstrapTable id="table-to-xls" keyField='name_category' data={  props.data } columns={ props.columns } pagination={ paginationFactory({sizePerPage: 5}) } />
      </Accordion.Body>
    </Accordion.Item>

);
}

export default AccordionTable;
