
function init() {
  console.log("Initializing GUBER");
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
  document.head.appendChild(link);
  console.log(config);
  var s = document.createElement('script');
  // TODO: add "script.js" to web_accessible_resources in manifest.json
  s.src = chrome.runtime.getURL('googleDocsUtil.js');
  (document.head || document.documentElement).appendChild(s);
  s.onload = function() {
    s.parentNode.removeChild(s);
  };
  
  if(!config.code) {
    console.log("Error loading GUBER: Unique code not found")
    return;
  }
  var inputs = getInputsByValue(config.code);
  if(inputs.length == 0) {
    console.log("Error loading GUBER: Input not found")
    return;
  }
  var text = '';
  var textLength = 0;
  var wordCount = 0;
  if (window.location.href.includes('https://docs.google.com')) {
      for (let i = 0; i < inputs[0].length; i++) {
        text += inputs[0][i].textContent.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
      }
      if (text.length > 0) {
        textLength = text.length-1;
        wordCount = text.split(" ").length+1;
      } else {
        textLength = 0;
        wordCount = 0;
      }
  } else {
    text = inputs[0].value.split(config.code).reverse()[0];
    textLength = text.length - 1;
    wordCount = text.split(" ").length;
  }
  var eng_synonyms = config.eng_synonyms;
  var trainData = config.trainData;
  var wordList = config.wordList;
  this.suggestions = [[],[]];
  this.longSentences = 0;
  var moreDetails = sentences_readingScore(text, eng_synonyms);
  var misspelledWords = findMisspelledWords(text, wordList, trainData, eng_synonyms);
  var fleschKincaid = calc_fleschKincaid(text);
  var score = calc_readingScore(text);
  var scoreNote = scoreNotes(score, 'notes');
  var schoolLevel = scoreNotes(score, 'level');
  // alert(text)
  inputs[0].value = inputs[0].value;
  if (!window.location.href.includes('https://docs.google.com')) {
    inputs[0].addEventListener('input', (e) => {
      var inputs = getInputsByValue(config.code);
      if(inputs.length == 0) {
        console.log("Error loading GUBER: Input not found");
        return;
      }
      var text = inputs[0].value.split(config.code).reverse()[0];
      var textLength = text.length - 1;
      var wordCount = text.split(" ").length;
      var wordCountSpan = document.getElementById("cheta-data-wordcount");
      wordCountSpan.textContent = ""+wordCount;

      var charCountSpan = document.getElementById("cheta-data-charcount");
      charCountSpan.textContent = ""+textLength;

      this.suggestions = [[],[]];
          var moreDetails = sentences_readingScore(text, eng_synonyms);
          var learn_more_page = document.getElementById('learnDiv');
          var newLearn_more_page = '';
    if (moreDetails.length > 0) {
      moreDetails.forEach(details => {
        newLearn_more_page += '<p class="cheta-pfnt">"<span class="details_sentence" style="font-size: 1.2vw">'+details.sentence+'</span>"</p><br>'
        if (details.sentenceLength >= 23 && details.readingScore < 50) {
          newLearn_more_page += '<p class="cheta-pfnt">This sentence is too long (<span class="details_tooLongAndHardToRead">'+details.sentenceLength+'</span> words) - please consider revising. Low Readability Score (<span class="details_readingScore">'+details.readingScore+'</span>). Have you thought about using smaller words and shorter sentences?</p><br>';
        } else if (details.readingScore <= 50) {
          newLearn_more_page += '<p class="cheta-pfnt">Low Readability Score (<span class="details_hardToRead" id='+details.readingScore+'>'+details.readingScore+'</span>). Have you thought about using smaller words or shorter sentences?</p><br>';
        } else {
          newLearn_more_page += '<p class="cheta-pfnt">This sentence is too long (<span class="details_tooLong">'+details.sentenceLength+'</span> words) - please consider revising. Have you thought about using smaller words and shorter sentences?</p><br>';
        }
        newLearn_more_page += '<button class="goToSuggestions button"><span class="cheta-pfnt" style="color: black !important; margin-right: 2px;">Word Suggestions</span></button><hr>';
      });
    } else {
      newLearn_more_page += '<p class="cheta-pfnt" id="details_good" style="color: #90ee90;">Your sentences have a good length and are very readable</p>';
    }
    newLearn_more_page += '</div>';
    newLearn_more_page += '</div>';
  learn_more_page.innerHTML = newLearn_more_page;
  
  var sentenceLengths = document.getElementsByClassName('details_tooLong');
  for (let i = 0; i < sentenceLengths.length; i++) {
      sentenceLengths.item(i).style.color = 'red';
  }
  var readingScores = document.getElementsByClassName('details_hardToRead');
  for (let i = 0; i < readingScores.length; i++) {
      if (readingScores.item(i).id <= 30) {
        readingScores.item(i).style.color = 'red';
      } else {
        readingScores.item(i).style.color = 'orange';
      }
  }
  
  var goToSuggestions = document.getElementsByClassName('goToSuggestions');
  for (let i = 0; i < goToSuggestions.length; i++) {
    goToSuggestions.item(i).onclick = () => {
      document.getElementById('cheta-flt-dv').style.visibility = 'hidden';
      document.getElementById('cheta-learnMore-dv').style.visibility = 'hidden';
      document.getElementById('cheta-suggestions-dv').style.visibility = 'visible';
    }
  }

  var suggestionsDiv = document.getElementById('suggestionsDiv');
  var newSuggestionsDiv = '';
  if (this.suggestions[0].length > 0) {
    this.suggestions[0].forEach(suggestion => {
      newSuggestionsDiv += '<div class="suggestions card" style="background-color: #1357F6 !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
      newSuggestionsDiv += '<p class="cheta-pfnt"><span class="suggestions_word" style="color:white !important; font-weight: 500; font-size: 1.5vw">'+suggestion.word+'</span></p><br>';
      suggestion.synonyms.forEach(synonym => {
        newSuggestionsDiv += '<button class="synonymsButtons button" id="'+suggestion.word+'"><span class="cheta-pfnt" style="color: black !important;">'+synonym+'</span></button>';
      });
      newSuggestionsDiv += '<br>';
      newSuggestionsDiv += '<span><i class="trash-alt fas fa-trash-alt fa-sm button" style="color: white; margin-top: 12px; position: absolute; right: 50px;"></i></span>';
      newSuggestionsDiv += '<br></div>';
    });
  } else {
    newSuggestionsDiv += '<p class="cheta-pfnt" id="suggestions" style="color: green">Your sentences have a good length and are very readable</p>';
  }
  newSuggestionsDiv += '</div>';
  suggestionsDiv.innerHTML = newSuggestionsDiv;
  var capitalSuggestionsDiv = document.getElementById('capitalSuggestionsDiv');
  var newCapitalSuggestionsDiv = '';
  if (this.suggestions[1].length > 0) {
    this.suggestions[1].forEach((suggestion, index) => {
      newCapitalSuggestionsDiv += '<div class="suggestions card" style="background-color: #F61B13 !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
      newCapitalSuggestionsDiv += '<p class="cheta-pfnt"><span class="suggestions_word" style="color: white !important; font-weight: 500; font-size: 1.5vw">'+suggestion.firstWord+'</span></p><br>';
      newCapitalSuggestionsDiv += '<p class="cheta-pfnt"><span class="suggestions_word" style="font-weight: 500; font-size: 1.3vw">The first letter of "'+suggestion.firstWord+'" at sentence '+suggestion.sentenceNumber+' should be capitalized because it is the first word of the sentence.</span></p><br>';
      newCapitalSuggestionsDiv += '<button class="fixCapitalsButton button" id="'+suggestion.firstWord+'"><span class="cheta-pfnt" style="color: black !important;">Capitalize "'+suggestion.firstWord+'"</span></button>';
      newCapitalSuggestionsDiv += '<br>';
      newCapitalSuggestionsDiv += '<span><i class="trash-alt fas fa-trash-alt fa-sm button" style="color: white; margin-top: 12px; position: absolute; right: 50px;"></i></span>';
      newCapitalSuggestionsDiv += '<br></div>';
    });
  } else {
    newCapitalSuggestionsDiv += '<p class="cheta-pfnt" id="suggestions" color="color: green">All the words in your writing are properly capitilized.</p>';
  }
  newCapitalSuggestionsDiv += '</div>';
  newCapitalSuggestionsDiv += '</div>';
  capitalSuggestionsDiv.innerHTML = newCapitalSuggestionsDiv;

  var misspelledWords = findMisspelledWords(text, wordList, trainData, eng_synonyms);
  var misspelledWordsDiv = document.getElementById('misspelledWordsDiv');
  var newMisspelledWordsDiv = '';
    if (misspelledWords.length > 0) {
      misspelledWords.forEach(word => {
        newMisspelledWordsDiv += '<div class="suggestions card" style="background-color: orange !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
        newMisspelledWordsDiv += '<p class="cheta-pfnt" style="font-weight: 500; font-size: 1.5vw">'+word+'</p><br>';
        newMisspelledWordsDiv += '<p class="cheta-pfnt"><span id="cheta-data-misspelledWord" style="font-weight: 500; font-size: 1.3vw">Check your spelling for "'+word+'".</span></p><br>';
      });
    } else {
      newMisspelledWordsDiv += '<p class="cheta-pfnt" id="suggestions" style="color: green">You have no spelling errors.</p>';
    }
    newMisspelledWordsDiv += '</div>';
    newMisspelledWordsDiv += '</div>';
    misspelledWordsDiv.innerHTML = newMisspelledWordsDiv;

  var synonymsButtons = document.getElementsByClassName('synonymsButtons');
  for (let i = 0; i < synonymsButtons.length; i++) {
    synonymsButtons.item(i).onclick = () => {
      var suggestion = synonymsButtons.item(i).textContent;
      var wordToReplace = synonymsButtons.item(i).id;
      useSuggestion(wordToReplace, suggestion, inputs);
    }
  }

  var fixCapitalsButton = document.getElementsByClassName('fixCapitalsButton');
  for (let i = 0; i < fixCapitalsButton.length; i++) {
    fixCapitalsButton.item(i).onclick = () => {
      var wordToCapitalize = fixCapitalsButton.item(i).id;
      capitalizeWord(wordToCapitalize, inputs);
    }
  }

  var trashAltButtons = document.getElementsByClassName('trash-alt');
  var arr = [...trashAltButtons];
  for (let i = 0; i < arr.length; i++) {
    arr[i].onclick = () => {
      moreDetails = sentences_readingScore(text, eng_synonyms);
      arr[i].parentNode.parentNode.remove();
    }
  }
          var fleschKincaid = calc_fleschKincaid(newText);
          var fleschKincaidSpan = document.getElementById("cheta-data-fleschKincaid");
          fleschKincaidSpan.textContent = ""+fleschKincaid;
          var score = calc_readingScore(newText);
          var readingScoreSpan = document.getElementById("cheta-data-score");
          var schoolLevelSpan = document.getElementById("cheta-data-schoolLevel");
          var scoreNoteSpan = document.getElementById("cheta-data-scoreNote");
          if (score >= 90) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Very easy to read. Easily understood by an average 11-year-old student.";
            schoolLevelSpan.textContent = "5th Grade";
          } else if (score >= 80) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Easy to read. Conversational English for consumers.";
            schoolLevelSpan.textContent = "6th Grade";
          } else if (score >= 70) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Fairly easy to read.";
            schoolLevelSpan.textContent = "7th Grade";
          } else if (score >= 60) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Plain English. Easily understood by 13- to 15-year-old students.";
            schoolLevelSpan.textContent = "8th Grade & 9th Grade";
          } else if (score >= 50) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Fairly difficult to read.";
            schoolLevelSpan.textContent = "10th to 12th Grade";
          } else if (score >= 30) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Difficult to read.";
            schoolLevelSpan.textContent = "College";
          } else if (score >= 10) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Very difficult to read. Best understood by university graduates.";
            schoolLevelSpan.textContent = "College Graduate";
          } else {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Extremely difficult to read. Best understood by university graduates.";
            schoolLevelSpan.textContent = "Professional";
          }
          if (score <= 30) {
            document.getElementById('cheta-data-score').style.color = 'red';
          } else if (score > 30 && score <= 50) {
            document.getElementById('cheta-data-score').style.color = 'orange';
          } else {
            document.getElementById('cheta-data-score').style.color = '#90ee90';
          }
          var longSentencesSpan = document.getElementById('cheta-data-longSentences');
          longSentencesSpan.textContent = ""+this.longSentences;
    });
    inputs[0].addEventListener('mouseup', e => {
      getSelectedText();
      var selectedTextSpan = document.getElementById("cheta-data-selectedText");
      selectedTextSpan.textContent = ""+this.selectedText;
    });
  } else {
      setInterval(() => {
        var inputs = getInputsByValue(config.code);
        var newText = '';
        for (let i = 0; i < inputs[0].length; i++) {
          newText += inputs[0][i].textContent.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
        }
        if (newText != text) {
          text = newText;
          console.log('run');
          var textLength = 0;
          if (newText.length > 0) {
            textLength = newText.length-1;
            wordCount = newText.split(" ").length+1;
          } else {
            textLength = 0;
            wordCount = 0;
          }
          var wordCountSpan = document.getElementById("cheta-data-wordcount");
          wordCountSpan.textContent = ""+wordCount;

          var charCountSpan = document.getElementById("cheta-data-charcount");
          charCountSpan.textContent = ""+textLength;
          
          this.suggestions = [[],[]];
          var moreDetails = sentences_readingScore(text, eng_synonyms);
          var learn_more_page = document.getElementById('learnDiv');
          var newLearn_more_page = '';
    if (moreDetails.length > 0) {
      moreDetails.forEach(details => {
        newLearn_more_page += '<p class="cheta-pfnt">"<span class="details_sentence" style="font-size: 1.2vw">'+details.sentence+'</span>"</p><br>'
        if (details.sentenceLength >= 23 && details.readingScore < 50) {
          newLearn_more_page += '<p class="cheta-pfnt">This sentence is too long (<span class="details_tooLongAndHardToRead">'+details.sentenceLength+'</span> words) - please consider revising. Low Readability Score (<span class="details_readingScore">'+details.readingScore+'</span>). Have you thought about using smaller words and shorter sentences?</p><br>';
        } else if (details.readingScore < 50) {
          newLearn_more_page += '<p class="cheta-pfnt">Low Readability Score (<span class="details_hardToRead" id='+details.readingScore+'>'+details.readingScore+'</span>). Have you thought about using smaller words or shorter sentences?</p><br>';
        } else {
          newLearn_more_page += '<p class="cheta-pfnt">This sentence is too long (<span class="details_tooLong">'+details.sentenceLength+'</span> words) - please consider revising. Have you thought about using smaller words and shorter sentences?</p><br>';
        }
        newLearn_more_page += '<button class="goToSuggestions button"><span class="cheta-pfnt" style="color: black !important; margin-right: 2px;">Word Suggestions</span></button><hr>';
      });
    } else {
      newLearn_more_page += '<p class="cheta-pfnt" id="details_good" style="color: #90ee90;">Your sentences have a good length and are very readable</p>';
    }
    newLearn_more_page += '</div>';
    newLearn_more_page += '</div>';
  learn_more_page.innerHTML = newLearn_more_page;
  
  var sentenceLengths = document.getElementsByClassName('details_tooLong');
  for (let i = 0; i < sentenceLengths.length; i++) {
      sentenceLengths.item(i).style.color = 'red';
  }
  var readingScores = document.getElementsByClassName('details_hardToRead');
  for (let i = 0; i < readingScores.length; i++) {
      if (readingScores.item(i).id <= 30) {
        readingScores.item(i).style.color = 'red';
      } else {
        readingScores.item(i).style.color = 'orange';
      }
  }
  
  var goToSuggestions = document.getElementsByClassName('goToSuggestions');
  for (let i = 0; i < goToSuggestions.length; i++) {
    goToSuggestions.item(i).onclick = () => {
      document.getElementById('cheta-flt-dv').style.visibility = 'hidden';
      document.getElementById('cheta-learnMore-dv').style.visibility = 'hidden';
      document.getElementById('cheta-suggestions-dv').style.visibility = 'visible';
    }
  }

  var suggestionsDiv = document.getElementById('suggestionsDiv');
  var newSuggestionsDiv = '';
  if (this.suggestions[0].length > 0) {
    this.suggestions[0].forEach(suggestion => {
      newSuggestionsDiv += '<div class="suggestions card" style="background-color: #1357F6 !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
      newSuggestionsDiv += '<p class="cheta-pfnt"><span class="suggestions_word" style="color:white !important; font-weight: 500; font-size: 1.5vw">'+suggestion.word+'</span></p><br>';
      suggestion.synonyms.forEach(synonym => {
        newSuggestionsDiv += '<button class="synonymsButtons button" id="'+suggestion.word+'"><span class="cheta-pfnt" style="color: black !important;">'+synonym+'</span></button>';
      });
      newSuggestionsDiv += '<br>';
      newSuggestionsDiv += '<span><i class="trash-alt fas fa-trash-alt fa-sm button" style="color: white; margin-top: 12px; position: absolute; right: 50px;"></i></span>';
      newSuggestionsDiv += '<br></div>';
    });
  } else {
    newSuggestionsDiv += '<p class="cheta-pfnt" id="suggestions" style="color: green">Your sentences have a good length and are very readable</p>';
  }
  newSuggestionsDiv += '</div>';
  suggestionsDiv.innerHTML = newSuggestionsDiv;
  var capitalSuggestionsDiv = document.getElementById('capitalSuggestionsDiv');
  var newCapitalSuggestionsDiv = '';
  if (this.suggestions[1].length > 0) {
    this.suggestions[1].forEach((suggestion, index) => {
      newCapitalSuggestionsDiv += '<div class="suggestions card" style="background-color: #F61B13 !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
      newCapitalSuggestionsDiv += '<p class="cheta-pfnt"><span class="suggestions_word" style="color: white !important; font-weight: 500; font-size: 1.5vw">'+suggestion.firstWord+'</span></p><br>';
      newCapitalSuggestionsDiv += '<p class="cheta-pfnt"><span class="suggestions_word" style="font-weight: 500; font-size: 1.3vw">The first letter of "'+suggestion.firstWord+'" at sentence '+suggestion.sentenceNumber+' should be capitalized because it is the first word of the sentence.</span></p><br>';
      newCapitalSuggestionsDiv += '<button class="fixCapitalsButton button" id="'+suggestion.firstWord+'"><span class="cheta-pfnt" style="color: black !important;">Capitalize "'+suggestion.firstWord+'"</span></button>';
      newCapitalSuggestionsDiv += '<br>';
      newCapitalSuggestionsDiv += '<span><i class="trash-alt fas fa-trash-alt fa-sm button" style="color: white; margin-top: 12px; position: absolute; right: 50px;"></i></span>';
      newCapitalSuggestionsDiv += '<br></div>';
    });
  } else {
    newCapitalSuggestionsDiv += '<p class="cheta-pfnt" id="suggestions" style="color: green">All the words in your writing are properly capitilized.</p>';
  }
  newCapitalSuggestionsDiv += '</div>';
  newCapitalSuggestionsDiv += '</div>';
  capitalSuggestionsDiv.innerHTML = newCapitalSuggestionsDiv;

  var misspelledWords = findMisspelledWords(text, wordList, trainData, eng_synonyms);
  var misspelledWordsDiv = document.getElementById('misspelledWordsDiv');
  var newMisspelledWordsDiv = '';
    if (misspelledWords.length > 0) {
      misspelledWords.forEach(word => {
        newMisspelledWordsDiv += '<div class="suggestions card" style="background-color: orange !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
        newMisspelledWordsDiv += '<p class="cheta-pfnt" style="font-weight: 500; font-size: 1.5vw">'+word+'</p><br>';
        newMisspelledWordsDiv += '<p class="cheta-pfnt"><span id="cheta-data-misspelledWord" style="font-weight: 500; font-size: 1.3vw">Check your spelling for "'+word+'".</span></p><br>';
        newMisspelledWordsDiv += '</div>';
      });
    } else {
      newMisspelledWordsDiv += '<p class="cheta-pfnt" id="suggestions" style="color: green">You have no spelling errors.</p>';
    }
    newMisspelledWordsDiv += '</div>';
    newMisspelledWordsDiv += '</div>';
    misspelledWordsDiv.innerHTML = newMisspelledWordsDiv;

  var synonymsButtons = document.getElementsByClassName('synonymsButtons');
  for (let i = 0; i < synonymsButtons.length; i++) {
    synonymsButtons.item(i).onclick = () => {
      var suggestion = synonymsButtons.item(i).textContent;
      var wordToReplace = synonymsButtons.item(i).id;
      useSuggestion(wordToReplace, suggestion, inputs);
    }
  }

  var fixCapitalsButton = document.getElementsByClassName('fixCapitalsButton');
  for (let i = 0; i < fixCapitalsButton.length; i++) {
    fixCapitalsButton.item(i).onclick = () => {
      var wordToCapitalize = fixCapitalsButton.item(i).id;
      capitalizeWord(wordToCapitalize, inputs);
    }
  }

  var trashAltButtons = document.getElementsByClassName('trash-alt');
  var arr = [...trashAltButtons];
  for (let i = 0; i < arr.length; i++) {
    arr[i].onclick = () => {
      moreDetails = sentences_readingScore(text, eng_synonyms);
      arr[i].parentNode.parentNode.remove();
    }
  }
          var fleschKincaid = calc_fleschKincaid(newText);
          var fleschKincaidSpan = document.getElementById("cheta-data-fleschKincaid");
          fleschKincaidSpan.textContent = ""+fleschKincaid;
          var score = calc_readingScore(newText);
          var readingScoreSpan = document.getElementById("cheta-data-score");
          var schoolLevelSpan = document.getElementById("cheta-data-schoolLevel");
          var scoreNoteSpan = document.getElementById("cheta-data-scoreNote");
          if (score >= 90) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Very easy to read. Easily understood by an average 11-year-old student.";
            schoolLevelSpan.textContent = "5th Grade";
          } else if (score >= 80) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Easy to read. Conversational English for consumers.";
            schoolLevelSpan.textContent = "6th Grade";
          } else if (score >= 70) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Fairly easy to read.";
            schoolLevelSpan.textContent = "7th Grade";
          } else if (score >= 60) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Plain English. Easily understood by 13- to 15-year-old students.";
            schoolLevelSpan.textContent = "8th Grade & 9th Grade";
          } else if (score >= 50) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Fairly difficult to read.";
            schoolLevelSpan.textContent = "10th to 12th Grade";
          } else if (score >= 30) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Difficult to read.";
            schoolLevelSpan.textContent = "College";
          } else if (score >= 10) {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Very difficult to read. Best understood by university graduates.";
            schoolLevelSpan.textContent = "College Graduate";
          } else {
            readingScoreSpan.textContent = ""+score;
            scoreNoteSpan.textContent = "Extremely difficult to read. Best understood by university graduates.";
            schoolLevelSpan.textContent = "Professional";
          }
          if (score <= 30) {
            document.getElementById('cheta-data-score').style.color = 'red';
          } else if (score > 30 && score <= 50) {
            document.getElementById('cheta-data-score').style.color = 'orange';
          } else {
            document.getElementById('cheta-data-score').style.color = '#90ee90';
          }
          var longSentencesSpan = document.getElementById('cheta-data-longSentences');
          longSentencesSpan.textContent = ""+this.longSentences;
        }
      }, 1500);
    }

  var link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = 'https://use.fontawesome.com/releases/v5.8.2/css/all.css';
  document.head.appendChild(link);


  const backButtonHtml = '<span><i class="backButton fas fa-chevron-left button" style="position: absolute; top: 10px; margin: 10px, 0px, 25px 5px; left: 5px"></i></span>';

  const homePage = document.createElement('div');
    var finalHTML = '<div id="cheta-flt-dv"><p class="cheta-flt-p">GUBER</p><br>';
      finalHTML += '<p class="cheta-pfnt">Words: <span id="cheta-data-wordcount">'+wordCount+'</span></p>';
      finalHTML += '<p class="cheta-pfnt">Chars: <span id="cheta-data-charcount">'+textLength+'</span></p><br><hr>';
      finalHTML += '<p class="cheta-pfnt">Readability Score: <span id="cheta-data-score">'+score+'</span></p><br>';
      finalHTML += '<p class="cheta-pfnt">School Level (US): <span id="cheta-data-schoolLevel">'+schoolLevel+'</span></p><br>';
      finalHTML += '<p class="cheta-pfnt"><span id="cheta-data-scoreNote">'+scoreNote+'</span></p><br>';
      finalHTML += '<p class="cheta-pfnt">Flesch-Kincaid Grade: <span id="cheta-data-fleschKincaid">'+fleschKincaid+'</span></p><br>';
      finalHTML += '<p class="cheta-pfnt">Long Sentences: <span id="cheta-data-longSentences">'+this.longSentences+'</span></p><br>';
      finalHTML += '<button class="button" id="learnMore"><span class="cheta-pfnt" style="color: black !important;">Learn More</span></button>';
      finalHTML += '<br><hr>';
      finalHTML += '<span style="font-weight: 500; font-size: 1.4vw;" class="cheta-pfnt" id="suggestions">Suggestions<i class="fas fa-arrow-right button" style="color: white !important; position: absolute; right: 10px; margin-top: 5px"></i></span>';
      finalHTML += '</div>';
  homePage.innerHTML = finalHTML;
  document.body.appendChild(homePage);

  if (score <= 30) {
    document.getElementById('cheta-data-score').style.color = 'red';
  } else if (score > 30 && score <= 50) {
    document.getElementById('cheta-data-score').style.color = 'orange';
  } else {
    document.getElementById('cheta-data-score').style.color = '#90ee90';
  }

  const learn_more_page = document.createElement('div');
    var learn_more_html = '<div style="visibility: hidden; height: 40vw; width: 25vw" id="cheta-learnMore-dv"><p class="cheta-flt-p">Learn More</p>';
    learn_more_html += backButtonHtml;
    learn_more_html += '<div id="learnDiv">';
    if (moreDetails.length > 0) {
      moreDetails.forEach(details => {
        learn_more_html += '<p class="cheta-pfnt">"<span class="details_sentence" style="font-size: 1.2vw">'+details.sentence+'</span>"</p><br>'
        if (details.sentenceLength >= 23 && details.readingScore < 50) {
          learn_more_html += '<p class="cheta-pfnt">This sentence is too long (<span class="details_tooLong">'+details.sentenceLength+'</span> words) - please consider revising. Low Readability Score (<span class="details_readingScore" id='+details.readingScore+'>'+details.readingScore+'</span>). Have you thought about using smaller words and shorter sentences?</p><br>';
        } else if (details.readingScore < 50) {
          learn_more_html += '<p class="cheta-pfnt">Low Readability Score (<span class="details_readingScore" id='+details.readingScore+'>'+details.readingScore+'</span>). Have you thought about using smaller words or shorter sentences?</p><br>';
        } else {
          learn_more_html += '<p class="cheta-pfnt">This sentence is too long (<span class="details_tooLong">'+details.sentenceLength+'</span> words) - please consider revising. Have you thought about using smaller words and shorter sentences?</p><br>';
        }
        learn_more_html += '<button class="cheta-pfnt goToSuggestions button"><span class="cheta-pfnt" style="color: black !important;">Word Suggestions</span></button><hr>';
      });
    } else {
      learn_more_html += '<p class="cheta-pfnt" id="details_good" style="color: #90ee90">Your sentences have a good length and are very readable</p>';
    }
    learn_more_html += '</div>';
    learn_more_html += '</div>';
  learn_more_page.innerHTML = learn_more_html;
  document.body.appendChild(learn_more_page);
  
  var sentenceLengths = document.getElementsByClassName('details_tooLong');
  for (let i = 0; i < sentenceLengths.length; i++) {
      sentenceLengths.item(i).style.color = 'red';
  }
  var readingScores = document.getElementsByClassName('details_readingScore');
  for (let i = 0; i < readingScores.length; i++) {
      if (readingScores.item(i).id <= 30) {
        readingScores.item(i).style.color = 'red';
      } else {
        readingScores.item(i).style.color = 'orange';
      }
  }

  const suggestionsPage = document.createElement('div');
    var suggestions_html = '<div style="visibility: hidden; height: 40vw; width: 25vw" id="cheta-suggestions-dv"><p class="cheta-flt-p" style="font-size: 1.2rem">Suggestions</p>';
    suggestions_html += backButtonHtml;
    suggestions_html += '<button type="button" class="collapsible" style="background-color: #1357F6 !important; font-size: 0.9rem">Synonym Suggestions</button>';
    suggestions_html += '<div id="suggestionsDiv" class="content">';
    if (this.suggestions[0].length > 0) {
      this.suggestions[0].forEach(suggestion => {
        suggestions_html += '<div class="suggestions card" style="background-color: #1357F6 !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
        suggestions_html += '<p class="cheta-pfnt"><span class="suggestions_word" style="color: white !important; font-weight: 500; font-size: 1.5vw">'+suggestion.word+'</span></p><br>';
        suggestion.synonyms.forEach(synonym => {
          suggestions_html += '<button class="synonymsButtons button" id="'+suggestion.word+'"><span class="cheta-pfnt" style="color: black !important;">'+synonym+'</span></button>';
        });
        suggestions_html += '<br>';
        suggestions_html += '<span><i class="trash-alt fas fa-trash-alt fa-sm button" style="color: white !important; margin-top: 12px; position: absolute; right: 50px;"></i></span>';
        suggestions_html += '<br></div>';
      });
    } else {
      suggestions_html += '<p class="cheta-pfnt" id="suggestions" style="color: green">Your sentences have a good length and are very readable</p>';
    }
    suggestions_html += '</div>';
    suggestions_html += '<button type="button" class="collapsible" style="background-color: #F61B13 !important; font-size: 0.9rem">Capitalizing Needed</button>';
    suggestions_html += '<div id="capitalSuggestionsDiv" class="content">';
    if (this.suggestions[1].length > 0) {
      this.suggestions[1].forEach((suggestion, index) => {
        suggestions_html += '<div class="suggestions card" style="background-color: #F61B13 !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
        suggestions_html += '<p class="cheta-pfnt"><span class="suggestions_word" style="color: white !important; font-weight: 500; font-size: 1.5vw">'+suggestion.firstWord+'</span></p><br>';
        suggestions_html += '<p class="cheta-pfnt"><span class="suggestions_word" style="font-weight: 500; font-size: 1.3vw">The first letter of "'+suggestion.firstWord+'" at sentence '+suggestion.sentenceNumber+' should be capitalized because it is the first word of the sentence.</span>"</p><br>';
        suggestions_html += '<button class="fixCapitalsButton button" id="'+suggestion.firstWord+'"><span class="cheta-pfnt" style="color: black !important;">Capitalize "'+suggestion.firstWord+'"</span></button>';
        suggestions_html += '<br>';
        suggestions_html += '<span><i class="trash-alt fas fa-trash-alt fa-sm button" style="color: white !important; margin-top: 12px; position: absolute; right: 50px;"></i></span>';
        suggestions_html += '<br></div>';
      });
    } else {
      suggestions_html += '<p class="cheta-pfnt" id="suggestions" style="color: green">All of the words in your writing are properly capitalized.</p>';
    }
    suggestions_html += '</div>';
    suggestions_html += '<button type="button" class="collapsible" style="background-color: orange !important; font-size: 0.9rem">Misspelled Words</button>';
    suggestions_html += '<div id="misspelledWordsDiv" class="content">';
    if (misspelledWords.length > 0) {
      misspelledWords.forEach(word => {
        suggestions_html += '<div class="suggestions card" style="background-color: orange !important; box-shadow: 10px 5px 5px white; border-radius:10px;>';
        suggestions_html += '<p class="cheta-pfnt"><span style="font-weight: 500; font-size: 1.5vw">'+word+'</span></p><br>';
        suggestions_html += '<p class="cheta-pfnt"><span id="cheta-data-misspelledWord" style="font-weight: 500; font-size: 1.3vw">Check your spelling for "'+word+'".</span></p>';
        suggestions_html += '<br></div>';
      });
    } else {
      suggestions_html += '<p class="cheta-pfnt" id="suggestions" style="color: green">You have no spelling errors.</p>';
    }
    suggestions_html += '</div>';
    suggestions_html += '</div>';
  suggestionsPage.innerHTML = suggestions_html;
  document.body.appendChild(suggestionsPage);

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

  document.getElementById('learnMore').onclick = () => {
    document.getElementById('cheta-flt-dv').style.visibility = 'hidden';
    document.getElementById('cheta-learnMore-dv').style.visibility = 'visible';
  };

  document.getElementById('suggestions').onclick = () => {
    document.getElementById('cheta-flt-dv').style.visibility = 'hidden';
    document.getElementById('cheta-suggestions-dv').style.visibility = 'visible';
  };

  var trashAltButtons = document.getElementsByClassName('trash-alt');
  var arr = [...trashAltButtons];
  for (let i = 0; i < arr.length; i++) {
    arr[i].onclick = () => {
      moreDetails = sentences_readingScore(text, eng_synonyms);
      arr[i].parentNode.parentNode.remove();
    }
  }

  var synonymsButtons = document.getElementsByClassName('synonymsButtons');
  for (let i = 0; i < synonymsButtons.length; i++) {
    synonymsButtons.item(i).onclick = () => {
      var suggestion = synonymsButtons.item(i).textContent;
      var wordToReplace = synonymsButtons.item(i).id;
      useSuggestion(wordToReplace, suggestion, inputs);
    }
  }

  var fixCapitalsButton = document.getElementsByClassName('fixCapitalsButton');
  for (let i = 0; i < fixCapitalsButton.length; i++) {
    fixCapitalsButton.item(i).onclick = () => {
      var wordToCapitalize = fixCapitalsButton.item(i).id;
      capitalizeWord(wordToCapitalize, inputs);
    }
  }

  var goToSuggestions = document.getElementsByClassName('goToSuggestions');
  for (let i = 0; i < goToSuggestions.length; i++) {
    goToSuggestions.item(i).onclick = () => {
      document.getElementById('cheta-flt-dv').style.visibility = 'hidden';
      document.getElementById('cheta-learnMore-dv').style.visibility = 'hidden';
      document.getElementById('cheta-suggestions-dv').style.visibility = 'visible';      
    }
  }

  var allBackButtons = document.getElementsByClassName('backButton');
  for (let i = 0; i < allBackButtons.length; i++) {
    allBackButtons.item(i).onclick = () => {
      document.getElementById('cheta-flt-dv').style.visibility = 'visible';
      document.getElementById('cheta-learnMore-dv').style.visibility = 'hidden';
      document.getElementById('cheta-suggestions-dv').style.visibility = 'hidden';
    }
  }
}


