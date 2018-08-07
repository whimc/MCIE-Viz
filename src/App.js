import React, { Component } from 'react';
import logo from './MCIE.png';
import './App.css';
import Chart from './Components/Chart'
import TimeChart from './Components/TimeChart'
import classNames from 'classnames';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

// const TEST_JSON = require('./TestJSON/latest_analysis.json');

const GENERAL_LABELS = ["Blocks Traveled/10", "Blocks Placed", "Blocks Broken", "Chat Messages", "Commands"];

const LONG_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

const generalSelect = "general_select", biomeSelect = "biome_select", fieldSelect = "field_select", allSelect = "select_all";
const barSelect = "bar_select", pieSelect = "pie_select", donutSelect = "donut_select", lineSelect = "line_select";

/**
 * Gets a nicely formatted version of a timestamp
 * @param {*} timestamp Timestamp to get the time of.
 * @param {boolean} short Whether or not to give the short version of a month
 */
function getDate(timestamp, short=false) {

  if (timestamp < 0) {
    return "None";
  }

  var a = new Date(timestamp * 1000);

  var day = a.getDate();
  var month = (short ? SHORT_MONTHS[a.getMonth()] : LONG_MONTHS[a.getMonth()]);
  var year = a.getFullYear();
  var hour = a.getHours() % 12;
  if (hour === 0) hour = 12;
  var min = "0" + a.getMinutes();
  var am_pm = (a.getHours() >= 12) ? "PM" : "AM";

  return month + ' ' + day + ' ' + year + ' ' + hour + ':' + min.substr(-2) + ' ' + am_pm;
}

/**
 * Gets the duration in minutes between two times
 * @param {*} startTime Start time (in seconds)
 * @param {*} endTime End time (in seconds)
 * @param {boolean} decimal Whether or not to show a decimal for the duration
 */
function getDuration(startTime, endTime, decimal=false) {
  var minutes = (endTime - startTime) / 60

  if (decimal) return minutes.toFixed(2);
  return parseInt(minutes, 10);
}

function getDurationOfSessions(sessions, decimal=false) {
  var total = 0;
  sessions.forEach((session) => {
    total += parseFloat(getDuration(session.startTime, session.endTime, true))
  })

  if (decimal) return total.toFixed(2);
  return parseInt(total, 10);
}

class App extends Component {
  
  constructor(props) {
    super(props);
    
    this.state = {

      SELECT: {
        users_loading: true,
        users_disabled: true,
        users_data: [],
        users_selected: '',

        sessions_loading: false,
        sessions_disabled: true,
        sessions_data: [],
        sessions_selected: [],
      },
      // Whether or not the options part is disabled
      options_state: false,


      // Username of user being analyzed
      username: "",
      // Start time of session being analyzed
      start_time: 0,
      // End time of session being analyzed
      end_time: -1,
      // Whether or not the analysis has loaded
      loaded: false,
      // 0: Blocks traveled (/10) | 1: Blocks placed | 2: Blocks broken | 3: Chat messages sent | 4: Commands sent
      analysis_general: [],
      // Keys for STEM areas
      analysis_STEM_keys: [],
      // Values for STEM areas
      analysis_STEM_values: [],
      // Whole "sessionStemAreaTimes" part of JSON file
      analysis_STEM_times: {},
      // Section of "sessionStemAreaTimes" that is currently selected
      analysis_STEM_selected_session: {},
      // Info about the selected session
      analysis_STEM_selected_info: {},
      // Keys for biomes
      analysis_biome_keys: [],
      // Values for biomes
      analysis_biome_values: [],


      // If each of these buttons is disabled
      buttonStates: {

        select_all: false,

        analysis_type: {
          'general_select': false,
          'biome_select': true,
          'field_select': true,
        },

        graph_type: {
          'bar_select': false,
          'pie_select': true,
          'donut_select': true,
          'line_select': true,
        },

        // 'general_select': false,
        // 'biome_select': true,
        // 'field_select': true,
        
        // 'bar_select': false,
        // 'pie_select': true,
        // 'donut_select': true,
        // 'line_select': true,
      },
    };

    // Binding button click function to button click
    this.generateButtonClick = this.generateButtonClick.bind(this);
    this.handleChangeUser = this.handleChangeUser.bind(this);
    this.handleChangeSession = this.handleChangeSession.bind(this);
    this.handleSelectTimedSession = this.handleSelectTimedSession.bind(this);
    this.reloadPage = this.reloadPage.bind(this);
  }

