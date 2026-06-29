import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const SlideDown = ({ show, value, onChange, disabled, t }) => (
    <div
        style={{
            maxHeight: show ? "120px" : "0",
            overflow: "hidden",
            transition: "max-height 0.35s ease",
        }}
    >
        <Row className="m-2">
            <Col sm="12" xl="12">
                <label className="txt-darkblue">{t("credit_days")}</label>
                <Form.Group>
                    <Form.Select
                        name="dias_credito"
                        onChange={onChange}
                        value={value}
                        disabled={disabled}
                        required={show}
                    >
                        <option value="">{t("select_option")}</option>
                        <option value="30">30 {t("days")}</option>
                        <option value="60">60 {t("days")}</option>
                        <option value="90">90 {t("days")}</option>
                        <option value="120">120 {t("days")}</option>
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>
    </div>
);

export default SlideDown;
