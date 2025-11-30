import React, { useEffect, useState, useContext } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { i18n } from '../../translate/i18n';
import { AuthContext } from "../../context/Auth/AuthContext";
import "./style.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            display: false,
        },
        title: {
            display: true,
            text: 'Tickets',
            position: 'left',
            color: 'var(--dashboard-text)',
            font: {
                size: 16,
                weight: 600
            }
        },
        datalabels: {
            display: true,
            anchor: 'start',
            offset: -30,
            align: "start",
            color: "#fff",
            textStrokeColor: "#000",
            textStrokeWidth: 2,
            font: {
                size: 20,
                weight: "bold"
            },
        },
        tooltip: {
            backgroundColor: 'var(--dashboard-card-bg)',
            titleColor: 'var(--dashboard-text)',
            bodyColor: 'var(--dashboard-text)',
            borderColor: 'var(--dashboard-border)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
        }
    },
    scales: {
        x: {
            ticks: {
                color: 'var(--dashboard-text-light)',
            },
            grid: {
                color: 'var(--dashboard-border)',
                opacity: 0.3
            }
        },
        y: {
            ticks: {
                color: 'var(--dashboard-text-light)',
            },
            grid: {
                color: 'var(--dashboard-border)',
                opacity: 0.3
            }
        }
    }
};

export const ChartsDate = () => {
    const [initialDate, setInitialDate] = useState(new Date());
    const [finalDate, setFinalDate] = useState(new Date());
    const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });
    const { user } = useContext(AuthContext);

    const companyId = user.companyId;

    useEffect(() => {
        if (companyId) {
            handleGetTicketsInformation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    const dataCharts = {
        labels: ticketsData && ticketsData?.data.length > 0 && ticketsData?.data.map((item) => 
            (item.hasOwnProperty('horario') ? `Das ${item.horario}:00 as ${item.horario}:59` : item.data)
        ),
        datasets: [
            {
                data: ticketsData?.data.length > 0 && ticketsData?.data.map((item) => item.total),
                backgroundColor: 'var(--dashboard-primary)',
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const handleGetTicketsInformation = async () => {
        try {
            const { data } = await api.get(
                `/dashboard/ticketsDay?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(finalDate, 'yyyy-MM-dd')}&companyId=${companyId}`
            );
            setTicketsData(data);
        } catch (error) {
            toast.error('Erro ao buscar informações dos tickets');
        }
    }

    return (
        <div className="dashboard-chart-wrapper">
            <h3 className="dashboard-chart-title">
                {i18n.t("dashboard.users.totalAttendances")} 
                <span className="dashboard-chart-count">({ticketsData?.count})</span>
            </h3>

            <div className="dashboard-chart-filters">
                <div className="dashboard-date-input-wrapper">
                    <label className="dashboard-date-label">
                        {i18n.t("dashboard.date.initialDate")}
                    </label>
                    <input
                        type="date"
                        value={format(initialDate, 'yyyy-MM-dd')}
                        onChange={(e) => setInitialDate(new Date(e.target.value))}
                        className="dashboard-date-input"
                    />
                </div>
                <div className="dashboard-date-input-wrapper">
                    <label className="dashboard-date-label">
                        {i18n.t("dashboard.date.finalDate")}
                    </label>
                    <input
                        type="date"
                        value={format(finalDate, 'yyyy-MM-dd')}
                        onChange={(e) => setFinalDate(new Date(e.target.value))}
                        className="dashboard-date-input"
                    />
                </div>
                <button
                    className="dashboard-filter-btn"
                    onClick={handleGetTicketsInformation}
                    style={{ height: 'fit-content', alignSelf: 'flex-end' }}
                >
                    Filtrar
                </button>
            </div>

            <div className="dashboard-chart-container-inner" style={{ minHeight: '300px', height: '300px' }}>
                <Bar options={options} data={dataCharts} />
            </div>
        </div>
    );
}
