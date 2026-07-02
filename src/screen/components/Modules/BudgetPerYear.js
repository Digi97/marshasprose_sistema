import React, { Component } from "react";
import { Container, Row, Col, Button, Table, Form } from "react-bootstrap";
import { withTranslation } from "react-i18next";
import crypto from "crypto-js";
import AppUtil from "../../../AppUtil/AppUtil";
import alertSuccess from "../common/SweetAlert";


class BudgetPerYear extends Component {
  constructor(props) {
    super(props);
    this.state = {
      budgetItems: [],
      monthlyMatrix: {},
      monthlyMatrixIds: {},
      anio_presupuesto: props.anio_presupuesto || "",
      filterCatId: props.categoria_presupuestaria_id || null,
      filterCcId: props.centro_Costos_id || null,
      user: {},
    };
    this.user = null;
  }

  getUserInfo = () => {
    let bytes = crypto.AES.decrypt(sessionStorage.getItem("user"), "@marsh_contable");
    this.user = JSON.parse(bytes.toString(crypto.enc.Utf8));
    this.setState({ user: this.user });
  };

  componentDidMount() {
    this.getUserInfo();
    const { anio_presupuesto } = this.props;
    if (anio_presupuesto) {
      this.getBudgetData(anio_presupuesto);
      this.getMonthlyData(anio_presupuesto);
    }
  }

  getBudgetData = (anio) => {
    AppUtil.getAPI(`gestion_presupuestaria/${anio}`).then(response => {
      const data = response ? response.data : [];
      if (!data || data.length === 0) return;
      this.setState({ budgetItems: data, anio_presupuesto: anio });
    });
  };

  getMonthlyData = (anio) => {
    AppUtil.getAPI(`gestion_por_anio/${anio}`).then(response => {
      const data = response ? response.data : [];
      
      if (!data || data.length === 0) return;

      const monthlyMatrix = {};
      const monthlyMatrixIds = {};
      data.forEach(item => {
       
        
        if (!monthlyMatrix[item.gestion_Presupuestaria_id]) {
          monthlyMatrix[item.gestion_Presupuestaria_id] = {};
        }
        monthlyMatrix[item.gestion_Presupuestaria_id][item.mes] = item.monto;
        monthlyMatrixIds[`${item.gestion_Presupuestaria_id}_${item.mes}`] = item.id;
      });

      this.setState({ monthlyMatrix, monthlyMatrixIds });
    });
  };

  _saveCellValue = (gestionId, mes, value) => {
    this.setState(prev => {
      const monthlyMatrix = { ...prev.monthlyMatrix };
      monthlyMatrix[gestionId] = { ...(monthlyMatrix[gestionId] || {}), [mes]: value };
      return { monthlyMatrix };
    });
  };

  getRowTotal = (gestionId) => {
    const row = this.state.monthlyMatrix[gestionId] || {};
    return Object.values(row).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  };

  getVisibleItems = () => {
    const { budgetItems, filterCatId, filterCcId } = this.state;
    return budgetItems.filter(item => {
      if (filterCatId && item.categoria_presupuestaria_id !== filterCatId) return false;
      if (filterCcId && item.centro_Costos_id !== filterCcId) return false;
      return true;
    });
  };

  saveMonthly = () => {
    const { t } = this.props;
    const { monthlyMatrix, monthlyMatrixIds, anio_presupuesto } = this.state;
    const visibleItems = this.getVisibleItems();

    for (const item of visibleItems) {
      const rowTotal = this.getRowTotal(item.id);
      const limit = parseFloat(item.monto_aprobado || 0);
      if (limit > 0 && rowTotal > limit) {
        alertSuccess(
          `${item.categoria_presupuestaria} - ${item.centro_costo}: total ${rowTotal.toFixed(2)} supera el monto aprobado ${limit.toFixed(2)}`,
          "error", t
        );
        return;
      }
    }

    const detalles = [];
    for (const item of visibleItems) {
      const row = monthlyMatrix[item.id] || {};
      for (let mes = 1; mes <= 12; mes++) {
        const key = `${item.id}_${mes}`;
        detalles.push({
          id: monthlyMatrixIds[key] || 0,
          gestion_presupuestaria_id: item.id,
          mes,
          monto: parseFloat(row[mes]) || 0,
          anio_presupuesto,
        });
      }
    }

    AppUtil.postAPI(`gestion_por_anio`, { anio_presupuesto, detalles }).then(response => {

    
      if (response && response.codeStatus === 200) {
        alertSuccess(t("updated_successfully"), "success", t);
        this.getMonthlyData(anio_presupuesto);
      } else {
        alertSuccess(t(response?.message || "please_verify_data"), "error", t);
      }
    });
  };

  render() {
    const { t } = this.props;
    const { monthlyMatrix, anio_presupuesto } = this.state;
    const visibleItems = this.getVisibleItems();
    const MONTHS = [ t("january"), t("february"), t("march"), t("april"), t("may"), t("june"), t("july"), t("august"), t("september"), t("october"), t("november"), t("december")];
    return (
      <Container fluid>
        <Row className="mb-3">
          <Col lg="6" sm="12">
            <h1>{t("budget_management")} - {anio_presupuesto}</h1>
          </Col>
          <Col lg="6" sm="12" className="d-flex justify-content-end align-items-center gap-2">
            <Button variant="primary" onClick={this.saveMonthly}>
              {t("save")}
            </Button>
            <Button variant="secondary" onClick={() => this.props.navigate(-1)}>
              <i className="fas fa-arrow-left" /> {t("back")}
            </Button>
          </Col>
        </Row>

        <Row>
          <Col sm="12">
            <div className="table-responsive">
              <Table bordered size="sm" className="align-middle">
                <thead className="table">
                  <tr>
                    <th style={{ minWidth: "200px" }}>{t("presupuestary_category")} / {t("cost_center")}</th>
                    {MONTHS.map((m, i) => (
                      <th key={i} className="text-center" style={{ minWidth: "100px" }}>{m}</th>
                    ))}
                    <th className="text-center" style={{ minWidth: "110px" }}>{t("total")}</th>
                    <th className="text-center" style={{ minWidth: "120px" }}>{t("budgeted_amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map(item => {
                    const rowTotal = this.getRowTotal(item.id);
                    const limit = parseFloat(item.monto_aprobado || 0);
                    const exceeded = limit > 0 && rowTotal > limit;
                    const row = monthlyMatrix[item.id] || {};
                  
                    
                    return (
                      <tr key={item.id}>
                        <td className="fw-semibold small">
                          {item.categoria_presupuestaria}
                          <span className="text-muted fw-normal"> - {item.centro_costo}</span>
                        </td>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                          <td key={mes} className="p-1">
                            <Form.Control
                              type="number"
                              size="sm"
                              min={0}
                              disabled={limit === 0}
                              step="0.01"
                              value={row[mes] ?? ""}
                              onChange={(e) => this._saveCellValue(item.id, mes, e.target.value)}
                            />
                          </td>
                        ))}
                        <td
                          className="text-center fw-bold"
                          style={{ color: exceeded ? "#dc3545" : "#198754" }}
                        >
                          {AppUtil.formatNumber(rowTotal.toFixed(2))}
                        </td>
                        <td className="text-center text-muted small">
                          {AppUtil.formatNumber(limit.toFixed(2))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withTranslation()(BudgetPerYear);
