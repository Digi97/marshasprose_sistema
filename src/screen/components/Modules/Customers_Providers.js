import React, {Component} from "react";

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button,Modal,Tabs, Form, Tab} from "react-bootstrap";
import Table from 'react-bootstrap/Table';
import Select from 'react-select'
import { withTranslation } from "react-i18next";
DataTable.use(DT);


class Invoice extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [],
    showCustomer:false,
    showProvider:false,
    processing: false,
  customer_provider:{
    id:0,
    identificacion:"",
    tipo_identificacion_id:0,
    nombre:"",
    apellido1:"",
    apellido2:"",
    correo:"",
    distrito_id:0,
    canton_id:0,
    provincia_id:0,
    codigo_actividad:0,
    estado:0,
    fecha_creacion:"",
    fecha_actualizacion:"",
    exonerado:0,
    otrassenas:0
  },
    telefonos:[]
    }
  }



//#region Funciones internas
    toggleShowCustomer = () => this.setState({showCustomer: !this.state.showCustomer})
    toggleShowProvider = () => this.setState({showProvider: !this.state.showProvider})

    addPhone = (e) => {
      e.preventDefault();
      e.stopPropagation();

        const formData = new FormData(e.target);

        const telefonos = {
            Numero: formData.get("Numero"),
            codigo_pais: formData.get("codigo_pais"),
            main:formData.get("telefono_principal"),
  
        };

        this.setState((prevState) => ({
            telefonos: [...prevState.telefonos, telefonos]
        }));   
              e.target.reset();

              // agregar conexion a axios

    }

    removeLine = (index) =>{
    this.setState((prevState) => ({
        telefonos: prevState.telefonos.filter((line, i) => i !== index)
    }));

    }

   

    saveCustomerProvider = () => {
      
    }

    //#endregion fin funciones internas


     render(){
       const { t } = this.props;
      return (
    <>
      <Container fluid>
        <Tabs id="controlled-tab-example" className="mb-3 txt-blue" defaultActiveKey="customer">
          <Tab eventKey="customer" title={t("customer")} className="txt-darkblue">
          <Row>
          <Col lg="6" sm="12">
            <h1>{t("customer")}</h1>
          </Col>
          <Col lg="6" sm="12">
            <Row>
              <Col lg="3" sm="12">
                <Button
                  className="btn-fill btn-rounded bg-blue"
                  onClick={this.toggleShowCustomer}>
                    {t("create")}
                </Button>
              </Col>
              <Col lg="2" sm="12">
                <Button
                className="btn-fill btn-rounded bg-blue">
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
                  <th>{t("identification")}</th>
                  <th>{t("name")}</th>
                  <th>{t("creation_date")}</th>                 
                  <th>{t("action")}</th>
                </tr>
              </thead>
            </DataTable>
        
        </Row>


          </Tab>
        
        <Tab eventKey="provider" title={t("provider")} className="txt-darkblue">
                   <Row>
          <Col lg="6" sm="12">
            <h1>{t("provider")}</h1>
          </Col>
          <Col lg="6" sm="12">
            <Row>
              <Col lg="3" sm="12">
                <Button
                  className="btn-fill btn-rounded bg-blue"
                  onClick={this.toggleShowProvider}>
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
                  <th>{t("identification")}</th>
                  <th>{t("name")}</th>
                  <th>{t("creation_date")}</th>                 
                  <th>{t("action")}</th>
                </tr>
              </thead>
            </DataTable>
        
        </Row>
          </Tab>
        </Tabs>
        <Modal
          show={this.state.showCustomer}
          onHide={this.toggleShowCustomer}
          backdrop="static"
          keyboard={false}
          size="lg"
          className="max-z-index">
          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("customer")}</h3>
          </Modal.Header>
          <Modal.Body>
         
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("identification_type")}</label>
                    <Form.Group>
                      <Form.Select aria-label="tipo_identificacion_id" name="tipo_identificacion_id" onChange={this._saveStateVariable} required>
                        <option value="">-- Seleccione una opción --</option>
                        {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                     </Form.Select>
                    </Form.Group>
                </Col>
                  <Col sm="12" xl="6">
                    <label>{t("identification")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("identification")}
                        type="text"
                        onChange={this.getInputData}
                        name="clave"
                        required
                        maxLength={45}
                        
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
               </Row>


                <Row className="m-2">
                 <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("activity_code")}</label>
                    <Form.Group>
                      <Form.Select aria-label="codigo_actividad_id" name="codigo_actividad_id" onChange={this._saveStateVariable} required>
                        <option value="">-- Seleccione una opción --</option>
                        {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                     </Form.Select>
                    </Form.Group>
                </Col>

                  <Col sm="12" xl="6">
                    <label>{t("name")}</label>
                    <Form.Group>
                      <Form.Control
                          placeholder={t("name")}
                          type="text"
                          onChange={this.getInputData}
                          name="Nombre"
                          required
                          maxLength={250}
                          
                          >
                        </Form.Control>
                    </Form.Group>
                   </Col>

                   </Row>
                <Row className="m-2">               
                  <Col sm="12" xl="6">
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

                  <Col sm="12" xl="6">
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
                 </Row>

                 <Row className="m-2">

                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">{t("email")}</label>
                       <Form.Group>
                         <Form.Control
                          placeholder={t("email")}
                          type="mail"
                          onChange={this.getInputData}
                          name="correo"
                          required
                          
                          
                          />
                       </Form.Group>
                     </Col>
                   </Row>

                   <Row className="m-2">
                     <Col sm="12" xl="4">
                       <label className="txt-darkblue">{t("province")}</label>
                      <Form.Group>
                         <Form.Select aria-label="Provincia_id" name="Provincia_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>

                      <Col sm="12" xl="4">
                       <label className="txt-darkblue">{t("canton")}</label>
                      <Form.Group>
                         <Form.Select aria-label="Canton_id" name="Canton_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>

                      <Col sm="12" xl="4">
                       <label className="txt-darkblue">{t("district")}</label>
                      <Form.Group>
                         <Form.Select aria-label="Distrito_id" name="Distrito_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
                    </Row>

                    <Row className="m-2">

                      <Col sm="12" xl="12">
                       <label className="txt-darkblue">{t("address")}</label>
                      <Form.Group>
                         
                         <Form.Control
                          placeholder={t("address")}
                          type="textarea"
                          onChange={this.getInputData}
                          name="OtrasSenas"
                          required
                          
                          
                          />
                      </Form.Group>
                      </Col>
                    </Row>

                  <Row className="m-2">

                     <Col sm="12" xl="4">
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="exonerado"
                        label={t("exonerated")}
                        name="exonerado"/>
                      </Col>

                     <Col sm="12" xl="4">
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="estado"
                        label={t("status")}
                        name="estado"/>
                      </Col>

              </Row>


   <div className="well">
                      <Form onSubmit={this.addPhone}>
                        
      
                        <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("code")}</label>
                      <Form.Group>
                          <Form.Control
                            placeholder={"+506"}
                            type="number"
                            name="codigo_pais"
                            required
                            maxLength={4}
                          />
                      </Form.Group>
                      </Col>
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("number")}</label>
                        <Form.Group>
                          <Form.Control
                          placeholder={t("number")}
                          type="number"
                          name="Numero"
                          required
                          maxLength={20}
                          />
                      </Form.Group>
                      </Col>
                  
                 
                    </Row>
                  <Row className="m-2">
                    
                    <Col sm="12" xl="6">
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="telefono_principal"
                        label={t("main")}
                        name="telefono_principal"/>
                      </Col>
                      <Col sm="12" xl="6">
                        <Button variant="primary" className="btn-fill btn-rounded" type="submit">{t("add_phone")}</Button>
                      </Col>


                    </Row>


                  
                    <Row className="m-3">
                           <Col sm="12" xl="12">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>{t("id")}</th>
                          <th>{t("code")}</th>
                          <th>{t("number")}</th>
                           <th>{t("main")}</th>
                          <th>{t("action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                       {this.state.telefonos.length > 0 && (
                        this.state.telefonos.map((line, index) => (
                          <tr key={index}>
                              <td>{index +1}</td>
                              <td>{line.codigo_pais}</td>
                              <td>{line.Numero}</td>
                              <td>{line.main === 1? t("yes"):t("no") }</td>
                              <td><Button variant="danger" className="btn-fill btn-rounded" onClick={() => this.removeLine(index)}> <i className="fas fa-trash" /></Button></td>
                          </tr>
                ))
              )}


                      </tbody>
                </Table>

                           </Col>
                    </Row>


                      </Form>
                    </div>



          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-rounded" onClick={this.toggleShowCustomer}>
              {t("close")}
            </Button>
            {this.state.processing ? <div className="lds-dual-ring-2"></div> : <Button variant="primary" className="btn-fill btn-rounded" type="submit">{t("save")}</Button>}
          </Modal.Footer>
         
        </Modal>



          <Modal
              show={this.state.showProvider}
              onHide={this.toggleProvider}
              backdrop="static"
              keyboard={false}
              size="lg"
              className="max-z-index"
          >
     

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("provider")}</h3>
          </Modal.Header>      
        <Modal.Body>
         
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("identification_type")}</label>
                    <Form.Group>
                      <Form.Select aria-label="tipo_identificacion_id" name="tipo_identificacion_id" onChange={this._saveStateVariable} required>
                        <option value="">-- Seleccione una opción --</option>
                        {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                     </Form.Select>
                    </Form.Group>
                </Col>
                  <Col sm="12" xl="6">
                    <label>{t("identification")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("identification")}
                        type="text"
                        onChange={this.getInputData}
                        name="clave"
                        required
                        maxLength={45}
                        
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
               </Row>


                <Row className="m-2">
                 <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("activity_code")}</label>
                    <Form.Group>
                      <Form.Select aria-label="codigo_actividad_id" name="codigo_actividad_id" onChange={this._saveStateVariable} required>
                        <option value="">-- Seleccione una opción --</option>
                        {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                     </Form.Select>
                    </Form.Group>
                </Col>

                  <Col sm="12" xl="6">
                    <label>{t("name")}</label>
                    <Form.Group>
                      <Form.Control
                          placeholder={t("name")}
                          type="text"
                          onChange={this.getInputData}
                          name="Nombre"
                          required
                          maxLength={250}
                          
                          >
                        </Form.Control>
                    </Form.Group>
                   </Col>

                   </Row>
                <Row className="m-2">               
                  <Col sm="12" xl="6">
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

                  <Col sm="12" xl="6">
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
                 </Row>

                 <Row className="m-2">

                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">{t("email")}</label>
                       <Form.Group>
                         <Form.Control
                          placeholder={t("email")}
                          type="mail"
                          onChange={this.getInputData}
                          name="correo"
                          required
                          
                          
                          />
                       </Form.Group>
                     </Col>
                   </Row>

                   <Row className="m-2">
                     <Col sm="12" xl="4">
                       <label className="txt-darkblue">{t("province")}</label>
                      <Form.Group>
                         <Form.Select aria-label="Provincia_id" name="Provincia_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>

                      <Col sm="12" xl="4">
                       <label className="txt-darkblue">{t("canton")}</label>
                      <Form.Group>
                         <Form.Select aria-label="Canton_id" name="Canton_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>

                      <Col sm="12" xl="4">
                       <label className="txt-darkblue">{t("district")}</label>
                      <Form.Group>
                         <Form.Select aria-label="Distrito_id" name="Distrito_id" onChange={this._saveStateVariable} required>
                              <option value="">-- Seleccione una opción --</option>
                            {/*categories?.map((item, key) =>( <option value={item.id} key={key}>{item.name}</option>))*/}
                              </Form.Select>
                      </Form.Group>
                      </Col>
                    </Row>

                    <Row className="m-2">

                      <Col sm="12" xl="12">
                       <label className="txt-darkblue">{t("address")}</label>
                      <Form.Group>
                         
                         <Form.Control
                          placeholder={t("address")}
                          type="textarea"
                          onChange={this.getInputData}
                          name="OtrasSenas"
                          required
                          
                          
                          />
                      </Form.Group>
                      </Col>
                    </Row>

                  <Row className="m-2">

                     <Col sm="12" xl="4">
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="exonerado"
                        label={t("exonerated")}
                        name="exonerado"/>
                      </Col>

                     <Col sm="12" xl="4">
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="estado"
                        label={t("status")}
                        name="estado"/>
                      </Col>

              </Row>


   <div className="well">
                      <Form onSubmit={this.addPhone}>
                        
      
                        <Row className="m-2">
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("code")}</label>
                      <Form.Group>
                          <Form.Control
                            placeholder={"+506"}
                            type="number"
                            name="codigo_pais"
                            required
                            maxLength={4}
                          />
                      </Form.Group>
                      </Col>
                     <Col sm="12" xl="6">
                       <label className="txt-darkblue">{t("number")}</label>
                        <Form.Group>
                          <Form.Control
                          placeholder={t("number")}
                          type="number"
                          name="Numero"
                          required
                          maxLength={20}
                          />
                      </Form.Group>
                      </Col>
                  
                 
                    </Row>
                  <Row className="m-2">
                    
                    <Col sm="12" xl="6">
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id="telefono_principal"
                        label={t("main")}
                        name="telefono_principal"/>
                      </Col>
                      <Col sm="12" xl="6">
                        <Button variant="primary" className="btn-fill btn-rounded" type="submit">{t("add_phone")}</Button>
                      </Col>


                    </Row>


                  
                    <Row className="m-3">
                           <Col sm="12" xl="12">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>{t("id")}</th>
                          <th>{t("code")}</th>
                          <th>{t("number")}</th>
                           <th>{t("main")}</th>
                          <th>{t("action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                       {this.state.telefonos.length > 0 && (
                        this.state.telefonos.map((line, index) => (
                          <tr key={index}>
                              <td>{index +1}</td>
                              <td>{line.codigo_pais}</td>
                              <td>{line.Numero}</td>
                              <td>{line.main === 1? t("yes"):t("no") }</td>
                              <td><Button variant="danger" className="btn-fill btn-rounded" onClick={() => this.removeLine(index)}> <i className="fas fa-trash" /></Button></td>
                          </tr>
                ))
              )}


                      </tbody>
                </Table>

                           </Col>
                    </Row>


                      </Form>
                    </div>



          </Modal.Body>



          <Modal.Footer>

            <Button variant="light" className="btn-rounded" onClick={this.toggleShowProvider}>
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

 export default withTranslation()(Invoice)
