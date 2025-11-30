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
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
    Legend,
    ChartDataLabels
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
            display: false,
        },
        datalabels: {
            display: true,
            anchor: 'end',
            align: 'top',
            color: '#ffffff',
            font: {
                size: 13,
                weight: 'bold'
            },
            formatter: (value) => {
                return value || 0;
            },
            padding: {
                top: 4
            },
            backgroundColor: 'rgba(6, 81, 131, 0.8)',
            borderRadius: 4,
            padding: {
                top: 4,
                bottom: 4,
                left: 6,
                right: 6
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
                label: function(context) {
                    return `${context.parsed.y} tickets`;
                }
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: 'var(--dashboard-text)',
                font: {
                    size: 12,
                    weight: 500
                },
                maxRotation: 45,
                minRotation: 0
            },
            grid: {
                display: false
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                color: 'var(--dashboard-text-light)',
                font: {
                    size: 12
                },
                stepSize: 1,
                precision: 0,
                callback: function(value) {
                    return Number.isInteger(value) ? value : '';
                }
            },
            grid: {
                color: 'var(--dashboard-border)',
                opacity: 0.2
            },
            title: {
                display: true,
                text: 'Tickets',
                color: 'var(--dashboard-text)',
                font: {
                    size: 13,
                    weight: 600
                },
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
        }
    }
};

export const ChatsUser = () => {
    const [initialDate, setInitialDate] = useState(new Date());
    const [finalDate, setFinalDate] = useState(new Date());
    const [ticketsData, setTicketsData] = useState({ data: [] });
    const { user } = useContext(AuthContext);

    const companyId = user.companyId;

    useEffect(() => {
        if (companyId) {
            handleGetTicketsInformation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    // Função para gerar cores gradientes baseadas no índice
    const generateGradientColor = (index, total) => {
        const baseColor = { r: 6, g: 81, b: 131 };
        const intensity = 0.7 + (index % 3) * 0.1;
        return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${Math.min(intensity, 0.95)})`;
    };

    const dataCharts = {
        labels: ticketsData && ticketsData?.data.length > 0 
            ? ticketsData.data.map((item) => item.nome || 'Sem nome')
            : [],
        datasets: [
            {
                label: 'Tickets',
                data: ticketsData && ticketsData?.data.length > 0 
                    ? ticketsData.data.map((item) => item.quantidade || 0)
                    : [],
                backgroundColor: ticketsData && ticketsData?.data.length > 0
                    ? ticketsData.data.map((item, index) => 
                        generateGradientColor(index, ticketsData.data.length)
                      )
                    : 'rgba(6, 81, 131, 0.85)',
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 'flex',
                maxBarThickness: 60,
                minBarLength: 2,
            },
        ],
    };

    const handleGetTicketsInformation = async () => {
        try {
            const { data } = await api.get(
                `/dashboard/ticketsUsers?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(finalDate, 'yyyy-MM-dd')}&companyId=${companyId}`
            );
            setTicketsData(data);
        } catch (error) {
            toast.error('Erro ao buscar informações dos tickets');
        }
    }

    return (
        <div className="dashboard-chart-wrapper">
            <h3 className="dashboard-chart-title">
                {i18n.t("dashboard.users.totalCallsUser")}
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

            <div className="dashboard-chart-container-inner" style={{ minHeight: '400px', height: '400px', position: 'relative' }}>
                {ticketsData?.data && ticketsData.data.length > 0 ? (
                    <Bar options={options} data={dataCharts} />
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        color: 'var(--dashboard-text-light)',
                        fontSize: '0.95rem'
                    }}>
                        Nenhum dado disponível para o período selecionado
                    </div>
                )}
            </div>
        </div>
    );
}
