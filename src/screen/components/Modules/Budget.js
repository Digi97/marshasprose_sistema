import React, {Component, createRef} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button, Modal, Form, Card, Table} from "react-bootstrap";
import { withTranslation } from "react-i18next";
import crypto from "crypto-js";
import moment from 'moment-timezone'
import AppUtil from "../../../AppUtil/AppUtil";
import alertSuccess from "../common/SweetAlert";
import Swal from 'sweetalert2';
import RenderActive from '../common/renderActive'
import ActionButtons from '../common/ActionButtons'

DataTable.use(DT);

class Budget extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [],
      isView:false,
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
    centro_Costos_id:"",
    tipo_moneda_id: ""
  },
  cost_center:[],
  presupuestary_category:[],
  showCategoryModal: false,
  categoryLines: [],
  deletedCategoryIds: [],
  newCategoryLine: { nombre: "", tipo_categoria: "", codigo: "", monto_presupuestado: "", tipo_moneda_id: "" },
  showCostCenterModal: false,
  costCenterLines: [],
  deletedCostCenterIds: [],
  newCostCenterLine: { nombre: "", codigo: "", monto_presupuesto_anual: "", tipo_moneda_id: "" },
  budgetMatrix: {},
      user:{}
    }
     this.user = null
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
    centro_Costos_id:"",
    tipo_moneda_id:0,

  },isView:false,
  budgetMatrix: {},
})
    _saveMatrixCell = (catId, ccId, value) => {
      this.setState(prev => ({
        budgetMatrix: { ...prev.budgetMatrix, [`${catId}_${ccId}`]: value }
      }));
    }

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
    let {budget, budgetMatrix} = this.state;

      e.preventDefault();
      e.stopPropagation();

      budget.usuarios_Usuario_id = this.state.user.usuario_id;

      const detalles = Object.entries(budgetMatrix)
        .filter(([, val]) => val !== "" && val !== null && val !== undefined)
        .map(([key, val]) => {
          const [catId, ccId] = key.split("_");
          return {
            categoria_presupuestaria_id: parseInt(catId),
            centro_Costos_id: parseInt(ccId),
            monto: parseFloat(val) || 0
          };
        });
      budget.detalles = detalles;

      const { presupuestary_category, cost_center } = this.state;
      for (const cat of (presupuestary_category || [])) {
        const rowTotal = (cost_center || []).reduce((sum, cc) => (
          sum + (parseFloat(budgetMatrix[`${cat.id}_${cc.id}`]) || 0)
        ), 0);
        const limit = parseFloat(cat.monto_presupuestado || 0);
        if (limit > 0 && rowTotal > limit) {
          alertSuccess(
            `${t("presupuestary_category")} "${cat.nombre}": ${t("total")} ${rowTotal.toFixed(2)} > ${t("budgeted_amount")} ${limit.toFixed(2)}`,
            "error",
            t
          );
          return;
        }
      }

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


      //#region CAtegoria_Presupuestaria_o_Catalogos_Presupuestos
    toggleCategoryModal = () => {
      this.setState(prev => ({
        showCategoryModal: !prev.showCategoryModal,
        categoryLines: !prev.showCategoryModal ? [...this.state.presupuestary_category] : [],
        deletedCategoryIds: [],
        newCategoryLine: { nombre: "", tipo_categoria: "", codigo: "", monto_presupuestado: "", tipo_moneda_id: "" }
      }));
    }

    _saveNewCategoryLine = (e) => {
      const { name, value } = e.target;
      this.setState(prev => ({ newCategoryLine: { ...prev.newCategoryLine, [name]: value } }));
    }

    addCategoryLine = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { newCategoryLine } = this.state;
      this.setState(prev => ({
        categoryLines: [...prev.categoryLines, { ...newCategoryLine, id: 0 }],
        newCategoryLine: { nombre: "", tipo_categoria: "", codigo: "", monto_presupuestado: "", tipo_moneda_id: "" }
      }));
      e.target.reset();
    }

    _saveCategoryLineField = (index, e) => {
      const { name, value } = e.target;
      this.setState(prev => {
        const categoryLines = [...prev.categoryLines];
        categoryLines[index] = { ...categoryLines[index], [name]: value };
        return { categoryLines };
      });
    }

    removeCategoryLine = async (index) => {

        const { t } = this.props;
      const result = await Swal.fire({
        customClass: { container: 'swal-above-modal' },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal-above-modal');
          if (swalContainer) swalContainer.style.zIndex = '9999';
        },
        icon: 'warning',
        title: t('are_you_sure'),
        text: t('this_action_will_delete_the_record'),
        showCancelButton: true,
        confirmButtonColor: '#000f47',
        cancelButtonColor: '#d33',
        confirmButtonText: t('yes_delete'),
        cancelButtonText: t('cancel'),
      });

      if (!result.isConfirmed) return;

      const line = this.state.categoryLines[index];
      if (line.id && line.id > 0) {
        await AppUtil.deleteAPI(`catalogos/categoria_presupuestaria/${line.id}`).then((response)=>{
         
          if(response.codeStatus === 200)
          {
            alertSuccess(t("deleted_successfully"), "success", t);
            this.setState(prev => ({
        categoryLines: prev.categoryLines.filter((_, i) => i !== index),
      }));
          } else{
                        alertSuccess(t(response.message), "error", t);
          }
         

        });
      }

      
    }

    

    saveCategoryLines = async () => {
      const { t } = this.props;
      const { categoryLines } = this.state;

      const tiposCategoriaVistos = new Set();
      for (const line of categoryLines) {
        if (tiposCategoriaVistos.has(line.tipo_categoria)) {
          alertSuccess(t("tipo_categoria_duplicated"), "error", t);
          return;
        }
        tiposCategoriaVistos.add(line.tipo_categoria);
      }

      for (const line of categoryLines) {
        if (line.id && line.id > 0) {
          await AppUtil.putAPI(`catalogos/categoria_presupuestaria/${line.id}`, line);
        } else {
          await AppUtil.postAPI(`catalogos/categoria_presupuestaria`, line);
        }
      }
      alertSuccess(t("updated_successfully"), "success", t);
      this.toggleCategoryModal();
      this.getCategories();
    }

    //#endregion

    //#region Centro_Costos

    toggleCostCenterModal = () => {
      this.setState(prev => ({
        showCostCenterModal: !prev.showCostCenterModal,
        costCenterLines: !prev.showCostCenterModal ? [...this.state.cost_center] : [],
        deletedCostCenterIds: [],
        newCostCenterLine: { nombre: "", codigo: "", monto_presupuesto_anual: "", tipo_moneda_id: "" }
      }));
    }

    _saveNewCostCenterLine = (e) => {
      const { name, value } = e.target;
      this.setState(prev => ({ newCostCenterLine: { ...prev.newCostCenterLine, [name]: value } }));
    }

    addCostCenterLine = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { newCostCenterLine } = this.state;
      this.setState(prev => ({
        costCenterLines: [...prev.costCenterLines, { ...newCostCenterLine, id: 0 }],
        newCostCenterLine: { nombre: "", codigo: "", monto_presupuesto_anual: "", tipo_moneda_id: "" }
      }));
      e.target.reset();
    }

    _saveCostCenterLineField = (index, e) => {
      const { name, value } = e.target;
      this.setState(prev => {
        const costCenterLines = [...prev.costCenterLines];
        costCenterLines[index] = { ...costCenterLines[index], [name]: value };
        return { costCenterLines };
      });
    }

    removeCostCenterLine =async(index) => {


       const { t } = this.props;
      const result = await Swal.fire({
        customClass: { container: 'swal-above-modal' },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal-above-modal');
          if (swalContainer) swalContainer.style.zIndex = '9999';
        },
        icon: 'warning',
        title: t('are_you_sure'),
        text: t('this_action_will_delete_the_record'),
        showCancelButton: true,
        confirmButtonColor: '#000f47',
        cancelButtonColor: '#d33',
        confirmButtonText: t('yes_delete'),
        cancelButtonText: t('cancel'),
      });

      if (!result.isConfirmed) return;

      const line = this.state.costCenterLines[index];
      if (line.id && line.id > 0) {
         AppUtil.deleteAPI(`catalogos/centro_costos/${line.id}`).then((response)=>{
         
          if(response.codeStatus === 200)
          {
            alertSuccess(t("deleted_successfully"), "success", t);
            this.setState(prev => ({
        costCenterLines: prev.costCenterLines.filter((_, i) => i !== index),
      }));
          } else{
                        alertSuccess(t(response.message), "error", t);
          }
         

        });
      }

      
    }

    saveCostCenterLines = async () => {
      const { t } = this.props;
      const { costCenterLines } = this.state;


       const tiposCentroCostosVistos = new Set();
      for (const line of costCenterLines) {
        if (tiposCentroCostosVistos.has(line.codigo)) {
          alertSuccess(t("tipo_centro_costo_duplicated"), "error", t);
          return;
        }
        tiposCentroCostosVistos.add(line.codigo);
      }


      for (const line of costCenterLines) {
        if (line.id && line.id > 0) {
          await AppUtil.putAPI(`catalogos/centro_costos/${line.id}`, line);
        } else {
          await AppUtil.postAPI(`catalogos/centro_costos`, line);
        }
      }

      alertSuccess(t("updated_successfully"), "success", t);
      this.toggleCostCenterModal();
      this.getCostCenter();
    }


    //#endregion
    getBudget = () =>{
      AppUtil.getAPI(`gestion_presupuestaria`).then(response => {
      let budgets = response ? response.data : [];
      this.setState({budgets});
    });
  }

  getBudgetById = (id, isView = false) =>
  {

        AppUtil.getAPI(`gestion_presupuestaria/${id}`).then(response => {        
      let budget = response ? response.data : [];      
      this.setState({budget, show:true, isView}, ()=>{this.getCostCenter(); this.getCategories()});
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
        viewAction={() => this.getBudgetById(rowData.id, true)}
        editAction={() => this.getBudgetById(rowData.id)}
        listAction={() => this.props.navigate(`/home/budget_detail/${rowData.id}`)}
      />

   
    );



  componentDidMount(){
    this.getUserInfo();
    this.getBudget();
    this.getCostCenter(); 
    this.getCategories();
    this.getCurrencies();
  }

   getUserInfo = () => {
      let bytes = crypto.AES.decrypt(
        sessionStorage.getItem("user"),
        "@marsh_contable",
      );
      this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
      
      this.setState({ user: this.user, token: sessionStorage.getItem("sessionId") });
    };

        getCurrencies = () =>
            AppUtil.getAPI("catalogos/tipo_moneda").then((response) => {
                this.setState({ currencies: response ? response.data : [] });
            });
    //#endregion fin funciones internas


     render(){
       const { t } = this.props;
       let {cost_center, budget, budgets, presupuestary_category, isView, currencies} = this.state;
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


        <Row className="m-2">
{/* creacion de las catalogos de presupuesto */}
  <Col lg="6" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("presupuestary_category")}
                                    </p>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#4e73df20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-users" style={{ color: "#4e73df", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-success" role="button" onClick={this.toggleCategoryModal}>
                                {t("manage")}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>


<Col lg="6" sm="6" className="mb-3">
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <Row className="align-items-center">
                                <Col xs="8">
                                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                                        {t("cost_center")}
                                    </p>
                                </Col>
                                <Col xs="4" className="text-end">
                                    <div style={{
                                        backgroundColor: "#4e73df20",
                                        borderRadius: "50%",
                                        width: "50px",
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "auto"
                                    }}>
                                        <i className="fas fa-users" style={{ color: "#4e73df", fontSize: "20px" }} />
                                    </div>
                                </Col>
                            </Row>
                            <hr className="my-2" />
                            <small className="text-success" role="button" onClick={this.toggleCostCenterModal}>
                                {t("manage")}
                            </small>
                        </Card.Body>
                    </Card>
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
              size="xl"
              
          >
     <Form onSubmit={this.saveBudget}>

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("budget_management")}</h3>
          
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
                        name="nombre"
                        required
                        maxLength={100}
                        value={budget.nombre}
                        disabled={isView}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>
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
                        disabled={isView}

                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                   </Row>
                   <Row className="m-2">

                


                <Col sm="12" xl="4">
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
                        disabled={isView}

                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                        <Col sm="12" xl="4">
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
                        disabled={isView}

                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                      <Col sm="12" xl="4">
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
                        disabled={isView}

                        >
                       </Form.Control>
                       </Form.Group>
                   </Col>


                   </Row>

              <Row className="m-2 mt-3">
                <Col sm="12">
                  <p className="txt-darkblue fw-bold mb-2">{t("presupuestary_category")} × {t("cost_center")}</p>
                  {(!presupuestary_category?.length || !cost_center?.length) && (
                    <p className="text-muted fst-italic small">
                      {t("presupuestary_category")}: {presupuestary_category?.length ?? 0} &nbsp;|&nbsp; {t("cost_center")}: {cost_center?.length ?? 0}
                    </p>
                  )}
                  <div className="table-responsive">
                    <Table bordered size="sm" className="align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ minWidth: "150px" }}>{t("presupuestary_category")}</th>
                          {cost_center?.map(cc => (
                            <th key={cc.id} className="text-center" style={{ minWidth: "110px" }}>{cc.nombre}</th>
                          ))}
                          <th className="text-center" style={{ minWidth: "90px" }}>{t("total")}</th>
                          <th className="text-center" style={{ minWidth: "110px" }}>{t("budgeted_amount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {presupuestary_category?.map(cat => {
                          const rowTotal = (cost_center || []).reduce((sum, cc) => (
                            sum + (parseFloat(this.state.budgetMatrix[`${cat.id}_${cc.id}`]) || 0)
                          ), 0);
                          const limit = parseFloat(cat.monto_presupuestado || 0);
                          const exceeded = limit > 0 && rowTotal > limit;
                          return (
                            <tr key={cat.id}>
                              <td className="fw-semibold small">{cat.nombre}</td>
                              {cost_center?.map(cc => (
                                <td key={cc.id} className="p-1">
                                  <Form.Control
                                    type="number"
                                    size="sm"
                                    min={0}
                                    step="0.01"
                                    disabled={isView}
                                    required
                                    value={this.state.budgetMatrix[`${cat.id}_${cc.id}`] ?? ""}
                                    onChange={(e) => this._saveMatrixCell(cat.id, cc.id, e.target.value)}
                                  />
                                </td>
                              ))}
                              <td className="text-center fw-bold" style={{ color: exceeded ? '#dc3545' : '#198754' }}>
                                {rowTotal.toFixed(2)}
                              </td>
                              <td className="text-center text-muted small">
                                {limit.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-rounded" onClick={this.toggleShow}>
              {t("close")}
            </Button>
            {this.state.processing ? <div className="lds-dual-ring-2"></div> : !isView && <Button variant="primary" className="" type="submit">{t("save")}</Button>}
          </Modal.Footer>
         </Form>
        </Modal>
        <Modal
          show={this.state.showCategoryModal}
          onHide={this.toggleCategoryModal}
          backdrop="static"
          keyboard={false}
          size="xl"
          scrollable
        >
          <Modal.Header closeButton>
            <h3 className="tituloFerias">{t("presupuestary_category")}</h3>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.addCategoryLine}>
              <Row className="m-2 align-items-end">
                <Col sm="12" xl="3">
                  <label>{t("name")}</label>
                  <Form.Control
                    placeholder={t("name")}
                    type="text"
                    name="nombre"
                    required
                    maxLength={100}
                    value={this.state.newCategoryLine.nombre}
                    onChange={this._saveNewCategoryLine}
                  />
                </Col>
                <Col sm="12" xl="3">
                  <label>{t("code")}</label>
                  <Form.Control
                    placeholder={t("code")}
                    type="text"
                    name="tipo_categoria"
                    required
                    maxLength={100}
                    value={this.state.newCategoryLine.tipo_categoria}
                    onChange={this._saveNewCategoryLine}
                  />
                </Col>
    
                <Col sm="12" xl="3">
                  <label>{t("budgeted_amount")}</label>
                  <Form.Control
                    placeholder={t("budgeted_amount")}
                    type="number"
                    name="monto_presupuestado"
                    required
                    min={0}
                    step="0.01"
                    value={this.state.newCategoryLine.monto_presupuestado}
                    onChange={this._saveNewCategoryLine}
                  />
                </Col>
                <Col sm="12" xl="2">
                  <label>{t("currency")}</label>
                  <Form.Select
                    name="tipo_moneda_id"
                    required
                    value={this.state.newCategoryLine.tipo_moneda_id}
                    onChange={this._saveNewCategoryLine}
                  >
                    <option value="">{t("select_option")}</option>
                    {currencies?.map((item) => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="12" xl="1">
                  <Button variant="primary" type="submit">
                    <i className="fas fa-plus" />
                  </Button>
                </Col>
              </Row>
            </Form>

            <Row className="m-3">
              <Col sm="12">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>{t("id")}</th>
                      <th>{t("name")}</th>
                      <th>{t("code")}</th>
                      <th>{t("budgeted_amount")}</th>
                      <th>{t("currency")}</th>
                      <th>{t("action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.categoryLines.map((line, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <Form.Control
                            type="text"
                            name="nombre"
                            value={line.nombre || ""}
                            onChange={(e) => this._saveCategoryLineField(index, e)}
                            maxLength={100}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            name="tipo_categoria"
                            value={line.tipo_categoria || ""}
                            onChange={(e) => this._saveCategoryLineField(index, e)}
                            maxLength={100}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            name="monto_presupuestado"
                            value={line.monto_presupuestado || ""}
                            onChange={(e) => this._saveCategoryLineField(index, e)}
                            min={0}
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Form.Select
                            name="tipo_moneda_id"
                            value={line.tipo_moneda_id || ""}
                            onChange={(e) => this._saveCategoryLineField(index, e)}
                          >
                            <option value="">{t("select_option")}</option>
                            {currencies?.map((item) => (
                              <option key={item.id} value={item.id}>{item.nombre}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            onClick={() => this.removeCategoryLine(index)}
                          >
                            <i className="fas fa-trash" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-rounded" onClick={this.toggleCategoryModal}>
              {t("close")}
            </Button>
            <Button variant="primary" onClick={this.saveCategoryLines}>
              {t("save")}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={this.state.showCostCenterModal}
          onHide={this.toggleCostCenterModal}
          backdrop="static"
          keyboard={false}
          size="xl"
          scrollable
        >
          <Modal.Header closeButton>
            <h3 className="tituloFerias">{t("cost_center")}</h3>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.addCostCenterLine}>
              <Row className="m-2 align-items-end">
                <Col sm="12" xl="3">
                  <label>{t("name")}</label>
                  <Form.Control
                    placeholder={t("name")}
                    type="text"
                    name="nombre"
                    required
                    maxLength={100}
                    value={this.state.newCostCenterLine.nombre}
                    onChange={this._saveNewCostCenterLine}
                  />
                </Col>
                <Col sm="12" xl="3">
                  <label>{t("code")}</label>
                  <Form.Control
                    placeholder={t("code")}
                    type="text"
                    name="codigo"
                    required
                    maxLength={50}
                    value={this.state.newCostCenterLine.codigo}
                    onChange={this._saveNewCostCenterLine}
                  />
                </Col>
                <Col sm="12" xl="3">
                  <label>{t("annual_budgeted_amount")}</label>
                  <Form.Control
                    placeholder={t("annual_budgeted_amount")}
                    type="number"
                    name="monto_presupuesto_anual"
                    required
                    min={0}
                    step="0.01"
                    value={this.state.newCostCenterLine.monto_presupuesto_anual}
                    onChange={this._saveNewCostCenterLine}
                  />
                </Col>
                <Col sm="12" xl="2">
                  <label>{t("currency")}</label>
                  <Form.Select
                    name="tipo_moneda_id"
                    required
                    value={this.state.newCostCenterLine.tipo_moneda_id}
                    onChange={this._saveNewCostCenterLine}
                  >
                    <option value="">{t("select_option")}</option>
                    {currencies?.map((item) => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm="12" xl="1">
                  <Button variant="primary" type="submit">
                    <i className="fas fa-plus" />
                  </Button>
                </Col>
              </Row>
            </Form>

            <Row className="m-3">
              <Col sm="12">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>{t("id")}</th>
                      <th>{t("name")}</th>
                      <th>{t("code")}</th>
                      <th>{t("annual_budgeted_amount")}</th>
                      <th>{t("currency")}</th>
                      <th>{t("action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.costCenterLines.map((line, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <Form.Control
                            type="text"
                            name="nombre"
                            value={line.nombre || ""}
                            onChange={(e) => this._saveCostCenterLineField(index, e)}
                            maxLength={100}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            name="codigo"
                            value={line.codigo || ""}
                            onChange={(e) => this._saveCostCenterLineField(index, e)}
                            maxLength={50}
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            name="monto_presupuesto_anual"
                            value={line.monto_presupuesto_anual || ""}
                            onChange={(e) => this._saveCostCenterLineField(index, e)}
                            min={0}
                            step="0.01"
                          />
                        </td>
                        <td>
                          <Form.Select
                            name="tipo_moneda_id"
                            value={line.tipo_moneda_id || ""}
                            onChange={(e) => this._saveCostCenterLineField(index, e)}
                          >
                            <option value="">{t("select_option")}</option>
                            {currencies?.map((item) => (
                              <option key={item.id} value={item.id}>{item.nombre}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            variant="danger"
                            onClick={() => this.removeCostCenterLine(index)}
                          >
                            <i className="fas fa-trash" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" className="btn-rounded" onClick={this.toggleCostCenterModal}>
              {t("close")}
            </Button>
            <Button variant="primary" onClick={this.saveCostCenterLines}>
              {t("save")}
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </>
  );


     }
}

 export default withTranslation()(Budget)
