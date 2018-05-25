import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ChartJS from 'react-chartjs-wrapper';

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      // Loading message
      loading: "Loading Analysis...",
      // Whether or not the analysis has loaded
      loaded: false,
      // JSON returned from analysis
      anaylsis_JSON: [],
      // 0: Blocks traveled (/10) | 1: Blocks placed | 2: Blocks broken | 3: Chat messages sent | 4: Commands sent
      analysis_general: [],
      // Keys for STEM areas
      anaylsis_STEM_keys: [],
      // Values for STEM areas
      analysis_STEM_values: [],
      // Keys for biomes
      analysis_biome_keys: [],
      // Values for biomes
      analysis_biome_values: []
    };

    this.generateButtonClick = this.generateButtonClick.bind(this);
  }

  /**
   * Hides the unloaded analysis parts until they're all loaded
   */
  componentDidMount() {
    this.hideAnalysis();
  }

  /**
   * Shows analysis once they're all loaded
   */
  showAnalysis() {
    var analysis = document.getElementById("analysis_data");
    analysis.style.display = "block";
  }

  /**
   * Hides analysis div
   */
  hideAnalysis() {
    var analysis = document.getElementById("analysis_data");
    analysis.style.display = "none";
  }

  /**
   * Disables the generate button
   */
  disableGenerateButton() {
    var button = document.getElementById("generate_button");
    button.disabled = true;
    button.innerHTML = "Loading...";
  }

  /**
   * Hides generate button
   */
  hideGenerateButton(){
    var button = document.getElementById("generate_button");
    button.style.display = "none";
  }

  normalAnimation() {
    var logo = document.getElementById("logo");
    logo.style.animation = "App-logo-spin infinite 20s linear";
  }

  loadingAnimation() {
    var logo = document.getElementById("logo");
    logo.style.animation = "App-logo-spin infinite 2s ease-in-out alternate-reverse";
  }

  /**
   * Retrieves analysis as a JSON file and displays it
   * Example JSON: https://pastebin.com/raw/WP0zf79h
   */
  generateButtonClick() {
    this.disableGenerateButton();
    this.loadingAnimation();
    fetch("https://1luht6078g.execute-api.us-west-2.amazonaws.com/demo/GetLatestAnalysis")
      .then(response => response.json())
      .then(data => {
        this.setState({
          loading: "Summary:",
          loaded: true,
          anaylsis_JSON: [JSON.stringify(data)],
          analysis_general: [
            data["blocksTraveled"]/10,
            data["blocksPlaced"],
            data["blocksBroken"],
            data["chatMessages"],
            data["commands"]
          ],
          analysis_STEM_keys: Object.keys(data["stemFields"]),
          analysis_STEM_values: Object.values(data["stemFields"]),
          analysis_biome_keys: Object.keys(data["biomeTimes"]),
          analysis_biome_values: Object.values(data["biomeTimes"]),
        });
        this.hideGenerateButton();
        this.normalAnimation();
        this.showAnalysis();
      }
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" id="logo" alt="logo" />
          <h1 className="App-title">MCIE: Minecraft Interest Engine</h1>
        </header>

        <h3>
          <button id="generate_button" onClick={this.generateButtonClick} className="myButton">
            Generate Analysis
          </button>
        </h3>

        <div className = "analysis" id="analysis_data">
          <div>
            <h3>Summary</h3>
            <p>Blocks Traveled: {this.state.analysis_general[0]*10}</p>
            <p>Blocks Placed: {this.state.analysis_general[1]}</p>
            <p>Blocks Broken: {this.state.analysis_general[2]}</p>
            <p>Messages Sent: {this.state.analysis_general[3]}</p>
            <p>Commands Sent: {this.state.analysis_general[4]}</p>
            <p>{this.state.anaylsis_JSON}</p>
          </div>

          <hr/>

          <div>
            <h3>General Action Analysis</h3>
            <div className="chart-container">
              <BarChart labels={["Blocks Traveled/10", "Blocks Placed", "Blocks Broken", "Chat Messages", "Commands"]} values={this.state.analysis_general}></BarChart>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

/**
 * BarChart from ChartJS
 */
class BarChart extends Component {
  constructor(props) {
    super(props);
    
    const options = {
      maintainAspectRatio: false,
    };

    this.state = {
      chartData: {},
      chartOptions: options,
    };
  }

  /**
   * Setting data for ChartJS BarChat
   * @param {*} nextProps Data from HTML 
   */
  componentWillReceiveProps(nextProps) {
    var data = {
      labels: nextProps.labels,
      datasets: [{
        label: "Session",
        data: nextProps.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        // borderColor: [
        //   'rgba(255,99,132,1)',
        //   'rgba(54, 162, 235, 1)',
        //   'rgba(255, 206, 86, 1)',
        //   'rgba(75, 192, 192, 1)',
        //   'rgba(153, 102, 255, 1)',
        //   'rgba(255, 159, 64, 1)'
        // ],
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ],
        borderWidth: 1
      }]
    };

    this.setState({chartData: data});
  }

  render() {
    const {chartData, chartOptions} = this.state;
    return (
      <div>
        <ChartJS type={"bar"} data={chartData} options={chartOptions} />
      </div>
    );
  }
}

export default App;
