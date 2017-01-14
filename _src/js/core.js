// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if (!supports) return;

// Modules needed for core js
window._ = require('./utils/_lib.js');

_.ready(function () {
  console.log('ready');
});