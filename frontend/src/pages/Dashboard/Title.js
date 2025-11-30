import React from "react";
import "./style.css";

/**
 * Componente de título customizado para substituir o Typography do Material-UI
 * Mantido para compatibilidade com código legado
 */
const Title = (props) => {
	return (
		<h2 className="dashboard-title">
			{props.children}
		</h2>
	);
};

export default Title;
