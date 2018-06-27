import React, { Component } from 'react';
import logo from './MCIE.png';
import './App.css';
import Chart from './Components/Chart'
import TimeChart from './Components/TimeChart'

// const TEST_JSON = require('./TestJSON/latest_analysis.json');

const GENERAL_LABELS = ["Blocks Traveled/10", "Blocks Placed", "Blocks Broken", "Chat Messages", "Commands"];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDate(timestamp) {

  if (timestamp < 0) {
    return "None";
  }

  var a = new Date(timestamp * 1000);

  var day = a.getDate();
  var month = MONTHS[a.getMonth()];
  var year = a.getFullYear();
  var hour = a.getHours() % 12;
  var min = a.getMinutes();
  var am_pm = (a.getHours() >= 12) ? "PM" : "AM";

  return month + ' ' + day + ' ' + year + ' ' + hour + ':' + min + ' ' + am_pm;
}

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      // Username of user being analyzed
      username: "",
      // Start time of session being analyzed
      start_time: 0,
      // End time of session being analyzed
      end_time: -1,
      // Whether or not the analysis has loaded
      loaded: false,
      // JSON returned from analysis
      analysis_JSON: [],
      // 0: Blocks traveled (/10) | 1: Blocks placed | 2: Blocks broken | 3: Chat messages sent | 4: Commands sent
      analysis_general: [],
      // Keys for STEM areas
      analysis_STEM_keys: [],
      // Values for STEM areas
      analysis_STEM_values: [],
      // Whole "areaTimes" part of JSON file
      analysis_STEM_times: {},
      // Keys for biomes
      analysis_biome_keys: [],
      // Values for biomes
      analysis_biome_values: []
    };

    // Binding button click function to button click
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

  /**
   * Makes logo do the normal animation
   */
  normalAnimation() {
    var logo = document.getElementById("logo");
    var property = "App-logo-spin-main infinite 1s alternate ease-in-out";
    logo.style['-webkit-animation'] = property;
    logo.style['-moz-animation'] = property;
    logo.style['-o-animation'] = property;
    logo.style['animation'] = property;
  }

  /**
   * Makes logo do the loading animation
   */
  loadingAnimation() {
    var logo = document.getElementById("logo");
    var property = "App-logo-spin-loading infinite 1s alternate ease-in-out";
    logo.style['-webkit-animation'] = property;
    logo.style['-moz-animation'] = property;
    logo.style['-o-animation'] = property;
    logo.style['animation'] = property;
  }

  

  /**
   * Retrieves analysis as a JSON file and displays it
   * Example JSON: https://pastebin.com/raw/WP0zf79h
   */
  generateButtonClick() {

    this.disableGenerateButton();
    this.loadingAnimation();
      fetch("https://rpaowv6m75.execute-api.us-east-2.amazonaws.com/beta/getlatestanalysis/341")
      .then(response => response.json())
      .then(data => {
        this.setState({
          username: data["username"],
          start_time: data["startTime"],
          end_time: data["endTime"],
          loaded: true,
          analysis_JSON: [JSON.stringify(data)],
          analysis_general: [
            data["blocksTraveled"]/10,
            data["blocksPlaced"],
            data["blocksBroken"],
            data["chatMessages"],
            data["commands"]
          ],
          analysis_STEM_keys: Object.keys(data["stemAreas"]),
          analysis_STEM_values: Object.values(data["stemAreas"]),
          analysis_STEM_times: data["areaTimes"],
          analysis_biome_keys: Object.keys(data["biomeTimes"]),
          analysis_biome_values: Object.values(data["biomeTimes"]),
        });
        this.hideGenerateButton();
        this.normalAnimation();
        this.showAnalysis();
      }
    );

// FOR TESTING
// this.setState({
//   username: TEST_JSON["username"],
//   start_time: TEST_JSON["startTime"],
//   end_time: TEST_JSON["endTime"],
//   loaded: true,
//   analysis_JSON: [JSON.stringify(TEST_JSON)],
//   analysis_general: [
//     TEST_JSON["blocksTraveled"]/10,
//     TEST_JSON["blocksPlaced"],
//     TEST_JSON["blocksBroken"],
//     TEST_JSON["chatMessages"],
//     TEST_JSON["commands"]
//   ],
//   analysis_STEM_keys: Object.keys(TEST_JSON["stemAreas"]),
//   analysis_STEM_values: Object.values(TEST_JSON["stemAreas"]),
//   analysis_STEM_times: TEST_JSON["areaTimes"],
//   analysis_biome_keys: Object.keys(TEST_JSON["biomeTimes"]),
//   analysis_biome_values: Object.values(TEST_JSON["biomeTimes"]),
// });
// this.hideGenerateButton();
// this.normalAnimation();
// this.showAnalysis();

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" id="logo" alt="logo" />
          <h1 className="App-title">Minecraft Interest Engine</h1>
        </header>

        <h3>
          <button id="generate_button" onClick={this.generateButtonClick} className="myButton">
            Generate Analysis
          </button>
        </h3>

        <div className="analysis" id="analysis_data">
          <h3>{this.state.username}'s Summary:</h3>
          <div className="summary">
            <p><b>Start Time:</b> {getDate(this.state.start_time)}</p>
            <p><b>End Time:</b> {this.state.end_time < 0 ? "Now" : getDate(this.state.end_time)}</p>
            <p><b>Duration:</b> {(this.state.end_time - this.state.start_time)/60} minutes</p>
            <p><b>Blocks Traveled:</b> {this.state.analysis_general[0]*10}</p>
            <p><b>Blocks Placed:</b> {this.state.analysis_general[1]}</p>
            <p><b>Blocks Broken:</b> {this.state.analysis_general[2]}</p>
            <p><b>Messages Sent:</b> {this.state.analysis_general[3]}</p>
            <p><b>Commands Sent:</b> {this.state.analysis_general[4]}</p>
          </div>

          <hr/>

          <div>
            <h3>General Action Statistics</h3>
            <div className="chart-container">
              <Chart type='Bar' labels={GENERAL_LABELS} data={this.state.analysis_general} />
              <Chart type='Pie' labels={GENERAL_LABELS} data={this.state.analysis_general} />
              <Chart type='Doughnut' labels={GENERAL_LABELS} data={this.state.analysis_general} />
            </div>
          </div>

          <hr/>

          <div>
            <h3>Biome Statistics</h3>
            <div className="chart-container">
              <Chart type='Bar' labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} yAxisLabel='Time (Seconds)'/>
              <Chart type='Pie' labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} />
              <Chart type='Doughnut' labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} />
            </div>
          </div>

          <hr/>

          <div>
            <h3>STEM Field Analysis</h3>
            <div className="chart-container">
              <Chart type='Bar' labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} yAxisLabel='Points'/>
              <Chart type='Pie' labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} />
              <Chart type='Doughnut' labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} />
              <TimeChart data={this.state.analysis_STEM_times} />
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default App;
