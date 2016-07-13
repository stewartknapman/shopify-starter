(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20150312
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

module.exports = function () {

if ("document" in self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
if (!("classList" in document.createElement("_")) 
	|| document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

}

}
},{}],3:[function(require,module,exports){
module.exports = function () {
  var forEach = [].forEach,
      regex = /^data-(.+)/,
      dashChar = /\-([a-z])/ig
      el = document.createElement('div');
      
  if (el.dataset != undefined) return;
  
  function toCamelCase(s) {
    return s.replace(dashChar, function (m,l) { return l.toUpperCase(); });
  }
  
  Object.defineProperty(Element.prototype, 'dataset', {
    get: function () {
      var dataset = {};
      forEach.call(this.attributes, function(attr) {
        if (match = attr.name.match(regex))
          dataset[toCamelCase(match[1])] = attr.value;
      });
      return dataset;
    }
  });
};
},{}],4:[function(require,module,exports){
module.exports = function () {
  if (!window.getComputedStyle) {
    window.getComputedStyle = function(el, pseudo) {
      this.el = el;
      this.getPropertyValue = function(prop) {
        var re = /(\-([a-z]){1})/g;
        if (prop == 'float') prop = 'styleFloat';
        if (re.test(prop)) {
          prop = prop.replace(re, function () {
            return arguments[2].toUpperCase();
          });
        }
        return el.currentStyle[prop] ? el.currentStyle[prop] : null;
      };
      return this;
    };
  }
}
},{}],5:[function(require,module,exports){
// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if ( !supports ) return;

// Pollyfills to add functionality to older browsers
require('./_pollyfills/pollyfill.dataset.js')();
require('./_pollyfills/pollyfill.classlist.js')();
require('./_pollyfills/pollyfill.getComputedStyle.js')();

// Modules needed for core js
var _ = require('./_lib.js');


_.ready(function () {
  
});
},{"./_lib.js":1,"./_pollyfills/pollyfill.classlist.js":2,"./_pollyfills/pollyfill.dataset.js":3,"./_pollyfills/pollyfill.getComputedStyle.js":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL19saWIuanMiLCJfc3JjL2pzL19wb2xseWZpbGxzL3BvbGx5ZmlsbC5jbGFzc2xpc3QuanMiLCJfc3JjL2pzL19wb2xseWZpbGxzL3BvbGx5ZmlsbC5kYXRhc2V0LmpzIiwiX3NyYy9qcy9fcG9sbHlmaWxscy9wb2xseWZpbGwuZ2V0Q29tcHV0ZWRTdHlsZS5qcyIsIl9zcmMvanMvY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qXG4gICAgQXJyYXkgRnVuY3Rpb25zXG4gICovXG4gIC8vIEZvciBlYWNoIGl0ZW0gaW4gQXJyYXlcbiAgZWFjaDogZnVuY3Rpb24gKGFyciwgY2FsbGJhY2ssIGN0eCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjdHggPSBjdHggfHwgYXJyW2ldO1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBbYXJyW2ldLCBpXSk7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gRm9yIGVhY2ggaXRlbSBpbiBPYmplY3RcbiAgZWFjaEluOiBmdW5jdGlvbiAob2JqLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgY3R4ID0gY3R4IHx8IG9ialtrXTtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBbb2JqW2tdLCBrXSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcbiAgLy8gUmV0dXJuIHRydWUgaWYgaXRlbSBpcyBpbiBBcnJheVxuICBpbkFycmF5OiBmdW5jdGlvbiAobmVlZGxlLCBoYXlzdGFjaykge1xuICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgIHRoaXMuZWFjaChoYXlzdGFjaywgZnVuY3Rpb24gKGhheSkge1xuICAgICAgaWYgKG5lZWRsZSA9PT0gaGF5KSBmb3VuZCA9IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZvdW5kO1xuICB9LFxuICBcbiAgLy8gcmV0dXJuIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGFycmF5XG4gIGxhc3Q6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXTtcbiAgfSxcbiAgXG4gIFxuICAvKlxuICAgIFN0cmluZyBGdW5jdGlvbnNcbiAgKi9cbiAgLy8gQ2FwdGlhbHNlIHRoZSBmaXJzdCBjaGFyIGluIFN0cmluZ1xuICBjYXBpdGFsaXNlOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0clswXS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xuICB9LFxuICBcbiAgXG4gIC8qXG4gICAgRXZlbnQgRnVuY3Rpb25zXG4gICovXG4gIC8vIFJ1biBjb2RlIHdoZW4gdGhlIHBhZ2UgaXMgcmVhZHlcbiAgcmVhZHk6IGZ1bmN0aW9uIChjYWxsYmFjaywgY3R4KSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgIFxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBDVVNUT00gRlVOQyBmb3Igc2VpZG8gdG8gdHJpZ2dlciB0aGluZ3Mgd2hlbiB0aGUgY29yZSBpcyByZWFkeVxuICByZWFkeUNvcmU6IGZ1bmN0aW9uIChjYWxsYmFjaywgY3R4KSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgIFxuICAgIGlmICh3aW5kb3cuU2VpZG9Db3JlLnJlYWR5KSB7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuU2VpZG9Db3JlLm9uKCdyZWFkeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8vIE1ha2UgdGhpbmcgbm90IGhhcHBlbiB1bnRpbCBmaW5pc2hlZD9cbiAgLy8gaS5lLiBkb24ndCBhY3Qgb24gZXZlcnkgd2luZG93IHJlc2l6ZSBldmVudCwganVzdCB0aGUgbGFzdCBvbmUgd2hlbiB3ZSBuZWVkIGl0LlxuICBkZWJvdW5jZTogZnVuY3Rpb24gKGNhbGxiYWNrLCB3YWl0LCBjdHgpIHtcbiAgICB2YXIgdGltZW91dCwgdGltZXN0YW1wLCBhcmdzO1xuICAgIHdhaXQgPSB3YWl0IHx8IDEwMDtcbiAgICBcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lc3RhbXA7XG4gICAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+PSAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBjdHggPSBjdHggfHwgdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIGlmICghdGltZW91dCkgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgIH07XG4gIH0sXG4gIFxuICAvLyBEb24ndCBzd2FtcCB1cyB3aXRoIGV2ZW50c1xuICAvLyBnb29kIGZvciB0aGluZ3MgbGlrZSBzY3JvbGwgYW5kIHJlc2l6ZVxuICB0aHJvdHRsZTogZnVuY3Rpb24gKGNhbGxiYWNrLCBsaW1pdCwgY3R4KSB7XG4gICAgbGltaXQgPSBsaW1pdCB8fCAyMDA7XG4gICAgdmFyIHdhaXQgPSBmYWxzZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF3YWl0KSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgd2FpdCA9IHRydWU7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHdhaXQgPSBmYWxzZTtcbiAgICAgICAgfSwgbGltaXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTsiLCIvKlxuICogY2xhc3NMaXN0LmpzOiBDcm9zcy1icm93c2VyIGZ1bGwgZWxlbWVudC5jbGFzc0xpc3QgaW1wbGVtZW50YXRpb24uXG4gKiAxLjEuMjAxNTAzMTJcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBMaWNlbnNlOiBEZWRpY2F0ZWQgdG8gdGhlIHB1YmxpYyBkb21haW4uXG4gKiAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZWxpZ3JleS9jbGFzc0xpc3QuanMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuICovXG5cbi8qZ2xvYmFsIHNlbGYsIGRvY3VtZW50LCBET01FeGNlcHRpb24gKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL2NsYXNzTGlzdC5qcy9ibG9iL21hc3Rlci9jbGFzc0xpc3QuanMgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbmlmIChcImRvY3VtZW50XCIgaW4gc2VsZikge1xuXG4vLyBGdWxsIHBvbHlmaWxsIGZvciBicm93c2VycyB3aXRoIG5vIGNsYXNzTGlzdCBzdXBwb3J0XG4vLyBJbmNsdWRpbmcgSUUgPCBFZGdlIG1pc3NpbmcgU1ZHRWxlbWVudC5jbGFzc0xpc3RcbmlmICghKFwiY2xhc3NMaXN0XCIgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIikpIFxuXHR8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgIShcImNsYXNzTGlzdFwiIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXCJnXCIpKSkge1xuXG4oZnVuY3Rpb24gKHZpZXcpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmlmICghKCdFbGVtZW50JyBpbiB2aWV3KSkgcmV0dXJuO1xuXG52YXJcblx0ICBjbGFzc0xpc3RQcm9wID0gXCJjbGFzc0xpc3RcIlxuXHQsIHByb3RvUHJvcCA9IFwicHJvdG90eXBlXCJcblx0LCBlbGVtQ3RyUHJvdG8gPSB2aWV3LkVsZW1lbnRbcHJvdG9Qcm9wXVxuXHQsIG9iakN0ciA9IE9iamVjdFxuXHQsIHN0clRyaW0gPSBTdHJpbmdbcHJvdG9Qcm9wXS50cmltIHx8IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCBcIlwiKTtcblx0fVxuXHQsIGFyckluZGV4T2YgPSBBcnJheVtwcm90b1Byb3BdLmluZGV4T2YgfHwgZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHR2YXJcblx0XHRcdCAgaSA9IDBcblx0XHRcdCwgbGVuID0gdGhpcy5sZW5ndGhcblx0XHQ7XG5cdFx0Zm9yICg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0aWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSB7XG5cdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gLTE7XG5cdH1cblx0Ly8gVmVuZG9yczogcGxlYXNlIGFsbG93IGNvbnRlbnQgY29kZSB0byBpbnN0YW50aWF0ZSBET01FeGNlcHRpb25zXG5cdCwgRE9NRXggPSBmdW5jdGlvbiAodHlwZSwgbWVzc2FnZSkge1xuXHRcdHRoaXMubmFtZSA9IHR5cGU7XG5cdFx0dGhpcy5jb2RlID0gRE9NRXhjZXB0aW9uW3R5cGVdO1xuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH1cblx0LCBjaGVja1Rva2VuQW5kR2V0SW5kZXggPSBmdW5jdGlvbiAoY2xhc3NMaXN0LCB0b2tlbikge1xuXHRcdGlmICh0b2tlbiA9PT0gXCJcIikge1xuXHRcdFx0dGhyb3cgbmV3IERPTUV4KFxuXHRcdFx0XHQgIFwiU1lOVEFYX0VSUlwiXG5cdFx0XHRcdCwgXCJBbiBpbnZhbGlkIG9yIGlsbGVnYWwgc3RyaW5nIHdhcyBzcGVjaWZpZWRcIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0aWYgKC9cXHMvLnRlc3QodG9rZW4pKSB7XG5cdFx0XHR0aHJvdyBuZXcgRE9NRXgoXG5cdFx0XHRcdCAgXCJJTlZBTElEX0NIQVJBQ1RFUl9FUlJcIlxuXHRcdFx0XHQsIFwiU3RyaW5nIGNvbnRhaW5zIGFuIGludmFsaWQgY2hhcmFjdGVyXCJcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBhcnJJbmRleE9mLmNhbGwoY2xhc3NMaXN0LCB0b2tlbik7XG5cdH1cblx0LCBDbGFzc0xpc3QgPSBmdW5jdGlvbiAoZWxlbSkge1xuXHRcdHZhclxuXHRcdFx0ICB0cmltbWVkQ2xhc3NlcyA9IHN0clRyaW0uY2FsbChlbGVtLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpXG5cdFx0XHQsIGNsYXNzZXMgPSB0cmltbWVkQ2xhc3NlcyA/IHRyaW1tZWRDbGFzc2VzLnNwbGl0KC9cXHMrLykgOiBbXVxuXHRcdFx0LCBpID0gMFxuXHRcdFx0LCBsZW4gPSBjbGFzc2VzLmxlbmd0aFxuXHRcdDtcblx0XHRmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHR0aGlzLnB1c2goY2xhc3Nlc1tpXSk7XG5cdFx0fVxuXHRcdHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGVsZW0uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy50b1N0cmluZygpKTtcblx0XHR9O1xuXHR9XG5cdCwgY2xhc3NMaXN0UHJvdG8gPSBDbGFzc0xpc3RbcHJvdG9Qcm9wXSA9IFtdXG5cdCwgY2xhc3NMaXN0R2V0dGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgQ2xhc3NMaXN0KHRoaXMpO1xuXHR9XG47XG4vLyBNb3N0IERPTUV4Y2VwdGlvbiBpbXBsZW1lbnRhdGlvbnMgZG9uJ3QgYWxsb3cgY2FsbGluZyBET01FeGNlcHRpb24ncyB0b1N0cmluZygpXG4vLyBvbiBub24tRE9NRXhjZXB0aW9ucy4gRXJyb3IncyB0b1N0cmluZygpIGlzIHN1ZmZpY2llbnQgaGVyZS5cbkRPTUV4W3Byb3RvUHJvcF0gPSBFcnJvcltwcm90b1Byb3BdO1xuY2xhc3NMaXN0UHJvdG8uaXRlbSA9IGZ1bmN0aW9uIChpKSB7XG5cdHJldHVybiB0aGlzW2ldIHx8IG51bGw7XG59O1xuY2xhc3NMaXN0UHJvdG8uY29udGFpbnMgPSBmdW5jdGlvbiAodG9rZW4pIHtcblx0dG9rZW4gKz0gXCJcIjtcblx0cmV0dXJuIGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbikgIT09IC0xO1xufTtcbmNsYXNzTGlzdFByb3RvLmFkZCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyXG5cdFx0ICB0b2tlbnMgPSBhcmd1bWVudHNcblx0XHQsIGkgPSAwXG5cdFx0LCBsID0gdG9rZW5zLmxlbmd0aFxuXHRcdCwgdG9rZW5cblx0XHQsIHVwZGF0ZWQgPSBmYWxzZVxuXHQ7XG5cdGRvIHtcblx0XHR0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG5cdFx0aWYgKGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbikgPT09IC0xKSB7XG5cdFx0XHR0aGlzLnB1c2godG9rZW4pO1xuXHRcdFx0dXBkYXRlZCA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHdoaWxlICgrK2kgPCBsKTtcblxuXHRpZiAodXBkYXRlZCkge1xuXHRcdHRoaXMuX3VwZGF0ZUNsYXNzTmFtZSgpO1xuXHR9XG59O1xuY2xhc3NMaXN0UHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuXHR2YXJcblx0XHQgIHRva2VucyA9IGFyZ3VtZW50c1xuXHRcdCwgaSA9IDBcblx0XHQsIGwgPSB0b2tlbnMubGVuZ3RoXG5cdFx0LCB0b2tlblxuXHRcdCwgdXBkYXRlZCA9IGZhbHNlXG5cdFx0LCBpbmRleFxuXHQ7XG5cdGRvIHtcblx0XHR0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG5cdFx0aW5kZXggPSBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pO1xuXHRcdHdoaWxlIChpbmRleCAhPT0gLTEpIHtcblx0XHRcdHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdHVwZGF0ZWQgPSB0cnVlO1xuXHRcdFx0aW5kZXggPSBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pO1xuXHRcdH1cblx0fVxuXHR3aGlsZSAoKytpIDwgbCk7XG5cblx0aWYgKHVwZGF0ZWQpIHtcblx0XHR0aGlzLl91cGRhdGVDbGFzc05hbWUoKTtcblx0fVxufTtcbmNsYXNzTGlzdFByb3RvLnRvZ2dsZSA9IGZ1bmN0aW9uICh0b2tlbiwgZm9yY2UpIHtcblx0dG9rZW4gKz0gXCJcIjtcblxuXHR2YXJcblx0XHQgIHJlc3VsdCA9IHRoaXMuY29udGFpbnModG9rZW4pXG5cdFx0LCBtZXRob2QgPSByZXN1bHQgP1xuXHRcdFx0Zm9yY2UgIT09IHRydWUgJiYgXCJyZW1vdmVcIlxuXHRcdDpcblx0XHRcdGZvcmNlICE9PSBmYWxzZSAmJiBcImFkZFwiXG5cdDtcblxuXHRpZiAobWV0aG9kKSB7XG5cdFx0dGhpc1ttZXRob2RdKHRva2VuKTtcblx0fVxuXG5cdGlmIChmb3JjZSA9PT0gdHJ1ZSB8fCBmb3JjZSA9PT0gZmFsc2UpIHtcblx0XHRyZXR1cm4gZm9yY2U7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuICFyZXN1bHQ7XG5cdH1cbn07XG5jbGFzc0xpc3RQcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHRoaXMuam9pbihcIiBcIik7XG59O1xuXG5pZiAob2JqQ3RyLmRlZmluZVByb3BlcnR5KSB7XG5cdHZhciBjbGFzc0xpc3RQcm9wRGVzYyA9IHtcblx0XHQgIGdldDogY2xhc3NMaXN0R2V0dGVyXG5cdFx0LCBlbnVtZXJhYmxlOiB0cnVlXG5cdFx0LCBjb25maWd1cmFibGU6IHRydWVcblx0fTtcblx0dHJ5IHtcblx0XHRvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG5cdH0gY2F0Y2ggKGV4KSB7IC8vIElFIDggZG9lc24ndCBzdXBwb3J0IGVudW1lcmFibGU6dHJ1ZVxuXHRcdGlmIChleC5udW1iZXIgPT09IC0weDdGRjVFQzU0KSB7XG5cdFx0XHRjbGFzc0xpc3RQcm9wRGVzYy5lbnVtZXJhYmxlID0gZmFsc2U7XG5cdFx0XHRvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG5cdFx0fVxuXHR9XG59IGVsc2UgaWYgKG9iakN0cltwcm90b1Byb3BdLl9fZGVmaW5lR2V0dGVyX18pIHtcblx0ZWxlbUN0clByb3RvLl9fZGVmaW5lR2V0dGVyX18oY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0R2V0dGVyKTtcbn1cblxufShzZWxmKSk7XG5cbn0gZWxzZSB7XG4vLyBUaGVyZSBpcyBmdWxsIG9yIHBhcnRpYWwgbmF0aXZlIGNsYXNzTGlzdCBzdXBwb3J0LCBzbyBqdXN0IGNoZWNrIGlmIHdlIG5lZWRcbi8vIHRvIG5vcm1hbGl6ZSB0aGUgYWRkL3JlbW92ZSBhbmQgdG9nZ2xlIEFQSXMuXG5cbihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciB0ZXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJfXCIpO1xuXG5cdHRlc3RFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJjMVwiLCBcImMyXCIpO1xuXG5cdC8vIFBvbHlmaWxsIGZvciBJRSAxMC8xMSBhbmQgRmlyZWZveCA8MjYsIHdoZXJlIGNsYXNzTGlzdC5hZGQgYW5kXG5cdC8vIGNsYXNzTGlzdC5yZW1vdmUgZXhpc3QgYnV0IHN1cHBvcnQgb25seSBvbmUgYXJndW1lbnQgYXQgYSB0aW1lLlxuXHRpZiAoIXRlc3RFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImMyXCIpKSB7XG5cdFx0dmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuXHRcdFx0dmFyIG9yaWdpbmFsID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZVttZXRob2RdO1xuXG5cdFx0XHRET01Ub2tlbkxpc3QucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih0b2tlbikge1xuXHRcdFx0XHR2YXIgaSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcblxuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdFx0XHR0b2tlbiA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdFx0XHRvcmlnaW5hbC5jYWxsKHRoaXMsIHRva2VuKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9O1xuXHRcdGNyZWF0ZU1ldGhvZCgnYWRkJyk7XG5cdFx0Y3JlYXRlTWV0aG9kKCdyZW1vdmUnKTtcblx0fVxuXG5cdHRlc3RFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJjM1wiLCBmYWxzZSk7XG5cblx0Ly8gUG9seWZpbGwgZm9yIElFIDEwIGFuZCBGaXJlZm94IDwyNCwgd2hlcmUgY2xhc3NMaXN0LnRvZ2dsZSBkb2VzIG5vdFxuXHQvLyBzdXBwb3J0IHRoZSBzZWNvbmQgYXJndW1lbnQuXG5cdGlmICh0ZXN0RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJjM1wiKSkge1xuXHRcdHZhciBfdG9nZ2xlID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGU7XG5cblx0XHRET01Ub2tlbkxpc3QucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKHRva2VuLCBmb3JjZSkge1xuXHRcdFx0aWYgKDEgaW4gYXJndW1lbnRzICYmICF0aGlzLmNvbnRhaW5zKHRva2VuKSA9PT0gIWZvcmNlKSB7XG5cdFx0XHRcdHJldHVybiBmb3JjZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBfdG9nZ2xlLmNhbGwodGhpcywgdG9rZW4pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0fVxuXG5cdHRlc3RFbGVtZW50ID0gbnVsbDtcbn0oKSk7XG5cbn1cblxufVxuXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmb3JFYWNoID0gW10uZm9yRWFjaCxcbiAgICAgIHJlZ2V4ID0gL15kYXRhLSguKykvLFxuICAgICAgZGFzaENoYXIgPSAvXFwtKFthLXpdKS9pZ1xuICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIFxuICBpZiAoZWwuZGF0YXNldCAhPSB1bmRlZmluZWQpIHJldHVybjtcbiAgXG4gIGZ1bmN0aW9uIHRvQ2FtZWxDYXNlKHMpIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKGRhc2hDaGFyLCBmdW5jdGlvbiAobSxsKSB7IHJldHVybiBsLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9XG4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRWxlbWVudC5wcm90b3R5cGUsICdkYXRhc2V0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRhdGFzZXQgPSB7fTtcbiAgICAgIGZvckVhY2guY2FsbCh0aGlzLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgICAgaWYgKG1hdGNoID0gYXR0ci5uYW1lLm1hdGNoKHJlZ2V4KSlcbiAgICAgICAgICBkYXRhc2V0W3RvQ2FtZWxDYXNlKG1hdGNoWzFdKV0gPSBhdHRyLnZhbHVlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGF0YXNldDtcbiAgICB9XG4gIH0pO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID0gZnVuY3Rpb24oZWwsIHBzZXVkbykge1xuICAgICAgdGhpcy5lbCA9IGVsO1xuICAgICAgdGhpcy5nZXRQcm9wZXJ0eVZhbHVlID0gZnVuY3Rpb24ocHJvcCkge1xuICAgICAgICB2YXIgcmUgPSAvKFxcLShbYS16XSl7MX0pL2c7XG4gICAgICAgIGlmIChwcm9wID09ICdmbG9hdCcpIHByb3AgPSAnc3R5bGVGbG9hdCc7XG4gICAgICAgIGlmIChyZS50ZXN0KHByb3ApKSB7XG4gICAgICAgICAgcHJvcCA9IHByb3AucmVwbGFjZShyZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1syXS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbC5jdXJyZW50U3R5bGVbcHJvcF0gPyBlbC5jdXJyZW50U3R5bGVbcHJvcF0gOiBudWxsO1xuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cbn0iLCIvLyBDaGVjayB0aGF0IHdlIGhhdmUgd2hhdCB3ZSBuZWVkIHRvIG1vdmUgZm9yd2FyZFxudmFyIHN1cHBvcnRzID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yICYmICEhd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5pZiAoICFzdXBwb3J0cyApIHJldHVybjtcblxuLy8gUG9sbHlmaWxscyB0byBhZGQgZnVuY3Rpb25hbGl0eSB0byBvbGRlciBicm93c2Vyc1xucmVxdWlyZSgnLi9fcG9sbHlmaWxscy9wb2xseWZpbGwuZGF0YXNldC5qcycpKCk7XG5yZXF1aXJlKCcuL19wb2xseWZpbGxzL3BvbGx5ZmlsbC5jbGFzc2xpc3QuanMnKSgpO1xucmVxdWlyZSgnLi9fcG9sbHlmaWxscy9wb2xseWZpbGwuZ2V0Q29tcHV0ZWRTdHlsZS5qcycpKCk7XG5cbi8vIE1vZHVsZXMgbmVlZGVkIGZvciBjb3JlIGpzXG52YXIgXyA9IHJlcXVpcmUoJy4vX2xpYi5qcycpO1xuXG5cbl8ucmVhZHkoZnVuY3Rpb24gKCkge1xuICBcbn0pOyJdfQ==
