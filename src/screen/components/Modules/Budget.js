import React, {Component, createRef} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button,Modal, Form} from "react-bootstrap";
import { withTranslation } from "react-i18next";
import crypto from "crypto-js";
import moment from 'moment-timezone'
import AppUtil from "../../../AppUtil/AppUtil";
import alertSuccess from "../common/SweetAlert";
import RenderActive from '../common/renderActive'
import ActionButtons from '../common/ActionButtons'

DataTable.use(DT);

class Budget extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [],
  show:false,
  processing: false,
  budgets:[],
  budget:{
    id:0,
    codigo:"",
    nombre:"",
    descripcion:"",
    anio_presupuesto:"",
    periodo_inicio:moment().format("YYYY-MM-DD"),
    periodo_fin:moment().add(1, 'y').format("YYYY-MM-DD"),
    categoria_presupuestaria_id:"",
    monto_aprobado:"",
    monto_modificado:"",
    monto_comprometido:"",
    monto_ejecutado:"",
    estado:0,
    fecha_creacion:"",
    fecha_actualizacion:"",
    usuarios_Usuario_id:0,
    centro_Costos_id:""
  },
  cost_center:[],
  presupuestary_category:[],
 
      user:{}
    }
this.datatableRef = createRef();

       
  }



//#region Funciones internas

    toggleShow = () => this.setState({show: !this.state.show,budget:{
    id:0,
    codigo:"",
    nombre:"",
    descripcion:"",
    anio_presupuesto:"",
    periodo_inicio:moment().format("YYYY-MM-DD"),
    periodo_fin:moment().add(1, 'y').format("YYYY-MM-DD"),
    categoria_presupuestaria_id:"",
    monto_aprobado:"",
    monto_modificado:"",
    monto_comprometido:"",
    monto_ejecutado:"",
    estado:0,
    fecha_creacion:"",
    fecha_actualizacion:"",
    usuarios_Usuario_id:0,
    centro_Costos_id:""
  }})
    _saveStateVariable = async (e) => {

      const {name, type, checked, value} = e.target;
    await this.setState({
            budget: {
              ...this.state.budget,
              [name]: type ==="checkbox" ? (checked? 1:0): value,
            },
          });
    }

    saveBudget = (e) => {


    const { t } = this.props;
    let {budget} = this.state; //asignacion para tipo de dato 

      e.preventDefault();
      e.stopPropagation();
   
      budget.usuarios_Usuario_id = this.state.user.usuario_id;
 
      if(budget.id === 0) //creacion
      {

        
           AppUtil.postAPI(`gestion_presupuestaria`, budget).then(response => {
if(response.codeStatus === 200)
{
   let budget = response ? response.data : [];
    if(Number.isInteger(budget))
                {

                  alertSuccess(t("record_created_successfully"),"success",t);
            this.toggleShow()
            this.setState({ processing: false });
            this.getBudget()
          // Guardar los detalles con el id del gasto recién creado
      

              
          } 

} else
  {
     alertSuccess(t(response.message),"error",t);
    
    }

            
        
           })
          
      } 
      else //actualizacion
      {
      AppUtil.putAPI(`gestion_presupuestaria/${budget.id}`, budget).then(response => {

        if(response)
        {
          let budget = response ? response.data : [];

                if(Number.isInteger(budget))
                {
                  alertSuccess(t("updated_successfully"),"success",t);
                  this.getBudget()
                  this.toggleShow()
               
                } 
                else
                  {
                     alertSuccess(t(response.message),"error",t);
                }
        } 
        else
        {
          alertSuccess(t("please_verify_data"),"error",t);
     
        }

           })
      }
    // e.target.reset();
     
   

      }

    getBudget = () =>{
      AppUtil.getAPI(`gestion_presupuestaria`).then(response => {
      let budgets = response ? response.data : [];
      this.setState({budgets});
    });
  }

  getBudgetById = (id) =>
  {

        AppUtil.getAPI(`gestion_presupuestaria/${id}`).then(response => {
        
      let budget = response ? response.data : [];      
      this.setState({budget, show:true}, ()=>{this.getCostCenter(); this.getCategories()});
    });

  }


  getCategories = () => AppUtil.getAPI(`catalogos/categoria_presupuestaria`).then(response => {
      let presupuestary_category = response ? response.data : [];
      this.setState({presupuestary_category});
    });

      getCostCenter = () => AppUtil.getAPI(`catalogos/centro_costos`).then(response => {
      let cost_center = response ? response.data : [];
      this.setState({cost_center});
    });


  ActionButtons = (rowData) => (

      <ActionButtons
        viewAction={() => this.getBudgetById(rowData.id)}
        editAction={() => this.getBudgetById(rowData.id)}
      />

   
    );



  componentDidMount(){
    this.getUserInfo();
    this.getBudget();
    this.getCostCenter(); 
    this.getCategories();
  }

   getUserInfo = () => {
      let bytes = crypto.AES.decrypt(
        sessionStorage.getItem("user"),
        "@marsh_contable",
      );
      this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
      this.setState({ user: this.user, token: sessionStorage.getItem("sessionId") });
    };

    //#endregion fin funciones internas


     render(){
       const { t } = this.props;
       let {cost_center, budget, budgets, presupuestary_category} = this.state;
      return (
    <>
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <h1>{t("budget_management")}</h1>
          </Col>
          <Col lg="6" sm="12">
          <Row>
            <Col lg="3" sm="12">
              <Button
                onClick={this.toggleShow}>
                  {t("create")}
              </Button>
            </Col>
          

          </Row>
          </Col>

        </Row>

        <Row>
                <DataTable
                data={budgets} 
                columns={[
                  {data:'id', title:t("id")},
                  {data:'codigo', title:t("code")},
                  {data:'nombre', title:t("name")},
                  {data:'anio_presupuesto', title:t("year_budget")},
                  {data:'periodo_inicio', title:t("begin_period"), render: (data, type, row) =>{ 
                   return moment(`${data}`).format(`${row.formato}`) }},
                  {data:'periodo_fin', title:t("end_period"),  render: (data, type, row) =>{ return moment(`${data}`).format(`${row.formato}`) }},
                  {data:'categoria_presupuestaria', title:t("category")},
                  {data:'centro_costo', title:t("cost_center")},
                  {data:'estado', title:t("status")},
                  {title:t("action"), data:null, orderable: false, searchable:false, 
                 //   render:(data, type, row)=> {return `<Button variant="danger" className="" onClick={this.removeLine(${row.usuario_id})}><i className="fas fa-trash" /></Button>` }
                 },
                ]}
                className="display table cell-border compact stripe"     
                slots={{
                  8: (cellData, rowData) => RenderActive(cellData, t),
                  9: (cellData, rowData) => this.ActionButtons(rowData, cellData)}}
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
              
          >
     <Form onSubmit={this.saveBudget}>

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("budget_management")}</h3>
          
          </Modal.Header>
          <Modal.Body>
          
                <Row className="m-2">
                  <Col sm="12" xl="6">
                    <label>{t("code")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("code")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="codigo"
                        required
                        value={budget.codigo}
                        maxLength={100}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                  <Col sm="12" xl="6">
                    <label>{t("name")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("name")}
                        type="text"
                         onChange={this._saveStateVariable}
                        name="nombre"
                        required
                        maxLength={100}
                        value={budget.nombre}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
                   </Row>
                   <Row className="m-2">

                  <Col sm="12" xl="6">
                    <label>{t("description")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("description")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="descripcion"
                        required
                        maxLength={100}
                        value={budget.descripcion}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>


                <Col sm="12" xl="6">
                    <label>{t("year_budget")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("year_budget")}
                        type="text"
                         onChange={this._saveStateVariable}
                        name="anio_presupuesto"
                        required
                        maxLength={100}
                        value={budget.anio_presupuesto}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
                   </Row>


             <Row className="m-2">
                    <Col sm="12" xl="6">
                    <label>{t("begin_period")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("begin_period")}
                        type="date"
                        onChange={this._saveStateVariable}
                        name="periodo_inicio"
                        required
                        maxLength={20}
                        value={moment(budget.periodo_inicio).format("YYYY-MM-DD")}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>


                    <Col sm="12" xl="6">
                    <label className="txt-darkblue">{t("end_period")}</label>
                       <Form.Group>
                           <Form.Control
                        placeholder={t("end_period")}
                        type="date"
                        onChange={this._saveStateVariable}
                        name="periodo_fin"
                        required
                        maxLength={20}
                        value={moment(budget.periodo_fin).format("YYYY-MM-DD")}
                        >
                       </Form.Control>
                       </Form.Group>
                   </Col>
                   </Row>
                   <Row className="m-2">

                <Col sm="12" xl="6">
                    <label>{t("presupuestary_category")}</label>
                   <Form.Group>                  
                     <Form.Select
                                          placeholder={t("presupuestary_category")}
                                          onChange={this._saveStateVariable}
                                          name="categoria_presupuestaria_id"
                                          required
                                        >
                                          <option value="">{t("select_option")}</option>
                                          {presupuestary_category?.map((item, key) =>
                                            item.id ===
                                            budget.categoria_presupuestaria_id ? (
                                              <option
                                                value={item.id}
                                                selected
                                                defaultValue
                                                key={key}
                                              >
                                                {item.nombre}
                                              </option>
                                            ) : (
                                              <option value={item.id} key={key}>
                                                {item.nombre}
                                              </option>
                                            ),
                                          )}
                                        </Form.Select>
                   </Form.Group>
                   </Col>

<Col sm="12" xl="6">
                    <label>{t("cost_center")}</label>
                   <Form.Group>                  
                     <Form.Select
                                          placeholder={t("cost_center")}
                                          onChange={this._saveStateVariable}
                                          name="centro_Costos_id"
                                          required
                                        >
                                          <option value="">{t("select_option")}</option>
                                          {cost_center?.map((item, key) =>
                                            item.id ===
                                            budget.centro_Costos_id ? (
                                              <option
                                                value={item.id}
                                                selected
                                                defaultValue
                                                key={key}
                                              >
                                                {item.nombre}
                                              </option>
                                            ) : (
                                              <option value={item.id} key={key}>
                                                {item.nombre}
                                              </option>
                                            ),
                                          )}
                                        </Form.Select>
                   </Form.Group>
                   </Col>
                   </Row>

<Row className="m-2">
  <Col sm="12" xl="4">
      <label className="txt-darkblue">{t("amount_approved")}</label>
                       <Form.Group>
                      <Form.Control
                        placeholder={t("amount_approved")}
                        type="number"
                        onChange={this._saveStateVariable}
                        name="monto_aprobado"
                        required
                        value={budget.monto_aprobado}
                        >
                       </Form.Control>
                       </Form.Group>
  
  </Col>

    <Col sm="12" xl="4">
      <label className="txt-darkblue">{t("amount_modified")}</label>
                       <Form.Group>
                      <Form.Control
                        placeholder={t("amount_modified")}
                        type="number"
                        onChange={this._saveStateVariable}
                        name="monto_modificado"
                        required
                        value={budget.monto_modificado}
                        >
                       </Form.Control>
                       </Form.Group>
  
  </Col>

    <Col sm="12" xl="4">
      <label className="txt-darkblue">{t("amount_compromised")}</label>
                       <Form.Group>
                      <Form.Control
                        placeholder={t("amount_compromised")}
                        type="number"
                        onChange={this._saveStateVariable}
                        name="monto_comprometido"
                        required
                        value={budget.monto_comprometido}
                        >
                       </Form.Control>
                       </Form.Group>
  
  </Col>
</Row>

<Row className="m-2">
    <Col sm="12" xl="12">
      <label className="txt-darkblue">{t("amount_executed")}</label>
                       <Form.Group>
                      <Form.Control
                        placeholder={t("amount_executed")}
                        type="number"
                        onChange={this._saveStateVariable}
                        name="monto_ejecutado"
                        required
                        value={budget.monto_ejecutado}
                        >
                       </Form.Control>
                       </Form.Group>
  
  </Col>
</Row>

                   <Row className="m-2">

                       <Col sm="12" xl="12">
                         <Form.Group>
                           <Form.Check // prettier-ignore
                              type="checkbox"
                              id="active"
                              label={t("active")}
                              name="estado"
                              onChange={this._saveStateVariable}
                              checked={budget.estado ===1 ? true :false}
                              />
                      </Form.Group>
                   </Col>

                 </Row>

               
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-rounded" onClick={this.toggleShow}>
              {t("close")}
            </Button>
            {this.state.processing ? <div className="lds-dual-ring-2"></div> : <Button variant="primary" className="" type="submit">{t("save")}</Button>}
          </Modal.Footer>
         </Form>
        </Modal>
        
      </Container>
    </>
  );


     }
}

 export default withTranslation()(Budget)
