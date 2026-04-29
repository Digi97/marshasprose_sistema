import Axios from 'axios';
const proxy = ""; //"https://cors-anywhere.herokuapp.com/";
const apiUrl = "api/v1/" //"https://api.expoinnova.jegsnet.com/api/v1/"
const token =  sessionStorage.getItem('token');
const AppUtil = {

  postAPI:async function postAPI(endpoint, dataPost, tokenSent = token)
  {
    try {

      let response = await Axios.post(`${endpoint}`, dataPost, {

        headers: {
          Authorization: `Bearer ${tokenSent}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'

        }
      });
      let dataRet = response.data;
      return dataRet;
    }
    catch (e)
    {
      console.error(e.message);
      return false;
    }
  },
  putAPI:async function putAPI(endpoint, dataPost)
  {
    try {

      let response = await Axios.put(`${endpoint}`, dataPost, {

        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'

        }
      });
      let dataRet = response.data;
      return dataRet;
    }
    catch (e)
    {
      console.error(e.message);
      return false;
    }
  },
  getAPI: async function getAPI(endpoint)
  {
    try {
      let response = await Axios.get(`${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=UTF-8'
        }

      });

      let dataRet = response.data;
      return dataRet;
    }
    catch (e)
    {
      console.error(e);
      return false;
    }
  },
  deleteAPI: async function deleteAPI(endpoint)
  {
    try {

      let response = await Axios.delete(`${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=UTF-8'
        }

      });
      let dataRet = response.data;
      return dataRet;
    }
    catch (e)
    {
      console.error(e);
      return false;
    }
  },
  isJson: function isJson(data)
  {
      try
      {
        let dataReturn = JSON.parse(data);
        return dataReturn;
      } catch (e)
      {
        console.error(e);
        return false;
      }
  },
  fileToBase64: function fileToBase64 (file, cb)
  {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () {
      cb(null, reader.result)
    }
    reader.onerror = function (error) {
      cb(error, null)
    }
},




  isEmail: function isEmail(email)
  {
    let isValidEmail =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return isValidEmail.test(email);
  },

  reloadPage: function reloadPage()
  {

    setTimeout(function(){
      window.location.reload(false);
    }, 3000);

  }
}



export default AppUtil;
