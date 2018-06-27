import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

const { BACKGROUND_COLOR, BORDER_COLOR } = {
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
    ]
}

function getDatasets(JSON_data) {
    var datasets = [];
    var ind = 0;

    // var area = "CIVE"; // 
    for (var area in JSON_data) {
        datasets.push({
            label: area,
            borderColor: BORDER_COLOR[ind],
            backgroundColor: BACKGROUND_COLOR[ind],
            pointBackgroundColor: 'rgb(255, 255, 255)',
            fill: false,
            pointHitRadius: 5,
            pointHoverRadius: 5,
            data: getData(JSON_data[area]),
        });
        ind += 1;
    }

    console.log(datasets);
    return datasets;
}

function getData(area_data) {
    var data = [];
    for (var ind in area_data) {

        // if (area_data[ind]['seconds'] != 0 && area_data[ind]['points'] == 0) continue;

        data.push({
            't': new Date(area_data[ind]['seconds']),
            'x': area_data[ind]['seconds'],
            'y': area_data[ind]['points'],
        });
    }

    data.sort(function(a, b) {
        return a['x'] - b['x'];
    });

    return data;
}

class TimeChart extends Component {
    
    static defaultProps = {
        label: 'Session',
        maintainAspectRatio: false,
    }

    render() {
        const ChartData = {
            datasets: getDatasets(this.props.data)
        }

        const ChartOptions = {
            maintainAspectRatio: this.props.maintainAspectRatio,
            scales: {
                xAxes: [{
                    type: 'linear',
                    ticks: {
                        beginAtZero: true,
                        stepSize: 3,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (Minutes)'
                    },
                    // time: {
                    //     tooltipFormat: 'mm:ss',
                    //     unit: 'minute',
                    //     // unitStepSize: '5'
                    // }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Points'
                    },
                }]
            }
        }

        return (
            <div className="chart">
                { React.createElement(Line, {'data': ChartData, 'options': ChartOptions}, '') }
            </div>
        );
    }
}

export default TimeChart;
