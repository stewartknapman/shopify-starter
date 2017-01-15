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
  events: {
    
  },
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NhcnQuanMiLCJfc3JjL2pzL21vZHVsZXMvY2FydC1jb3VudC5qcyIsIl9zcmMvanMvdXRpbHMvX2V2ZW50ZXIuanMiLCJfc3JjL2pzL3ZpZXcvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAgQ2FydFxuICAtIGNhcnQgY291bnRcbiAgLSBjYXJ0IHRlbXBsYXRlXG4gIC0gbWljcm8gY2FydCAoaWYgZGlmZmVyZW50IHRvIGNhcnQgdGVtcGxhdGUpXG4qL1xuXG4vLyBDaGVjayB0aGF0IHdlIGhhdmUgd2hhdCB3ZSBuZWVkIHRvIG1vdmUgZm9yd2FyZFxudmFyIHN1cHBvcnRzID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yICYmICEhd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5pZiAoIXN1cHBvcnRzKSByZXR1cm47XG5cbndpbmRvdy5UaGVtZSA9IHdpbmRvdy5UaGVtZSB8fCB7fTtcblxudmFyIGNhcnRDb3VudCA9IFRoZW1lLmNhcnRDb3VudCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jYXJ0LWNvdW50LmpzJyk7XG5cblRoZW1lLl8ucmVhZHkoZnVuY3Rpb24gKCkge1xuICBjYXJ0Q291bnQuaXRlbUNvdW50IC8vIHN1cHJlc3MgYnVpbGQgd2FybmluZ1xuLy8gICBjb25zb2xlLmxvZygnQ0FSVCByZWFkeScsIGNhcnRDb3VudC5pdGVtQ291bnQpO1xufSk7IiwidmFyIFZpZXcgPSByZXF1aXJlKCcuLi92aWV3L3ZpZXcuanMnKTtcbnZhciBjYXJ0Q291bnQgPSBuZXcgVmlldyh7XG4gIGVsZTogJ1tkYXRhLWNhcnQtY291bnRdJyxcbiAgZGF0YTogW1xuICAgICdpdGVtLWNvdW50JyxcbiAgICAnY2FydC10b3RhbCdcbiAgXSxcbiAgZXZlbnRzOiB7XG4gICAgXG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBhZnRlckluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjYXJ0Q291bnQgYWZ0ZXJJbml0Jyk7XG4gICAgfSxcbiAgICB0ZXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnbWV0aG9kIHRlc3QnLCB0aGlzKTtcbiAgICAgIHRoaXMuaXRlbUNvdW50ID0gMTtcbiAgICB9XG4gIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBjYXJ0Q291bnQ7IiwidmFyIEV2ZW50ZXIgPSBmdW5jdGlvbiAoY2FsbGVyKSB7XG4gIHRoaXMuY2FsbGVyID0gY2FsbGVyO1xuICB0aGlzLmNhbGxlci5fZXZlbnRzID0ge307XG4gIHRoaXMuY2FsbGVyLm9uID0gdGhpcy5vbjtcbiAgdGhpcy5jYWxsZXIub2ZmID0gdGhpcy5vZmY7XG4gIHRoaXMuY2FsbGVyLnRyaWdnZXIgPSB0aGlzLnRyaWdnZXI7XG59O1xuXG4vLyB0aGlzID09PSBjYWxsZXIgbm90IEV2ZW50ZXJcbkV2ZW50ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaykge1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcbiAgdGhpcy5fZXZlbnRzW2V2ZW50XS5wdXNoKGNhbGxiYWNrKTtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c1tldmVudF0ubGVuZ3RoIC0gMTtcbn07XG5cbkV2ZW50ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgaWQpIHtcbiAgaWYgKGV2ZW50ICYmIGlkKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudF1baWRdKSB0aGlzLl9ldmVudHNbZXZlbnRdW2lkXSA9IG51bGw7XG4gIH0gZWxzZSBpZiAoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gIH1cbn07XG5cbkV2ZW50ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcbiAgaWYgKHR5cGVvZiBhcmdzICE9PSAnb2JqZWN0JykgYXJncyA9IFthcmdzXTsgXG4gIGZvciAodmFyIGkgaW4gdGhpcy5fZXZlbnRzW2V2ZW50XSkge1xuICAgIHZhciBlID0gdGhpcy5fZXZlbnRzW2V2ZW50XVtpXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2ZW50XS5oYXNPd25Qcm9wZXJ0eShpKSAmJiB0eXBlb2YgZSA9PT0gJ2Z1bmN0aW9uJykgZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGVyOyIsIi8qXG52YXIgdmlldyA9IG5ldyBWaWV3KHtcbiAgZWxlOiAnbWFzdGVyIGVsZW1lbnQnLFxuICB0ZW1wbGF0ZTogJyNpZCBvZiB0ZW1wbGF0ZSA8c2NyaXB0PicsIC8vIG5vdCAxMDAlIHN1cmUgaG93IHRoaXMgd29ya3Mgb3IgSUYgd2UgbmVlZCBpdFxuICBkYXRhOiBbIC8vIHNldCBwcm9wcyBvbiBvYmplY3QgYW5kIGJpbmQgdG8gZWxlcyB3aXRoIGRhdGEtYXR0cnNcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIHVwZGF0ZSB0aGVzZSBvbiBwYWdlIGxvYWQgYXMgdGhleSBzaG91bGQgYmUgZ29vZCBmcm9tIHRoZSBsaXF1aWQsIHNvIG5vIHZhbHVlIG5lZWRlZFxuICAgIHByb3AxLFxuICAgIHByb3AyXG4gIF0sXG4gIGV2ZW50czogeyAvLyBFdmVudHMgdG8gbGlzdGVuIHRvLiBPYmogY2FuIHVzZSB0cmlnZ2VyKCkgdG8gb21pdCBjdXN0b20gZXZlbnRzXG4gICAgJ2V2ZW50TmFtZSBzZWxlY3Rvcic6ICdtZXRob2QnLCAvLyBET00gZXZlbnQgaS5lLiBjbGlja1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgbXlNZXRob2Q6IGZ1bmN0aW9uICgpIHt9XG4gIH1cbn0pO1xuXG52aWV3LmluaXQoKTtcblxuLy8gY3VzdG9tIGV2ZW50cz8gVGhpcyB3aWxsIGJlIGRvbmUgaW4gdGhlIG1haW4gZmlsZVxudmFyIHYxLCB2MjtcbnYxLm9uKCdldm50JywgZnVuY3Rpb24gKCkge1xuICB2Mi5zb21ldGhpbmcoKTtcbn0pO1xuXG4qL1xuXG52YXIgXyA9IFRoZW1lLl87XG52YXIgRXZlbnRlciA9IHJlcXVpcmUoJy4uL3V0aWxzL19ldmVudGVyLmpzJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24gKG9wdHMpIHtcbiAgaWYgKCFvcHRzLmVsZSkgcmV0dXJuO1xuICB0aGlzLmVsZSA9IG9wdHMuZWxlO1xuICBcbiAgLy8gU2V0IHZpZXcgcHJvcGVydGllcyBhbmQgbWV0aG9kc1xuICBpZiAob3B0cy5kYXRhKSB0aGlzLl9idWlsZFByb3BlcnRpZXMob3B0cy5kYXRhKTtcbiAgaWYgKG9wdHMubWV0aG9kcykgdGhpcy5fYnVpbGRNZXRob2RzKG9wdHMubWV0aG9kcyk7XG4gIFxuICAvLyBHaXZlIHZpZXcgY3VzdG9tIGV2ZW50c1xuICBuZXcgRXZlbnRlcih0aGlzKTtcbiAgXG4gIF8ucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfSwgdGhpcyk7XG59O1xuXG4vLyBQcml2YXRlIG1ldGhvZHNcblZpZXcucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmVsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5lbGUpO1xuICBpZiAodGhpcy50ZW1wbGF0ZSkgdGhpcy50ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy50ZW1wbGF0ZSk7XG4gIGlmICh0aGlzLmV2ZW50cykgdGhpcy5fYnVpbGRFdmVudExpc3RlbmVycyh0aGlzLmV2ZW50cyk7XG4gIGlmICh0aGlzLmFmdGVySW5pdCkgdGhpcy5hZnRlckluaXQoKTtcbn07XG5cblZpZXcucHJvdG90eXBlLl9idWlsZFByb3BlcnRpZXMgPSBmdW5jdGlvbiAoZGF0YSkge1xuICBfLmVhY2goZGF0YSwgZnVuY3Rpb24gKGQpIHtcbiAgICB0aGlzLl9idWlsZFByb3BlcnR5KGQpO1xuICB9LCB0aGlzKTtcbn07XG5cblZpZXcucHJvdG90eXBlLl9idWlsZFByb3BlcnR5ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgdmFyIHZhbHVlLFxuICAgIGRhdGFFbGUsXG4gICAgZGF0YUVsZXMsXG4gICAgZGF0YU5hbWUgPSBfLmNhbWVsQ2FzZShkYXRhKSxcbiAgICBzZWxlY3RvciA9ICdbZGF0YS0nK2RhdGErJ10nO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgZGF0YU5hbWUsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YUVsZSA9IHRoaXMuZWxlLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgaWYgKGRhdGFFbGUpIHtcbiAgICAgICAgdmFsdWUgPSAoISFkYXRhRWxlLnZhbHVlKT8gZGF0YUVsZS52YWx1ZSA6IGRhdGFFbGUuaW5uZXJIVE1MO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgZGF0YUVsZXMgPSB0aGlzLmVsZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgICAgXy5lYWNoKGRhdGFFbGVzLCBmdW5jdGlvbiAoZGF0YUVsZSkge1xuICAgICAgICAgIGlmICghIWRhdGFFbGUudmFsdWUpIHtcbiAgICAgICAgICAgIGRhdGFFbGUudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YUVsZS5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG5WaWV3LnByb3RvdHlwZS5fYnVpbGRNZXRob2RzID0gZnVuY3Rpb24gKG1ldGhvZHMpIHtcbiAgXy5lYWNoSW4obWV0aG9kcywgZnVuY3Rpb24gKG1ldGhvZE5hbWUsIG1ldGhvZCkge1xuICAgIHRoaXNbbWV0aG9kTmFtZV0gPSBtZXRob2Q7XG4gIH0sIHRoaXMpO1xufTtcblxuVmlldy5wcm90b3R5cGUuX2J1aWxkRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoZXZlbnRzKSB7XG4gIFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyJdfQ==
