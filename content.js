var gLastUrl = '';

function getPOSInformation(){
  var selector = $('.gt-cd.gt-cd-mmd > .gt-cd-c > .gt-cd-pos');
  var posIndexs = [];
  var posList = [];
  var posIndex = 0;
  for (var i = 0; i < selector.length; i++) {
    var currentSelector = selector.eq(i);
    posIndex += currentSelector.next('.gt-def-list').children().length;
    var pos = currentSelector.text();
    posIndexs.push(posIndex);
    posList.push(pos);
  }
  return {posIndexs: posIndexs, posList: posList};
}

function getDefinitionInformation(){
  var selector = $('.gt-def-info');
  var text = [];
  var examples = [];
  var synonyms = [];
  for (var i = 0; i < selector.length; i++) {
    var currentSelector = selector.eq(i);
    text.push(currentSelector.children('.gt-def-row').text());

    var example = currentSelector.children('.gt-def-example').text();
    if (example !== '') {
      example = '"' + example + '"';
    }
    examples.push(example);

    synonym = currentSelector.children('.gt-def-synonym').text();
    synonyms.push(synonym.substr(synonym.indexOf(':')+1, synonym.length-1));
  }
  return {text: text, examples: examples, synonyms: synonyms};
}

function getPreparedInformation(sourceText){
  var posInformation = getPOSInformation();
  var definitionInformation = getDefinitionInformation();
  var synonymTitle = $('.gt-def-synonym-title').eq(0).text();

  var toShowTitle = $('.gt-cd-mmd > .gt-cd-t > .gt-cd-tl > div').text()
                      .replace(sourceText, '<span id=gtp_bart ' +
                                           'class="notranslate">' +
                                           sourceText + '</span>');

  // line feed by '; '
  var toTranslateText = definitionInformation.text.join('; |; ');
  toTranslateText += '; |; ' + posInformation.posList.join('; |; ') +
                     '; |; ' + synonymTitle + '; |; ' + toShowTitle;

  return {
    toTranslateText: toTranslateText,
    notToTranslateInformation: {
      posIndexs: posInformation.posIndexs,
      examples: definitionInformation.examples,
      synonyms: definitionInformation.synonyms
    }
  };
}
 
function showResult(data, notToTranslateInformation, sourceText, history){
  console.log("@GTP, start to show result");
  var translatedText = '';
  var i;
  for (i = 0; i < data[0].length; i++) {
    translatedText += data[0][i][0];
  }

  var translatedTextList = translatedText.split('|');
  var translatedResultList = [];
  for (i = 0; i < translatedTextList.length; i++) {
    var translatedResult = translatedTextList[i].trim();
    if (translatedResult.indexOf(';') === 0) {
      translatedResult = translatedResult.substr(1, translatedResult.length);
    }
    if (translatedResult.lastIndexOf(';') === translatedResult.length - 1) {
      translatedResult = translatedResult.substr(0, translatedResult.length-1);
    }
    translatedResultList.push(translatedResult);
  }

  var toShowResult = '<div class="gtp-extension-info">' +
                     '<p class="gtp-extension-name"><b>Google Translate Plus</b></p>' +
                     '<a target="_blank" href="https://www.bart.com.hk?from=t-p">' +
                     '<img class="gtp-bart-logo" ' +
                     'title="Powered By Bart Solutions" ' +
                     'src="http://gtranslateplus.com/bart-logo.24.png"/>' +
                     '</a></div><div class="gtp-result-header">' +
                     '<p class="gtp-result-title">' +
                     translatedResultList.pop().replace('</ span>', '</span>') +
                     '</p></div>';

  var posIndexs = notToTranslateInformation.posIndexs;
  var posCount = posIndexs.length;
  var definitionCount = translatedResultList.length - posCount - 1;
  var index = 0;
  for (i = 0; i < definitionCount; i++) {
    if (index < posCount && (i === 0 || posIndexs.indexOf(i) > -1)){
      toShowResult += '<p class="gtp-definition-pos">' +
                      translatedResultList[definitionCount + index] +
                      '</p>';
      index ++;
    }

    var synonyms = notToTranslateInformation.synonyms;
    var translatedSynonyms = '';
    if (synonyms[i]) {
      translatedSynonyms = translatedResultList.slice(-1).pop();
    }

    toShowResult += '<div class="gtp-translated-text">' +
                    '<p class="gtp-translated-definition">' +
                    translatedResultList[i] +
                    '</p><p class="gtp-definition-example">' +
                    notToTranslateInformation.examples[i] +
                    '</p><p class="gtp-definition-synonyms">' +
                    translatedSynonyms + synonyms[i] + '</div>';
  }

  for (i = 0; i < history.length; i++) {
    if (i === 0) {
      toShowResult += '<div class="sgn-history">';
    }

    var historyItem = history[i];
    toShowResult += '<div class="sgn-history-item"><a target="_blank" href="' +
                    historyItem.url + '">' + historyItem.text + '</a></div>';

    if (i === history.length - 1) {
      toShowResult += '</div>';
    }
  }

  var showDom = $(toShowResult);

  //change translated source text to original source text
  showDom.find('#gtp_bart').text(sourceText);
  $('#gtp-definition-translated-result').append(showDom);

  $( ".cd-expand-button" ).click();
}

