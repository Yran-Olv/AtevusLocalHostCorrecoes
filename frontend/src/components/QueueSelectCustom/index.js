import React, { useEffect, useState, useRef } from "react";
import { FiX, FiChevronDown, FiLayers } from "react-icons/fi";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import "./style.css";

const QueueSelectCustom = ({ selectedQueueIds, onChange }) => {
	const [queues, setQueues] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef(null);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/queue");
				setQueues(data);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleChange = (queueId) => {
		const isSelected = selectedQueueIds.includes(queueId);
		let newSelected;
		
		if (isSelected) {
			newSelected = selectedQueueIds.filter(id => id !== queueId);
		} else {
			newSelected = [...selectedQueueIds, queueId];
		}
		
		onChange(newSelected);
	};

	const removeQueue = (queueId, e) => {
		e.stopPropagation();
		const newSelected = selectedQueueIds.filter(id => id !== queueId);
		onChange(newSelected);
	};

	const filteredQueues = queues.filter(queue =>
		queue.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const selectedQueues = queues.filter(q => selectedQueueIds.includes(q.id));
	const withoutQueueSelected = selectedQueueIds.includes("0");

	return (
		<div className="queue-select-custom" ref={dropdownRef}>
			<label className="queue-select-label">
				{i18n.t("queueSelect.inputLabel")}
			</label>
			<div className="queue-select-wrapper">
				<div 
					className="queue-select-input"
					onClick={() => setIsOpen(!isOpen)}
				>
					<div className="queue-select-chips">
						{selectedQueueIds.length === 0 ? (
							<span className="queue-select-placeholder">
								{i18n.t("queueSelect.inputLabel")}
							</span>
						) : (
							<>
								{withoutQueueSelected && (
									<span className="queue-select-chip">
										<FiLayers className="queue-select-chip-icon" />
										{i18n.t("queueSelect.withoutQueue")}
										<button
											className="queue-select-chip-remove"
											onClick={(e) => removeQueue("0", e)}
										>
											<FiX />
										</button>
									</span>
								)}
								{selectedQueues.map((queue) => (
									<span 
										key={queue.id} 
										className="queue-select-chip"
										style={{ backgroundColor: queue.color || "#7c7c7c" }}
									>
										<FiLayers className="queue-select-chip-icon" />
										{queue.name}
										<button
											className="queue-select-chip-remove"
											onClick={(e) => removeQueue(queue.id, e)}
										>
											<FiX />
										</button>
									</span>
								))}
							</>
						)}
					</div>
					<FiChevronDown className={`queue-select-arrow ${isOpen ? 'open' : ''}`} />
				</div>
				
				{isOpen && (
					<div className="queue-select-dropdown">
						<div className="queue-select-search">
							<input
								type="text"
								className="queue-select-search-input"
								placeholder="Buscar fila..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
						<div className="queue-select-options">
							<div
								className={`queue-select-option ${withoutQueueSelected ? 'selected' : ''}`}
								onClick={() => handleChange("0")}
							>
								<div className="queue-select-option-checkbox">
									{withoutQueueSelected && <div className="queue-select-option-check"></div>}
								</div>
								<FiLayers className="queue-select-option-icon" />
								<span className="queue-select-option-label">
									{i18n.t("queueSelect.withoutQueue")}
								</span>
							</div>
							{filteredQueues.map((queue) => {
								const isSelected = selectedQueueIds.includes(queue.id);
								return (
									<div
										key={queue.id}
										className={`queue-select-option ${isSelected ? 'selected' : ''}`}
										onClick={() => handleChange(queue.id)}
									>
										<div className="queue-select-option-checkbox">
											{isSelected && <div className="queue-select-option-check"></div>}
										</div>
										<div 
											className="queue-select-option-color"
											style={{ backgroundColor: queue.color || "#7c7c7c" }}
										></div>
										<span className="queue-select-option-label">{queue.name}</span>
									</div>
								);
							})}
							{filteredQueues.length === 0 && (
								<div className="queue-select-empty">Nenhuma fila encontrada</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default QueueSelectCustom;
