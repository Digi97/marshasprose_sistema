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
        id:0,
        showDelete:false,
        showDeleteEvaluation: false,
        showDeleteEQ:false,
        key: 'question',
        validatedQuestion:false,
        validatedEvaluationQuestion:false,
        categories:[],
        evaluations:[],
        processing:true,
        question:{
          description:"",
          calification_scale:1
        },
        validatedEvaluations:false,
        evaluationsReq:{
          tittle:"",
          categories_id:0
        },
        alert:{
          show:false,
          variant:'success',
          title:"",
          body:""
        },
        questions:[],
        paginationItems:[],
        questionEvaluationsArray:[],
        question_evaluation:{
          evaluations_id:0,
          questions_id:0,
          question_evaluation:0
        },
        assignEvaluation:false,
        idAssign:0,
        percentageUsedPerEvaluation:0, // aqui se va sumar para ver el limite de las evaluaciones para que no pase de 100
        showEditQuestion: false,
        questionEdit:{
          id:0,
          description:"",
          calification_scale:1
        },
        editEvaluation:"",
        editing:false,
        evaluations_id_edit:0,
        id_edit:0,
        old_percentage:0
  }
}

  toggleEdit = (id = 0) =>{
    if (id === 0)
    {
      this.setState({showEditQuestion: !this.state.showEditQuestion, id});
    }
    else
    {
      AppUtil.getAPI(`${url}questions/${id}`).then(response => {
        if (response.success)
        {
          this.setState({showEditQuestion: !this.state.showEditQuestion, id, questionEdit: response.data});
          return ;
        }
      });
    }
   }
  toggleDelete = (id = 0) => this.setState({showDelete: !this.state.showDelete, id});
  toggleDeleteEvaluation = (id = 0) => this.setState({showDeleteEvaluation: !this.state.showDeleteEvaluation, id});
  toggleDeleteEQ = (id = 0) => this.setState({showDeleteEQ: !this.state.showDeleteEQ, id});
  toggleEditEQ = (data) => {

    document.getElementById('question_evaluation').value = data.question_evaluation;
    document.getElementById('questions_id').value = data.questions.id;
    this.setState({editing: true, evaluations_id_edit:data.evaluations_id, id_edit:data.id, old_percentage:data.question_evaluation});
  };
  toggleAssignEvaluation = (idAssign = 0) => {
    this._setProcessing(true);
    this._getQuestions();
    this._getEvaluations();

    if (idAssign > 0)
    {
      let question_evaluation = {
        evaluations_id:idAssign,
        questions_id:0,
        question_evaluation:""
      }
      this.setState({assignEvaluation: true, idAssign, question_evaluation, editing:false}, () =>{

        this._getEvaluationQuestion(this.state.idAssign);
      });
    }
    else
    {
        this.setState({assignEvaluation: false, idAssign, questionEvaluationsArray:[]})
    }
    this._setProcessing(false);




  }

