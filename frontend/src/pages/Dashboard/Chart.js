import React, { useState, useEffect } from "react";
import {
	CartesianGrid,
	XAxis,
	YAxis,
	Label,
	ResponsiveContainer,
	LineChart,
	Line,
	Tooltip,
	Legend,
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";
import useTickets from "../../hooks/useTickets";
import "./style.css";

const Chart = ({ dateStartTicket, dateEndTicket, queueTicket }) => {
	const { tickets, count } = useTickets({
		dateStart: dateStartTicket,
		dateEnd: dateEndTicket,
		queueIds: queueTicket ? `[${queueTicket}]` : "[]",
	});

	const [chartData, setChartData] = useState([
		{ time: "00:00", amount: 0 },
		{ time: "01:00", amount: 0 },
		{ time: "02:00", amount: 0 },
		{ time: "03:00", amount: 0 },
		{ time: "04:00", amount: 0 },
		{ time: "05:00", amount: 0 },
		{ time: "06:00", amount: 0 },
		{ time: "07:00", amount: 0 },
		{ time: "08:00", amount: 0 },
		{ time: "09:00", amount: 0 },
		{ time: "10:00", amount: 0 },
		{ time: "11:00", amount: 0 },
		{ time: "12:00", amount: 0 },
		{ time: "13:00", amount: 0 },
		{ time: "14:00", amount: 0 },
		{ time: "15:00", amount: 0 },
		{ time: "16:00", amount: 0 },
		{ time: "17:00", amount: 0 },
		{ time: "18:00", amount: 0 },
		{ time: "19:00", amount: 0 },
		{ time: "20:00", amount: 0 },
		{ time: "21:00", amount: 0 },
		{ time: "22:00", amount: 0 },
		{ time: "23:00", amount: 0 },
	]);

	useEffect(() => {
		setChartData((prevState) => {
			let aux = [...prevState];

			aux.forEach((a) => {
				tickets.forEach((ticket) => {
					format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") ===
						a.time && a.amount++;
				});
			});

			return aux;
		});
	}, [tickets]);

	return (
		<div className="dashboard-chart-wrapper">
			<h3 className="dashboard-chart-title">
				Atendimentos Criados: <span className="dashboard-chart-count">{count}</span>
			</h3>
			<div className="dashboard-chart-container-inner">
				<ResponsiveContainer width="100%" height={300}>
					<LineChart
						data={chartData}
						margin={{
							top: 20,
							right: 30,
							left: 20,
							bottom: 20,
						}}
					>
						<CartesianGrid 
							strokeDasharray="3 3" 
							stroke="var(--dashboard-border)"
							opacity={0.3}
						/>
						<XAxis
							dataKey="time"
							stroke="var(--dashboard-text-light)"
							fontSize={12}
							tick={{ fill: "var(--dashboard-text-light)" }}
						/>
						<YAxis
							type="number"
							allowDecimals={false}
							stroke="var(--dashboard-text-light)"
							fontSize={12}
							tick={{ fill: "var(--dashboard-text-light)" }}
						>
							<Label
								angle={270}
								position="left"
								style={{
									textAnchor: "middle",
									fill: "var(--dashboard-text)",
									fontSize: "0.875rem",
									fontWeight: 500,
								}}
							>
								Tickets
							</Label>
						</YAxis>
						<Tooltip
							contentStyle={{
								backgroundColor: "var(--dashboard-card-bg)",
								border: "1px solid var(--dashboard-border)",
								borderRadius: "8px",
								color: "var(--dashboard-text)",
								boxShadow: "0 4px 12px var(--dashboard-shadow)",
							}}
							labelStyle={{
								color: "var(--dashboard-text)",
								fontWeight: 600,
							}}
						/>
						<Legend
							wrapperStyle={{
								color: "var(--dashboard-text)",
								fontSize: "0.875rem",
							}}
						/>
						<Line
							type="monotone"
							dataKey="amount"
							stroke="var(--dashboard-primary)"
							strokeWidth={3}
							dot={{ fill: "var(--dashboard-primary)", r: 4 }}
							activeDot={{ r: 6, fill: "var(--dashboard-primary-light)" }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default Chart;