function getInputsByValue(value)
{
    var results = [];
    if (window.location.href.includes('https://docs.google.com')) {
      var googleDocsSpan = document.getElementsByClassName('kix-wordhtmlgenerator-word-node');
      results.push(googleDocsSpan);
    } else {
      var allInputs = document.getElementsByTagName("input");
      for(var x=0;x<allInputs.length;x++)
          if(allInputs[x].value.includes(value)) {
              results.push(allInputs[x]);
          }

      var allTextArea = document.getElementsByTagName("textarea");
      for(var x=0;x<allTextArea.length;x++)
          if(allTextArea[x].value.includes(value)) {
            results.push(allTextArea[x]);
          }
    }
    return results;
}

function capitalizeWord(wordToCapitalize, inputs) {
  for (let i = 0; i < inputs[0].length; i++) {
    if (inputs[0][i].textContent.includes(wordToCapitalize)) {
      var index = inputs[0][i].textContent.search(wordToCapitalize);
      var capitalizedWord = wordToCapitalize.substring(0,1).toUpperCase() + wordToCapitalize.slice(1);
      inputs[0][i].textContent = inputs[0][i].textContent.substring(0,index) + capitalizedWord + inputs[0][i].textContent.substring(index+capitalizedWord.length);
    }
  }
}