componentDidMount()
{

  this._getQuestions();
  this._setProcessing(false);
}

  _setProcessing = (processing) => this.setState({processing});
  _fetchCategories = () => {
    AppUtil.getAPI(`${url}categories`, sessionStorage.getItem('token')).then(response => {
    let categories = response ? response.data : [];
    this.setState({categories});
  });
}

    getInputQuestion = async (e) => {

    await this.setState({
      question: {
        ...this.state.question,
        [e.target.name]: e.target.value,
      },
    });
  };

  getInputQuestionEdit = async (e) => {

  await this.setState({
    questionEdit: {
      ...this.state.questionEdit,
      [e.target.name]: e.target.value,
    },
  });
};
    getInputEvaluation = async (e) => {

        await this.setState({
          evaluationsReq: {
            ...this.state.evaluationsReq,
            [e.target.name]: e.target.value,
          },
        });
      };
    getInputEvaluationQuestion = async (e) => {
      if (e.target.name ==='question_evaluation')
      {
        //^[1-9][0-9]?$|^100$
        await this.setState({
          question_evaluation: {
            ...this.state.question_evaluation,
            [e.target.name]: e.target.value.replace(/[^0-9]/g, ''),
          },
        });



      }
      else
      {
        await this.setState({
          question_evaluation: {
            ...this.state.question_evaluation,
            [e.target.name]: e.target.value,
          },
        });
      }


        };


    SubmitQuestion = (e) => {

            const form = e.currentTarget;

            if (form.checkValidity() === false)
            {
              e.preventDefault();
              e.stopPropagation();
              return ;
            }

            e.preventDefault();
            e.stopPropagation();
            let {question, questions} =  this.state;

            for (var i = 0; i < questions.length; i++)
            {
              if (questions[i].description != null)
              {
                if (question.description === questions[i].description)
                {

                  let alert = {
                    show:true,
                    variant:'warning',
                    title:"La pregunta ya existe",
                    body:"No se puede crear una pregunta que ya existe"
                  };
                  this.setState({alert});

                  return ;
                  break;
                }
              }
            }



            this._setProcessing(true);
            AppUtil.postAPI(`${url}questions`, question).then(response => {
              if (response.success)
              {
                question = {
                  description:"",
                  calification_scale:1
                }
                let alert = {
                  show:true,
                  variant:'success',
                  title:"Pregunta agregada",
                  body:"La pregunta fue creada correctamente"
                };
                this.setState({alert, question});
                this._getQuestions();
                this._setProcessing(false);
                return ;
              }
              let alert = {
                show:true,
                variant:'danger',
                title:"Error al crear la pregunta",
                body:"No se pudo crear la pregunta, por favor intente más tarde"
              }
              this.setState({alert})
            });
            this._setProcessing(false);

        }


        SubmitEditQuestion = (e) => {

          const form = e.currentTarget;

          if (form.checkValidity() === false)
          {
            e.preventDefault();
            e.stopPropagation();
            return ;
          }

          e.preventDefault();
          e.stopPropagation();
          let {questionEdit, questions} =  this.state;

          for (var i = 0; i < questions.length; i++)
          {
            if (questions[i].description != null)
            {
              if (questionEdit.description === questions[i].description)
              {

                let alert = {
                  show:true,
                  variant:'warning',
                  title:"No se puede editar la pregunta",
                  body:"No se puede crear una pregunta que ya existe"
                };
                this.setState({alert});

                return ;
                break;
              }
            }
          }

          this._setProcessing(true);
          AppUtil.putAPI(`${url}questions/${questionEdit.id}`, questionEdit).then(response => {
            if (response.success)
            {

              questionEdit = {
                id:0,
                description:"",
                calification_scale:1
              }
              let alert = {
                show:true,
                variant:'success',
                title:"Pregunta editada",
                body:"La pregunta fue editada correctamente"
              };
              this.setState({alert, questionEdit, showEditQuestion: false});
              AppUtil.reloadPage();
              // this._getQuestions();
              // this._setProcessing(false);
              return ;
            }
            let alert = {
              show:true,
              variant:'danger',
              title:"Error al editar la pregunta",
              body:"No se pudo editar la pregunta, por favor intente más tarde"
            }
            this.setState({alert})
          });
          this._setProcessing(false);

      }


    SubmitEvaluations = (e) => {

            const form = e.currentTarget;

            if (form.checkValidity() === false)
            {
              e.preventDefault();
              e.stopPropagation();
              return ;
            }

            e.preventDefault();
            e.stopPropagation();
            let {evaluationsReq} =  this.state;
            this._setProcessing(true);
            AppUtil.postAPI(`${url}evaluations`, evaluationsReq).then(response => {
              if (response.success)
              {
                evaluationsReq = {
                  tittle:"",
                  categories_id:0
                }
                let alert = {
                  show:true,
                  variant:'success',
                  title:"Evaluación agregada",
                  body:"La evaluación fue creada correctamente"
                };
                this._setProcessing(false);
                this.setState({alert, evaluationsReq})
                AppUtil.reloadPage();
                // this._getEvaluations();
                return ;
              }
              let alert = {
                show:true,
                variant:'danger',
                title:"Error al crear la evaluación",
                body:"No se pudo crear la evaluación, por favor intente más tarde"
              }
              this.setState({alert})
            });
            this._setProcessing(false);
        }
    SubmitEvaluationQuestion = (e) => {

                const form = e.currentTarget;

                if (form.checkValidity() === false)
                {
                  e.preventDefault();
                  e.stopPropagation();
                  return ;
                }

                e.preventDefault();
                e.stopPropagation();
                let {question_evaluation} =  this.state;

                if (question_evaluation.question_evaluation <= 0 ||  question_evaluation.question_evaluation > 100 || question_evaluation.question_evaluation == "" )
                {
                  let alert = {
                    show:true,
                    variant:'success',
                    title:"Calificación incorrecta",
                    body:"La calificación debe ser entre 0 y 100"
                  };
                  this.setState({alert});
                  return ;
                }

                if (question_evaluation.questions_id === "")
                {
                  let alert = {
                    show:true,
                    variant:'success',
                    title:"La pregunta es requerida",
                    body:"La pregunta es requerida"
                  };
                  this.setState({alert});
                  return ;
                }
                console.log('que pasho');

                this._setProcessing(true);
                AppUtil.postAPI(`${url}evaluation_questions`, question_evaluation).then(response => {

                  if (response.success)
                  {

                    if (response.data > 100)
                    {
                      let alert = {
                        show:true,
                        variant:'warning',
                        title:"Pregunta agregada",
                        body:response.message
                      };
                      this.setState({alert});
                      return ;
                    }

                    e.target.reset();
                    question_evaluation = {
                      evaluations_id:question_evaluation.evaluations_id,
                      questions_id:0,
                      question_evaluation:""
                    }
                    let alert = {
                      show:true,
                      variant:'success',
                      title:"Pregunta agregada",
                      body:"La pregunta fue creada correctamente"
                    };
                    this.setState({alert, question_evaluation});
                    this._getEvaluationQuestion(this.state.idAssign);
                    this._setProcessing(false);
                    return ;
                  }
                  let alert = {
                    show:true,
                    variant:'danger',
                    title:"Error al crear la pregunta",
                    body:"No se pudo crear la pregunta, por favor intente más tarde"
                  }
                  this.setState({alert})
                });
                this._setProcessing(false);

            }

            EditEvaluationQuestion = (e) => {

              const form = e.currentTarget;

              if (form.checkValidity() === false)
              {
                e.preventDefault();
                e.stopPropagation();
                return ;
              }

              e.preventDefault();
              e.stopPropagation();

              let total_evaluation = this.state.percentageUsedPerEvaluation;
              let edit_percentage = parseInt(total_evaluation) - parseInt(this.state.old_percentage);
              let new_percentage = edit_percentage + parseInt(document.getElementById('question_evaluation').value);

              if(new_percentage > 100)
              {
                let alert = {
                  show:true,
                  variant:'warning',
                  title:"La pregunta no valida",
                  body:"El total de preguntas no puede sobrepasar el 100%"
                };
                this.setState({alert});
                return;
              }
              let data = {
                "evaluations_id": this.state.evaluations_id_edit,
                "questions_id": document.getElementById('questions_id').value,
                "question_evaluation": document.getElementById('question_evaluation').value,
              };

              this._setProcessing(true);
              AppUtil.putAPI(`${url}evaluation_questions/${this.state.id_edit}`, data).then(response => {
                if (response.success)
                {

                  data = {
                    id:0,
                    description:"",
                    calification_scale:1
                  }
                  let alert = {
                    show:true,
                    variant:'success',
                    title:"Pregunta editada",
                    body:"La pregunta fue editada correctamente"
                  };
                  this.setState({alert, data, showEditQuestion: false});
                  AppUtil.reloadPage();
                  // this._getQuestions();
                  // this._setProcessing(false);
                  // this._getEvaluationQuestion(this.state.idAssign);
                  return ;
                }
                let alert = {
                  show:true,
                  variant:'danger',
                  title:"Error al editar la pregunta",
                  body:"No se pudo editar la pregunta, por favor intente más tarde"
                }
                this.setState({alert})
              });
              this._setProcessing(false);

          }

    _getQuestions = () =>{
          AppUtil.getAPI(`${url}questions`, sessionStorage.getItem('token')).then(response => {
          let questions = response ? response.data : [];
          let paginationItems = [], active = 1;


          this.setState({questions, paginationItems});
        });
        }
    _getEvaluations = () =>{
          AppUtil.getAPI(`${url}evaluations`, sessionStorage.getItem('token')).then(response => {
          let evaluations = response ? response.data : [];
          let paginationItems = [], active = 1;


          this.setState({evaluations, paginationItems});
        });
        }
    _getEvaluationQuestion = (idAssign) =>{

              AppUtil.getAPI(`${url}evaluationQuestion_by_evaluation_id/${idAssign}`, sessionStorage.getItem('token')).then(response => {

                let questionEvaluationsArray = response ? response.data : [];
                let percentageUsedPerEvaluation = 0;
                  for (var i = 0; i < questionEvaluationsArray.length; i++)
                  {
                    percentageUsedPerEvaluation += questionEvaluationsArray[i].question_evaluation;
                  }


                  this.setState({questionEvaluationsArray, percentageUsedPerEvaluation});


            });
    }


        deleteItem = (type, id) => {


          this._setProcessing(true);

          switch (type)
          {
            case 'question':

              AppUtil.deleteAPI(`${url}questions/${id}`).then((response) => {
                this.toggleDelete(0);
                if (response.success)
                {
                  let alert = {
                    show:true,
                    variant:'success',
                    title:"Pregunta eliminada",
                    body:"La pregunta fue eliminada correctamente"
                  };

                  this._setProcessing(false);
                  this._getQuestions();
                  this.setState({alert})

                }
                else
                {
                  let alert = {
                    show:true,
                    variant:'danger',
                    title:"Error al eliminar la pregunta",
                    body:"Hubo un problema al eliminar la pregunta"
                  };
                  this._setProcessing(false);
                  this._getQuestions();
                  this.setState({alert})


                }
              })
            break;
            case 'evaluation':

              AppUtil.deleteAPI(`${url}evaluations/${id}`).then((response) => {
                this.toggleDeleteEvaluation(0);
                if (response.success)
                {
                  let alert = {
                    show:true,
                    variant:'success',
                    title:"Evaluación eliminada",
                    body:"La evalución fue eliminada correctamente"
                  };

                  this._setProcessing(false);
                  this._getEvaluations();
                  this.setState({alert})

                }
                else
                {
                  let alert = {
                    show:true,
                    variant:'danger',
                    title:"Error al eliminar la evaluación",
                    body:"Hubo un problema al eliminar la evaluación"
                  };
                  this._setProcessing(false);
                  this._getEvaluations();
                  this.setState({alert})

                }
              });
            break;

            case 'evaluation_question':
              AppUtil.deleteAPI(`${url}evaluation_questions/${id}`).then((response) => {
                            this.toggleDeleteEQ(0);
                            if (response.success)
                            {
                              let alert = {
                                show:true,
                                variant:'success',
                                title:"Pregunta eliminada de esta evaluación",
                                body:"La pregunta se ha removido de esta evaluación"
                              };

                              this._setProcessing(false);

                              this.toggleAssignEvaluation(this.state.question_evaluation.evaluations_id)
                              this.setState({alert})

                            }
                            else
                            {
                              let alert = {
                                show:true,
                                variant:'danger',
                                title:"No se pudo remover la pregunta de esta evaluación",
                                body:"Hubo un problema, no se pudo remover la pregunta de esta evaluación"
                              };
                              this._setProcessing(false);
                              this.setState({alert})

                            }
                          });
            break;
          }



        }


