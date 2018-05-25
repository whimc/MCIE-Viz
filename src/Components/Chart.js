import React, { Component } from 'react';
import {Bar, Pie, Doughnut } from 'react-chartjs-2';

const { BACKGROUND_COLOR, BORDER_COLOR, HOVER_BACKGROUND_COLOR } = {
    BACKGROUND_COLOR: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
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
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
}

class Chart extends Component {
    
    static defaultProps = {
        label: 'Session',
    }

    render() {
        return (
            <div className="chart-container">
                <Bar
                    data={{
                        type: 'horizontalBar',
                        labels: this.props.labels,
                        datasets: [{
                            label: this.props.label,
                            data: this.props.data,
                            backgroundColor: BACKGROUND_COLOR,
                            borderColor: BORDER_COLOR,
                            hoverBackgroundColor: HOVER_BACKGROUND_COLOR,
                            borderWidth: 1,
                        }]
                    }}
                    options={{
		                // maintainAspectRatio: false,
                	}}
                />
            </div>
        );
    }
}

export default Chart;
