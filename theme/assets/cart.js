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
  console.log('CART ready', cartCount.itemCount);
});
},{"./modules/cart-count.js":2}],2:[function(require,module,exports){
var View = require('../view/view.js');
var cartCount = new View({
  ele: '[data-cart-count]',
  data: [
    'item-count',
    'cart-total'
  ]
});
module.exports = cartCount;
},{"../view/view.js":3}],3:[function(require,module,exports){
/*
var view = new View({
  ele: 'master element',
  template: '#id of template <script>', // not 100% sure how this works or IF we need it
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

var _ = Theme._;
var View = function (opts) {
  if (!opts.ele) return;
  this.ele = opts.ele;
  this.template = opts.template || false;
  
  if (opts.data) this._buildProperties(opts.data);
  if (opts.methods) this._buildMethods(opts.methods);
  
  _.ready(function () {
    this.init();
  }, this);
};

// Public methods
View.prototype.init = function () {
  this.ele = document.querySelector(this.ele);
  if (this.template) this.template = document.querySelector(this.template);
  if (this.events) this._buildEventListeners(this.events);
};

// Private methods
View.prototype._buildProperties = function (data) {
  _.each(data, function (d) {
    this._buildProperty(d);
  }, this);
};

View.prototype._buildProperty = function (data) {
  var value,
    dataEle,
    dataEles,
    dataName = _.camelCase(data),
    selector = '[data-'+data+']';
  Object.defineProperty(this, dataName, {
    enumerable: true,
    get: function () {
      dataEle = this.ele.querySelector(selector);
      if (dataEle) {
        value = (!!dataEle.value)? dataEle.value : dataEle.innerHTML;
      }
      return value;
    },
    set: function (newValue) {
      if (newValue !== value) {
        value = newValue;
        dataEles = this.ele.querySelectorAll(selector);
        _.each(dataEles, function (dataEle) {
          if (!!dataEle.value) {
            dataEle.value = value;
          } else {
            dataEle.innerHTML = value;
          }
        });
      }
    }
  });
};

View.prototype._buildMethods = function (data) {
  
};

View.prototype._buildEventListeners = function (events) {
  
};

module.exports = View;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NhcnQuanMiLCJfc3JjL2pzL21vZHVsZXMvY2FydC1jb3VudC5qcyIsIl9zcmMvanMvdmlldy92aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICBDYXJ0XG4gIC0gY2FydCBjb3VudFxuICAtIGNhcnQgdGVtcGxhdGVcbiAgLSBtaWNybyBjYXJ0IChpZiBkaWZmZXJlbnQgdG8gY2FydCB0ZW1wbGF0ZSlcbiovXG5cbi8vIENoZWNrIHRoYXQgd2UgaGF2ZSB3aGF0IHdlIG5lZWQgdG8gbW92ZSBmb3J3YXJkXG52YXIgc3VwcG9ydHMgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJiYgISF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcbmlmICghc3VwcG9ydHMpIHJldHVybjtcblxud2luZG93LlRoZW1lID0gd2luZG93LlRoZW1lIHx8IHt9O1xuXG52YXIgY2FydENvdW50ID0gVGhlbWUuY2FydENvdW50ID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NhcnQtY291bnQuanMnKTtcblxuVGhlbWUuXy5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdDQVJUIHJlYWR5JywgY2FydENvdW50Lml0ZW1Db3VudCk7XG59KTsiLCJ2YXIgVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXcvdmlldy5qcycpO1xudmFyIGNhcnRDb3VudCA9IG5ldyBWaWV3KHtcbiAgZWxlOiAnW2RhdGEtY2FydC1jb3VudF0nLFxuICBkYXRhOiBbXG4gICAgJ2l0ZW0tY291bnQnLFxuICAgICdjYXJ0LXRvdGFsJ1xuICBdXG59KTtcbm1vZHVsZS5leHBvcnRzID0gY2FydENvdW50OyIsIi8qXG52YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgZWxlOiAnbWFzdGVyIGVsZW1lbnQnLFxuICB0ZW1wbGF0ZTogJyNpZCBvZiB0ZW1wbGF0ZSA8c2NyaXB0PicsIC8vIG5vdCAxMDAlIHN1cmUgaG93IHRoaXMgd29ya3Mgb3IgSUYgd2UgbmVlZCBpdFxuICBkYXRhOiBbIC8vIHNldCBwcm9wcyBvbiBvYmplY3QgYW5kIGJpbmQgdG8gZWxlcyB3aXRoIGRhdGEtYXR0cnNcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIHVwZGF0ZSB0aGVzZSBvbiBwYWdlIGxvYWQgYXMgdGhleSBzaG91bGQgYmUgZ29vZCBmcm9tIHRoZSBsaXF1aWQsIHNvIG5vIHZhbHVlIG5lZWRlZFxuICAgIHByb3AxLFxuICAgIHByb3AyXG4gIF0sXG4gIGV2ZW50czogeyAvLyBFdmVudHMgdG8gbGlzdGVuIHRvLiBPYmogY2FuIHVzZSB0cmlnZ2VyKCkgdG8gb21pdCBjdXN0b20gZXZlbnRzXG4gICAgJ2V2ZW50TmFtZSBzZWxlY3Rvcic6ICdtZXRob2QnLCAvLyBET00gZXZlbnQgaS5lLiBjbGlja1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgbXlNZXRob2Q6IGZ1bmN0aW9uICgpIHt9XG4gIH1cbn0pO1xuXG52aWV3LmluaXQoKTtcblxuLy8gY3VzdG9tIGV2ZW50cz8gVGhpcyB3aWxsIGJlIGRvbmUgaW4gdGhlIG1haW4gZmlsZVxudmFyIHYxLCB2MjtcbnYxLm9uKCdldm50JywgZnVuY3Rpb24gKCkge1xuICB2Mi5zb21ldGhpbmcoKTtcbn0pO1xuXG4qL1xuXG52YXIgXyA9IFRoZW1lLl87XG52YXIgVmlldyA9IGZ1bmN0aW9uIChvcHRzKSB7XG4gIGlmICghb3B0cy5lbGUpIHJldHVybjtcbiAgdGhpcy5lbGUgPSBvcHRzLmVsZTtcbiAgdGhpcy50ZW1wbGF0ZSA9IG9wdHMudGVtcGxhdGUgfHwgZmFsc2U7XG4gIFxuICBpZiAob3B0cy5kYXRhKSB0aGlzLl9idWlsZFByb3BlcnRpZXMob3B0cy5kYXRhKTtcbiAgaWYgKG9wdHMubWV0aG9kcykgdGhpcy5fYnVpbGRNZXRob2RzKG9wdHMubWV0aG9kcyk7XG4gIFxuICBfLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgfSwgdGhpcyk7XG59O1xuXG4vLyBQdWJsaWMgbWV0aG9kc1xuVmlldy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5lbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuZWxlKTtcbiAgaWYgKHRoaXMudGVtcGxhdGUpIHRoaXMudGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMudGVtcGxhdGUpO1xuICBpZiAodGhpcy5ldmVudHMpIHRoaXMuX2J1aWxkRXZlbnRMaXN0ZW5lcnModGhpcy5ldmVudHMpO1xufTtcblxuLy8gUHJpdmF0ZSBtZXRob2RzXG5WaWV3LnByb3RvdHlwZS5fYnVpbGRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgXy5lYWNoKGRhdGEsIGZ1bmN0aW9uIChkKSB7XG4gICAgdGhpcy5fYnVpbGRQcm9wZXJ0eShkKTtcbiAgfSwgdGhpcyk7XG59O1xuXG5WaWV3LnByb3RvdHlwZS5fYnVpbGRQcm9wZXJ0eSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIHZhciB2YWx1ZSxcbiAgICBkYXRhRWxlLFxuICAgIGRhdGFFbGVzLFxuICAgIGRhdGFOYW1lID0gXy5jYW1lbENhc2UoZGF0YSksXG4gICAgc2VsZWN0b3IgPSAnW2RhdGEtJytkYXRhKyddJztcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGRhdGFOYW1lLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGFFbGUgPSB0aGlzLmVsZS5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIGlmIChkYXRhRWxlKSB7XG4gICAgICAgIHZhbHVlID0gKCEhZGF0YUVsZS52YWx1ZSk/IGRhdGFFbGUudmFsdWUgOiBkYXRhRWxlLmlubmVySFRNTDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIGRhdGFFbGVzID0gdGhpcy5lbGUucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIF8uZWFjaChkYXRhRWxlcywgZnVuY3Rpb24gKGRhdGFFbGUpIHtcbiAgICAgICAgICBpZiAoISFkYXRhRWxlLnZhbHVlKSB7XG4gICAgICAgICAgICBkYXRhRWxlLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFFbGUuaW5uZXJIVE1MID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTtcblxuVmlldy5wcm90b3R5cGUuX2J1aWxkTWV0aG9kcyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIFxufTtcblxuVmlldy5wcm90b3R5cGUuX2J1aWxkRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoZXZlbnRzKSB7XG4gIFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyJdfQ==
