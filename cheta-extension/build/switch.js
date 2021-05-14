
function init() {
  console.log("Initializing ChETA");
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
  document.head.appendChild(link);
  console.log(config);
  if(!config.code) {
    console.log("Error loading ChETA: Unique code not found")
    return;
  }
  var inputs = getInputsByValue(config.code);
  if(inputs.length == 0) {
    console.log("Error loading ChETA: Input not found")
    return;
  }
  var text = inputs[0].value.split(config.code).reverse()[0];
  var dictionary = config.dictionary;
  var misspelledWords = findMisspelledWords(text, dictionary);
  var score = calc_readingScore(text);
  var scoreNote = scoreNotes(score, 'notes');
  var schoolLevel = scoreNotes(score, 'level');
  // alert(text)
  inputs[0].value = inputs[0].value;
  inputs[0].addEventListener('input', (e) => {
    var inputs = getInputsByValue(config.code);
    if(inputs.length == 0) {
      console.log("Error loading ChETA: Input not found");
      return;
    }
    var text = inputs[0].value.split(config.code).reverse()[0];
    var wordCountSpan = document.getElementById("cheta-data-wordcount");
    wordCountSpan.textContent = ""+text.split(" ").length;

    var charCountSpan = document.getElementById("cheta-data-charcount");
    charCountSpan.textContent = ""+text.length;

    var score = calc_readingScore(text);
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
  });

  inputs[0].addEventListener('mouseup', e => {
    getSelectedText();
    var selectedTextSpan = document.getElementById("cheta-data-selectedText");
    selectedTextSpan.textContent = ""+this.selectedText;
  });

  const div = document.createElement('div');
  var finalHTML = '<div id="cheta-flt-dv"><p class="cheta-flt-p">ChETA</p><br>';
  finalHTML += '<p class="cheta-pfnt">Words: <span id="cheta-data-wordcount">'+text.split(" ").length+'</span></p>';
  finalHTML += '<p class="cheta-pfnt">Chars: <span id="cheta-data-charcount">'+text.length+'</span></p><br><hr>';
  finalHTML += '<p class="cheta-pfnt">Reading Score: <span id="cheta-data-score">'+score+'</span></p><br>';
  finalHTML += '<p class="cheta-pfnt">School Level (US): <span id="cheta-data-schoolLevel">'+schoolLevel+'</span></p><br>';
  finalHTML += '<p class="cheta-pfnt">Note: <span id="cheta-data-scoreNote">'+scoreNote+'</span></p><br><hr>';
  finalHTML += '<p class="cheta-pfnt">Selected Text: <span id="cheta-data-selectedText"></span></p><br><hr>';
  finalHTML += '<p class="cheta-pfnt">Misspelled Words: <span id="cheta-data-mispelledWords">';
  for (let i = 0; i < misspelledWords.length; i++) {
    finalHTML += '<p class="mispelledWords">'+misspelledWords[i]+'</p>'
  }
  finalHTML += '</span></p>';
  finalHTML += '</div>';
  div.innerHTML = finalHTML;
  document.body.appendChild(div);
}

function getInputsByValue(value)
{
    var allInputs = document.getElementsByTagName("input");
    var results = [];
    for(var x=0;x<allInputs.length;x++)
        if(allInputs[x].value.includes(value))
            results.push(allInputs[x]);

    var allTextArea = document.getElementsByTagName("textarea");
    for(var x=0;x<allTextArea.length;x++)
        if(allTextArea[x].value.includes(value))
            results.push(allTextArea[x]);

    return results;
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
  for(let i = 0; i < words.length; i++) {
    totalSyllables += calc_syllables(words[i]);
  }
  var score = 206.835 - 1.015 * (words.length / text.split(/[.!?]+\s/).length) - 84.6 * (totalSyllables / words.length);
  return Math.round(score * 10) / 10;
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

function findMisspelledWords(text, dictionary) {
  var words = text.split(" ");
  var misspelledWords = [];
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    var property = words[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
    if (!dictionary[property]) {
      misspelledWords.push(words[i]);
    }
  }
  return misspelledWords;
}

init();
