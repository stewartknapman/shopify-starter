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
  cartCount.itemCount // supress build warning
//   console.log('CART ready', cartCount.itemCount);
});
},{"./modules/cart-count.js":2}],2:[function(require,module,exports){
var View = require('../view/view.js');
var cartCount = new View({
  ele: '[data-cart-count]',
  data: [
    'item-count',
    'cart-total'
  ],
  methods: {
    afterInit: function () {
      console.log('cartCount afterInit');
    },
    test: function () {
      console.log('method test', this);
      this.itemCount = 1;
    }
  }
});
module.exports = cartCount;
},{"../view/view.js":4}],3:[function(require,module,exports){
var Eventer = function (caller) {
  this.caller = caller;
  this.caller._events = {};
  this.caller.on = this.on;
  this.caller.off = this.off;
  this.caller.trigger = this.trigger;
};

// this === caller not Eventer
Eventer.prototype.on = function (event, callback) {
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(callback);
  return this._events[event].length - 1;
};

Eventer.prototype.off = function (event, id) {
  if (event && id) {
    if (this._events[event][id]) this._events[event][id] = null;
  } else if (event) {
    if (this._events[event]) this._events[event] = null;
  } else {
    this._events = {};
  }
};

Eventer.prototype.trigger = function (event, args) {
  if (typeof args !== 'object') args = [args]; 
  for (var i in this._events[event]) {
    var e = this._events[event][i];
    if (this._events[event].hasOwnProperty(i) && typeof e === 'function') e.apply(this, args);
  }
};

module.exports = Eventer;
},{}],4:[function(require,module,exports){
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
var Eventer = require('../utils/_eventer.js');

var View = function (opts) {
  if (!opts.ele) return;
  this.ele = opts.ele;
  
  // Set view properties and methods
  if (opts.data) this._buildProperties(opts.data);
  if (opts.methods) this._buildMethods(opts.methods);
  
  // Give view custom events
  new Eventer(this);
  
  _.ready(function () {
    this._init();
  }, this);
};

// Private methods
View.prototype._init = function () {
  this.ele = document.querySelector(this.ele);
  if (this.template) this.template = document.querySelector(this.template);
  if (this.events) this._buildEventListeners(this.events);
  if (this.afterInit) this.afterInit();
};

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

View.prototype._buildMethods = function (methods) {
  _.eachIn(methods, function (methodName, method) {
    this[methodName] = method;
  }, this);
};

View.prototype._buildEventListeners = function (events) {
  
};

module.exports = View;
},{"../utils/_eventer.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NhcnQuanMiLCJfc3JjL2pzL21vZHVsZXMvY2FydC1jb3VudC5qcyIsIl9zcmMvanMvdXRpbHMvX2V2ZW50ZXIuanMiLCJfc3JjL2pzL3ZpZXcvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAgQ2FydFxuICAtIGNhcnQgY291bnRcbiAgLSBjYXJ0IHRlbXBsYXRlXG4gIC0gbWljcm8gY2FydCAoaWYgZGlmZmVyZW50IHRvIGNhcnQgdGVtcGxhdGUpXG4qL1xuXG4vLyBDaGVjayB0aGF0IHdlIGhhdmUgd2hhdCB3ZSBuZWVkIHRvIG1vdmUgZm9yd2FyZFxudmFyIHN1cHBvcnRzID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yICYmICEhd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5pZiAoIXN1cHBvcnRzKSByZXR1cm47XG5cbndpbmRvdy5UaGVtZSA9IHdpbmRvdy5UaGVtZSB8fCB7fTtcblxudmFyIGNhcnRDb3VudCA9IFRoZW1lLmNhcnRDb3VudCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jYXJ0LWNvdW50LmpzJyk7XG5cblRoZW1lLl8ucmVhZHkoZnVuY3Rpb24gKCkge1xuICBjYXJ0Q291bnQuaXRlbUNvdW50IC8vIHN1cHJlc3MgYnVpbGQgd2FybmluZ1xuLy8gICBjb25zb2xlLmxvZygnQ0FSVCByZWFkeScsIGNhcnRDb3VudC5pdGVtQ291bnQpO1xufSk7IiwidmFyIFZpZXcgPSByZXF1aXJlKCcuLi92aWV3L3ZpZXcuanMnKTtcbnZhciBjYXJ0Q291bnQgPSBuZXcgVmlldyh7XG4gIGVsZTogJ1tkYXRhLWNhcnQtY291bnRdJyxcbiAgZGF0YTogW1xuICAgICdpdGVtLWNvdW50JyxcbiAgICAnY2FydC10b3RhbCdcbiAgXSxcbiAgbWV0aG9kczoge1xuICAgIGFmdGVySW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc29sZS5sb2coJ2NhcnRDb3VudCBhZnRlckluaXQnKTtcbiAgICB9LFxuICAgIHRlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdtZXRob2QgdGVzdCcsIHRoaXMpO1xuICAgICAgdGhpcy5pdGVtQ291bnQgPSAxO1xuICAgIH1cbiAgfVxufSk7XG5tb2R1bGUuZXhwb3J0cyA9IGNhcnRDb3VudDsiLCJ2YXIgRXZlbnRlciA9IGZ1bmN0aW9uIChjYWxsZXIpIHtcbiAgdGhpcy5jYWxsZXIgPSBjYWxsZXI7XG4gIHRoaXMuY2FsbGVyLl9ldmVudHMgPSB7fTtcbiAgdGhpcy5jYWxsZXIub24gPSB0aGlzLm9uO1xuICB0aGlzLmNhbGxlci5vZmYgPSB0aGlzLm9mZjtcbiAgdGhpcy5jYWxsZXIudHJpZ2dlciA9IHRoaXMudHJpZ2dlcjtcbn07XG5cbi8vIHRoaXMgPT09IGNhbGxlciBub3QgRXZlbnRlclxuRXZlbnRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gdGhpcy5fZXZlbnRzW2V2ZW50XS5sZW5ndGggLSAxO1xufTtcblxuRXZlbnRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBpZCkge1xuICBpZiAoZXZlbnQgJiYgaWQpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2ZW50XVtpZF0pIHRoaXMuX2V2ZW50c1tldmVudF1baWRdID0gbnVsbDtcbiAgfSBlbHNlIGlmIChldmVudCkge1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgfVxufTtcblxuRXZlbnRlci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChldmVudCwgYXJncykge1xuICBpZiAodHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSBhcmdzID0gW2FyZ3NdOyBcbiAgZm9yICh2YXIgaSBpbiB0aGlzLl9ldmVudHNbZXZlbnRdKSB7XG4gICAgdmFyIGUgPSB0aGlzLl9ldmVudHNbZXZlbnRdW2ldO1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnRdLmhhc093blByb3BlcnR5KGkpICYmIHR5cGVvZiBlID09PSAnZnVuY3Rpb24nKSBlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50ZXI7IiwiLypcbnZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICBlbGU6ICdtYXN0ZXIgZWxlbWVudCcsXG4gIHRlbXBsYXRlOiAnI2lkIG9mIHRlbXBsYXRlIDxzY3JpcHQ+JywgLy8gbm90IDEwMCUgc3VyZSBob3cgdGhpcyB3b3JrcyBvciBJRiB3ZSBuZWVkIGl0XG4gIGRhdGE6IFsgLy8gc2V0IHByb3BzIG9uIG9iamVjdCBhbmQgYmluZCB0byBlbGVzIHdpdGggZGF0YS1hdHRyc1xuICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gdXBkYXRlIHRoZXNlIG9uIHBhZ2UgbG9hZCBhcyB0aGV5IHNob3VsZCBiZSBnb29kIGZyb20gdGhlIGxpcXVpZCwgc28gbm8gdmFsdWUgbmVlZGVkXG4gICAgcHJvcDEsXG4gICAgcHJvcDJcbiAgXSxcbiAgZXZlbnRzOiB7IC8vIEV2ZW50cyB0byBsaXN0ZW4gdG8uIE9iaiBjYW4gdXNlIHRyaWdnZXIoKSB0byBvbWl0IGN1c3RvbSBldmVudHNcbiAgICAnZXZlbnROYW1lIHNlbGVjdG9yJzogJ21ldGhvZCcsIC8vIERPTSBldmVudCBpLmUuIGNsaWNrXG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBteU1ldGhvZDogZnVuY3Rpb24gKCkge31cbiAgfVxufSk7XG5cbnZpZXcuaW5pdCgpO1xuXG4vLyBjdXN0b20gZXZlbnRzPyBUaGlzIHdpbGwgYmUgZG9uZSBpbiB0aGUgbWFpbiBmaWxlXG52YXIgdjEsIHYyO1xudjEub24oJ2V2bnQnLCBmdW5jdGlvbiAoKSB7XG4gIHYyLnNvbWV0aGluZygpO1xufSk7XG5cbiovXG5cbnZhciBfID0gVGhlbWUuXztcbnZhciBFdmVudGVyID0gcmVxdWlyZSgnLi4vdXRpbHMvX2V2ZW50ZXIuanMnKTtcblxudmFyIFZpZXcgPSBmdW5jdGlvbiAob3B0cykge1xuICBpZiAoIW9wdHMuZWxlKSByZXR1cm47XG4gIHRoaXMuZWxlID0gb3B0cy5lbGU7XG4gIFxuICAvLyBTZXQgdmlldyBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzXG4gIGlmIChvcHRzLmRhdGEpIHRoaXMuX2J1aWxkUHJvcGVydGllcyhvcHRzLmRhdGEpO1xuICBpZiAob3B0cy5tZXRob2RzKSB0aGlzLl9idWlsZE1ldGhvZHMob3B0cy5tZXRob2RzKTtcbiAgXG4gIC8vIEdpdmUgdmlldyBjdXN0b20gZXZlbnRzXG4gIG5ldyBFdmVudGVyKHRoaXMpO1xuICBcbiAgXy5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9LCB0aGlzKTtcbn07XG5cbi8vIFByaXZhdGUgbWV0aG9kc1xuVmlldy5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmVsZSk7XG4gIGlmICh0aGlzLnRlbXBsYXRlKSB0aGlzLnRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnRlbXBsYXRlKTtcbiAgaWYgKHRoaXMuZXZlbnRzKSB0aGlzLl9idWlsZEV2ZW50TGlzdGVuZXJzKHRoaXMuZXZlbnRzKTtcbiAgaWYgKHRoaXMuYWZ0ZXJJbml0KSB0aGlzLmFmdGVySW5pdCgpO1xufTtcblxuVmlldy5wcm90b3R5cGUuX2J1aWxkUHJvcGVydGllcyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIF8uZWFjaChkYXRhLCBmdW5jdGlvbiAoZCkge1xuICAgIHRoaXMuX2J1aWxkUHJvcGVydHkoZCk7XG4gIH0sIHRoaXMpO1xufTtcblxuVmlldy5wcm90b3R5cGUuX2J1aWxkUHJvcGVydHkgPSBmdW5jdGlvbiAoZGF0YSkge1xuICB2YXIgdmFsdWUsXG4gICAgZGF0YUVsZSxcbiAgICBkYXRhRWxlcyxcbiAgICBkYXRhTmFtZSA9IF8uY2FtZWxDYXNlKGRhdGEpLFxuICAgIHNlbGVjdG9yID0gJ1tkYXRhLScrZGF0YSsnXSc7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBkYXRhTmFtZSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhRWxlID0gdGhpcy5lbGUucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICBpZiAoZGF0YUVsZSkge1xuICAgICAgICB2YWx1ZSA9ICghIWRhdGFFbGUudmFsdWUpPyBkYXRhRWxlLnZhbHVlIDogZGF0YUVsZS5pbm5lckhUTUw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICBkYXRhRWxlcyA9IHRoaXMuZWxlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBfLmVhY2goZGF0YUVsZXMsIGZ1bmN0aW9uIChkYXRhRWxlKSB7XG4gICAgICAgICAgaWYgKCEhZGF0YUVsZS52YWx1ZSkge1xuICAgICAgICAgICAgZGF0YUVsZS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhRWxlLmlubmVySFRNTCA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cblZpZXcucHJvdG90eXBlLl9idWlsZE1ldGhvZHMgPSBmdW5jdGlvbiAobWV0aG9kcykge1xuICBfLmVhY2hJbihtZXRob2RzLCBmdW5jdGlvbiAobWV0aG9kTmFtZSwgbWV0aG9kKSB7XG4gICAgdGhpc1ttZXRob2ROYW1lXSA9IG1ldGhvZDtcbiAgfSwgdGhpcyk7XG59O1xuXG5WaWV3LnByb3RvdHlwZS5fYnVpbGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uIChldmVudHMpIHtcbiAgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
