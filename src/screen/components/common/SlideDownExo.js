import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const SlideDown = ({ show, values, onChange, disabled, t }) => (
    <div
        style={{
            maxHeight: show ? "500px" : "0",
            overflow: "hidden",
            transition: "max-height 0.35s ease",
        }}
    >
        <Row className="m-2">
            <Col sm="12" xl="12">
                <label className="txt-darkblue">{t("code")}</label>
                <Form.Group>
                    <Form.Select
                        placeholder={t("exoneration_type")}
                        onChange={onChange}
                        name="tipoExoneracion"
                        value={values.tipoExoneracion}
                        required={show}
                        disabled={disabled}
                    >
                        <option value="">{t("select_option")}</option>
                        <option value="01">Compras autorizadas por la Dirección General de Tributación</option>
                        <option value="02">Ventas exentas a diplomáticos</option>
                        <option value="03">Autorizado por Ley especial</option>
                        <option value="04">Exenciones Dirección General de Hacienda Autorización Local Genérica</option>
                        <option value="05">Exenciones Dirección General de Hacienda Transitorio V (servicios de ingeniería, arquitectura, topografía obra civil)</option>
                        <option value="06">Servicios turísticos inscritos ante el Instituto Costarricense de Turismo (ICT)</option>
                        <option value="07">Transitorio XVII (Recolección, Clasificación, almacenamiento de Reciclaje y reutilizable)</option>
                        <option value="08">Exoneración a Zona Franca</option>
                        <option value="09">Exoneración de servicios complementarios para la exportación artículo 11 RLIVA</option>
                        <option value="10">Órgano de las corporaciones municipales</option>
                        <option value="11">Exenciones Dirección General de Hacienda Autorización de Impuesto Local Concreta</option>
                    </Form.Select>
                </Form.Group>
            </Col>

            <Col sm="12" xl="4">
                <label className="txt-darkblue">{t("code")}</label>
                <Form.Group>
                    <Form.Control
                        placeholder={"AL-000000000"}
                        type="text"
                        onChange={onChange}
                        name="codigoExoneracion"
                        value={values.codigoExoneracion}
                        required={show}
                        disabled={disabled}
                        maxLength={20}
                    />
                </Form.Group>
            </Col>

            <Col sm="12" xl="4">
                <label className="txt-darkblue">{t("institution_name")}</label>
                <Form.Group>
                    <Form.Control
                        placeholder={"Hacienda"}
                        type="text"
                        onChange={onChange}
                        name="nombreInstitucionExo"
                        value={values.nombreInstitucionExo}
                        required={show}
                        disabled={disabled}
                        maxLength={20}
                    />
                </Form.Group>
            </Col>

            <Col sm="12" xl="4">
                <label className="txt-darkblue">{t("percentage")}</label>
                <Form.Group>
                    <Form.Control
                        placeholder={"100"}
                        type="number"
                        onChange={onChange}
                        name="porcentajeExo"
                        value={values.porcentajeExo}
                        required={show}
                        disabled={disabled}
                        maxLength={3}
                    />
                </Form.Group>
            </Col>

              <Col sm="12" xl="4">
                <label className="txt-darkblue">{t("date")}</label>
                <Form.Group>
                    <Form.Control
                        type="date"
                        onChange={onChange}
                        name="fechaEmision"
                        value={values.fechaEmision}
                        required={show}
                        disabled={disabled}
                        maxLength={3}
                    />
                </Form.Group>
            </Col>
        </Row>
    </div>
);

export default SlideDown;