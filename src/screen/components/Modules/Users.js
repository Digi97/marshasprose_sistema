import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button,Modal, Form} from "react-bootstrap";
import { withTranslation } from "react-i18next";

import AppUtil from "../../../AppUtil/AppUtil";

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
    usuario_id:0,
    empresa:"",
    apellido1:"",
    apellido2:"",
    correo:"",
    contrasena:"",
    id_Empleado:"",
    roles_id:0,
    activo:false,
      
  },
  users:[],
  roles:[],
  //manejo de alertas
      error: false,
      errorMsg: "",
      color:"",
    }
  }



//#region Funciones internas
    toggleShow = () => this.setState({show: !this.state.show, user:{usuario_id:0,
    empresa:"",
    apellido1:"",
    apellido2:"",
    correo:"",
    contrasena:"",
    id_Empleado:"",
    roles_id:0,
    activo:false}},  ()=>{this.getRoles()})


    _saveStateVariable = async (e) => {

      const {name, type, checked, value} = e.target;
    await this.setState({
            user: {
              ...this.state.user,
              [name]: type ==="checkbox" ? (checked? 1:0): value,
            },
          });
    }


    saveUser = (e) => {


        const { t } = this.props;
 let {user} = this.state;


    user.activo = user.activo ? 1 : 0; //asignacion para tipo de dato 

       e.preventDefault();
      e.stopPropagation();
      if(user.usuario_id === 0) //creacion
      {
           AppUtil.postAPI(`users`, user).then(response => {
            let user = response ? response.data : [];
            console.log(user);
            
        
           })
          
      } 
      else //actualizacion
      {
      AppUtil.putAPI(`users/${user.usuario_id}`, user).then(response => {

        if(response)
        {
          let user = response ? response.data : [];

                if(Number.isInteger(user))
                {
                    this.setState({
                  error: true,
                  errorMsg: t("updated_successfully"),
                  color:"alert alert-success"
                });
                } 
                else
                  {
              this.setState({
                  error: true,
                  errorMsg: t('please_verify_data'),
                  color:"alert alert-success"
                });
                }
        } 
        else
        {
                  
        this.setState({
          error: true,
          errorMsg: t('please_verify_data'),
          color:"alert alert-danger"
        });
        }
     
     // this.setState({user});
           })
      }
    // e.target.reset();
     
   

      }

    getUsers = () =>{
      AppUtil.getAPI(`users`, sessionStorage.getItem('token')).then(response => {
      let users = response ? response.data : [];
      this.setState({users});
    });
  }

  getUserById = (id) =>
  {
        AppUtil.getAPI(`users/${id}`, sessionStorage.getItem('token')).then(response => {
      let user = response ? response.data : [];      
      this.setState({user, show:true}, ()=>{this.getRoles()});
    });

  }


  getRoles = () => AppUtil.getAPI(`roles`, sessionStorage.getItem('token')).then(response => {
      let roles = response ? response.data : [];
      this.setState({roles});
    });


  ActionButtons = (rowData) => {
    return (
        <Row className="m-2">
          <Col lg="12" sm="12">
               <Button variant="info" className="btn-fill btn-rounded" onClick={() => this.getUserById(rowData.usuario_id)}><i className="fas fa-pen" /></Button>
          </Col>
        </Row>
    );
};

  componentDidMount(){
    this.getUsers();
    
  }
    //#endregion fin funciones internas


     render(){
       const { t } = this.props;
       let {roles, users, user} = this.state;
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
                data={users} 
                columns={[
                  {data:'usuario_id', title:t("id")},
                  {data:'nombre', title:t("name")},
                  {data:'apellido1', title:t("lastname")},
                  {data:'apellido2', title:t("secondlastname")},
                  {data:'correo', title:t("email")},
                  {data:'rol', title:t("rol")},
                  {data:'id_Empleado', title:t("employeeid")},
                  {data:'activo', title:t("status"), render: (data, type, row) => { return row.activo ===1 ? t('active'):t("inactive") }},
                  {title:t("action"), data:null, orderable: false, searchable:false, 
                 //   render:(data, type, row)=> {return `<Button variant="danger" className="btn-fill btn-rounded" onClick={this.removeLine(${row.usuario_id})}><i className="fas fa-trash" /></Button>` }
                 },
                ]}
                className="display table cell-border compact stripe"     
                slots={{8: (cellData, rowData) => this.ActionButtons(rowData, cellData)}}
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
     <Form onSubmit={this.saveUser}>

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("users")}</h3>
               {this.state.error === true && (
              <div className={this.state.color} role="alert">
                {this.state.errorMsg}
              </div>
            )}
          </Modal.Header>
          <Modal.Body>
          
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label>{t("name")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("name")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="Nombre"
                        required
                        value={user.nombre}
                        maxLength={100}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                  <Col sm="12" xl="6">
                    <label>{t("lastname")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("lastname")}
                        type="text"
                         onChange={this._saveStateVariable}
                        name="apellido1"
                        required
                        maxLength={100}
                        value={user.apellido1}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
                   </Row>
                   <Row className="m-2">

                  <Col sm="12" xl="6">
                    <label>{t("secondlastname")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("secondlastname")}
                        type="text"
                         onChange={this._saveStateVariable}
                        name="apellido2"
                        required
                        maxLength={100}
                        value={user.apellido2}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>


                <Col sm="12" xl="6">
                    <label>{t("email")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("email")}
                        type="text"
                         onChange={this._saveStateVariable}
                        name="correo"
                        required
                        maxLength={100}
                        value={user.correo}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
                   </Row>


             <Row className="m-2">
                    <Col sm="12" xl="12">
                    <label>{t("password")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("password")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="contraseña"
                        required={user.usuario_id > 0 ? true:false}
                        maxLength={20}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>


                    <Col sm="12" xl="12">
                    <label className="txt-darkblue">{t("rol")}</label>
                       <Form.Group>
                          <Form.Select aria-label="Roles_id" name="roles_id" onChange={this._saveStateVariable} required>
                            <option value="">-- Seleccione una opción --</option>
                           
                            {roles?.map((item, key) =>(item.id === user.roles_id  ? <option value={item.id} selected defaultValue key={key}>{item.descripcion}</option> :  <option value={item.id} key={key}>{item.descripcion}</option>))}
                            </Form.Select>
                       </Form.Group>
                   </Col>

                <Col sm="12" xl="12">
                    <label>{t("employeeid")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("employeeid")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="id_Empleado"
                        required
                        value={user.id_Empleado}
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
                              name="activo"
                              onChange={this._saveStateVariable}
                              checked={user.activo ===1 ? true :false}
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
         </Form>
        </Modal>
        
      </Container>
    </>
  );


     }
}

 export default withTranslation()(Users)