function useSuggestion(wordToReplace, suggestion, inputs) {
  for (let i = 0; i < inputs[0].length; i++) {
    if (inputs[0][i].textContent.includes(wordToReplace)) {
      inputs[0][i].textContent = inputs[0][i].textContent.replace(wordToReplace, suggestion);
    }
  }
}

function wordSuggestions(words, eng_synonyms) {
  var obj = { word: '', synonyms: [] };
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
    if (this.suggestions[0].findIndex(obj => obj.word == word) == -1) {
      const property = word.toLowerCase();
      if (eng_synonyms[property]) {
        obj.word = word;
        for (let j = 0; j < eng_synonyms[property].length; j++) {
          if (calc_syllables(eng_synonyms[property][j]) < 3) {
              obj.synonyms.push(eng_synonyms[property][j]);
          }
        }
        if (obj.synonyms.length > 0) {
          obj.synonyms = [...new Set(obj.synonyms)];
          this.suggestions[0].push(obj);
        }
        obj = { word: '', synonyms: [] };
      }
    }
  }
}

function highlight(word, color, underlineColor) {
  var googleDocsSpan = document.getElementsByClassName('kix-wordhtmlgenerator-word-node');
  for (let i = 0; i < googleDocsSpan.length; i++) {
      if (googleDocsSpan[i].innerHTML.search(word) > -1) {
        index1 = i;
        break;
    }
  }
  var inputText = googleDocsSpan[index1];
  var innerHTML = inputText.innerHTML;
  var index = innerHTML.indexOf(word);
  if (index >= 0) {
   innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+word.length) + "</span>" + innerHTML.substring(index+word.length);
   inputText.innerHTML = innerHTML;
   var highlightedText = document.getElementsByClassName('highlight');
   for (let i = 0; i < highlightedText.length; i++) {
     if (highlightedText.item(i).innerHTML == word) {
      highlightedText[i].style.borderBottom = '3px solid '+underlineColor+'';
      highlightedText[i].style.backgroundColor = color;
     }
   }
  }
}

