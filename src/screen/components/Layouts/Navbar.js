import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import crypto from "crypto-js";
import { useDarkMode } from '../common/useDarkMode';



function Header() {
  let { isDark } = useDarkMode();
  const navigate   = useNavigate();

  const [user, setUser] = useState({
    nombre:    "",
    correo:    "",
    roles_id:  0,
  });


  useEffect(() => {
    try {
      const encrypted = sessionStorage.getItem("user");
      if (encrypted) {
        const bytes    = crypto.AES.decrypt(encrypted, "@marsh_contable");
        const userData = JSON.parse(bytes.toString(crypto.enc.Utf8));
        setUser({
          nombre:    userData.nombre    || "",
          correo:    userData.correo    || "",
          roles_id:  userData.roles_id  || 0,
        });
      }
    } catch (e) {
      console.error("Error al descifrar usuario:", e);
    }
  }, []); // solo al montar el componente


  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node      = document.createElement("div");
    node.id       = "bodyClick";
    node.onclick  = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };
console.log(isDark);

  return (
    <Navbar expand="lg">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ml-lg-0">
          <Button
            variant="dark"
            className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="ml-auto" navbar>

            {/* ── Notificaciones ── */}
            <Nav.Item>
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle
                  as={Nav.Link}
                  data-toggle="dropdown"
                  variant="default"
                >
                  <i className="nc-icon nc-notification-70"></i>
                  <span className="d-lg-none ml-1">Notificaciones</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
                    Notification 1
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>

            {/* ── Usuario ── */}
            <Nav.Item>
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle
                  as={Nav.Link}
                  data-toggle="dropdown"
                  variant="default"
                  className="m-0"
                >
                  <i className="nc-icon nc-single-02 mr-1"></i>
                  {/* Mostrar nombre del usuario del state */}
                  <span className="ml-1">
                    {user.nombre} 
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>
                    <small className="text-muted">{user.correo}</small>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
                    <i className="fas fa-user mr-2"></i>
                    Mi Cuenta
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out mr-2"></i>
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;