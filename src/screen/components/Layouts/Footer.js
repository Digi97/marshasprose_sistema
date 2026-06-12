import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { useDarkMode } from '../common/useDarkMode';


function Footer() {
  const { isDark } = useDarkMode();

    return (
      <footer className="footer px-0 px-lg-3" data-theme={isDark? "dark":"light"}>
        <Container fluid>
          <nav>

            <p className="copyright text-center">
              © {new Date().getFullYear()}{" "}
              Marsh Asprose
            </p>
          </nav>
        </Container>
      </footer>
    );
}

export default Footer;