function translateDefinition(){
  var currentUrl = window.location.href;
  if (currentUrl === gLastUrl){
    return;
  }

  gLastUrl = currentUrl;

  $('#gtp-definition-translated-result').remove();

  if ($('.gt-cd-mmd:visible').length){
    var parameters = currentUrl.split('#')[1].split('&');
    var parameterDict = {};
    for (i = 0; i < parameters.length; i++) {
      var key = parameters[i].split('=')[0];
      var value = parameters[i].split('=')[1];
      parameterDict[key] = value;
    }

    var fromLanguage = parameterDict['sl'];
    var toLanguage = parameterDict['tl'];

    $('.gt-cc-l-i').before(
      '<div id="gtp-definition-translated-result" class="gt-cc-l-i"></div>');

    var sourceText = $('.gt-cd-mmd > .gt-cd-t > .gt-cd-tl > div > span').text();

    var preparedInformation = getPreparedInformation(sourceText);
    var toTranslateText = preparedInformation.toTranslateText;

    var translateUrl = 'https://translate.googleapis.com' +
                       '/translate_a/single?client=gtx' +
                       '&sl=' + fromLanguage + '&tl=' + toLanguage +
                       '&dt=t&q=' + encodeURI(toTranslateText);

    console.log("@GTP: start query");
    $.get(translateUrl, function(data, status){
      if (status === 'success'){
        console.log("@GTP: translation collected");
        getBrowser().storage.local.get(['max_history', 'GTPHistory'], function(result) {
          var max_history =  10;
          if(result.max_history){
            max_history = parseInt(result.max_history);
          }

          var history = [];
          if (max_history && result.GTPHistory) {
            history = JSON.parse(result.GTPHistory);
          } 

          showResult(data,
                     preparedInformation.notToTranslateInformation,
                     sourceText,
                     history);


          if(max_history){
            var historyFound = false;
            for(var i=0; i<history.length; i++){
              if(history[i].text === sourceText)
                historyFound = true;
            }

            // do not repeat
            if(!historyFound){
              history.unshift({'text': sourceText, 'url': currentUrl});
              history = JSON.stringify(history.slice(0, max_history));
              getBrowser().storage.local.set({'GTPHistory': history});
            }
          }

        });
      } else {
        console.log('translate failed');
      }
    });
  }
}

var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function(mutation) {
    translateDefinition();
  });
});

//observe whether the definition change
observer.observe($('.gt-cd-mmd')[0], {attributes: true, characterData: true});

setTimeout(translateDefinition, 200);
