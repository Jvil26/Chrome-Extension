/*global chrome*/
import React, { Component } from 'react';
import trainData from './big.js';
import allWords from './allWords.js';
import eng_synonyms from './eng_synonyms.json';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      uniqueCode: `<Guber>`,
      trainData: trainData,
      wordList: allWords,
      eng_synonyms: eng_synonyms
    }
  }

  nextTapped_det = () => {
    var config = {
      code: this.state.uniqueCode,
      trainData: this.state.trainData,
      wordList: this.state.wordList,
      eng_synonyms: this.state.eng_synonyms
    };

    var css = "@import url('http://fonts.googleapis.com/css?family=Lato:400,700'); #cheta-flt-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 15vw; height: 38vw; bottom: 2%; right: 64px; background-color:#353535; color: white; text-align: center; box-shadow: 2px 2px 3px 3px #999; } #cheta-misspelledWords-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 20vw; bottom: 10%; right: 40px; background-color:#353535; color: white; text-align: center; box-shadow: 2px 2px 3px 3px #999; } #cheta-learnMore-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 30vw; bottom: 3%; background-color:#353535; right: 40px; color: white; text-align: center; box-shadow: 2px 2px 3px 3px #999; } #cheta-suggestions-dv { overflow-y:auto; padding: 8px; z-index: 999; position: fixed; width: 30vw; bottom: 3%; right: 40px; background-color:#353535; color: white; text-align: center; box-shadow: 2px 2px 3px 3px #999; } .collapsible { background-color: white; color: black; cursor: pointer; padding: 18px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; } .active, .collapsible:hover { background-color: #555; color: white; } .collapsible:after {  content: '\\002B'; color: black; font-weight: bold; float: right; margin-left: 5px; } .active:after { content: '\\2212'; color: white; } .content { padding: 0 18px; display: none; overflow: hidden; background-color: #f1f1f1; max-height: 0; transition: max-height 0.2s ease-out; color: white } a.animated-button.thar-four { color: #fff; cursor: pointer; display: block; border: 2px solid #F7CA18; transition: all 0.4s cubic-bezier(0.42, 0, 0.58, 1); 0s;} a.animated-button.thar-four:hover { color: #000 !important; background-color: transparent; text-shadow: nfour; } a.animated-button.thar-four:before { display: block; z-index: -1; content: ''; color: #000 !important; background: #F7CA18; transition: all 0.4s cubic-bezier(0.42, 0, 0.58, 1); 0s; } .card { padding: 1rem; border: 1px solid black; margin: 1rem; background-color: #555; } .cheta-flt-p { margin-top: 25px; margin-bottom: 25px; font-family: 'Lato, sans-serif'; font-weight: 400; font-size: 22px; font-size: 1.5vw color: white } .button { font-weight: 700 } .button:hover { cursor: pointer; } .cheta-pfnt { margin: 5px; font-family: 'Lato, sans-serif'; font-size: 14px; font-size: 1.2vw; color: white; } .button { margin-bottom: 5px; margin-top: 5px }";
    chrome.tabs.insertCSS({code: css});

    chrome.tabs.executeScript({
      file: 'jquery.js'
    });
    chrome.tabs.executeScript({
      file: 'chetalib/script.js'
    });

    chrome.tabs.executeScript({
      file: 'chetalib/googleDocsUtil.js'
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
          <h1>GUBER</h1>
          <p class="subtitle">Chrome Extension for Text Analysis</p>
        </div>
        <div className="contentBox">
          <div className="no-tf-dtctd">
            <p class="instructions">When ready, click start</p>
            <a class="btn btn-sm animated-button thar-four" href="#" onClick={this.nextTapped_det}>Start</a>
          </div>
        </div>
      </div>
    )
  };
}

export default Home;
