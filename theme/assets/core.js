(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if (!supports) return;

// Modules needed for core js
window._ = require('./utils/_lib.js');

_.ready(function () {
  console.log('ready');
});
},{"./utils/_lib.js":2}],2:[function(require,module,exports){
module.exports = {
  /*
    Array Functions
  */
  // For each item in Array
  each: function (arr, callback, ctx) {
    for (var i = 0; i < arr.length; i++) {
      ctx = ctx || arr[i];
      callback.apply(ctx, [arr[i], i]);
    }
  },
  
  // For each item in Object
  eachIn: function (obj, callback, ctx) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        ctx = ctx || obj[k];
        callback.apply(ctx, [obj[k], k]);
      }
    }
  },
  
  // Return true if item is in Array
  inArray: function (needle, haystack) {
    var found = false;
    this.each(haystack, function (hay) {
      if (needle === hay) found = true;
    });
    return found;
  },
  
  // return the last item in the array
  last: function (arr) {
    return arr[arr.length - 1];
  },
  
  
  /*
    String Functions
  */
  // Captialse the first char in String
  capitalise: function (str) {
    return str[0].toUpperCase() + str.slice(1);
  },
  
  
  /*
    Event Functions
  */
  // Run code when the page is ready
  ready: function (callback, ctx) {
    if (typeof callback !== 'function') return;
    
    if (document.readyState !== 'loading') {
      callback.apply(ctx);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        callback.apply(ctx);
      });
    }
  },
  
  // CUSTOM FUNC for seido to trigger things when the core is ready
  readyCore: function (callback, ctx) {
    if (typeof callback !== 'function') return;
    
    if (window.SeidoCore.ready) {
      callback.apply(ctx);
    } else {
      window.SeidoCore.on('ready', function () {
        callback.apply(ctx);
      });
    }
  },
  
  // Make thing not happen until finished?
  // i.e. don't act on every window resize event, just the last one when we need it.
  debounce: function (callback, wait, ctx) {
    var timeout, timestamp, args;
    wait = wait || 100;
    
    var later = function() {
      var last = new Date().getTime() - timestamp;
      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        callback.apply(ctx, args);
      }
    };
    
    return function () {
      ctx = ctx || this;
      args = arguments;
      timestamp = new Date().getTime();
      if (!timeout) timeout = setTimeout(later, wait);
    };
  },
  
  // Don't swamp us with events
  // good for things like scroll and resize
  throttle: function (callback, limit, ctx) {
    limit = limit || 200;
    var wait = false;
    return function () {
      if (!wait) {
        callback.apply(ctx, arguments);
        wait = true;
        setTimeout(function () {
          wait = false;
        }, limit);
      }
    }
  }
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NvcmUuanMiLCJfc3JjL2pzL3V0aWxzL19saWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBDaGVjayB0aGF0IHdlIGhhdmUgd2hhdCB3ZSBuZWVkIHRvIG1vdmUgZm9yd2FyZFxudmFyIHN1cHBvcnRzID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yICYmICEhd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5pZiAoIXN1cHBvcnRzKSByZXR1cm47XG5cbi8vIE1vZHVsZXMgbmVlZGVkIGZvciBjb3JlIGpzXG53aW5kb3cuXyA9IHJlcXVpcmUoJy4vdXRpbHMvX2xpYi5qcycpO1xuXG5fLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ3JlYWR5Jyk7XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLypcbiAgICBBcnJheSBGdW5jdGlvbnNcbiAgKi9cbiAgLy8gRm9yIGVhY2ggaXRlbSBpbiBBcnJheVxuICBlYWNoOiBmdW5jdGlvbiAoYXJyLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGN0eCA9IGN0eCB8fCBhcnJbaV07XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgsIFthcnJbaV0sIGldKTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBGb3IgZWFjaCBpdGVtIGluIE9iamVjdFxuICBlYWNoSW46IGZ1bmN0aW9uIChvYmosIGNhbGxiYWNrLCBjdHgpIHtcbiAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICBjdHggPSBjdHggfHwgb2JqW2tdO1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIFtvYmpba10sIGtdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFxuICAvLyBSZXR1cm4gdHJ1ZSBpZiBpdGVtIGlzIGluIEFycmF5XG4gIGluQXJyYXk6IGZ1bmN0aW9uIChuZWVkbGUsIGhheXN0YWNrKSB7XG4gICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgdGhpcy5lYWNoKGhheXN0YWNrLCBmdW5jdGlvbiAoaGF5KSB7XG4gICAgICBpZiAobmVlZGxlID09PSBoYXkpIGZvdW5kID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0sXG4gIFxuICAvLyByZXR1cm4gdGhlIGxhc3QgaXRlbSBpbiB0aGUgYXJyYXlcbiAgbGFzdDogZnVuY3Rpb24gKGFycikge1xuICAgIHJldHVybiBhcnJbYXJyLmxlbmd0aCAtIDFdO1xuICB9LFxuICBcbiAgXG4gIC8qXG4gICAgU3RyaW5nIEZ1bmN0aW9uc1xuICAqL1xuICAvLyBDYXB0aWFsc2UgdGhlIGZpcnN0IGNoYXIgaW4gU3RyaW5nXG4gIGNhcGl0YWxpc2U6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICByZXR1cm4gc3RyWzBdLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG4gIH0sXG4gIFxuICBcbiAgLypcbiAgICBFdmVudCBGdW5jdGlvbnNcbiAgKi9cbiAgLy8gUnVuIGNvZGUgd2hlbiB0aGUgcGFnZSBpcyByZWFkeVxuICByZWFkeTogZnVuY3Rpb24gKGNhbGxiYWNrLCBjdHgpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gICAgXG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJykge1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8vIENVU1RPTSBGVU5DIGZvciBzZWlkbyB0byB0cmlnZ2VyIHRoaW5ncyB3aGVuIHRoZSBjb3JlIGlzIHJlYWR5XG4gIHJlYWR5Q29yZTogZnVuY3Rpb24gKGNhbGxiYWNrLCBjdHgpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gICAgXG4gICAgaWYgKHdpbmRvdy5TZWlkb0NvcmUucmVhZHkpIHtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5TZWlkb0NvcmUub24oJ3JlYWR5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gTWFrZSB0aGluZyBub3QgaGFwcGVuIHVudGlsIGZpbmlzaGVkP1xuICAvLyBpLmUuIGRvbid0IGFjdCBvbiBldmVyeSB3aW5kb3cgcmVzaXplIGV2ZW50LCBqdXN0IHRoZSBsYXN0IG9uZSB3aGVuIHdlIG5lZWQgaXQuXG4gIGRlYm91bmNlOiBmdW5jdGlvbiAoY2FsbGJhY2ssIHdhaXQsIGN0eCkge1xuICAgIHZhciB0aW1lb3V0LCB0aW1lc3RhbXAsIGFyZ3M7XG4gICAgd2FpdCA9IHdhaXQgfHwgMTAwO1xuICAgIFxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRpbWVzdGFtcDtcbiAgICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID49IDApIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3MpO1xuICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGN0eCA9IGN0eCB8fCB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgaWYgKCF0aW1lb3V0KSB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgfTtcbiAgfSxcbiAgXG4gIC8vIERvbid0IHN3YW1wIHVzIHdpdGggZXZlbnRzXG4gIC8vIGdvb2QgZm9yIHRoaW5ncyBsaWtlIHNjcm9sbCBhbmQgcmVzaXplXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoY2FsbGJhY2ssIGxpbWl0LCBjdHgpIHtcbiAgICBsaW1pdCA9IGxpbWl0IHx8IDIwMDtcbiAgICB2YXIgd2FpdCA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXdhaXQpIHtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB3YWl0ID0gdHJ1ZTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgd2FpdCA9IGZhbHNlO1xuICAgICAgICB9LCBsaW1pdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59OyJdfQ==