function identifyBigWords(sentence, eng_synonyms) {
  var words = sentence.split(" ");
  var newWords = [];
    for (let i = 0; i < words.length; i++) {
      if (calc_syllables(words[i]) >= 3) {
        newWords.push(words[i]);
        if (window.location.href.includes('https://docs.google.com')) {
          highlight(words[i], '#B5F9F2', '#1357F6');
        }
      }
    }
    wordSuggestions(newWords, eng_synonyms);
  }

function calc_syllables(word) {
  word = word.toLowerCase();
  if(word.length <= 3) { return 1; }
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    return word.match(/[aeiouy]{1,2}/g).length;
}

function calc_readingScore(text) {
  var words = text.split(" ");
  var totalSyllables = 0;
  var totalSentences = text.split(/[.!?]+\s/).length;
  for(let i = 0; i < words.length; i++) {
    totalSyllables += calc_syllables(words[i]);
  }
  var score = 206.835 - 1.015 * (words.length / totalSentences) - 84.6 * (totalSyllables / words.length);
  return Math.round(score * 10) / 10;
}

function calc_fleschKincaid(text) {
  var words = text.split(" ");
  var totalSyllables = 0;
  var totalSentences = text.split(/[.!?]+\s/).length;
  for(let i = 0; i < words.length; i++) {
    totalSyllables += calc_syllables(words[i]);
  }
  var score = 0.39 * (words.length / totalSentences) + 11.8 * (totalSyllables / words.length) - 15.59;
  return Math.round(score * 10) / 10;
}