changeTab = (key) =>
{
  switch (key)
  {
    case 'question':
      this._getQuestions();
    break;
    case 'evaluations':
      this._fetchCategories();
      this._getEvaluations();
    break;
  }

  this.setState({key})
}

 deleteFormatEQ = (cell, row, rowIndex, formatExtraData) => {

  return (
    <a onClick={() => this.toggleDeleteEQ( cell )} className="txt-blue decoration-none">
      Eliminar <i className="fas fa-window-close"></i>
    </a>
  );
}


editFormatEQ = (cell, row, rowIndex, formatExtraData) => {

  return (
    <a onClick={() => this.toggleEditEQ( row )} className="txt-blue decoration-none">
      Editar <i className="fas fa-edit"></i>
    </a>
  );
}


editFormatQuestion = (cell, row, rowIndex, formatExtraData) => {

 return (
   <a onClick={() => this.toggleEdit( cell )} className="txt-blue decoration-none">
     Editar <i className="fas fa-edit"></i>
   </a>
 );
}

deleteFormatQuestion = (cell, row, rowIndex, formatExtraData) => {

 return (
   <a onClick={() => this.toggleDelete( cell )} className="txt-blue decoration-none">
     Eliminar <i className="fas fa-window-close"></i>
   </a>
 );
}


