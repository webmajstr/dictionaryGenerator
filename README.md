dictionaryGenerator
===================


dictionaryGenerator is a node.js based project which generates polish dictionary for related to input word provided by the user. Application crawls wikipedia searching for interwiki links, and related articles. For instance: running project with input "Szlifierka kątowa" gives you a dictionary covering names of tools etc. Project was created for educational purposes (Natural Language Processing classes at Adam Mickiewicz University in Poznań, Poland), and is is experimental. Author cannot assure that the application works as expected. 

## Requirements

* nodejs

## Dependencies

* [nodemw](http://github.com/macbre/nodemw)

### Using npm

``` bash
npm install nodemw
```

## Using dictionaryGenerator

Clone repository
run dictionaryMaker.js
``` bash
node dictionaryMaker.js
```
open index.html
use it!

## Available languages
You can create dictionaries from polish to: 
* English
* French
* German
* Spanish
