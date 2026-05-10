import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button,Modal, Form } from "react-bootstrap";

import { withTranslation } from "react-i18next";
DataTable.use(DT);

class Type_Accounting_Account extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [],
  show:false,
  processing: false,
  type_accounting_account:{
    id:"",
    nombre:"",
    naturaleza:"",
  }
    }
  }



//#region Funciones internas
    toggleShow = () => this.setState({show: !this.state.show}) //muestra el modal de agregar/modificar

    _saveStateVariable = async (e) => {
    await this.setState({
            type_accounting_account: {
              ...this.state.question,
              [e.target.name]: e.target.value,
            },
          });

    }


    savePC = () => {
      
    }

    //#endregion fin funciones internas


     render(){
       const { t } = this.props;
      return (
    <>
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <h1>{t("type_accounting_account")}</h1>
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
            <Col lg="2" sm="12">
              <Button
                className="btn-fill btn-rounded bg-blue"
                onClick={()=> this.props.navigate(-1)}>
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
                  <th>{t("id")}</th>
                  <th>{t("name")}</th>
                  <th>{t("nature")}</th>
                  <th>{t("action")}</th>
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
            <h3 className=" tituloFerias">{t("type_accounting_account")}</h3>
          </Modal.Header>
          <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("name")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("name")}
                        type="text"
                        onChange={this.getInputData}
                        name="nombre"
                        required
                        maxLength={100}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                 </Row>

                 <Row className="m-2">

                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">{t("nature")}</label>
                       <Form.Group>
                            <Form.Control
                                placeholder={t("nature")}
                                type="text"
                                onChange={this.getInputData}
                                name="naturaleza"
                                required
                                maxLength={100}
                                />
                       </Form.Group>
                     </Col>       
                   </Row>

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

 export default withTranslation()(Type_Accounting_Account)
