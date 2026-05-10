import React from "react";
import { Container, Row, Col, Modal, Tabs, Tab, Button, Form } from "react-bootstrap";
import AppUtil from '../../../AppUtil/AppUtil.js';
import { url } from "../services/api.js";
import Toast from '../common/Toast.js';

import Select from 'react-select'


import { withTranslation } from "react-i18next";

class Settings extends React.Component {
  constructor(props)
  {
      super(props);
      this.state = {
   
        processing:true,
        alert:{
          show:false,
          variant:'success',
          title:"",
          body:""
        },
        editing:false,
        Nombre_Empresa:"",
        Correo_empresa:"",
        Ruta_nas:"",
        Formato_fecha:"",
        Tipo_identificacion_id:"",
        identificacion:"",
       
    
    
      }
}


componentDidMount()
{ 
  this._setProcessing(false);
}

  _setProcessing = (processing) => this.setState({processing});



render(){
  let {processing, alert} = this.state;
    const { t } = this.props;

  return (
    <>
    <Toast onClose={()=> this.setState({alert:{show:false}} )} variant={alert.variant} show={alert.show} title={alert.title} body={alert.body}  />

    <Container fluid>
    <Form>
    <Tabs
 
      className="mb-3"
      >


      <Tab eventKey="question" title={<span><i className="fas fa-building"></i> {t("business")}</span>}>
       <h4 className="txt-blue">{t("business_info")}</h4>
        <div className="well">
      
           <Form.Group>
             <Form.Label className="txt-darkblue">{t("name")}</Form.Label>
             <Form.Control
                placeholder={t("name")}
                name="Nombre_Empresa"
                onChange={this.getInputQuestion}
                required
                value={this.state.Nombre_Empresa}
                >
               </Form.Control>
           </Form.Group>

            <Form.Group>
             <Form.Label className="txt-darkblue">{t("email")}</Form.Label>
             <Form.Control
                placeholder={t("email")}
                name="Correo_empresa"
                onChange={this.getInputQuestion}
                required
                value={this.state.Correo_empresa}
                >
               </Form.Control>
           </Form.Group>
           
           <Form.Group>
             <Form.Label className="txt-darkblue">{t("nas")}</Form.Label>
             <Form.Control
                placeholder={t("nas")}
                name="Ruta_nas"
                onChange={this.getInputQuestion}
                required
                value={this.state.Ruta_nas}
                >
               </Form.Control>
           </Form.Group>

          <Form.Group>
             <Form.Label className="txt-darkblue">{t("date_format")}</Form.Label>
             <Form.Control
                placeholder={t("date_format")}
                name="Formato_fecha"
                onChange={this.getInputQuestion}
                required
                value={this.state.Formato_fecha}
                >
               </Form.Control>
           </Form.Group>


         <Form.Group>
             <Form.Label className="txt-darkblue">{t("identification_type")}</Form.Label>
              <Select options={this.state.providers} name="Tipo_identificacion_id" onChange={this._saveStateVariable} />
           </Form.Group>


         <Form.Group>
             <Form.Label className="txt-darkblue">{t("identification")}</Form.Label>
             <Form.Control
                placeholder={t("identification")}
                name="identificacion"
                onChange={this.getInputQuestion}
                required
                value={this.state.identificacion}
                >
               </Form.Control>
           </Form.Group>
        </div>
      </Tab>
      {/*TAB AJUSTES FACTURACION ELECTRÓNICA*/}
        <Tab eventKey="evaluations" title={<span><i className="fas fa-file"></i> {t("electronic_invoice")}</span>}>
        <div className="well">
         <h4 className="txt-blue">{t("electronic_invoice")}</h4>

          <Form validated={this.state.validatedEvaluations} onSubmit={this.SubmitEvaluations}>
          <Row>
            <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("terminal")}</Form.Label>
                <Form.Control
                   placeholder={t("terminal")}
                   name="terminal"
                   onChange={this.getInputEvaluation}
                   required
                   value={this.state.terminal}
                   >
                  </Form.Control>
              </Form.Group>
              </Col>

           <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("invoice_key")}</Form.Label>
                <Form.Control
                  type="file"
                   placeholder={t("invoice_key")}
                   name="Ruta_llave_factura"
                   onChange={this.getInputEvaluation}
                   required
                   value={this.state.Ruta_llave_factura}
                   >
                  </Form.Control>
              </Form.Group>
              </Col>

