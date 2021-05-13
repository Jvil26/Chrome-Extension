
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
  var score = readingTest(text);
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

    var score = readingTest(text);
    var readingScoreSpan = document.getElementById("cheta-data-score");
    readingScoreSpan.textContent = ""+score;

    if(config.priceperword) {
      var pricePerWord = document.getElementById("cheta-data-priceperword");
      var priceVal = text.split(" ").length * config.priceperword;
      pricePerWord.textContent = ""+priceVal.toFixed(2);
    }
  });

  inputs[0].addEventListener('mouseup', e => {
    getSelectedText();
    var selectedTextSpan = document.getElementById("cheta-data-selectedText");
    selectedTextSpan.textContent = ""+this.selectedText;
  });

  const div = document.createElement('div');
  var finalHTML = '<div id="cheta-flt-dv"><p class="cheta-flt-p">ChETA</p>';
  finalHTML += '<p class="cheta-pfnt">Words: <span id="cheta-data-wordcount">'+text.split(" ").length+'</span></p>';
  finalHTML += '<p class="cheta-pfnt">Chars: <span id="cheta-data-charcount">'+text.length+'</span></p>';
  finalHTML += '<p class="cheta-pfnt">Reading Score: <span id="cheta-data-score">'+score+'</span></p>';
  finalHTML += '<p class="cheta-pfnt">Selected Text: <span id="cheta-data-selectedText">'+this.selectedText+'</span></p>';

  if(config.priceperword) {
    var priceVal = text.split(" ").length * config.priceperword;
    finalHTML += '<p class="cheta-pfnt">Total PPW: $<span id="cheta-data-priceperword">'+priceVal.toFixed(2)+'</span></p>';
  }
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

function readingTest(text) {
  var words = text.split(" ");
  var totalSyllables = 0;
  for(let i = 0; i < words.length; i++) {
    totalSyllables += calc_syllables(words[i]);
  }
  var score = 206.835 - 1.015 * (words.length / text.split(/[.!?]+\s/).length) - 84.6 * (totalSyllables / words.length);
  return Math.round(score * 10) / 10;
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

init();
