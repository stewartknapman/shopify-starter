/*
  Theme Core
  - Sets up reusable objects like _lib, and mq-size
  - Sets up generic objects like show-and-hide, and element-queries
  - image galleries?
  - customer login header widget
  
  Storage model uses browser DB and cookies?
*/

// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if (!supports) return;

// Main Theme object
window.Theme = window.Theme || {};

// Modules needed for core js
var _ = Theme._ = require('./utils/_lib.js');
Theme.mqSize = require('./utils/_mq-size.js');

var ElementQueries = require('./utils/_element-queries.js');
Theme.elementQueries = new ElementQueries();

var ShowHide = require('./utils/_show-hide.js');
Theme.showHide = new ShowHide();

_.ready(function () {
  console.log('ready', Theme, Theme.mqSize());
});