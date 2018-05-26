import React, { Component } from 'react';
import logo from './MCIE.png';
import './App.css';
import Chart from './Components/Chart'

const TEST_JSON = {
  "blocksBroken": 125,
  "blocksPlaced": 117,
  "commands": 1,
  "chatMessages": 0,
  "blocksTraveled": 3982,
  "stemFields": {
    "Agriculture": 169,
    "City/Urban Planning": 138,
    "Landscape Architecture": 121,
    "Forestry": 100,
    "Architecture": 92,
    "Biology": 26
  },
  "biomeTimes": {
    "Plains": 1256,
    "Extreme Hills": 849,
    "Mutated Forest": 75,
    "Extreme Hills With Trees": 6,
    "Taiga Cold Hills": -250
  }
}

const GENERAL_LABELS = ["Blocks Traveled/10", "Blocks Placed", "Blocks Broken", "Chat Messages", "Commands"]

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {
      // Loading message
      loading: "Loading Analysis...",
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
    var property = "App-logo-spin-main infinite 1s alternate ease-in-out";
    logo.style['-webkit-animation'] = property;
    logo.style['-moz-animation'] = property;
    logo.style['-o-animation'] = property;
    logo.style['animation'] = property;
  }

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
    fetch("https://1luht6078g.execute-api.us-west-2.amazonaws.com/demo/GetLatestAnalysis")
      .then(response => response.json())
      .then(data => {
        this.setState({
          loading: "Summary:",
          loaded: true,
          analysis_JSON: [JSON.stringify(data)],
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

// FOR TESTING
    // this.disableGenerateButton();
    // this.loadingAnimation();
    // this.setState({
    //   loading: "Summary:",
    //   loaded: true,
    //   analysis_JSON: [JSON.stringify(TEST_JSON)],
    //   analysis_general: [
    //     TEST_JSON["blocksTraveled"]/10,
    //     TEST_JSON["blocksPlaced"],
    //     TEST_JSON["blocksBroken"],
    //     TEST_JSON["chatMessages"],
    //     TEST_JSON["commands"]
    //   ],
    //   analysis_STEM_keys: Object.keys(TEST_JSON["stemFields"]),
    //   analysis_STEM_values: Object.values(TEST_JSON["stemFields"]),
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
          <h3>Summary</h3>
          <div className="summary">
            <p>Blocks Traveled: {this.state.analysis_general[0]*10}</p>
            <p>Blocks Placed: {this.state.analysis_general[1]}</p>
            <p>Blocks Broken: {this.state.analysis_general[2]}</p>
            <p>Messages Sent: {this.state.analysis_general[3]}</p>
            <p>Commands Sent: {this.state.analysis_general[4]}</p>
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
              <Chart type='Bar' labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} />
              <Chart type='Pie' labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} />
              <Chart type='Doughnut' labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} />
            </div>
          </div>

          <hr/>

          <div>
            <h3>STEM Field Analysis</h3>
            <div className="chart-container">
              <Chart type='Bar' labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} />
              <Chart type='Pie' labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} />
              <Chart type='Doughnut' labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} />
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default App;