function checkFirstLetter(sentence, sentenceNumber) {
  sentence = sentence.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  var firstWord = sentence.split(" ")[0];
  var obj = { firstWord: '', sentenceNumber: 0 };
  console.log(firstWord);
  if (firstWord[0] !== firstWord[0].toUpperCase()) {
    obj.sentenceNumber = sentenceNumber;
    obj.firstWord = firstWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
    this.suggestions[1].push(obj);
    highlight(firstWord, '#F6D0CA', '#F61B13');
  }
}

function sentences_readingScore(text, eng_synonyms) {
  this.longSentences = 0;
  const sentences = text.match( /[^\.!\?]+[\.!\?]+/g );
  const details = [];
  var obj = { sentence: '', readingScore: 0, sentenceLength: 0 };
  var count = 0;
  if (sentences) {
    for (let i = 0; i < sentences.length; i++) {
      checkFirstLetter(sentences[i], i+1);
      var readingScore = calc_readingScore(sentences[i]);
      if (readingScore <= 50 || sentences[i].split(" ").length > 23) {
        if (sentences[i].split(" ").length > 23) {
          this.longSentences = this.longSentences + 1;
        }
        identifyBigWords(sentences[i], eng_synonyms);
        obj.sentence = sentences[i].trim();
        obj.readingScore = readingScore;
        obj.sentenceLength = sentences[i].split(" ").length;
        details[count] = { ...obj };
        count++;
      }
    }
  }
  return details;
}

