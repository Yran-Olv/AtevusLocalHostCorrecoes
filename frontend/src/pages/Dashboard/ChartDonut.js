import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import "./style.css";

const DonutChart = (props) => {
  const { title, value, data, color } = props;
  
  const data1 = JSON.parse(`[${String(data).replace(/'/g, '"')}]`);
  
  const COLORS = [color].length === 1 ? color : [JSON.stringify(color)];
  
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 120;
    const radius = -100 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="var(--dashboard-text)" 
        textAnchor='middle' 
        dominantBaseline="middle" 
        fontWeight="bold"
        fontSize="0.875rem"
      >
        <tspan fontWeight="600" fontSize="0.75rem" fill="var(--dashboard-text-light)">{`${title}`}</tspan> 
        <tspan x={x} y={y} dy="1.2em" fontWeight="700" fontSize="1.1rem" fill="var(--dashboard-primary)">{`${value}%`}</tspan>
      </text>
    );
  };

  return (
    <div className="dashboard-donut-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data1}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            labelLine={false}
            strokeWidth={0}
            label={renderCustomLabel}
          >
            {data1.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}            
          </Pie>          
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
