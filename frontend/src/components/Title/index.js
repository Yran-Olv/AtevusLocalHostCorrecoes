import React from "react";
import "./Title.css";

export default function Title(props) {
	return (
		<h2 className="title-component">
			{props.children}
		</h2>
	);
}