            <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("pin")}</Form.Label>
                <Form.Control
                  type="number"
                  maxLength={4}
                   placeholder={t("pin")}
                   name="pin_llave"
                   onChange={this.getInputEvaluation}
                   required
                   value={this.state.pin_llave}
                   >
                  </Form.Control>
              </Form.Group>
              </Col>


            <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("security_code")}</Form.Label>
                <Form.Control
                  
                   placeholder={t("security_code")}
                   name="codigo_seguridad"
                   onChange={this.getInputEvaluation}
                   required
                   value={this.state.codigo_seguridad}
                   >
                  </Form.Control>
              </Form.Group>
              </Col>

          <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("activity_code")}</Form.Label>
                 <Select 
                 options={this.state.codigo_actividad} 
                 name="codigo_actividad" 
                 onChange={this._saveStateVariable} />
              </Form.Group>
              </Col>


          <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("default_tax")}</Form.Label>
                 <Select options={this.state.impuesto_id} name="impuesto_id" onChange={this._saveStateVariable} />
              </Form.Group>
              </Col>
            </Row>
          </Form>
          </div>
        </Tab>

    <Tab eventKey="catalogs" title={<span><i className="fas fa-check"></i> {t("catalogs")}</span>}>
    <div className="well">
      <div className="list-group">
        
        <a href="/home/maintenance/currency" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("currency")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("currency_description")}</p>
        </a>

        <a href="/home/maintenance/activity_code" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("activity_code")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("activity_code_description")}</p>
        </a>
        <a href="/home/maintenance/payment_method" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("payment_method")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("payment_method_description")}</p>
        </a>

        <a href="/home/maintenance/accounting_account" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("accounting_account")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("accounting_account_description")}</p>
        </a>

        <a href="/home/maintenance/type_accounting_account" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("type_accounting_account")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("type_accounting_account_description")}</p>
        </a>

        <a href="/home/maintenance/invoice_status" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("invoice_status")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("invoice_status_description")}</p>
        </a>

        <a href="/home/maintenance/rol" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("rol")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("rol_description")}</p>
        </a>


        <a href="/home/maintenance/presupuestary_category" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("presupuestary_category")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("presupuestary_category_description")}</p>
        </a>

        <a href="/home/maintenance/file_type" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("file_type")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("file_type_description")}</p>
        </a>


        <a href="/home/maintenance/tax_type" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("tax_type")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("tax_type_description")}</p>
        </a>

        <a href="/home/maintenance/sale_condition" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("sale_condition")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("sale_condition_description")}</p>
        </a>

        <a href="/home/maintenance/document_type" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("document_type")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("document_type_description")}</p>
        </a>


        <a href="/home/maintenance/expenses_category" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("expenses_category")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("expenses_category_description")}</p>
        </a>

        <a href="/home/maintenance/measurement_unity" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("measurement_unity")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("measurement_unity_description")}</p>
        </a>
        <a href="/home/maintenance/comercial_code" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("comercial_code")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("comercial_code_description")}</p>
        </a>
        
         <a href="/home/maintenance/cabys_code" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("cabys_code")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("cabys_code_description")}</p>
        </a>  
        
        <a href="/home/maintenance/cost_center" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("cost_center")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("cost_center_description")}</p>
        </a>        
        <a href="/home/maintenance/permissions" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{t("permissions")}</h5>
            <small><i className="fas fa-arrow-right"></i></small>
          </div>
          <p class="mb-1">{t("permissions_description")}</p>
        </a>                

      </div>
    </div>
    </Tab>


      </Tabs>

      
    
             <Button className="btn-rounded btn-fill bg-darkblue" type="submit" disabled={processing}>
               {processing ? <div className="lds-dual-ring"></div>: t("save")}
             </Button>
    </Form>
    </Container>
    </>
    );
  }
}

 export default withTranslation()(Settings)
