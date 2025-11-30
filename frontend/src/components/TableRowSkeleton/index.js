import React from "react";
import "./style.css";

const TableRowSkeleton = ({ avatar, columns }) => {
	return (
		<tr className="skeleton-row">
			{avatar && (
				<>
					<td className="skeleton-cell">
						<div className="skeleton-avatar"></div>
					</td>
					<td className="skeleton-cell">
						<div className="skeleton-text" style={{ width: '80px' }}></div>
					</td>
				</>
			)}
			{Array.from({ length: columns }, (_, index) => (
				<td key={index} className="skeleton-cell center">
					<div className="skeleton-text" style={{ width: '80px', margin: '0 auto' }}></div>
				</td>
			))}
		</tr>
	);
};

export default TableRowSkeleton;
