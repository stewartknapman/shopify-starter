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
      if (!value) {
        dataEle = this.ele.querySelector(selector);
        value = (!!dataEle.value)? dataEle.value : dataEle.innerHTML;
      }
      return value;
    },
    set: function (newValue) {
      if (newValue !== value) {
        value = newValue;      
        dataEles = dataEles || this.ele.querySelectorAll(selector);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NhcnQuanMiLCJfc3JjL2pzL21vZHVsZXMvY2FydC1jb3VudC5qcyIsIl9zcmMvanMvdmlldy92aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gIENhcnRcbiAgLSBjYXJ0IGNvdW50XG4gIC0gY2FydCB0ZW1wbGF0ZVxuICAtIG1pY3JvIGNhcnQgKGlmIGRpZmZlcmVudCB0byBjYXJ0IHRlbXBsYXRlKVxuKi9cblxuLy8gQ2hlY2sgdGhhdCB3ZSBoYXZlIHdoYXQgd2UgbmVlZCB0byBtb3ZlIGZvcndhcmRcbnZhciBzdXBwb3J0cyA9ICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvciAmJiAhIXdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuaWYgKCFzdXBwb3J0cykgcmV0dXJuO1xuXG53aW5kb3cuVGhlbWUgPSB3aW5kb3cuVGhlbWUgfHwge307XG5cbnZhciBjYXJ0Q291bnQgPSBUaGVtZS5jYXJ0Q291bnQgPSByZXF1aXJlKCcuL21vZHVsZXMvY2FydC1jb3VudC5qcycpO1xuXG5UaGVtZS5fLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ0NBUlQgcmVhZHknKTtcbiAgY2FydENvdW50LmluaXQoKTtcbn0pOyIsInZhciBWaWV3ID0gcmVxdWlyZSgnLi4vdmlldy92aWV3LmpzJyk7XG52YXIgY2FydENvdW50ID0gbmV3IFZpZXcoe1xuICBlbGU6ICdbZGF0YS1jYXJ0LWNvdW50XScsXG4gIGRhdGE6IFtcbiAgICAnaXRlbS1jb3VudCcsXG4gICAgJ2NhcnQtdG90YWwnXG4gIF1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBjYXJ0Q291bnQ7IiwiLypcbnZhciB2aWV3ID0gbmV3IFZpZXcoe1xuICBlbGU6ICdtYXN0ZXIgZWxlbWVudCcsXG4gIHRlbXBsYXRlOiAnI2lkIG9mIHRlbXBsYXRlIDxzY3JpcHQ+JywgLy8gbm90IDEwMCUgc3VyZSBob3cgdGhpcyB3b3JrcyBvciBJRiB3ZSBuZWVkIGl0XG4gIGRhdGE6IFsgLy8gc2V0IHByb3BzIG9uIG9iamVjdCBhbmQgYmluZCB0byBlbGVzIHdpdGggZGF0YS1hdHRyc1xuICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gdXBkYXRlIHRoZXNlIG9uIHBhZ2UgbG9hZCBhcyB0aGV5IHNob3VsZCBiZSBnb29kIGZyb20gdGhlIGxpcXVpZCwgc28gbm8gdmFsdWUgbmVlZGVkXG4gICAgcHJvcDEsXG4gICAgcHJvcDJcbiAgXSxcbiAgZXZlbnRzOiB7IC8vIEV2ZW50cyB0byBsaXN0ZW4gdG8uIE9iaiBjYW4gdXNlIHRyaWdnZXIoKSB0byBvbWl0IGN1c3RvbSBldmVudHNcbiAgICAnZXZlbnROYW1lIHNlbGVjdG9yJzogJ21ldGhvZCcsIC8vIERPTSBldmVudCBpLmUuIGNsaWNrXG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBteU1ldGhvZDogZnVuY3Rpb24gKCkge31cbiAgfVxufSk7XG5cbnZpZXcuaW5pdCgpO1xuXG4vLyBjdXN0b20gZXZlbnRzPyBUaGlzIHdpbGwgYmUgZG9uZSBpbiB0aGUgbWFpbiBmaWxlXG52YXIgdjEsIHYyO1xudjEub24oJ2V2bnQnLCBmdW5jdGlvbiAoKSB7XG4gIHYyLnNvbWV0aGluZygpO1xufSk7XG5cbiovXG5cbnZhciBfID0gVGhlbWUuXztcbnZhciBWaWV3ID0gZnVuY3Rpb24gKG9wdHMpIHtcbiAgaWYgKCFvcHRzLmVsZSkgcmV0dXJuO1xuICB0aGlzLmVsZSA9IG9wdHMuZWxlO1xuICB0aGlzLnRlbXBsYXRlID0gb3B0cy50ZW1wbGF0ZSB8fCBmYWxzZTtcbiAgXG4gIGlmIChvcHRzLmRhdGEpIHRoaXMuX2J1aWxkUHJvcGVydGllcyhvcHRzLmRhdGEpO1xuICBpZiAob3B0cy5tZXRob2RzKSB0aGlzLl9idWlsZE1ldGhvZHMob3B0cy5tZXRob2RzKTtcbiAgXG4gIGNvbnNvbGUubG9nKCdWSUVXJyk7XG59O1xuXG4vLyBQdWJsaWMgbWV0aG9kc1xuVmlldy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5lbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuZWxlKTtcbiAgaWYgKHRoaXMudGVtcGxhdGUpIHRoaXMudGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMudGVtcGxhdGUpO1xuICBpZiAodGhpcy5ldmVudHMpIHRoaXMuX2J1aWxkRXZlbnRMaXN0ZW5lcnModGhpcy5ldmVudHMpO1xuICBcbiAgY29uc29sZS5sb2coJ1ZJRVcgSU5JVCcpO1xufTtcblxuLy8gUHJpdmF0ZSBtZXRob2RzXG5WaWV3LnByb3RvdHlwZS5fYnVpbGRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgXy5lYWNoKGRhdGEsIGZ1bmN0aW9uIChkKSB7XG4gICAgdGhpcy5fYnVpbGRQcm9wZXJ0eShkKTtcbiAgfSwgdGhpcyk7XG59O1xuXG5WaWV3LnByb3RvdHlwZS5fYnVpbGRQcm9wZXJ0eSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIHZhciB2YWx1ZSxcbiAgICBkYXRhRWxlLFxuICAgIGRhdGFFbGVzLFxuICAgIGRhdGFOYW1lID0gXy5jYW1lbENhc2UoZGF0YSksXG4gICAgc2VsZWN0b3IgPSAnW2RhdGEtJytkYXRhKyddJztcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGRhdGFOYW1lLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgZGF0YUVsZSA9IHRoaXMuZWxlLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB2YWx1ZSA9ICghIWRhdGFFbGUudmFsdWUpPyBkYXRhRWxlLnZhbHVlIDogZGF0YUVsZS5pbm5lckhUTUw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IG5ld1ZhbHVlOyAgICAgIFxuICAgICAgICBkYXRhRWxlcyA9IGRhdGFFbGVzIHx8IHRoaXMuZWxlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgICAgICBfLmVhY2goZGF0YUVsZXMsIGZ1bmN0aW9uIChkYXRhRWxlKSB7XG4gICAgICAgICAgaWYgKCEhZGF0YUVsZS52YWx1ZSkge1xuICAgICAgICAgICAgZGF0YUVsZS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhRWxlLmlubmVySFRNTCA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn07XG5cblZpZXcucHJvdG90eXBlLl9idWlsZE1ldGhvZHMgPSBmdW5jdGlvbiAoZGF0YSkge1xuICBcbn07XG5cblZpZXcucHJvdG90eXBlLl9idWlsZEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50cykge1xuICBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiXX0=
