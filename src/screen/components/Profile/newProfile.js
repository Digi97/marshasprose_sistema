import React, { Component } from "react";

// react-bootstrap components
import { Card, Container, Row, Col, Modal } from "react-bootstrap";
import AppUtil from "../../../AppUtil/AppUtil.js";
import "moment-timezone";
import { url } from "../services/api";
import crypto from "crypto-js";


// Clase para la creacion de los distintos usuarios
class NewProfile extends Component {
  state = {
    user: "",
    form: {
      id: 0,
      name: "",
      email: "",
      campus_id: 0,
      professors_users_id: 0,
      password: "",
    },
    formJudge: {
      name: "",
      email: "",
      password: "",
      business_name: "",
    },
    formAdmin: {
      name: "",
      email: "",
      password: "",
      role:""
    },
    show: false,
    showDelete: false,
    showJudge: false,
    showProfessor: false,
    showAdmin: false,
    showCampus: false,

    valid_email: true,
    spinner: false,
    charging: false,
    campuses: "",
    options: [],
    professors: [],
    students: [],
    judges: [],

    profiles:[],
    nameProfessor: "",
    campus_id: 0,
    campus_name: "",

    add: [],
    updating: false,
    role:""
  };

  constructor(props) {
    super(props);
  }

  validateToken = () => {
    let decodedToken = sessionStorage.getItem("expire_tkn");
    let exp = parseFloat(decodedToken);
    let dateNow = new Date();
    if (decodedToken != null) {
      if (exp * 1000 < dateNow.getTime()) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.setItem("expired", true);
        window.location.replace("/");
      }
  }
}
//# obtiene datos del estudiante, para posterior actualizacion
getUpdateStudent = (student) => {
this.setState({ updating: true});

  document.getElementById("id").value = student.id;
  document.getElementById("id_users").value = student.users.id;
  document.getElementById("name").value = student.users.name;
  document.getElementById("email").value = student.users.email;
  document.getElementById("campusid").value = student.campuses.id;
  document.getElementById("professorsusersid").value = student.professor_users.id;
};

  //se obtiene el usuario
  getUserData = async () => {
    let bytes = crypto.AES.decrypt(
      sessionStorage.getItem("user"),
      "@virtual_cr"
    );
    this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
    this.nameUser = this.user.name.charAt(0).toUpperCase();

    this.setState({
      role: this.user.roles[0].name,
    });

    if(this.user.roles[0].name == "Students" || this.user.roles[0].name == "Judges"){
      window.location.replace("/home");
    }
  };

  //se obtiene la info de los inputs
  getInputData = async (e) => {
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value,
      },
    });
    this.validateEmail(e);
  };
  // obtiene los inputs para la data de administradores
  getInputDataAdmin = async (e) => {
    await this.setState({
      formAdmin: {
        ...this.state.formAdmin,
        [e.target.name]: e.target.value,
      },
    });
    this.validateEmail(e);
  };
    // obtiene los inputs para la data de jurados
  getInputDataJudge = async (e) => {
    await this.setState({
      formJudge: {
        ...this.state.formJudge,
        [e.target.name]: e.target.value,
      },
    });
    this.validateEmail(e);
  };
  // obtiene los inputs para la data de otros formulariso (sedes)
  getInputDataOthers = async (e) => {
    await this.setState({
      ...this.state,
      [e.target.name]: e.target.value,
    });
  };

  //se obtiene la lista de sedes
  getCampusData = () => {
    let url_api = url + "campuses";
    AppUtil.getAPI(url_api).then((response) => {
      if (response.data.length > 0) {
        this.setState({
          options: response.data,
          charging: true
        });
      }
    });
  };


  //se obtiene la lista de profesores
  getProfessorData = () => {
    let url_api = url + "professor_users";
    AppUtil.getAPI(url_api).then((response) => {

      if (response.data.length > 0) {
        this.getCampusData();
        this.setState({
          professors: response.data,
          charging: true
        });
      }
    });
  };

  //se obtiene la lista de estudiantes
  getStudentsData = () => {

    let url_api = url + "students";
    AppUtil.getAPI(url_api).then((response) => {
      if (response.data.length > 0) {
        this.setState({
          students: response.data,
          charging: true
        });
        this.getProfessorData();
        this.getCampusData();
      }
    });
  };

  //se obtiene la lista de estudiantes
  getJudgesData = () => {
    let url_api = url + "judges";
    AppUtil.getAPI(url_api).then((response) => {
      if (response.data.length > 0) {
        this.setState({
          judges: response.data,
          charging: true
        });
      }
    });
  };

  //se limpian los campos de los inputs
  clearFields = () => {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("campus_id").value = 0;
    document.getElementById("professors_users_id").value = 0;
    document.getElementById("business_name").value = "";
    document.getElementById("nameProfessor").value = "";
    document.getElementById("campus_name").value = "";

  };

  //se guarda el estudiante
  saveStudent = () => {

    this.validateToken();
    let {students, form} = this.state;
    if (
      form.name == "" ||
      (form.email == "" || !AppUtil.isEmail(form.email )) ||
      form.password == "" ||
      form.campus_id == 0 ||
      form.professors_users_id == 0
    ) {
      this.setState({
        error: true,
        errorMsg: "Todos los campos son requeridos",
        color: "alert alert-danger",
      });
      setTimeout(() => {
        this.setState({
          error: false,
          errorMsg: "",
          color: "",
          spinner: false,
        });
      }, "2000");
      return;
    }
    if (!this.validatePassword(this.state.form.password)) {
      return;
    }


    for (var i = 0; i < students.length; i++)
    {
      if (students[i].users.email != null)
      {
        if (form.email === students[i].users.email)
        {
          this.setState({
            error: true,
            errorMsg:"El correo relacionado a este estudiante ya esta registrado",
            color: "alert alert-warning",
          });

          this.setState({alert});

          return ;
          break;
        }
      }
    }


    this.setState({
      spinner: true,
    });
    let url_api = url + "students";
    AppUtil.postAPI(url_api, this.state.form).then((response) => {

      if (response.success) {
        this.setState({
          error: true,
          errorMsg: "El estudiante se guardo exitosamente",
          color: "alert alert-success",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
        this.getStudentsData();
        this.clearFields();
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al guardar el estudiante",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
      }
    });
  };

  //se guarda el jurado
  saveJudge = () => {
    this.validateToken();
      let {formJudge, judges} = this.state;
    if (
      formJudge.name == "" ||
      (formJudge.email == "" || !AppUtil.isEmail(formJudge.email )) ||
      formJudge.business_name == "" ||
      formJudge.password == ""
    ) {
      this.setState({
        error: true,
        errorMsg: "Todos los campos son requeridos",
        color: "alert alert-danger",
      });
      setTimeout(() => {
        this.setState({
          error: false,
          errorMsg: "",
          color: "",
          spinner: false,
        });
      }, "2000");
      return;
    }

    for (var i = 0; i < judges.length; i++)
    {
      if (judges[i].users.email != null)
      {
        if (formJudge.email === judges[i].users.email)
        {
          this.setState({
            error: true,
            errorMsg:"El correo relacionado a este jurado ya existe",
            color: "alert alert-warning",
          });

          this.setState({alert});

          return ;
          break;
        }
      }
    }

    if (!this.validatePassword(formJudge.password)) {
      return;
    }
    this.setState({
      spinner: true,
    });
    let url_api = url + "judges";
    AppUtil.postAPI(url_api, this.state.formJudge).then((response) => {
      if (response.success) {
        this.getJudgesData();
        this.setState({
          error: true,
          errorMsg: "El jurado se guardo exitosamente",
          color: "alert alert-success",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false
          });
        }, "2000");
        document.getElementById('name').value = "";
        document.getElementById('email').value = "";
        document.getElementById('business_name').value = "";
        document.getElementById('password').value = "";
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al guardar el jurado",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
      }
    });
  };

  //se guarda el profesor
  saveProfessor = () => {
    this.validateToken();
    let url_api = url + "professor_users";
    let professor_data = "";
    if (this.state.nameProfessor != "" && this.state.campus_id != "") {
      professor_data = {
        campus_id: this.state.campus_id,
        name: this.state.nameProfessor,
      };
    } else {
      this.setState({
        error: true,
        errorMsg: "Todos los campos son requeridos",
        color: "alert alert-danger",
        spinner: false,
      });
      return;
    }
    let {professors} = this.state;
    for (var i = 0; i < professors.length; i++)
    {
      if (professors[i].name != null)
      {
        if (professor_data.name === professors[i].name)
        {
          this.setState({
            error: true,
            errorMsg:"No se puede crear un profesor que ya existe",
            color: "alert alert-warning",
          });

          this.setState({alert});

          return ;
          break;
        }
      }
    }


    this.setState({
      spinner: true,
    });
    AppUtil.postAPI(url_api, professor_data).then((response) => {
      if (response.success) {
        this.getProfessorData();
        this.setState({
          error: true,
          errorMsg: "El profesor se guardo exitosamente",
          color: "alert alert-success",
          nameProfessor:""
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al guardar el profesor",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
      }
    });
    this.setState({
      error: false,
    });
  };

  //se guarda el campus
  saveCampus = () => {
    this.validateToken();
    let url_api = url + "campuses";
    let campuses_data = "";
    if (this.state.campus_name != "") {
      campuses_data = {
        name: this.state.campus_name,
      };
    } else {
      this.setState({
        error: true,
        errorMsg: "Todos los campos son requeridos",
        color: "alert alert-danger",
        spinner: false,
      });
      return;
    }

    let {options } = this.state;
    for (var i = 0; i < options.length; i++)
    {
      if (options[i].name != null)
      {
        if (campuses_data.name === options[i].name)
        {
          this.setState({
            error: true,
            errorMsg:"No se puede crear una sede que ya existe",
            color: "alert alert-warning",
          });

          this.setState({alert});

          return ;
          break;
        }
      }
    }



    this.setState({
      spinner: true,
    });
    AppUtil.postAPI(url_api, campuses_data).then((response) => {
      if (response.success) {
        this.getCampusData();
        this.setState({
          error: true,
          errorMsg: "La sede se guardo exitosamente",
          color: "alert alert-success",
          campus_name:""
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
        document.getElementById('campus_name').value = '';
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al guardar la sede",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
      }
    });
    this.setState({
      error: false,
    });
  };

  //se obtiene la lista de administradores
  getAdminData = async () => {
    let data = [];
    let responseA = await AppUtil.getAPI(url + "users/role/admins")
      let arrayA = responseA.data
      if (arrayA) {
        for (let i = 0; i < arrayA.length; i++) {

          data.push(arrayA[i]);
        }
      }
    let responseB = await AppUtil.getAPI(url + "users/role/super-admins")
      if (responseB) {
        let arraySA = responseB.data;
        for (let i = 0; i < arraySA.length; i++) {

          data.push(arraySA[i]);
        }
      }

    await this.setState({
      charging: true,
      profiles:data
    });
  };

    //carga la informacion del administrador a actualizar
    getUpdateAdmin = (admin) => {
      this.setState({
        updating: true
      });
      document.getElementById("id").value = admin.id;
      document.getElementById("name").value = admin.name;
      document.getElementById("email").value = admin.email;
      document.getElementById("role").value = admin.rol[0];
    };


  //se guarda el admin
  saveAdmin = () => {
    this.validateToken();
    let url_api = url + "users";
    let campuses_data = "";
    if (this.state.formAdmin.name == "" &&
        (this.state.formAdmin.email == "" || !AppUtil.isEmail(this.state.form.email ) )&&
        this.state.formAdmin.password == "" &&
        this.state.formAdmin.role == "") {
          this.setState({
            error: true,
            errorMsg: "Todos los campos son requeridos",
            color: "alert alert-danger",
            spinner: false,
          });
          return;
    }
    this.setState({
      spinner: true,
    });
    AppUtil.postAPI(url_api, this.state.formAdmin).then((response) => {
      if (response.success) {
        this.getAdminData();
        this.setState({
          error: true,
          errorMsg: "Datos guardados exitosamente",
          color: "alert alert-success",
        });
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("role").value = "";
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al guardar los datos",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
          });
        }, "2000");
      }
    });
    this.setState({
      error: false,
    });
  };

  //elimina el profesor seleccionado
  deleteAdmin = (id) => {
    this.validateToken();
    let url_api = url + "users/" + id;
    AppUtil.deleteAPI(url_api).then((response) => {
      if (response.success) {
        this.getAdminData();
        this.setState({
          error: true,
          errorMsg: "El usuario se elimino exitosamente",
          color: "alert alert-success",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al eliminar el usuario",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      }
    });
  };


  updateAdmin = () => {
    this.validateToken();
    this.setState({
      spinner: true
    });
    let form = {};
    let id = document.getElementById("id").value;
    if(document.getElementById("password").value == ''){
      form = {
        "name": document.getElementById("name").value,
        "email": document.getElementById("email").value,
        "role": document.getElementById("role").value,
      }
    }else{
      form = {
        "name": document.getElementById("name").value,
        "email": document.getElementById("email").value,
        "password": document.getElementById("password").value,
        "role": document.getElementById("role").value,
      }
    }

    AppUtil.putAPI(url + 'users/' + id, form).then((response) => {
      if (response.success) {
        document.getElementById("id").value = 0;
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("role").value = 0;
        this.getAdminData();
        this.setState({
          error: true,
          errorMsg: "El usuario se actualizo exitosamente",
          color: "alert alert-success",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: true,
            updating: false
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al actualizar el usuario",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
            updating: false
          });
        }, "2000");
      }
    });

  }

  //elimina el profesor seleccionado
  deleteProfessor = (id) => {
    this.validateToken();
    let url_api = url + "professor_users/" + id;
    AppUtil.deleteAPI(url_api).then((response) => {
      if (response.success) {
        this.getProfessorData();
        this.setState({
          error: true,
          errorMsg: "El profesor se elimino exitosamente",
          color: "alert alert-success",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al eliminar el profesor",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      }
    });
  };

  //elimina el campus seleccionado
  deleteCampus = (id) => {
    this.validateToken();
    let url_api = url + "campuses/" + id;
    AppUtil.deleteAPI(url_api).then((response) => {
      if (response.success) {
        this.getCampusData();
        this.setState({
          error: true,
          errorMsg: "La sede se elimino exitosamente",
          color: "alert alert-success",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al eliminar la sede",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      }
    });
  };

  //elimina el estudiante seleccionado
  deleteStudent = (id) => {


      this.validateToken();
      let url_api = url + "students/" + id;
      AppUtil.deleteAPI(url_api).then((response) => {
        if (response.success) {

          if (response.message == "Estudiante no se puede eliminar, esta ligado a ideas o ferias")
          {
            let listaIdeas = '<ul>';
            for (var i = 0; i < response.data.length; i++)
            {
              listaIdeas += `<li>ID:${response.data[i].id} | Idea asignada: ${response.data[i].name} </li>`;
            }
            listaIdeas += '</ul>'

            this.setState({
              error: true,
              errorMsg: `<div>${response.message} <br/> ${listaIdeas}</div>`,
              color: "alert alert-warning",
            });
            setTimeout(() => {
              this.setState({
                error: false,
                errorMsg: "",
                color: "",
              });
            }, "6000");
            return;
          }


          this.getStudentsData();
          this.setState({
            error: true,
            errorMsg: "El estudiante se elimino exitosamente",
            color: "alert alert-success",
          });
          setTimeout(() => {
            this.setState({
              error: false,
              errorMsg: "",
              color: "",
            });
          }, "2000");
        } else {
          this.setState({
            error: true,
            errorMsg: "Hubo un problema al eliminar el estudiante",
            color: "alert alert-danger",
          });
          setTimeout(() => {
            this.setState({
              error: false,
              errorMsg: "",
              color: "",
            });
          }, "2000");
        }
      });
  };

  //elimina el estudiante seleccionado
  deleteJudge = (id) => {
    this.validateToken();
    let url_api = url + "judges/" + id;
    AppUtil.deleteAPI(url_api).then((response) => {
      if (response.success)
      {
        if (response.message === "Juez no se puede eliminar, esta ligado a ferias")
        {
          let listaIdeas = '<ul>';
          for (var i = 0; i < response.data.length; i++)
          {
            listaIdeas += `<li>ID:${response.data[i].fairs_id} | Feria asignada: ${response.data[i].fairs.name} </li>`;
          }
          listaIdeas += '</ul>'

          this.setState({
            error: true,
            errorMsg: `<div>${response.message} <br/> ${listaIdeas}</div>`,
            color: "alert alert-warning",
          });
          setTimeout(() => {
            this.setState({
              error: false,
              errorMsg: "",
              color: "",
            });
          }, "6000");

            return ;
        }


        this.getJudgesData();
        this.setState({
          error: true,
          errorMsg: "El jurado se elimino exitosamente",
          color: "alert alert-success",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al eliminar el jurado",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
          });
        }, "2000");
      }
    });
  };

  validateEmail = (e) => {
    if (e.target.type == "email") {
      let isValidEmail =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!isValidEmail.test(e.target.value)) {
        this.setState({
          valid_email: false,
        });
      } else {
        this.setState({
          valid_email: true,
        });
      }
      return;
    }
  };

  validatePassword = (pass) => {
    if (pass.length < 8) {
      this.setState({
        error: true,
        errorMsg: "La contraseña debe tener mínimo 8 caracteres",
        color: "alert alert-danger",
      });
      setTimeout(() => {
        this.setState({
          error: false,
          errorMsg: "",
          color: "",
        });
      }, "4000");
      return false;
    }
    return true;
  };


  //carga la informacion del profesor a actualizar
  getUpdateProfessor = (professor) => {
    this.setState({
      updating: true
    });
    document.getElementById("id").value = professor.id;
    document.getElementById("nameProfessor").value = professor.name;
    document.getElementById("campus_id").value = professor.campus.id;
  };

  updateProfessor = () => {
    this.validateToken();
    this.setState({
      spinner: true
    });
    let id = document.getElementById("id").value;
    let form = {
      "campus_id": document.getElementById("campus_id").value,
      "name": document.getElementById("nameProfessor").value
    }
    AppUtil.putAPI(url + 'professor_users/' + id, form).then((response) => {
      if (response.success) {
        document.getElementById("id").value = 0;
        document.getElementById("nameProfessor").value = "";
        document.getElementById("campus_id").value = 0;
        this.getProfessorData();
        this.setState({
          error: true,
          errorMsg: "El profesor se actualizo exitosamente",
          color: "alert alert-success",
          updating: false
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
            updating: false
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al actualizar el profesor",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
            updating: false
          });
        }, "2000");
      }
    });

  }


  //carga la informacion del campus a actualizar
  getUpdateCampus = (campus) => {
    this.setState({
      updating: true
    });
    document.getElementById("id").value = campus.id;
    document.getElementById("campus_name").value = campus.name;
  };

  updateCampus = () => {
    this.validateToken();
    this.setState({
      spinner: true
    });
    let id = document.getElementById("id").value;
    let form = {
      "name": document.getElementById("campus_name").value
    }
    AppUtil.putAPI(url + 'campuses/' + id, form).then((response) => {
      if (response.success) {
        document.getElementById("id").value = 0;
        document.getElementById("campus_name").value = "";
        this.getCampusData();
        this.setState({
          error: true,
          errorMsg: "La sede se actualizo exitosamente",
          color: "alert alert-success",
          updating: false
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
            updating: false
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al actualizar la sede",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
            updating: false
          });
        }, "2000");
      }
    });

  }

    //carga la informacion del juez a actualizar
    getUpdateJudge = (judge) => {
      this.setState({
        updating: true
      });

      document.getElementById("id").value = judge.id;
      document.getElementById("id_users").value = judge.users.id;
      document.getElementById("name").value = judge.users.name;
      document.getElementById("email").value = judge.users.email;
      document.getElementById("business_name").value = judge.business_name;
    };

    updateJudges = () => {
      this.validateToken();
      this.setState({
        spinner: true
      });
      let id = document.getElementById("id").value;
      let form = "";
      if(document.getElementById("password").value == ""){
        form = {
          "id": document.getElementById("id").value,
          "users_id": document.getElementById("id_users").value,
          "business_name": document.getElementById("business_name").value,
          "name": document.getElementById("name").value,
          "email": document.getElementById("email").value
        }
      }else{
        form = {
          "id": document.getElementById("id").value,
          "users_id": document.getElementById("id_users").value,
          "business_name": document.getElementById("business_name").value,
          "name": document.getElementById("name").value,
          "email": document.getElementById("email").value,
          "password": document.getElementById("password").value
        }
      }

      AppUtil.putAPI(url + 'judges/' + id, form).then((response) => {
        if (response.success) {
          document.getElementById("id").value = "";
          document.getElementById("id_users").value = "";
          document.getElementById("name").value = "";
          document.getElementById("email").value = "";
          document.getElementById("business_name").value = "";
          document.getElementById("password").value = "";
          this.getJudgesData();
          this.setState({
            error: true,
            errorMsg: "El juez se actualizo exitosamente",
            color: "alert alert-success",
            updating: false
          });
          setTimeout(() => {
            this.setState({
              error: false,
              errorMsg: "",
              color: "",
              spinner: false,
              updating: false
            });
          }, "2000");
        } else {
          this.setState({
            error: true,
            errorMsg: "Hubo un problema al actualizar el juez",
            color: "alert alert-danger",
          });
          setTimeout(() => {
            this.setState({
              error: false,
              errorMsg: "",
              color: "",
              spinner: false,
              updating: false
            });
          }, "2000");
        }
      });

    }


  //carga la informacion del estudiante a actualizar
    getUpdateStudent = (student) => {
      this.setState({
        updating: true
      });

      document.getElementById("id").value = student.id;
      document.getElementById("id_users").value = student.users.id;
      document.getElementById("name").value = student.users.name;
      document.getElementById("email").value = student.users.email;
      document.getElementById("campus_id").value = student.campuses.id;
      document.getElementById("professors_users_id").value = student.professor_users.id;
    };

    //actualiza el estudiante enviando el formulario
  updateStudents = () => {
    this.validateToken();
    this.setState({
      spinner: true
    });
    let id = document.getElementById("id").value;
    let form = "";
    if(document.getElementById("password").value == ""){
      form = {
        "id": document.getElementById("id").value,
        "users_id": document.getElementById("id_users").value,
        "campus_id": document.getElementById("campus_id").value,
        "professors_users_id": document.getElementById("professors_users_id").value,
        "name": document.getElementById("name").value,
        "email": document.getElementById("email").value
      }
    }else{
      form = {
        "id": document.getElementById("id").value,
        "users_id": document.getElementById("id_users").value,
        "campus_id": document.getElementById("campus_id").value,
        "professors_users_id": document.getElementById("professors_users_id").value,
        "name": document.getElementById("name").value,
        "email": document.getElementById("email").value,
        "password": document.getElementById("password").value
      }
    }

    AppUtil.putAPI(url + 'students/' + id, form).then((response) => {
      if (response.success) {
        document.getElementById("id").value = "";
        document.getElementById("id_users").value = "";
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("campus_id").value = "";
        document.getElementById("professors_users_id").value = "";
        document.getElementById("password").value = "";
        this.getStudentsData();
        this.setState({
          error: true,
          errorMsg: "El estudiante se actualizo exitosamente",
          color: "alert alert-success",
          updating: false
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
            updating: false
          });
        }, "2000");
      } else {
        this.setState({
          error: true,
          errorMsg: "Hubo un problema al actualizar el estudiante",
          color: "alert alert-danger",
        });
        setTimeout(() => {
          this.setState({
            error: false,
            errorMsg: "",
            color: "",
            spinner: false,
            updating: false
          });
        }, "2000");
      }
    });

  }


  toggleStudent = () => {
    this.setState({
      showStudent: !this.state.showStudent,
      error: false,
      valid_email: true,
      charging: false,
      updating:false
    });
    this.getStudentsData();
  };
  toggleJudge = () => {
    this.setState({
      showJudge: !this.state.showJudge,
      error: false,
      valid_email: true,
      charging: false,
      updating:false
    });
    this.getJudgesData();
  };
  toggleProfessor = () => {
    this.setState({
      showProfessor: !this.state.showProfessor,
      error: false,
      valid_email: true,
      charging: false,
      updating:false
    });
    this.getProfessorData();
  };
  toggleAdmin = () => {
    this.setState({
      showAdmin: !this.state.showAdmin,
      error: false,
      valid_email: true,
      charging: false,
      updating:false
    });
    this.getAdminData();
  };
  toggleCampus = () => {
    this.setState({
      showCampus: !this.state.showCampus,
      error: false,
      valid_email: true,
      charging: false,
      updating:false
    });
    this.getCampusData();
  };


  componentWillMount() {
    this.getUserData();
  }

  renderStudentEdit = (cell, row, rowIndex, formatExtraData) => (
     <a onClick={() => this.getUpdateStudent(row)} className="txt-blue decoration-none">
       {cell}
     </a>
   );

   renderStudentDelete = (cell, row, rowIndex, formatExtraData) => (
     <a onClick={() => this.deleteStudent(cell)}  className="txt-blue decoration-none" >
       Eliminar X
     </a>
    );

    renderJudgeEdit = (cell, row, rowIndex, formatExtraData) => (
      <a onClick={() => this.getUpdateJudge(row)} className="txt-blue decoration-none">
        {cell}
      </a>
    );

    //borrar jurado
    renderJudgeDelete = (cell, row, rowIndex, formatExtraData) => (
      <a onClick={() => this.deleteJudge(cell)}  className="txt-blue decoration-none" >
        Eliminar X
      </a>
     );

     renderProfessorEdit = (cell, row, rowIndex, formatExtraData) => (
        <a onClick={() => this.getUpdateProfessor(row)} className="txt-blue decoration-none">
          {cell}
        </a>
      );

      renderProfessorDelete = (cell, row, rowIndex, formatExtraData) => (
        <a onClick={() => this.deleteProfessor(cell)}  className="txt-blue decoration-none" >
          Eliminar X
        </a>
       );


       renderOptionEdit = (cell, row, rowIndex, formatExtraData) => (
          <a onClick={() => this.getUpdateCampus(row)} className="txt-blue decoration-none">
            {cell}
          </a>
        );

        renderOptionDelete = (cell, row, rowIndex, formatExtraData) => (
          <a onClick={() => this.deleteCampus(cell)}  className="txt-blue decoration-none" >
            Eliminar X
          </a>
         );


           renderProfileDelete = (cell, row, rowIndex, formatExtraData) => (
            <a onClick={() => this.deleteAdmin(cell)}  className="txt-blue decoration-none" >
              Eliminar X
            </a>
           );

           renderProfileEdit = (cell, row, rowIndex, formatExtraData) => (
            <a onClick={() => this.getUpdateAdmin(row)} className="txt-blue decoration-none">
              {cell}
            </a>
          );



  render() {
    let {
      
      showStudent,
      showJudge,
      showProfessor,
      showAdmin,
      showCampus,
   
    } = this.state;


    return (
      <>
        <Container fluid>
          <input id="id" name="id" className="here"></input>
          <input id="id_users" name="id_users" className="here"></input>
          <Row>
            <Col lg="12" sm="12">
              <Card className="card-stats">
                <div className="text-center d-flex justify-content-center background-profile">
                  <h1 className="letter-profile-user radius-letter text-white">
                    {this.nameUser}
                  </h1>
                </div>
                <div className="background-profile p-0">
                  <h2 className="text-center text-white p-0 m-0">
                    {this.user.name}
                  </h2>
                  <br></br>
                </div>
                <Row className="m-5">
                  <Col lg="6" sm="6" xs="12" className="pt-3">
                    <a onClick={this.toggleStudent}>
                      <div className="text-center p-1">
                        <p className="new-profile-text text-color-recovery">
                          Nuevo Estudiante
                        </p>
                      </div>
                    </a>
                  </Col>
                  <Col lg="6" sm="6" xs="12" className="pt-3">
                    <a onClick={this.toggleJudge}>
                      <div className="text-center p-1">
                        <p className="new-profile-text text-color-recovery">
                          Nuevo Jurado
                        </p>
                      </div>
                    </a>
                  </Col>
                  <Col lg="6" sm="6" xs="12">
                    <a onClick={this.toggleProfessor}>
                      <div className="text-center p-1">
                        <p className="new-profile-text text-color-recovery">
                          Profesores
                        </p>
                      </div>
                    </a>
                  </Col>
                  {this.state.role === "SuperAdmin" && <Col lg="6" sm="6" xs="12">
                    <a onClick={this.toggleAdmin}>
                      <div className="text-center p-1">
                        <p className="new-profile-text text-color-recovery">
                          Nuevo Administrador
                        </p>
                      </div>
                    </a>
                  </Col>}
                  <Col lg="6" sm="6" xs="12">
                    <a onClick={this.toggleCampus}>
                      <div className="text-center p-1">
                        <p className="new-profile-text text-color-recovery">
                          Sedes
                        </p>
                      </div>
                    </a>
                  </Col>

                </Row>
              </Card>
            </Col>
          </Row>

          <Modal show={showStudent} onHide={this.toggleStudent} size="lg">
            <Modal.Header closeButton>
              <Modal.Title className="txt-blue text-center">
                Nuevo Estudiante
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid">
              {this.state.error && (
                <div className={this.state.color} role="alert" dangerouslySetInnerHTML={{__html: this.state.errorMsg}}></div>
              )}
              <Container>
  
                <Row className="p-1">
                  <Col xs={12} md={12} xl={12}>
                    <div className="form-group">
                      <label htmlFor="name" className="text-color-recovery">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="name"
                        name="name"
                        aria-describedby="nameHelp"
                        onChange={this.getInputData}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="p-1">
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label htmlFor="email" className="text-color-recovery">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        id="email"
                        name="email"
                        aria-describedby="emailHelp"
                        onChange={this.getInputData}
                        maxLength={200}
                      />
                      {!this.state.valid_email && (
                        <small className="text-danger">
                          Correo electrónico no valido
                        </small>
                      )}
                    </div>
                  </Col>
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label
                        htmlFor="campus_id"
                        className="text-color-recovery"
                      >
                        Sede
                      </label>
                      <select
                        type="text"
                        className="form-control form-control-sm input-field"
                        id="campus_id"
                        name="campus_id"
                        aria-describedby="campus_idHelp"
                        onChange={this.getInputData}
                      >
                        <option value="0" selected>
                          Seleccione una sede
                        </option>
                        {this.state.options.map((option) => (
                          <option value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                  </Col>
                </Row>

                <Row className="p-1">
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label
                        htmlFor="professors_users_id"
                        className="text-color-recovery"
                      >
                        Profesor
                      </label>
                      <select
                        type="text"
                        className="form-control form-control-sm input-field"
                        id="professors_users_id"
                        name="professors_users_id"
                        aria-describedby="professors_users_idHelp"
                        onChange={this.getInputData}
                      >
                        <option value="0" selected>
                          Seleccione un profesor
                        </option>
                        {this.state.professors.map((option) => (
                          <option value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                  </Col>
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label htmlFor="password" className="text-color-recovery">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm input-field"
                        id="password"
                        name="password"
                        aria-describedby="passwordHelp"
                        onChange={this.getInputData}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
              {!this.state.spinner && (
                <div>
                {!this.state.updating && (
                <button
                  size="lg"
                  type="submit"
                  onClick={this.saveStudent}
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  Crear Nuevo
                </button>
                  )}
                {this.state.updating && (
                <button
                  size="lg"
                  type="submit"
                  onClick={this.updateStudents}
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  Actualizar
                </button>
                  )}
                </div>
              )}
              {this.state.spinner && (
                <button
                  size="lg"
                  type="submit"
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  <div className="lds-dual-ring"></div>
                </button>
              )}
            </Modal.Footer>
          </Modal>

          <Modal show={showJudge} onHide={this.toggleJudge} size="lg">
            <Modal.Header closeButton>
              <Modal.Title className="txt-blue text-center">
                Nuevo Jurado
              </Modal.Title>
            </Modal.Header>
            {this.state.error && (
              <div className={this.state.color} role="alert" dangerouslySetInnerHTML={{__html: this.state.errorMsg}}></div>
            )}
            <Modal.Body className="show-grid">
              <Container>
         
                <Row className="p-1">
                  <Col xs={12} md={12}>
                    <div className="form-group">
                      <label htmlFor="name" className="text-color-recovery">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="name"
                        name="name"
                        aria-describedby="nameHelp"
                        onChange={this.getInputDataJudge}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="p-1">
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label htmlFor="email" className="text-color-recovery">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        id="email"
                        name="email"
                        aria-describedby="emailHelp"
                        maxLength={200}
                        onChange={this.getInputDataJudge}
                      />
                      {!this.state.valid_email && (
                        <small className="text-danger">
                          Correo electrónico no valido
                        </small>
                      )}
                    </div>
                  </Col>
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label
                        htmlFor="business_name"
                        className="text-color-recovery"
                      >
                        Empresa (Independiente)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm input-field"
                        id="business_name"
                        name="business_name"
                        aria-describedby="business_nameHelp"
                        onChange={this.getInputDataJudge}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="p-1">
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label htmlFor="password" className="text-color-recovery">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm input-field"
                        id="password"
                        name="password"
                        aria-describedby="passwordHelp"
                        onChange={this.getInputDataJudge}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
              {!this.state.spinner && (
                <div>
                  {!this.state.updating && (
                <button
                  size="lg"
                  type="submit"
                  onClick={this.saveJudge}
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  Crear Nuevo
                </button>
                  )}
                {this.state.updating && (
                <button
                  size="lg"
                  type="submit"
                  onClick={this.updateJudges}
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  Actualizar
                </button>
                  )}
                </div>
              )}
              {this.state.spinner && (
                <button
                  size="lg"
                  type="submit"
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  <div className="lds-dual-ring"></div>
                </button>
              )}
            </Modal.Footer>
          </Modal>

          <Modal show={showProfessor} onHide={this.toggleProfessor} size="lg">
            <Modal.Header closeButton>
              <Modal.Title className="txt-blue text-center">
                Nuevo Profesor
              </Modal.Title>
            </Modal.Header>
            {this.state.error == true && (
              <div className={this.state.color} role="alert">
                {this.state.errorMsg}
              </div>
            )}
            <Modal.Body className="show-grid">
              <Container>
         
                <hr></hr>
                <Row className="p-1">
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label
                        htmlFor="nameProfessor"
                        className="text-color-recovery"
                      >
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm input-field"
                        id="nameProfessor"
                        name="nameProfessor"
                        aria-describedby="nameProfessorHelp"
                        onChange={this.getInputDataOthers}

                      />
                    </div>
                  </Col>
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label
                        htmlFor="campus_id"
                        className="text-color-recovery"
                      >
                        Sede
                      </label>
                      <select
                        type="text"
                        className="form-control form-control-sm input-field"
                        id="campus_id"
                        name="campus_id"
                        aria-describedby="campus_idHelp"
                        onChange={this.getInputDataOthers}
                      >
                        <option value="0" selected>
                          Seleccione una sede
                        </option>
                        {this.state.options.map((option) => (
                          <option value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
              {!this.state.spinner && (
                <div>
                  {!this.state.updating && (
                    <button
                      size="lg"
                      type="submit"
                      onClick={this.saveProfessor}
                      className="bg-blue btn-lg btn-rounded txt-white-btn"
                    >
                      Crear Nuevo
                    </button>
                  )}
                  {this.state.updating && (
                    <button
                      size="lg"
                      type="submit"
                      onClick={this.updateProfessor}
                      className="bg-blue btn-lg btn-rounded txt-white-btn"
                    >
                      Actualizar
                    </button>
                  )}
                </div>

              )}
              {this.state.spinner && (
                <button
                  size="lg"
                  type="submit"
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  <div className="lds-dual-ring"></div>
                </button>
              )}
            </Modal.Footer>
          </Modal>

          <Modal show={showAdmin} onHide={this.toggleAdmin} size="lg">
            <Modal.Header closeButton>
              <Modal.Title className="txt-blue text-center">
                Nuevo Administrador
              </Modal.Title>
            </Modal.Header>
            {this.state.error == true && (
              <div className={this.state.color} role="alert">
                {this.state.errorMsg}
              </div>
            )}
            <Modal.Body className="show-grid">
              <Container>
         
                <Row className="p-1">
                  <Col xs={12} md={12}>
                    <div className="form-group">
                      <label htmlFor="name" className="text-color-recovery">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        id="name"
                        name="name"
                        aria-describedby="nameHelp"
                        onChange={this.getInputDataAdmin}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="p-1">
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label htmlFor="email" className="text-color-recovery">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        id="email"
                        name="email"
                        aria-describedby="emailHelp"
                        onChange={this.getInputDataAdmin}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label htmlFor="password" className="text-color-recovery">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm input-field"
                        id="password"
                        name="password"
                        aria-describedby="passwordHelp"
                        onChange={this.getInputDataAdmin}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>

                <Row className="p-1">
                  <Col xs={12} md={12} xl={6}>
                    <div className="form-group">
                      <label
                        htmlFor="role"
                        className="text-color-recovery"
                      >
                        Rol
                      </label>
                      <select
                        type="text"
                        className="form-control form-control-sm input-field"
                        id="role"
                        name="role"
                        aria-describedby="roleHelp"
                        onChange={this.getInputDataAdmin}
                      >
                        <option value="0" selected>
                          Seleccione un rol
                        </option>
                          <option value="SuperAdmin">Super Administrador</option>
                          <option value="Admin">Administrador</option>
                      </select>
                    </div>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
            {!this.state.spinner && (
                <div>
                  {!this.state.updating && (
                    <button
                      size="lg"
                      type="submit"
                      onClick={this.saveAdmin}
                      className="bg-blue btn-lg btn-rounded txt-white-btn"
                    >
                      Crear Nuevo
                    </button>
                  )}
                  {this.state.updating && (
                    <button
                      size="lg"
                      type="submit"
                      onClick={this.updateAdmin}
                      className="bg-blue btn-lg btn-rounded txt-white-btn"
                    >
                      Actualizar
                    </button>
                  )}
                </div>
              )}
              {this.state.spinner && (
                <button
                  size="lg"
                  type="submit"
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  <div className="lds-dual-ring"></div>
                </button>
              )}
            </Modal.Footer>
          </Modal>

          <Modal show={showCampus} onHide={this.toggleCampus} size="lg">
            <Modal.Header closeButton>
              <Modal.Title className="txt-blue text-center">
                Nueva Sede
              </Modal.Title>
            </Modal.Header>
            {this.state.error == true && (
              <div className={this.state.color} role="alert">
                {this.state.errorMsg}
              </div>
            )}
            <Modal.Body className="show-grid">
              <Container>
          
                <Row className="p-1">
                  <Col xs={12} md={12}>
                    <div className="form-group">
                      <label
                        htmlFor="campus_name"
                        className="text-color-recovery"
                      >
                        Nombre de la nueva sede
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm input-field"
                        id="campus_name"
                        name="campus_name"
                        aria-describedby="campus_nameHelp"
                        onChange={this.getInputDataOthers}
                        maxLength={200}
                      />
                    </div>
                  </Col>
                </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
              {!this.state.spinner && (
                <div>
                  {!this.state.updating && (
                    <button
                      size="lg"
                      type="submit"
                      onClick={this.saveCampus}
                      className="bg-blue btn-lg btn-rounded txt-white-btn"
                    >
                      Crear Nuevo
                    </button>
                  )}
                  {this.state.updating && (
                    <button
                      size="lg"
                      type="submit"
                      onClick={this.updateCampus}
                      className="bg-blue btn-lg btn-rounded txt-white-btn"
                    >
                      Actualizar
                    </button>
                  )}
                </div>
              )}
              {this.state.spinner && (
                <button
                  size="lg"
                  type="submit"
                  className="bg-blue btn-lg btn-rounded txt-white-btn"
                >
                  <div className="lds-dual-ring"></div>
                </button>
              )}
            </Modal.Footer>
          </Modal>

        </Container>
      </>
    );
  }
}

export default NewProfile;
