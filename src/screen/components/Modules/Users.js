import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button,Modal, Form} from "react-bootstrap";
import { withTranslation } from "react-i18next";
DataTable.use(DT);

class Users extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [],
  show:false,
  processing: false,
  user:{
    id:"",
    empresa:"",
    apellido1:"",
    apellido2:"",
    correo:"",
    contrasena:"",
    correo:"",
    rol_id:0,
    id_empleado:0,
    activo:false    
  }
    }
  }



//#region Funciones internas
    toggleShow = () => this.setState({show: !this.state.show})


    _saveStateVariable = async (e) => {
    await this.setState({
            user: {
              ...this.state.question,
              [e.target.name]: e.target.value,
            },
          });

    }


    saveUser = () => {
      
    }

    //#endregion fin funciones internas


     render(){
       const { t } = this.props;
      return (
    <>
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <h1>{t("users")}</h1>
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
                  <th>{t("business")}</th>
                  <th>{t("name")}</th>
                  <th>{t("lastname")}</th>
                  <th>{t("secondlastname")}</th>
                  <th>{t("email")}</th>
                  <th>{t("rol")}</th>
                  <th>{t("employeeid")}</th>
                  <th>{t("status")}</th>
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
            <h3 className=" tituloFerias">{t("users")}</h3>
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
                        name="Nombre"
                        required
                        maxLength={100}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                  <Col sm="12" xl="12">
                    <label>{t("lastname")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("lastname")}
                        type="text"
                        onChange={this.getInputData}
                        name="Apellido1"
                        required
                        maxLength={100}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                  <Col sm="12" xl="12">
                    <label>{t("secondlastname")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("secondlastname")}
                        type="text"
                        onChange={this.getInputData}
                        name="Apellido2"
                        required
                        maxLength={100}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                    <Col sm="12" xl="12">
                    <label>{t("password")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("password")}
                        type="text"
                        onChange={this.getInputData}
                        name="Contraseña"
                        required
                        maxLength={20}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>


                    <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("rol")}</label>
                       <Form.Group>
                          <Form.Select aria-label="Rol_id" name="rol_id" onChange={this._saveStateVariable} required>
                            <option value="">-- Seleccione una opción --</option>
                          {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                            </Form.Select>
                       </Form.Group>
                   </Col>

                <Col sm="12" xl="12">
                    <label>{t("employeeid")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("employeeid")}
                        type="text"
                        onChange={this.getInputData}
                        name="Id_Empleado"
                        required
                        maxLength={20}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                       <Col sm="12" xl="12">
                         <Form.Group>
                           <Form.Check // prettier-ignore
                             type="checkbox"
                            id="active"
                             label={t("active")}
                              name="Estado"/>
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

 export default withTranslation()(Users)
