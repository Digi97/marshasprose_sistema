import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Configuración base para aparecer sobre modales Bootstrap
const aboveModal = {
  customClass: {
    container: 'swal-above-modal',
  },
  didOpen: () => {
    // Mueve el contenedor de Swal por encima del modal de Bootstrap
    const swalContainer = document.querySelector('.swal-above-modal');
    if (swalContainer) {
      swalContainer.style.zIndex = '9999';
    }
  },
};

const alert = (message, icon, t) => {
  return MySwal.fire({
    ...aboveModal,
    icon,
    title: icon === "success" ? t("success"): t("something_went_wrong"),
    text: message,
    confirmButtonColor: '#000f47',
  });
};
export default alert