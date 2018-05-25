import React, { Component } from 'react';
import {Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';

const { BACKGROUND_COLOR, BORDER_COLOR, HOVER_BACKGROUND_COLOR } = {
    BACKGROUND_COLOR: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
    ],
    BORDER_COLOR: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    HOVER_BACKGROUND_COLOR: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ],
}
const components = {
    "Bar": Bar,
    "Pie": Pie,
    "Doughnut": Doughnut,
    "Radar": Radar
}

class Chart extends Component {
    
    static defaultProps = {
        type: 'Bar',
        label: 'Session',
        maintainAspectRatio: false,
    }

    render() {
        const ChartType = this.props.type;
        const ChartData = {
            labels: this.props.labels,
            datasets: [{
                label: this.props.label,
                data: this.props.data,
                backgroundColor: BACKGROUND_COLOR,
                borderColor: BORDER_COLOR,
                hoverBackgroundColor: HOVER_BACKGROUND_COLOR,
                borderWidth: 1,
            }]
        }
        const ChartOptions = {
            maintainAspectRatio: this.props.maintainAspectRatio,
        }

        return (
            <div className="chart">
                { React.createElement(components[ChartType], {'data': ChartData, 'options': ChartOptions}, '') }
            </div>
        );
    }
}

export default Chart;
