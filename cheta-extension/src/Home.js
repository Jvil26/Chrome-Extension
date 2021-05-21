/*global chrome*/
import React, { Component } from 'react';
import dict from './dict.json';
import trainData from './big.js';
import allWords from './allWords.js';
import eng_synonyms from './eng_synonyms.json';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      uniqueCode: `<Guber>`,
      dictionary: dict,
      trainData: trainData,
      wordList: allWords,
      eng_synonyms: eng_synonyms
    }
  }

  nextTapped_det = () => {
    var config = {
      code: this.state.uniqueCode,
      dictionary: this.state.dictionary,
      trainData: this.state.trainData,
      wordList: this.state.wordList,
      eng_synonyms: this.state.eng_synonyms
    };

    var css = "@import url('http://fonts.googleapis.com/css?family=Lato:400,700'); #cheta-flt-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 15vw; height: 38vw; bottom: 2%; right: 64px; background-color:aqua; color: black; text-align: center; box-shadow: 2px 2px 3px 3px #999; } #cheta-misspelledWords-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 20vw; bottom: 10%; right: 40px; background-color:aqua; color: black; text-align: center; box-shadow: 2px 2px 3px 3px #999; } #cheta-learnMore-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 30vw; bottom: 3%; background-color:aqua; right: 40px; color: black; text-align: center; box-shadow: 2px 2px 3px 3px #999; } #cheta-suggestions-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 30vw; bottom: 3%; right: 40px; background-color:aqua; color: black; text-align: center; box-shadow: 2px 2px 3px 3px #999; } .card { padding: 1rem; border: 1px solid black; margin: 1rem; } .cheta-flt-p { margin-top: 25px; margin-bottom: 25px; font-family: 'Lato, sans-serif'; font-weight: 400; font-size: 22px; font-size: 1.5vw } .button { font-weight: 700 } .button:hover { cursor: pointer; } .cheta-pfnt { margin: 5px; font-family: 'Lato, sans-serif'; font-size: 14px; font-size: 1vw }";
    chrome.tabs.insertCSS({code: css});

    chrome.tabs.executeScript({
      file: 'jquery.js'
    });
    chrome.tabs.executeScript({
      file: 'chetalib/script.js'
    });

    chrome.tabs.executeScript({
      code: 'var config = ' + JSON.stringify(config)
    }, function() {
      chrome.tabs.executeScript({
        file: 'chetalib/chetalib.js',
      });
    })

  }

  render() {
    return (
      <div>
        <div className="header">
          <h1>ChETA</h1>
          <p>Chrome Extension for Text Analysis</p>
        </div>
        <div className="contentBox">
          <div className="no-tf-dtctd">
            
            <p>To start analysing a textfield, <span className="resalted">follow the steps</span>:</p>
            <p>1. <span className="resalted">Locate the field</span> you want to analyze</p>
            <p>2. Replace or <span className="resalted">add</span> anywhere on the field <span className="resalted">the following code</span>:</p>
            <p>Code: <span className="resalted">{this.state.uniqueCode}</span></p>
            <p>3. When ready, click start</p>
            <button href="#" onClick={this.nextTapped_det}>Start</button>
          </div>
        </div>
      </div>
    )
  };
}

export default Home;
