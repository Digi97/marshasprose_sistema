 const renderActive  =(isActive, t) => {
   
      return (
        <span className={`badge_status ${isActive ===1  ? "badge-active":"badge-inactive"}`} >
          <i className={isActive ===1 ? "fas fa-circle-check": "fas fa-circle-minus"} aria-hidden="true"></i> {isActive ===1 ? t("active"): t("inactive") }
          </span>
     
      );
  };

  export default renderActive