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

var areaDatasets = {};
var datasetNames = {};

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
            data: getData(JSON_data[area], ind),
        });

        datasetNames[ind] = area;

        ind += 1;
    }

    return datasets;
}

function getData(area_data, setIndex) {
    var data = [];
    for (var ind in area_data) {

        data.push({
            't': new Date(area_data[ind]['minutes']),
            'x': area_data[ind]['minutes'],
            'y': area_data[ind]['points']
        });

        var key = setIndex + "+" + ind;
        areaDatasets[key] = area_data[ind];
    }

    // data.sort(function(a, b) {
    //     return a['x'] - b['x'];
    // });

    return data;
}

function pointClick(elements) {
    if (!elements[0]) return;
    
    var elem = elements[0];

    var setIndex = elem._datasetIndex;
    var ind = elem._index;
    
    var key = setIndex + "+" + ind;
    var breakActions = areaDatasets[key].breakActions;
    var placeActions = areaDatasets[key].placeActions;
    var minutes = areaDatasets[key]['minutes'];
    var points = areaDatasets[key]['points'];

    // console.log("Blocks broken: ", breakActions);
    // console.log("Blocks placed: ", placeActions);

    // TODO: Make this display in a better way.    
    
    var header = datasetNames[setIndex] + " (" + minutes + ", " + points + ")";
    var breakString = "Blocks broken:\n" + (Object.keys(breakActions).length === 0 ? "None\n" : "");
    var placeString = "Blocks placed:\n" + (Object.keys(placeActions).length === 0 ? "None\n" : "");

    var block;
    for (block in breakActions) {
        breakString += " - " + breakActions[block] + "x " + block + "\n";
    }
    for (block in placeActions) {
        placeString += " - " + placeActions[block] + "x " + block + "\n";
    }

    alert(header + "\n\n" + breakString + "\n" + placeString);
}

class TimeChart extends Component {
    
    static defaultProps = {
        label: 'Session',
        maintainAspectRatio: false,
        className: "",
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
                    }
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
            <div className={"chart " + this.props.className}>
                { React.createElement(Line, { 'data': ChartData, 'options': ChartOptions, getElementAtEvent: pointClick }, '') }
            </div>
        );
    }

}

export default TimeChart;
