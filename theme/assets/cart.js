(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  Cart
  - cart count
  - cart template
  - micro cart (if different to cart template)
*/

// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if (!supports) return;

window.Theme = window.Theme || {};

var cartCount = Theme.cartCount = require('./modules/cart-count.js');

Theme._.ready(function () {
  console.log('CART ready');
  cartCount.init();
});
},{"./modules/cart-count.js":2}],2:[function(require,module,exports){
var View = require('../view/view.js');
var cartCount = new View({
  ele: '[data-cart-count]',
  data: [
    'item-count'
  ]
});
module.exports = cartCount;
},{"../view/view.js":3}],3:[function(require,module,exports){
/*
var view = new View({
  ele: 'master element',
  template: '#id of template <script>',
  data: [ // set props on object and bind to eles with data-attrs
    // we don't need to update these on page load as they should be good from the liquid, so no value needed
    prop1,
    prop2
  ],
  events: { // Events to listen to. Obj can use trigger() to omit custom events
    'eventName selector': 'method', // DOM event i.e. click
  },
  methods: {
    myMethod: function () {}
  }
});

view.init();

// custom events? This will be done in the main file
var v1, v2;
v1.on('evnt', function () {
  v2.something();
});

*/

// var _ = Theme._;
var View = function (opts) {
  if (!opts.ele) return;
  this.ele = opts.ele;
  this.template = opts.template || false;
  
  if (opts.data) this._buildProperties(opts.data);
  if (opts.methods) this._buildMethods(opts.methods);
  
  console.log('VIEW');
};

// Public methods
View.prototype.init = function () {
  this.ele = document.querySelector(this.ele);
  if (this.template) this.template = document.querySelector(this.template);
  if (this.events) this._buildEventListeners(this.events);
  
  console.log('VIEW INIT');
};

// Private methods
View.prototype._buildProperties = function (data) {
  
};

View.prototype._buildMethods = function (data) {
  
};

View.prototype._buildEventListeners = function (events) {
  
};

module.exports = View;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NhcnQuanMiLCJfc3JjL2pzL21vZHVsZXMvY2FydC1jb3VudC5qcyIsIl9zcmMvanMvdmlldy92aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICBDYXJ0XG4gIC0gY2FydCBjb3VudFxuICAtIGNhcnQgdGVtcGxhdGVcbiAgLSBtaWNybyBjYXJ0IChpZiBkaWZmZXJlbnQgdG8gY2FydCB0ZW1wbGF0ZSlcbiovXG5cbi8vIENoZWNrIHRoYXQgd2UgaGF2ZSB3aGF0IHdlIG5lZWQgdG8gbW92ZSBmb3J3YXJkXG52YXIgc3VwcG9ydHMgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJiYgISF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcbmlmICghc3VwcG9ydHMpIHJldHVybjtcblxud2luZG93LlRoZW1lID0gd2luZG93LlRoZW1lIHx8IHt9O1xuXG52YXIgY2FydENvdW50ID0gVGhlbWUuY2FydENvdW50ID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NhcnQtY291bnQuanMnKTtcblxuVGhlbWUuXy5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdDQVJUIHJlYWR5Jyk7XG4gIGNhcnRDb3VudC5pbml0KCk7XG59KTsiLCJ2YXIgVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXcvdmlldy5qcycpO1xudmFyIGNhcnRDb3VudCA9IG5ldyBWaWV3KHtcbiAgZWxlOiAnW2RhdGEtY2FydC1jb3VudF0nLFxuICBkYXRhOiBbXG4gICAgJ2l0ZW0tY291bnQnXG4gIF1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBjYXJ0Q291bnQ7IiwiLypcbnZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICBlbGU6ICdtYXN0ZXIgZWxlbWVudCcsXG4gIHRlbXBsYXRlOiAnI2lkIG9mIHRlbXBsYXRlIDxzY3JpcHQ+JyxcbiAgZGF0YTogWyAvLyBzZXQgcHJvcHMgb24gb2JqZWN0IGFuZCBiaW5kIHRvIGVsZXMgd2l0aCBkYXRhLWF0dHJzXG4gICAgLy8gd2UgZG9uJ3QgbmVlZCB0byB1cGRhdGUgdGhlc2Ugb24gcGFnZSBsb2FkIGFzIHRoZXkgc2hvdWxkIGJlIGdvb2QgZnJvbSB0aGUgbGlxdWlkLCBzbyBubyB2YWx1ZSBuZWVkZWRcbiAgICBwcm9wMSxcbiAgICBwcm9wMlxuICBdLFxuICBldmVudHM6IHsgLy8gRXZlbnRzIHRvIGxpc3RlbiB0by4gT2JqIGNhbiB1c2UgdHJpZ2dlcigpIHRvIG9taXQgY3VzdG9tIGV2ZW50c1xuICAgICdldmVudE5hbWUgc2VsZWN0b3InOiAnbWV0aG9kJywgLy8gRE9NIGV2ZW50IGkuZS4gY2xpY2tcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIG15TWV0aG9kOiBmdW5jdGlvbiAoKSB7fVxuICB9XG59KTtcblxudmlldy5pbml0KCk7XG5cbi8vIGN1c3RvbSBldmVudHM/IFRoaXMgd2lsbCBiZSBkb25lIGluIHRoZSBtYWluIGZpbGVcbnZhciB2MSwgdjI7XG52MS5vbignZXZudCcsIGZ1bmN0aW9uICgpIHtcbiAgdjIuc29tZXRoaW5nKCk7XG59KTtcblxuKi9cblxuLy8gdmFyIF8gPSBUaGVtZS5fO1xudmFyIFZpZXcgPSBmdW5jdGlvbiAob3B0cykge1xuICBpZiAoIW9wdHMuZWxlKSByZXR1cm47XG4gIHRoaXMuZWxlID0gb3B0cy5lbGU7XG4gIHRoaXMudGVtcGxhdGUgPSBvcHRzLnRlbXBsYXRlIHx8IGZhbHNlO1xuICBcbiAgaWYgKG9wdHMuZGF0YSkgdGhpcy5fYnVpbGRQcm9wZXJ0aWVzKG9wdHMuZGF0YSk7XG4gIGlmIChvcHRzLm1ldGhvZHMpIHRoaXMuX2J1aWxkTWV0aG9kcyhvcHRzLm1ldGhvZHMpO1xuICBcbiAgY29uc29sZS5sb2coJ1ZJRVcnKTtcbn07XG5cbi8vIFB1YmxpYyBtZXRob2RzXG5WaWV3LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmVsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5lbGUpO1xuICBpZiAodGhpcy50ZW1wbGF0ZSkgdGhpcy50ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy50ZW1wbGF0ZSk7XG4gIGlmICh0aGlzLmV2ZW50cykgdGhpcy5fYnVpbGRFdmVudExpc3RlbmVycyh0aGlzLmV2ZW50cyk7XG4gIFxuICBjb25zb2xlLmxvZygnVklFVyBJTklUJyk7XG59O1xuXG4vLyBQcml2YXRlIG1ldGhvZHNcblZpZXcucHJvdG90eXBlLl9idWlsZFByb3BlcnRpZXMgPSBmdW5jdGlvbiAoZGF0YSkge1xuICBcbn07XG5cblZpZXcucHJvdG90eXBlLl9idWlsZE1ldGhvZHMgPSBmdW5jdGlvbiAoZGF0YSkge1xuICBcbn07XG5cblZpZXcucHJvdG90eXBlLl9idWlsZEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50cykge1xuICBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiXX0=
