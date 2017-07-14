var gLastUrl = '';

function getPOSInformation(){
    var selector = $('.gt-cd.gt-cd-md > .gt-cd-c > .gt-cd-pos');
    var posIndexs = [];
    var posList = [];
    var posIndex = 0;
    for (var i = 0; i < selector.length; i++){
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
    for (var i = 0; i < selector.length; i++){
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

    var toShowTitle = $('.gt-cd-md > .gt-cd-t > .gt-cd-tl > div').text()
                       .replace(sourceText, '<span id=gtp_bart ' +
			       'class="notranslate">' + sourceText + '</span>');

    //line feed by '; '
    var toTranslateText = definitionInformation.text.join('; |; ');
    toTranslateText += '; |; ' + posInformation.posList.join('; |; ') +
                       '; |; ' + synonymTitle + '; |; ' + toShowTitle;

    return {toTranslateText: toTranslateText,
            notToTranslateInformation: {posIndexs: posInformation.posIndexs,
                                        examples: definitionInformation.examples,
                                        synonyms: definitionInformation.synonyms}
           };
}
 
function showResult(data, notToTranslateInformation, sourceText){
    var translatedText = '';
    var i;
    for (i = 0; i < data[0].length; i++){
        translatedText += data[0][i][0];
    }

    var translatedTextList = translatedText.split('|;');
    var translatedResultList = [];
    for (i = 0; i < translatedTextList.length; i++){
        var translatedResult = translatedTextList[i];
        if (translatedResult.lastIndexOf('; ') === translatedResult.length - 2){
            translatedResult = translatedResult.substr(
                                    0, translatedResult.length-2);
        }
        translatedResultList.push(translatedResult);
    }

    var toShowResult = '<div class="extension_info">' +
                       '<p class="extension_name">Google Translate Plus</p>' +
                       '<a href="https://www.bart.com.hk?from=t-p">' +
                       '<img class="bart_logo" ' +
                       'title="Powered By Bart Soluions" ' +
                       'src="http://gtranslateplus.com/bart-logo.24.png"/>' +
                       '</a></div><div class="result_header">' +
                       '<p class="result_title">' +
                       translatedResultList.pop().replace('</ span>', '</span>') +
                       '</p></div>';

    var posIndexs = notToTranslateInformation.posIndexs;
    var posCount = posIndexs.length;
    var definitionCount = translatedResultList.length - posCount - 1;
    var index = 0;
    for (i = 0; i < definitionCount; i++){
        if (index < posCount && (i === 0 || posIndexs.indexOf(i) > -1)){
            toShowResult += '<p class="definition_pos">' +
                            translatedResultList[definitionCount + index] + 
                            '</p>';
            index ++;
        }

        var synonyms = notToTranslateInformation.synonyms;
        var translatedSynonyms = '';
        if (synonyms[i]) {
            translatedSynonyms = translatedResultList.slice(-1).pop();
        }

        toShowResult += '<div class="translated_text">' +
                        '<p class="translated_definition">' +
                        translatedResultList[i] +
                        '</p><p class="definition_example">' +
                        notToTranslateInformation.examples[i] +
                        '</p><p class="definition_synonyms">' +
                        translatedSynonyms + synonyms[i] + '</div>';
    }

    var showDom = $(toShowResult);

    //change translated source text to original source text
    showDom.find('#gtp_bart').text(sourceText);
    $('#definition_translated_result').append(showDom);

    $( ".cd-expand-button" ).click();
}

function translateDefinition(){
    var currentUrl = window.location.href;
    if (currentUrl === gLastUrl){
        return;
    }

    gLastUrl = currentUrl;

    $('#definition_translated_result').remove();

    if ($('.gt-cd-md:visible').length){
        var languages = currentUrl.split('#')[1].split('/');
        var fromLanguage = languages[0];
        var toLanguage = languages[1];

        $('.gt-cc-r').before(
            '<div id="definition_translated_result" class="gt-cc-r"></div>');

        var sourceText = $(
                '.gt-cd-md > .gt-cd-t > .gt-cd-tl > div > span').text();

        var preparedInformation = getPreparedInformation(sourceText);
        var toTranslateText = preparedInformation.toTranslateText;

        var translateUrl = 'https://translate.googleapis.com' +
                           '/translate_a/single?client=gtx' +
                           '&sl=' + fromLanguage + '&tl=' + toLanguage +
                           '&dt=t&q=' + encodeURI(toTranslateText);

        $.get(translateUrl, function(data, status){
            if (status === 'success'){
                showResult(data, preparedInformation.notToTranslateInformation,
                           sourceText);
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
observer.observe($('.gt-cd-md')[0], {attributes: true, characterData: true});

window.onbeforeunload = translateDefinition();
