import {Toast, ToastContainer} from "react-bootstrap";

const CustomToast = (props) => {
//Estas son las alertas del sitio que se muestra en todo el sitio
return (
  <ToastContainer position={props.position ? props.position : 'top-end'} className="p-3">
       <Toast onClose={props.onClose} show={props.show} delay={3000} autohide bg={props.variant} >
         <Toast.Header>
           <strong className="me-auto">{props.title}</strong>
         </Toast.Header>
         <Toast.Body>{props.body}</Toast.Body>
       </Toast>
    </ToastContainer>
);
}

export default CustomToast;
