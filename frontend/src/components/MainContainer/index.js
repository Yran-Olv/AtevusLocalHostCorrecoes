import React from "react";
import "./style.css";

const MainContainer = ({ children, className = "" }) => {
	return (
		<div className={`main-container ${className}`}>
			<div className="main-container-wrapper">
				{children}
			</div>
		</div>
	);
};

export default MainContainer;
