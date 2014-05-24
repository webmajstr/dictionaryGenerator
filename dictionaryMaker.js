var bot = require('nodemw'),
client = new bot({
  "server": "pl.wikipedia.org",
  "path": "/w",
  "debug": false
}),
http = require('http'),
fs = require('fs');

var client;

var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var helper = {
	getArticleName: function(url) {
		var output = url.slice(1,url.length-8);
    console.log(output);
    return decodeURIComponent(output);
  },
  getSentence: function(url) {
    var output = url.slice(1,url.length);
    console.log(output);
    return decodeURIComponent(output);
  },
  getLang: function(url) {
    var output = url.slice(url.length-2,url.length);
    console.log(output);
    return decodeURIComponent(output);
  },
  getCategoriesFromArticle: function (article) {
    var categoriesTable = article.match(/\[\[Kategoria\:[\wĘęÓóĄąŚśŁłŻżŹźĆćŃń\s]+/g);
    for (var i=0; i<categoriesTable.length; i++) {
     categoriesTable[i] = categoriesTable[i].replace("[[Kategoria:", "");
   }
   return categoriesTable;



 },
 decode: function (content) {
   return decoder.write(content);
 },
 removeDuplicates: function (list) {
  var newList = [list[0]];

  for (var i=1; i< list.length; i++) {
   if (list[i] !== newList[newList.length-1]) {
    newList.push(list[i]);
  }
}

return newList;
},

prepareDictionary: function (articleName, article, lang, callback) {
 var listToCheck = [articleName];
 var dictionary = [];
 var categories = this.getCategoriesFromArticle(article);
 var that = this;
 if (article.search(/\#REDIRECT/gi) == -1 && article.search(/\#PATRZ/gi) == -1 && article.search(/\{\{Ujednoznacznienie\}\}/gi) == -1) {
   categories.forEach(function(cat) {
    client.getPagesInCategory(cat, function(list) {
     list.forEach(function(entity) {
      if (entity.ns === 0) {
       listToCheck.push(entity.title);
     }
     if(cat === categories[categories.length-1] && entity === list[list.length - 1]) {
    					//All callbacks finished
    					var backlinks = client.getBacklinks(articleName, function(backLinkSet) {
    						backLinkSet.forEach(function(backlink) {
    							if (backlink.ns === 0) {
    								listToCheck.push(backlink.title);
    							}
    							if (backlink === backLinkSet[backLinkSet.length-1]) {
    								//All pages gathered, now getting interwiki links
    								listToCheck.sort();
    								listToCheck = that.removeDuplicates(listToCheck);
    								listToCheck.forEach(function(pageTitle) {
    									client.getInterwikiLinks(pageTitle, lang, function (iwLinks) {
    										if (iwLinks.length > 0) {
    											dictionary.push({"original": pageTitle, "translated": iwLinks[0]["*"]});
    										}

    										if (pageTitle === listToCheck[listToCheck.length-1]) {
    											console.log(dictionary);
    											callback(JSON.stringify(dictionary));
    										}
    									});
    								});
    							}
    						});

    					});
    				}
    			});
});
}); 
} else {
  callback("[]");
}





},
getNouns: function (data) {
  var words = data.output;
  var result = [];
  words.forEach(function(wordList){
    if (wordList instanceof Array) {
      wordList.forEach(function(word){
        if (word.match(/\+subst$/) !== null) {
          result.push(word.replace("+subst", ""));
        }
      });

    } else {
      if (wordList.match(/\+subst$/) !== null) {
        result.push(wordList.replace("+subst", ""));
      }
    }


  });
  return result;


}




}


http.createServer(function (req, res) {
	if (req.method === "GET") {
		


    var articleName = helper.getArticleName(req.url);
    client.getArticle(articleName, function(page) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (page === undefined) {
        page = "0";
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end(page);
      } else {
        console.log(page);
        helper.prepareDictionary(articleName, page, helper.getLang(req.url), function(dictionary) {
         res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
         res.end(dictionary);
       });
      }

			//console.log(helper.getCategoriesFromArticle(page))
		});

  }


}).listen(1337, '127.0.0.1');

http.createServer(function (req, res) {
  if (req.method === "GET") {

    var sentence = helper.getSentence(req.url);
    sentence = sentence.replace(/\s/gi, "+");
    console.log(sentence);
    var request = http.request("http://mrt.wmi.amu.edu.pl/json.psis?pipe=morfologik+!+json-simple-writer+--tags+lexeme&input=" + sentence, function(response) {
      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify(helper.getNouns(JSON.parse(chunk))));
      });
    });

    request.end();



  }


}).listen(1336, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');