assignFormatEvaluation = (cell, row, rowIndex, formatExtraData) => {

 return (
   <a onClick={() => this.toggleAssignEvaluation(cell)} className="txt-blue decoration-none">
    <i className="fas fa-list"></i> Asignar Pregunta
   </a>
 );
}

deleteFormatEvaluation = (cell, row, rowIndex, formatExtraData) => {

 return (
   <a onClick={() => this.toggleDeleteEvaluation(cell)} className="txt-blue decoration-none">
     Eliminar <i className="fas fa-window-close"></i>
   </a>
 );
}

render(){
  let {key, validatedQuestion, categories, processing, alert, questions, showDelete, evaluations} = this.state;
    const { t } = this.props;

  return (
    <>
    <Toast onClose={()=> this.setState({alert:{show:false}} )} variant={alert.variant} show={alert.show} title={alert.title} body={alert.body}  />

    <Container fluid>
    <Tabs
      activeKey={key}
      onSelect={(key) => this.changeTab(key)}
      className="mb-3"
      defaultActiveKey="question"
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
                value={this.state.question.description}
                >
               </Form.Control>
           </Form.Group>

            <Form.Group>
             <Form.Label className="txt-darkblue">{t("mail")}</Form.Label>
             <Form.Control
                placeholder={t("mail")}
                name="Correo_empresa"
                onChange={this.getInputQuestion}
                required
                value={this.state.question.description}
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
                value={this.state.question.description}
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
                value={this.state.question.description}
                >
               </Form.Control>
           </Form.Group>


         <Form.Group>
             <Form.Label className="txt-darkblue">{t("identification_type")}</Form.Label>
              <Select options={this.state.providers} name="provider" onChange={this._saveStateVariable} />
           </Form.Group>


         <Form.Group>
             <Form.Label className="txt-darkblue">{t("identification")}</Form.Label>
             <Form.Control
                placeholder={t("identification")}
                name="identificacion"
                onChange={this.getInputQuestion}
                required
                value={this.state.question.description}
                >
               </Form.Control>
           </Form.Group>



           <Button className="btn-rounded btn-fill bg-darkblue" type="submit" disabled={processing}>
             {processing ? <div className="lds-dual-ring"></div>: 'Enviar'}
           </Button>
     
        </div>
      </Tab>
      {/*TAB AJUSTES FACTURACION ELECTRÓNICA*/}
        <Tab eventKey="evaluations" title={<span><i className="fas fa-check"></i> {t("electronic_invoice")}</span>}>
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
                   value={this.state.evaluationsReq.tittle}
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
                   value={this.state.evaluationsReq.tittle}
                   >
                  </Form.Control>
              </Form.Group>
              </Col>

            <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("pin")}</Form.Label>
                <Form.Control
                  type="file"
                   placeholder={t("pin")}
                   name="pin_llave"
                   onChange={this.getInputEvaluation}
                   required
                   value={this.state.evaluationsReq.tittle}
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
                   value={this.state.evaluationsReq.tittle}
                   >
                  </Form.Control>
              </Form.Group>
              </Col>

          <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("activity_code")}</Form.Label>
                 <Select options={this.state.codigo_actividad} name="codigo_actividad" onChange={this._saveStateVariable} />
              </Form.Group>
              </Col>


          <Col xl="12" sm="12" md="12">
              <Form.Group>
                <Form.Label className="txt-darkblue">{t("default_tax")}</Form.Label>
                 <Select options={this.state.codigo_actividad} name="impuesto_id" onChange={this._saveStateVariable} />
              </Form.Group>
              </Col>


            </Row>
     



             <Button className="btn-rounded btn-fill bg-darkblue" type="submit" disabled={processing}>
               {processing ? <div className="lds-dual-ring"></div>: t("Send")}
             </Button>
          </Form>
          </div>
        </Tab>

      </Tabs>
    </Container>
    </>
    );
  }
}

 export default withTranslation()(Settings)
