var sub = "SXGWLZPDOKFIVUHJYTQBNMACERxswgzldpkoifuvjhtybqmncare";
var nouns = [],
    verbs = [];
var url = location.href;

Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
}

function encodeStr(uncoded) {
  uncoded = uncoded.toUpperCase().replace(/^\s+|\s+$/g,"");
  var coded = "";
  var chr;
  for (var i = uncoded.length - 1; i >= 0; i--) {
    chr = uncoded.charCodeAt(i);
    coded += (chr >= 65 && chr <= 90) ? 
      sub.charAt(chr - 65 + 26*Math.floor(Math.random()*2)) :
      String.fromCharCode(chr); 
    }
  return encodeURIComponent(coded);  
}

function decodeStr(coded) {
  coded = decodeURIComponent(coded);  
  var uncoded = "";
  var chr;
  for (var i = coded.length - 1; i >= 0; i--) {
    chr = coded.charAt(i);
    uncoded += (chr >= "a" && chr <= "z" || chr >= "A" && chr <= "Z") ?
      String.fromCharCode(65 + 32 + sub.indexOf(chr) % 26) :
      chr; 
    }
  return uncoded;   
} 

function gup( name ){
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
  var regexS = "[\\?&]"+name+"=([^&#]*)";  
  var regex = new RegExp( regexS );  
  var results = regex.exec( window.location.href ); 
  if( results == null ) {
    return "";  
  }
  else {
return results[1];
  }
}

function getWords(suppressGenerate) {
  $.when(
    $.ajax({
      url: 'http://api.wordnik.com/v4/words.json/randomWords?minCorpusCount=10000&minDictionaryCount=5&excludePartOfSpeech=proper-noun,proper-noun-plural,proper-noun-posessive,suffix,family-name,idiom,affix&hasDictionaryDef=true&includePartOfSpeech=noun&limit=1000&maxLength=22&api_key='+key.API_KEY,
      async: false,
      dataType:"json"
    }),
    $.ajax({
      url: 'http://api.wordnik.com//v4/words.json/randomWords?limit=1000&excludePartOfSpeech=adjective&hasDictionaryDef=true&includePartOfSpeech=verb-transitive&minCorpusCount=1000&api_key='+key.API_KEY,
      async: false,
      dataType:"json"
    })
  ).done(function(noun_data, verb_data) {
    nouns = $.map(noun_data[0], function(el) { return el.word; });
    verbs = $.map(verb_data[0], function(el) { return el.word; });
    if (!suppressGenerate) {
      generate();
    }
  });
}

function generate(nounPlural, verb) {
  nounPlural = nounPlural || nouns.pick().pluralize();
  verb = verb || verbs.pick();
  var generatedText = verb + " ALL the " + nounPlural;
  $("#content").text(generatedText);
  var shareUrl = location.href.split('?')[0]+'?word='+encodeStr(verb)+'$'+encodeStr(nounPlural);
  $('#share').attr('href', shareUrl);;
  $('.twitter-share-button').remove();
  $('#twitterShare').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + shareUrl + '" data-text="' + generatedText + '" data-lang="en">Tweet</a>');
  if (twttr.widgets) {
    twttr.widgets.load();
  }
}

$('#generate').click(function() { generate(); });;
if (gup('word') === "") {
  getWords();
}
else {
  var verb = decodeStr(unescape(gup('word')).split('$')[0]);
  var nounPlural = decodeStr(unescape(gup('word')).split('$')[1]);
  getWords(true);
  generate(nounPlural, verb);
}