  /**
   * Hides the unloaded analysis parts until they're all loaded
   */
  componentDidMount() {
    this.generateUserList();
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
   * Hides initial selection menu
   */
  hideOptionsMenu(){
    this.setState({
      options_state: true,
    })
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
   * Handles clicking a select button
   * @param {*} buttonID ID of the clicked button
   */
  selectButtonClick(buttonID, isAnalysisButton) {

    // Toggle the button on / off
    this.toggleButtonState(buttonID, isAnalysisButton);

    // Handle the lines separating the different analyses
    // var line1 = document.getElementById("line1");
    // var line2 = document.getElementById("line2");

    // var generalOn = !this.state.buttonStates.analysis_type[generalSelect];
    // var biomeOn = !this.state.buttonStates.analysis_type[biomeSelect];
    // var fieldOn = !this.state.buttonStates.analysis_type[fieldSelect];

    // line1.style.display = "none";
    // line2.style.display = "none";

    // if (generalOn) {
    //   if (biomeOn || fieldOn) line1.style.display = "block";
    //   if (biomeOn && fieldOn) line2.style.display = "block";
    // } else {
    //   if (biomeOn && fieldOn) line2.style.display = "block";
    // }
  }

  /**
   * Toggles the state of a button between enabled/disabled
   * @param {*} buttonID ID of the clicked button
   */
  toggleButtonState(buttonID, isAnalysisButton) {
    var path = "analysis_type";
    if (!isAnalysisButton) path = "graph_type";

    var tempButtonStates = this.state.buttonStates;

    if (this.state.buttonStates[allSelect]) {

      tempButtonStates[allSelect] = false;
      for (var buttonInd in tempButtonStates["analysis_type"]) {
        tempButtonStates["analysis_type"][buttonInd] = true;
      }
      for (buttonInd in tempButtonStates["graph_type"]) {
        tempButtonStates["graph_type"][buttonInd] = true;
      }

      if (isAnalysisButton) {
        tempButtonStates["analysis_type"][buttonID] = false;
        tempButtonStates["graph_type"][barSelect] = false;
      } else {
          tempButtonStates["graph_type"][buttonID] = false;
          if (buttonID === lineSelect) tempButtonStates["analysis_type"][fieldSelect] = false;
          else tempButtonStates["analysis_type"][generalSelect] = false;
      }

      this.setState({buttonStates: tempButtonStates});
      return;
    }
    
    // if (!buttonOff) return;

    // Make sure that the line graph is not selected for an analysis without one.
    if (isAnalysisButton && buttonID !== fieldSelect && !this.state.buttonStates['graph_type'][lineSelect]) {
      tempButtonStates['graph_type'][lineSelect] = true;
      tempButtonStates['graph_type'][barSelect] = false;
    }

    for (buttonInd in tempButtonStates[path]) {
      tempButtonStates[path][buttonInd] = true;
    }

    // tempButtonStates[path][buttonID] = !buttonOff;
    tempButtonStates[path][buttonID] = false;
    
    this.setState({buttonStates: tempButtonStates});
  }

  selectAllButtonClick() {
    var tempButtonStates = this.state.buttonStates;
    tempButtonStates[allSelect] = true;

    for (var buttonInd in tempButtonStates["analysis_type"]) {
      tempButtonStates["analysis_type"][buttonInd] = false;
    }
    for (buttonInd in tempButtonStates["graph_type"]) {
      tempButtonStates["graph_type"][buttonInd] = false;
    }

    this.setState({buttonStates: tempButtonStates});
  }

  /**
   * Generates a list of users for the dropdown select menu
   */
  generateUserList() {

    var url = "https://rpaowv6m75.execute-api.us-east-2.amazonaws.com/beta/getallusers/";
    
    fetch(url).then(response => response.json()).then(data => {

      data.sort(function(a, b) {
        var nameA = a.username.toLowerCase(), nameB = b.username.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })

      var users = []
      data.forEach(obj => {
        users.push({
          value: obj.userId,
          label: obj.username,
        })
      });

      var select_options = this.state.SELECT;
      select_options.users_data = users;
      this.setState({ SELECT: select_options });

    }).then(() => {
      var select_options = this.state.SELECT;
      select_options.users_loading = false;
      select_options.users_disabled = false;
      this.setState({ SELECT: select_options })
    });
    
  }

  /**
   * Handles when a user is selected
   * @param {*} value Value of the selected user
   */
  handleChangeUser(value) {
    if (this.state.SELECT.users_selected === value) return;

    var select_options = this.state.SELECT;
    if (value === null) value = '';

    select_options.users_selected = value;
    select_options.sessions_selected = [];
    select_options.sessions_data = [];
    select_options.sessions_disabled = true;

    this.setState({ 
        SELECT: select_options,
        current_user_id: (value === '' ? -1 : value.value) }, () => {
      this.generateUserSessions();
    });

    console.log("Selected user: " + value.label)
  }

  handleSelectTimedSession(value) {
    var sessionID = value.value;
    this.setState({
      analysis_STEM_selected_session: this.state.analysis_STEM_times[sessionID],
      analysis_STEM_selected_info: {
        value: sessionID,
        label: value.label,
      }
    });
  }

  /**
   * Generates and populates the dropdown menu with a list of sessions for the given user
   */
  generateUserSessions() {
    if (this.state.SELECT.users_selected === '') return;

    var select_options = this.state.SELECT;
    select_options.sessions_loading = true;
    select_options.sessions_disabled = true;
    this.setState({ SELECT: select_options });

    var url = "https://rpaowv6m75.execute-api.us-east-2.amazonaws.com/beta/getsessions/" + this.state.SELECT.users_selected.value;
    fetch(url).then(response => response.json()).then(data => {
      
      data.sort(function(a, b) {
        return b.loginTime - a.loginTime;
      })

      var sessions = []
      data.forEach(obj => {
        var duration = getDuration(obj.loginTime, obj.logoutTime)
        if (duration < 1) return;

        sessions.push({
          value: obj.sessionId,
          label: getDate(obj.loginTime, true) + " (" + duration + " mins)",
          startTime: obj.loginTime,
          endTime: obj.logoutTime,
        })
      });

      var select_options = this.state.SELECT;
      select_options.sessions_data = sessions;
      this.setState({ SELECT: select_options });

    }).then(() => {
      var select_options = this.state.SELECT;
      select_options.sessions_loading = false;
      select_options.sessions_disabled = false;
      this.setState({ SELECT: select_options });
    });
  }

  /**
   * Handles selecting a session(s)
   * @param {*} values Values of the selected session(s)
   */
  handleChangeSession(values) {
    if (values === null) values = []
    var select_options = this.state.SELECT;
    select_options.sessions_selected = values;
    this.setState({ SELECT: select_options });

    console.log("Selected sessions: " + values.map(a => a.label).join(", "));
  }

  /**
   * Retrieves analysis as a JSON file and displays it
   */
  generateButtonClick() {

    if (this.state.SELECT.users_selected === '' || this.state.SELECT.sessions_selected.length === 0) {
      alert("Please select a user id and session(s)!")
      return;
    }

    // var url = "https://rpaowv6m75.execute-api.us-east-2.amazonaws.com/beta/getanalysis/";
    // var url = "https://rpaowv6m75.execute-api.us-east-2.amazonaws.com/beta/getanalysisbysession/";
    var url = "https://rpaowv6m75.execute-api.us-east-2.amazonaws.com/beta/newgetanalysisbysession/";
    url += this.state.SELECT.users_selected.value + "+" + this.state.SELECT.sessions_selected.map(a => a.value).join("+");
    // console.log(url);
    // url = "https://rpaowv6m75.execute-api.us-east-2.amazonaws.com/beta/getanalysis/275+1530374999+1530377076";

    this.disableGenerateButton();
    this.loadingAnimation();
    fetch(url).then(response => response.json()).then(data => {
      this.setState({
        username: data["username"],
        start_time: data["startTime"],
        end_time: data["endTime"],
        loaded: true,
        analysis_general: [
          // data["blocksTraveled"]/10,
          data["distanceTraveled"]/10,
          data["blocksPlaced"],
          data["blocksBroken"],
          data["chatMessages"],
          data["commands"]
        ],
        // analysis_STEM_keys: Object.keys(data["stemAreas"]),
        // analysis_STEM_values: Object.values(data["stemAreas"]),
        analysis_STEM_keys: Object.keys(data["stemAreaPoints"]),
        analysis_STEM_values: Object.values(data["stemAreaPoints"]),

        // analysis_STEM_times: data["areaTimes"],
        analysis_STEM_times: data["sessionStemAreaTimes"],
        analysis_STEM_selected_info: this.state.SELECT.sessions_selected[0],
        analysis_STEM_selected_session: data["sessionStemAreaTimes"][this.state.SELECT.sessions_selected[0].value],

        analysis_biome_keys: Object.keys(data["biomeTimes"]),
        analysis_biome_values: Object.values(data["biomeTimes"]),
      });
    }).then(() => {
      this.hideOptionsMenu();
      this.normalAnimation();
      this.showAnalysis();
    });

// FOR TESTING
// this.setState({
//   username: TEST_JSON["username"],
//   start_time: TEST_JSON["startTime"],
//   end_time: TEST_JSON["endTime"],
//   loaded: true,
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
  
  /**
   * Reloads the page
   * We use this to reset everything and go back to the main selecting screen
   */
  reloadPage() {
    window.location.reload();
  }

  render() {
    var generateOptionsClass = classNames({
      "disabledDiv": this.state.options_state,
    })
    var separatorClass = classNames({
      "disabledDiv": !this.state.buttonStates[allSelect],
    });

    var generalBtnClass = classNames({
      "myButton": true,
      "disabledButton": this.state.buttonStates.analysis_type[generalSelect],
    });
    var biomesBtnClass = classNames({
      "myButton": true,
      "disabledButton": this.state.buttonStates.analysis_type[biomeSelect],
    });
    var fieldsBtnClass = classNames({
      "myButton": true,
      "disabledButton": this.state.buttonStates.analysis_type[fieldSelect],
    });

    var generalClass = classNames({
      "disabledDiv": this.state.buttonStates.analysis_type[generalSelect],
    });
    var biomesClass = classNames({
      "disabledDiv": this.state.buttonStates.analysis_type[biomeSelect],
    });
    var fieldsClass = classNames({
      "disabledDiv": this.state.buttonStates.analysis_type[fieldSelect],
    });

    var barBtnClass = classNames({
      "myButton": true,
      "disabledButton": this.state.buttonStates.graph_type[barSelect]
    });
    var pieBtnClass = classNames({
      "myButton": true,
      "disabledButton": this.state.buttonStates.graph_type[pieSelect]
    });
    var donutBtnClass = classNames({
      "myButton": true,
      "disabledButton": this.state.buttonStates.graph_type[donutSelect]
    });
    var lineBtnClass = classNames({
      "myButton": true,
      "disabledButton": this.state.buttonStates.graph_type[lineSelect]
    });

    var barClass = classNames({
      "disabledDiv": this.state.buttonStates.graph_type[barSelect]
    });
    var pieClass = classNames({
      "disabledDiv": this.state.buttonStates.graph_type[pieSelect]
    });
    var donutClass = classNames({
      "disabledDiv": this.state.buttonStates.graph_type[donutSelect]
    });
    var lineClass = classNames({
      "disabledDiv": this.state.buttonStates.graph_type[lineSelect]
    });
    
    return (
      <div className="App">
        
        <header className="App-header">
          <img src={logo} className="App-logo" id="logo" alt="logo" />
          <h1 className="App-title">Minecraft Interest Engine</h1>
        </header>

        {/* First screen -- selecting which user and which session to analyze */}
        <div className={generateOptionsClass}>
          <div className="selectors">
          
            {/* Dropdown for selecting a user */}
            <Select className="custom-select"
              placeholder="Select a user"
              options={ this.state.SELECT.users_data }
              value={ this.state.SELECT.users_selected }
              removeSelected={false}
              closeOnSelect={true}
              onChange={ this.handleChangeUser }
              isLoading={ this.state.SELECT.users_loading }
              disabled={ this.state.SELECT.users_disabled }
            />

            {/* Dropdown for selecting one or more sessions */}
            <Select className="custom-select"
              multi={true}
              placeholder="Select one or more sessions"
              options={ this.state.SELECT.sessions_data }
              value={ this.state.SELECT.sessions_selected }
              removeSelected={true}
              closeOnSelect={false}
              onChange={ this.handleChangeSession }
              isLoading={ this.state.SELECT.sessions_loading }
              disabled={ this.state.SELECT.sessions_disabled }
            />
          </div>

          {/* Button to generate analysis */}
          <div>
            <button id="generate_button" onClick={this.generateButtonClick} className="myButton">
              Generate Analysis
            </button>
          </div>
        </div>

        {/* Second screen -- showing entire analysis */}
        <div className="analysis" id="analysis_data">

          <div>
            <button onClick={this.reloadPage} className="myButton reloadButton">
              Back to Home
            </button>
          </div>

          <h3>{this.state.username}'s Summary:</h3>
          <div className="summary">
            <p><b>Start Time:</b> {getDate(this.state.start_time)}</p>
            <p><b>End Time:</b> {this.state.end_time < 0 ? "Now" : getDate(this.state.end_time)}</p>
            <p><b>Total Duration:</b> {getDurationOfSessions(this.state.SELECT.sessions_selected, true)} minutes</p>
            <p><b>Distance Traveled:</b> {this.state.analysis_general[0]*10}</p>
            <p><b>Blocks Placed:</b> {this.state.analysis_general[1]}</p>
            <p><b>Blocks Broken:</b> {this.state.analysis_general[2]}</p>
            <p><b>Messages Sent:</b> {this.state.analysis_general[3]}</p>
            <p><b>Commands Sent:</b> {this.state.analysis_general[4]}</p>
            <Select className="custom-select"
              placeholder={"Analyzed Sessions (" + this.state.SELECT.sessions_selected.length + ")"}
              options={ this.state.SELECT.sessions_selected }
              closeOnSelect={false}
            />
          </div>

          <hr/>

          <div>
            <h4>Choose which analysis to show and with which graph</h4>
          </div>

          {/* Buttons for selecting which sections of the analysis to show */}
          <div className="selectButtons">
            <div className="innerButton"><button className={generalBtnClass} 
              onClick={ () => this.selectButtonClick(generalSelect, true)}>General Actions</button></div>
              
            <div className="innerButton"><button className={biomesBtnClass} 
              onClick={ () => this.selectButtonClick(biomeSelect, true)}>Biome Statistics</button></div>

            <div className="innerButton"><button className={fieldsBtnClass} 
              onClick={ () => this.selectButtonClick(fieldSelect, true)}>Field Analysis</button></div>

            <div className="innerButton"><button className="myButton" disabled={this.state.buttonStates[allSelect]}
              onClick={ () => this.selectAllButtonClick()}><b>Select All</b></button></div>
          </div>

          {/* Buttons for selecting which types of graphs to show */}
          <div className="selectButtons">
            <div className="innerButton"><button className={barBtnClass} 
              onClick={ () => this.selectButtonClick(barSelect, false)}>Bar Graph</button></div>
              
            <div className="innerButton"><button className={pieBtnClass} 
              onClick={ () => this.selectButtonClick(pieSelect, false)}>Pie Chart</button></div>

            <div className="innerButton"><button className={donutBtnClass} 
              onClick={ () => this.selectButtonClick(donutSelect, false)}>Donut Chart</button></div>

            <div className="innerButton"><button className={lineBtnClass} disabled={this.state.buttonStates.analysis_type[fieldSelect]}
              onClick={ () => this.selectButtonClick(lineSelect, false)}>Line Graph</button></div>
          </div>

          
          {/* Analysis of general actions */}
          <div className={generalClass}>
            <h3>General Action Statistics</h3>
            <div className="chart-container">
              <Chart type='Bar' className={barClass} labels={GENERAL_LABELS} data={this.state.analysis_general} />
              <Chart type='Pie' className={pieClass} labels={GENERAL_LABELS} data={this.state.analysis_general} />
              <Chart type='Doughnut' className={donutClass} labels={GENERAL_LABELS} data={this.state.analysis_general} />
            </div>
          </div>

          {/* By default, this separator is disabled */}
          <hr className={separatorClass}/>

          {/* Statistics of biome times */}
          <div className={biomesClass}>
            <h3>Biome Statistics</h3>
            <div className="chart-container">
              <Chart type='Bar' className={barClass} labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} yAxisLabel='Time (Seconds)'/>
              <Chart type='Pie' className={pieClass} labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} />
              <Chart type='Doughnut' className={donutClass} labels={this.state.analysis_biome_keys} data={this.state.analysis_biome_values} />
            </div>
          </div>

          {/* By default, this separator is disabled */}
          <hr className={separatorClass}/>

          {/* Analysis of STEM fields */}
          <div className={fieldsClass}>
            <h3>STEM Field Analysis</h3>
            <div className="chart-container">
              <Chart type='Bar' className={barClass} labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} yAxisLabel='Points'/>
              <Chart type='Pie' className={pieClass} labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} />
              <Chart type='Doughnut' className={donutClass} labels={this.state.analysis_STEM_keys} data={this.state.analysis_STEM_values} />
              
              <h4 className={lineClass}>Click on a point to see what blocks were placed/broken</h4>
              <h4 className={lineClass}>Select which session to see the graph of</h4>

{/* <Select className="custom-select"
              multi={true}
              placeholder="Select one or more sessions"
              options={ this.state.SELECT.sessions_data }
              value={ this.state.SELECT.sessions_selected }
              removeSelected={true}
              closeOnSelect={false}
              onChange={ this.handleChangeSession }
              isLoading={ this.state.SELECT.sessions_loading }
              disabled={ this.state.SELECT.sessions_disabled }
            /> */}

              <Select
                className={classNames({
                  "custom-select": true,
                  "disabledDiv": this.state.buttonStates.graph_type[lineSelect]
                })}
                placeholder={"Analyzed Sessions (" + this.state.SELECT.sessions_selected.length + ")"}
                options={ this.state.SELECT.sessions_selected }
                value={ this.state.analysis_STEM_selected_info }
                closeOnSelect={true}
                clearable={false}
                onChange={ this.handleSelectTimedSession }
              />
              <TimeChart className={lineClass} data={this.state.analysis_STEM_selected_session} />
            </div>
          </div>

        </div>
        
        <div className="bottom">
          <footer className="App-footer">
            <p className="App-ending">&#169; Copyright 2018 WHIMC</p>
          </footer>
        </div>

      </div>
    );
  }
}

export default App;
