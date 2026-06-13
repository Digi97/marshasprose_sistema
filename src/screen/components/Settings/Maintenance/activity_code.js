import React, {Component} from "react";
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import { Container, Row, Col, Button,Modal, Form } from "react-bootstrap";
import AppUtil from "../../../../AppUtil/AppUtil";
import { withTranslation } from "react-i18next";
import ActionButtons from '../../common/ActionButtons'
DataTable.use(DT);

class Activity_Code extends Component {
constructor(props)
  {
    super(props);

    this.state = {
      tableData: [],
  show:false,
  processing: false,
  activityCode:{
    id:0,
    codigo_actividad1:"",
    nombre_actividad:""
  },
  activityCodeList:[]
    }
  }


  
   getActivityCode = () => AppUtil.getAPI(`catalogos/codigo_actividad`).then(response => {
      let activityCodeList = response ? response.data : [];
      this.setState({activityCodeList});
    });

    
  
   getActivityCodeById = (id) => AppUtil.getAPI(`catalogos/codigo_actividad/${id}`).then(response => {
      let activityCode = response ? response.data : [];

      
      this.setState({activityCode:activityCode[0], show:true});
    });


//#region Funciones internas
    toggleShow = () => this.setState({show: !this.state.show, activityCode:{id:0, codigo_actividad1:"", nombre_actividad:""}}) //muestra el modal de agregar/modificar

    _saveStateVariable = async (e) => {
    await this.setState({
            activityCode: {
              ...this.state.activityCode,
              [e.target.name]: e.target.value,
            },
          });

    }


    saveActivityCode = (e) => {
          const { t } = this.props;
          
        
      e.preventDefault();
      e.stopPropagation();

      if(this.validateForm(t))
      {
if(this.state.activityCode.id === 0)
{

AppUtil.postAPI(`catalogos/codigo_actividad`, this.state.activityCode).then(response => {
     
        if(response)
        {
          let activityCode = response ? response.data : [];

                if(Number.isInteger(activityCode))
                {
                    this.setState({
                  error: true,
                  errorMsg: t("created_successfully"),
                  color:"alert alert-success"
                }, () => { window.location.reload(); });
                } 
                else
                  {
              this.setState({
                  error: true,
                  errorMsg: t(response.message),
                  color:"alert alert-warning"
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
else
  {
AppUtil.putAPI(`catalogos/codigo_actividad/${this.state.activityCode.id}`, this.state.activityCode).then(response => {
     

  
        if(response)
        {
          let activityCode = response ? response.data : [];

                if(Number.isInteger(activityCode))
                {
                    this.setState({
                  error: true,
                  errorMsg: t("updated_successfully"),
                  color:"alert alert-success"
                }, () => { window.location.reload(); });
                } 
                else
                  {
              this.setState({
                  error: true,
                  errorMsg: t(response.message),
                  color:"alert alert-warning"
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
      }
    }

    validateForm = (t) =>
    {
      let {activityCode} = this.state;
      
      
      if(activityCode.codigo_actividad1.length > 6 || !AppUtil.isNumberEntero(activityCode.codigo_actividad1))
      {
         this.setState({ error: true,  errorMsg: t("invalid_string_form_codigo_actividad"), color:"alert alert-warning" });
                return false;
      }

      if(!AppUtil.isValidText(activityCode.nombre_actividad))
      {
         this.setState({ error: true,  errorMsg: t("invalid_string_form_nombre_actividad"), color:"alert alert-warning" });
                return false;
      }

      return true;

    }

    //#endregion fin funciones internas

    componentDidMount(){
      this.getActivityCode();
    }


  ActionButtons = (rowData) => (
      <ActionButtons 
      editAction={() => this.getActivityCodeById(rowData.id)}
      />
    );
  


     render(){
       const { t } = this.props;
      return (
    <>
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <h1>{t("activity_code")}</h1>
          </Col>
          <Col lg="6" sm="12">
          <Row>
            <Col lg="6" sm="12">
              <Button
                className=" "
                onClick={this.toggleShow}>
                  {t("create")}
              </Button>
            </Col>
          
            <Col lg="6" sm="12">
         <Button
                    className=" "
                    onClick={()=> this.props.navigate(-1)}>
                      {t("cancel")}
                  </Button>
            </Col>

          </Row>
          
          
      
          </Col>

        </Row>

        <Row>
          		<DataTable
                data={this.state.activityCodeList} 
                columns={[
                  {data:'id', title:t("id")},
                  {data:'codigo_actividad1', title:t("code")},
                  {data:'nombre_actividad', title:t("name")},
                  {title:t("action"), data:null, orderable: false, searchable:false, 
                 },
                ]}
                className="display table cell-border compact stripe"     
                slots={{3: (cellData, rowData) => this.ActionButtons(rowData, cellData)}}
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
              />  
        </Row>

             <Modal
              show={this.state.show}
              onHide={this.toggleShow}
              backdrop="static"
              keyboard={false}
              size="lg"
              
          >
     <Form onSubmit={this.saveActivityCode}>

          <Modal.Header closeButton>
            <h3 className=" tituloFerias">{t("activity_code")}</h3>
          </Modal.Header>
                  {this.state.error === true && (
              <div className={this.state.color} role="alert">
                {this.state.errorMsg}
              </div>
            )}
          <Modal.Body>
                <Row className="m-2">
                  <Col sm="12" xl="12">
                    <label>{t("code")}</label>
                   <Form.Group>
                     <Form.Control
                        placeholder={t("code")}
                        type="text"
                        onChange={this._saveStateVariable}
                        name="codigo_actividad1"
                        required
                        maxLength={6}
                        value={this.state.activityCode.codigo_actividad1}
                        >
                       </Form.Control>
                   </Form.Group>
                   </Col>

                 </Row>

                 <Row className="m-2">

                    <Col sm="12" xl="12">
                      <label className="txt-darkblue">{t("name")}</label>
                       <Form.Group>
                            <Form.Control
                                placeholder={t("name")}
                                type="text"
                                onChange={this._saveStateVariable}
                                name="nombre_actividad"
                                required
                                maxLength={200}
                                value={this.state.activityCode.nombre_actividad}
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

 export default withTranslation()(Activity_Code)