function scoreNotes(score, param) {
  if (param == 'level') {
    var schoolLevel;
    if (score >= 90) {
      schoolLevel = "5th Grade";
    } else if (score >= 80) {
      schoolLevel = "6th Grade";
    } else if (score >= 70) {
      schoolLevel = "7th Grade";
    } else if (score >= 60) {
      schoolLevel = "8th Grade & 9th Grade";
    } else if (score >= 50) {
      schoolLevel = "10th to 12th Grade";
    } else if (score >= 30) {
      schoolLevel = "College";
    } else if (score >= 10) {
      schoolLevel = "College Graduate";
    } else {
      schoolLevel = "Professional";
    }
    return schoolLevel;
  } else if (param == 'notes') {
    var scoreNote;
    if (score >= 90) {
      scoreNote = "Very easy to read. Easily understood by an average 11-year-old student.";
    } else if (score >= 80) {
      scoreNote = "Easy to read. Conversational English for consumers.";
    } else if (score >= 70) {
      scoreNote = "Fairly easy to read.";
    } else if (score >= 60) {
      scoreNote = "Plain English. Easily understood by 13- to 15-year-old students.";
    } else if (score >= 50) {
      scoreNote = "Fairly difficult to read.";
    } else if (score >= 30) {
      scoreNote = "Difficult to read.";
    } else if (score >= 10) {
      scoreNote = "Very difficult to read. Best understood by university graduates.";
    } else {
      scoreNote = "Extremely difficult to read. Best understood by university graduates.";
    }
    return scoreNote;
  }
}

function getSelectedText() {
  var text = "";
  if (typeof window.getSelection != "undefined") {
      text = window.getSelection().toString();
  } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
      text = document.selection.createRange().text;
  }
  this.selectedText = text;
}

function findMisspelledWords(text, wordList, trainData, eng_synonyms) {
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  var words = text.split(" ");
  var misspelledWords = [];
  var count = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
    const property = word.toLowerCase();
    if (trainData.search(word.toLowerCase()) < 0) {
      if (wordList.search(word.toLowerCase()) < 0 && !eng_synonyms[property]) {
          if (count != 0) {
            misspelledWords[count] = word;
            highlight(word, '#fed8b1', 'orange');
          }
          count++;
        }
      }
    }
  return misspelledWords;
}

init();