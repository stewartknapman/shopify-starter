// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if ( !supports ) return;

// Pollyfills to add functionality to older browsers
require('./_pollyfills/pollyfill.dataset.js')();
require('./_pollyfills/pollyfill.classlist.js')();
require('./_pollyfills/pollyfill.getComputedStyle.js')();

// Modules needed for core js
var _ = require('./utils/_lib.js');


_.ready(function () {
  
});