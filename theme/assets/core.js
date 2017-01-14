(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./utils/_element-queries.js":2,"./utils/_lib.js":4,"./utils/_mq-size.js":5,"./utils/_show-hide.js":6}],2:[function(require,module,exports){
/*
  Element Queries:
  Media queries but for elements rather than the window.
  
  html: <div class="my-ele" data-element-query="min-width: 10em, min-width: 30em"> ... </div>
  css: .my-ele[data-min-width~="30em"] { ... }
  
*/

var _ = require('./_lib.js');
var eqElementSelector = '[data-element-query]';

var ElementQuery = function (eqEle, html) {
  this.eqEle = eqEle;
  this.html = html;
  this.queries = this.getQueries(eqEle.dataset.elementQuery);
  
  this.addEventListeners();
  this.calcElementQueries();
};

ElementQuery.prototype.addEventListeners = function () {
  var _this = this;
  window.addEventListener('resize', _.debounce(function () {
    _this.calcElementQueries();
  }));
};

ElementQuery.prototype.calcElementQueries = function () {
  this.emptyCurrentQueries();
  this.each(this.queries, function (query) {
    this.calcElementQuery(query);
  });
  this.applyQueries();
};

ElementQuery.prototype.calcElementQuery = function (query) {
  var offsetValue = this.getOffsetValue(query.dimension);
  var computedValue = this.getComputedValue(query.value, query.unit);
  if (query.limit === 'min') {
    if (offsetValue >= computedValue) {
      this.currentQueries[query.dataKey].push(query);
    }
  } else if (query.limit === 'max') {
    if (offsetValue <= computedValue) {
      this.currentQueries[query.dataKey].push(query);
    }
  }
};

ElementQuery.prototype.getOffsetValue = function (dimension) {
  if (dimension === 'width') {
    return this.eqEle.offsetWidth;
  } else if (dimension === 'height') {
    return this.eqEle.offsetHeight;
  }
};

ElementQuery.prototype.getComputedValue = function (value, unit) {
  var computedValue,
    baseFontSize;
  switch (unit) {
    case 'rem':
      baseFontSize = this.getFontSize(this.html);
      computedValue = baseFontSize * value;
      break;
    case 'em':
      baseFontSize = this.getFontSize(this.eqEle);
      computedValue = baseFontSize * value;
      break;
    default:
      computedValue = value;
  }
  return computedValue;
};

ElementQuery.prototype.applyQueries = function () {
  for (var dataKey in this.currentQueries) {
    if (this.currentQueries.hasOwnProperty(dataKey)) {
      var data = [];
      var dataSet = this.currentQueries[dataKey];
      this.each(dataSet, function (query) {
        data.push(query.value + query.unit);
      });
      this.eqEle.dataset[dataKey] = data.join(' ');
    }
  }
}

/* Initial Setup */
ElementQuery.prototype.emptyCurrentQueries = function () {
  this.currentQueries = {
    minWidth: [],
    maxWidth: [],
    minHeight: [],
    maxHeight: []
  };
};

ElementQuery.prototype.getQueries = function (queryStr) {
  var queries = [],
    queryStrs = queryStr.split(',');
  this.each(queryStrs, function (query) {
    var queryObj = this.getQueryObject(query);
    if (queryObj) {
      queries.push(queryObj);
    }
  });
  return queries;
};

ElementQuery.prototype.getQueryObject = function (queryStr) {
  var queryMatch = queryStr.match(/(min|max)-(width|height):\s?(\d*)(px|rem|em)/);
  if (queryMatch) {
    return {
      limit: queryMatch[1],
      dimension: queryMatch[2],
      value: parseFloat(queryMatch[3]),
      unit: queryMatch[4],
      dataKey: this.getDataKey(queryMatch[1], queryMatch[2])
    }
  } else {
    return false;
  }
};

ElementQuery.prototype.getFontSize = function (ele) {
  return parseFloat(window.getComputedStyle(ele, null).getPropertyValue('font-size'));
};

ElementQuery.prototype.getDataKey = function (limit, dimension) {
  return limit + dimension.charAt(0).toUpperCase() + dimension.slice(1);
};

ElementQuery.prototype.each = function (obj, callback) {
  for (var i = 0; i < obj.length; i++) {
    var item = obj[i];
    callback.apply(this, [item, i]);
  }
};

/* Wrapper for multiple objects */
var ElementQueries = function () {
  this.queries = [];
  var html = document.querySelector('html');
  var eqElements = document.querySelectorAll(eqElementSelector);
  for (var i = 0; i < eqElements.length; i++) {
    var eqEle = eqElements[i];
    this.queries.push(new ElementQuery(eqEle, html));
  }
};

ElementQueries.prototype.calcQueries = function () {
  _.each(this.queries, function (query) {
    query.calcElementQueries();
  });
};

module.exports = ElementQueries;
},{"./_lib.js":4}],3:[function(require,module,exports){
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
  
  camelCase: function (str) {
    return str.replace(/([\-\s]\w)/g, function (s) {
      return s[1].toUpperCase();
    });
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
},{}],5:[function(require,module,exports){
module.exports = function () {
  return window.getComputedStyle(document.body,':after').getPropertyValue('content').replace(/['"]/g, '');
};
},{}],6:[function(require,module,exports){
/*
  To show, hide or toggle an element add a data attribute of data-show=""
  to the element you wish to trigger the show/hide action,
  with the value being a css selector of the target element to be shown/hidden
  
  `data-toggle-content`
  
  `data-toggle-group`
*/

var _ = require('./_lib.js');
var Eventer = require('./_eventer.js');

var ShowHide = function () {
  new Eventer(this);
  this.hiddenClass = 'hidden';
  this.showSelector = '[data-show]';
  this.hideSelector = '[data-hide]';
  this.toggleSelector = '[data-toggle]';
  this._addEventListeners();
};

ShowHide.prototype.show = function (target, actionEle) {
  var didShow = this._getEles(target, function (targetEle) {
    targetEle.classList.remove(this.hiddenClass);
  });
  if (didShow){
    this.toggleContent(actionEle);
    this.trigger('show', [actionEle, target]);
  }
  return didShow;
};

ShowHide.prototype.hide = function (target, actionEle) {
  var didHide = this._getEles(target, function (targetEle) {
    targetEle.classList.add(this.hiddenClass);
  });
  if (didHide) {
    this.toggleContent(actionEle);
    this.trigger('hide', [actionEle, target]);
  }
  return didHide;
};

ShowHide.prototype.toggle = function (target, actionEle) {
  var event;
  var didToggle = this._getEles(target, function (targetEle) {
    var display = window.getComputedStyle(targetEle, null).getPropertyValue('display');
    if (display == 'none') {
      targetEle.classList.remove(this.hiddenClass);
      event = 'show';
    } else {
      targetEle.classList.add(this.hiddenClass);
      event = 'hide';
    }
  });
  
  if (didToggle) {
    this.toggleGroup(event, actionEle, 'toggle');
    this.toggleContent(actionEle);
    this.trigger(event, [actionEle, target]);
  }
  return didToggle;
};

ShowHide.prototype.toggleContent = function (actionEle) {
  if (actionEle.hasAttribute('data-toggle-content')) {
    var newContent = actionEle.getAttribute('data-toggle-content');
    actionEle.setAttribute('data-toggle-content', actionEle.innerHTML);
    actionEle.innerHTML = newContent;
  }
};

ShowHide.prototype.toggleGroup = function (event, actionEle, dataAttr) {
  if (actionEle.hasAttribute('data-toggle-group')) {
    var groupSelector = '[data-toggle-group="'+actionEle.getAttribute('data-toggle-group')+'"]';
    var groupEles = document.querySelectorAll(groupSelector);
    _.each(groupEles, function (groupEle) {
      if (groupEle !== actionEle) {
        var target = groupEle.getAttribute('data-'+dataAttr);
        if (event === 'show') {
          this.hide(target, groupEle);
        }
      }
    }, this);
  };
};

// Private
ShowHide.prototype._addEventListeners = function () {
  this._addEventListener(this.toggleSelector, 'toggle', this.toggle);
  this._addEventListener(this.hideSelector, 'hide', this.hide);
  this._addEventListener(this.showSelector, 'show', this.show);
  
};

ShowHide.prototype._addEventListener = function (selector, dataAttr, callback) {
  var _this = this;
  var eles = document.querySelectorAll(selector);
  _.each(eles, function (ele) {
    ele.addEventListener('click', function (e) {
      var target = e.currentTarget.getAttribute('data-'+dataAttr);
      if (callback.apply(_this, [target, e.currentTarget])) {
        e.preventDefault();
      }
    });
  });
};

ShowHide.prototype._getEles = function (target, callback) {
  var _this = this;
  var targetEles = document.querySelectorAll(target);
  if (targetEles.length > 0) {
    _.each(targetEles, function (targetEle) {
      callback.apply(_this, [targetEle]);
    });
    return true;
  }
  return false;
};

module.exports = ShowHide;
},{"./_eventer.js":3,"./_lib.js":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NvcmUuanMiLCJfc3JjL2pzL3V0aWxzL19lbGVtZW50LXF1ZXJpZXMuanMiLCJfc3JjL2pzL3V0aWxzL19ldmVudGVyLmpzIiwiX3NyYy9qcy91dGlscy9fbGliLmpzIiwiX3NyYy9qcy91dGlscy9fbXEtc2l6ZS5qcyIsIl9zcmMvanMvdXRpbHMvX3Nob3ctaGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICBUaGVtZSBDb3JlXG4gIC0gU2V0cyB1cCByZXVzYWJsZSBvYmplY3RzIGxpa2UgX2xpYiwgYW5kIG1xLXNpemVcbiAgLSBTZXRzIHVwIGdlbmVyaWMgb2JqZWN0cyBsaWtlIHNob3ctYW5kLWhpZGUsIGFuZCBlbGVtZW50LXF1ZXJpZXNcbiAgLSBpbWFnZSBnYWxsZXJpZXM/XG4gIC0gY3VzdG9tZXIgbG9naW4gaGVhZGVyIHdpZGdldFxuICBcbiAgU3RvcmFnZSBtb2RlbCB1c2VzIGJyb3dzZXIgREIgYW5kIGNvb2tpZXM/XG4qL1xuXG4vLyBDaGVjayB0aGF0IHdlIGhhdmUgd2hhdCB3ZSBuZWVkIHRvIG1vdmUgZm9yd2FyZFxudmFyIHN1cHBvcnRzID0gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yICYmICEhd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5pZiAoIXN1cHBvcnRzKSByZXR1cm47XG5cbi8vIE1haW4gVGhlbWUgb2JqZWN0XG53aW5kb3cuVGhlbWUgPSB3aW5kb3cuVGhlbWUgfHwge307XG5cbi8vIE1vZHVsZXMgbmVlZGVkIGZvciBjb3JlIGpzXG52YXIgXyA9IFRoZW1lLl8gPSByZXF1aXJlKCcuL3V0aWxzL19saWIuanMnKTtcblRoZW1lLm1xU2l6ZSA9IHJlcXVpcmUoJy4vdXRpbHMvX21xLXNpemUuanMnKTtcblxudmFyIEVsZW1lbnRRdWVyaWVzID0gcmVxdWlyZSgnLi91dGlscy9fZWxlbWVudC1xdWVyaWVzLmpzJyk7XG5UaGVtZS5lbGVtZW50UXVlcmllcyA9IG5ldyBFbGVtZW50UXVlcmllcygpO1xuXG52YXIgU2hvd0hpZGUgPSByZXF1aXJlKCcuL3V0aWxzL19zaG93LWhpZGUuanMnKTtcblRoZW1lLnNob3dIaWRlID0gbmV3IFNob3dIaWRlKCk7XG5cbl8ucmVhZHkoZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZygncmVhZHknLCBUaGVtZSwgVGhlbWUubXFTaXplKCkpO1xufSk7IiwiLypcbiAgRWxlbWVudCBRdWVyaWVzOlxuICBNZWRpYSBxdWVyaWVzIGJ1dCBmb3IgZWxlbWVudHMgcmF0aGVyIHRoYW4gdGhlIHdpbmRvdy5cbiAgXG4gIGh0bWw6IDxkaXYgY2xhc3M9XCJteS1lbGVcIiBkYXRhLWVsZW1lbnQtcXVlcnk9XCJtaW4td2lkdGg6IDEwZW0sIG1pbi13aWR0aDogMzBlbVwiPiAuLi4gPC9kaXY+XG4gIGNzczogLm15LWVsZVtkYXRhLW1pbi13aWR0aH49XCIzMGVtXCJdIHsgLi4uIH1cbiAgXG4qL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vX2xpYi5qcycpO1xudmFyIGVxRWxlbWVudFNlbGVjdG9yID0gJ1tkYXRhLWVsZW1lbnQtcXVlcnldJztcblxudmFyIEVsZW1lbnRRdWVyeSA9IGZ1bmN0aW9uIChlcUVsZSwgaHRtbCkge1xuICB0aGlzLmVxRWxlID0gZXFFbGU7XG4gIHRoaXMuaHRtbCA9IGh0bWw7XG4gIHRoaXMucXVlcmllcyA9IHRoaXMuZ2V0UXVlcmllcyhlcUVsZS5kYXRhc2V0LmVsZW1lbnRRdWVyeSk7XG4gIFxuICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gIHRoaXMuY2FsY0VsZW1lbnRRdWVyaWVzKCk7XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgXy5kZWJvdW5jZShmdW5jdGlvbiAoKSB7XG4gICAgX3RoaXMuY2FsY0VsZW1lbnRRdWVyaWVzKCk7XG4gIH0pKTtcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuY2FsY0VsZW1lbnRRdWVyaWVzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmVtcHR5Q3VycmVudFF1ZXJpZXMoKTtcbiAgdGhpcy5lYWNoKHRoaXMucXVlcmllcywgZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgdGhpcy5jYWxjRWxlbWVudFF1ZXJ5KHF1ZXJ5KTtcbiAgfSk7XG4gIHRoaXMuYXBwbHlRdWVyaWVzKCk7XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmNhbGNFbGVtZW50UXVlcnkgPSBmdW5jdGlvbiAocXVlcnkpIHtcbiAgdmFyIG9mZnNldFZhbHVlID0gdGhpcy5nZXRPZmZzZXRWYWx1ZShxdWVyeS5kaW1lbnNpb24pO1xuICB2YXIgY29tcHV0ZWRWYWx1ZSA9IHRoaXMuZ2V0Q29tcHV0ZWRWYWx1ZShxdWVyeS52YWx1ZSwgcXVlcnkudW5pdCk7XG4gIGlmIChxdWVyeS5saW1pdCA9PT0gJ21pbicpIHtcbiAgICBpZiAob2Zmc2V0VmFsdWUgPj0gY29tcHV0ZWRWYWx1ZSkge1xuICAgICAgdGhpcy5jdXJyZW50UXVlcmllc1txdWVyeS5kYXRhS2V5XS5wdXNoKHF1ZXJ5KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAocXVlcnkubGltaXQgPT09ICdtYXgnKSB7XG4gICAgaWYgKG9mZnNldFZhbHVlIDw9IGNvbXB1dGVkVmFsdWUpIHtcbiAgICAgIHRoaXMuY3VycmVudFF1ZXJpZXNbcXVlcnkuZGF0YUtleV0ucHVzaChxdWVyeSk7XG4gICAgfVxuICB9XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmdldE9mZnNldFZhbHVlID0gZnVuY3Rpb24gKGRpbWVuc2lvbikge1xuICBpZiAoZGltZW5zaW9uID09PSAnd2lkdGgnKSB7XG4gICAgcmV0dXJuIHRoaXMuZXFFbGUub2Zmc2V0V2lkdGg7XG4gIH0gZWxzZSBpZiAoZGltZW5zaW9uID09PSAnaGVpZ2h0Jykge1xuICAgIHJldHVybiB0aGlzLmVxRWxlLm9mZnNldEhlaWdodDtcbiAgfVxufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5nZXRDb21wdXRlZFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlLCB1bml0KSB7XG4gIHZhciBjb21wdXRlZFZhbHVlLFxuICAgIGJhc2VGb250U2l6ZTtcbiAgc3dpdGNoICh1bml0KSB7XG4gICAgY2FzZSAncmVtJzpcbiAgICAgIGJhc2VGb250U2l6ZSA9IHRoaXMuZ2V0Rm9udFNpemUodGhpcy5odG1sKTtcbiAgICAgIGNvbXB1dGVkVmFsdWUgPSBiYXNlRm9udFNpemUgKiB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VtJzpcbiAgICAgIGJhc2VGb250U2l6ZSA9IHRoaXMuZ2V0Rm9udFNpemUodGhpcy5lcUVsZSk7XG4gICAgICBjb21wdXRlZFZhbHVlID0gYmFzZUZvbnRTaXplICogdmFsdWU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29tcHV0ZWRWYWx1ZSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBjb21wdXRlZFZhbHVlO1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5hcHBseVF1ZXJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIGRhdGFLZXkgaW4gdGhpcy5jdXJyZW50UXVlcmllcykge1xuICAgIGlmICh0aGlzLmN1cnJlbnRRdWVyaWVzLmhhc093blByb3BlcnR5KGRhdGFLZXkpKSB7XG4gICAgICB2YXIgZGF0YSA9IFtdO1xuICAgICAgdmFyIGRhdGFTZXQgPSB0aGlzLmN1cnJlbnRRdWVyaWVzW2RhdGFLZXldO1xuICAgICAgdGhpcy5lYWNoKGRhdGFTZXQsIGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICBkYXRhLnB1c2gocXVlcnkudmFsdWUgKyBxdWVyeS51bml0KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5lcUVsZS5kYXRhc2V0W2RhdGFLZXldID0gZGF0YS5qb2luKCcgJyk7XG4gICAgfVxuICB9XG59XG5cbi8qIEluaXRpYWwgU2V0dXAgKi9cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZW1wdHlDdXJyZW50UXVlcmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jdXJyZW50UXVlcmllcyA9IHtcbiAgICBtaW5XaWR0aDogW10sXG4gICAgbWF4V2lkdGg6IFtdLFxuICAgIG1pbkhlaWdodDogW10sXG4gICAgbWF4SGVpZ2h0OiBbXVxuICB9O1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5nZXRRdWVyaWVzID0gZnVuY3Rpb24gKHF1ZXJ5U3RyKSB7XG4gIHZhciBxdWVyaWVzID0gW10sXG4gICAgcXVlcnlTdHJzID0gcXVlcnlTdHIuc3BsaXQoJywnKTtcbiAgdGhpcy5lYWNoKHF1ZXJ5U3RycywgZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgdmFyIHF1ZXJ5T2JqID0gdGhpcy5nZXRRdWVyeU9iamVjdChxdWVyeSk7XG4gICAgaWYgKHF1ZXJ5T2JqKSB7XG4gICAgICBxdWVyaWVzLnB1c2gocXVlcnlPYmopO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBxdWVyaWVzO1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5nZXRRdWVyeU9iamVjdCA9IGZ1bmN0aW9uIChxdWVyeVN0cikge1xuICB2YXIgcXVlcnlNYXRjaCA9IHF1ZXJ5U3RyLm1hdGNoKC8obWlufG1heCktKHdpZHRofGhlaWdodCk6XFxzPyhcXGQqKShweHxyZW18ZW0pLyk7XG4gIGlmIChxdWVyeU1hdGNoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbWl0OiBxdWVyeU1hdGNoWzFdLFxuICAgICAgZGltZW5zaW9uOiBxdWVyeU1hdGNoWzJdLFxuICAgICAgdmFsdWU6IHBhcnNlRmxvYXQocXVlcnlNYXRjaFszXSksXG4gICAgICB1bml0OiBxdWVyeU1hdGNoWzRdLFxuICAgICAgZGF0YUtleTogdGhpcy5nZXREYXRhS2V5KHF1ZXJ5TWF0Y2hbMV0sIHF1ZXJ5TWF0Y2hbMl0pXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5nZXRGb250U2l6ZSA9IGZ1bmN0aW9uIChlbGUpIHtcbiAgcmV0dXJuIHBhcnNlRmxvYXQod2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKSk7XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmdldERhdGFLZXkgPSBmdW5jdGlvbiAobGltaXQsIGRpbWVuc2lvbikge1xuICByZXR1cm4gbGltaXQgKyBkaW1lbnNpb24uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBkaW1lbnNpb24uc2xpY2UoMSk7XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbiAob2JqLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gb2JqW2ldO1xuICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIFtpdGVtLCBpXSk7XG4gIH1cbn07XG5cbi8qIFdyYXBwZXIgZm9yIG11bHRpcGxlIG9iamVjdHMgKi9cbnZhciBFbGVtZW50UXVlcmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5xdWVyaWVzID0gW107XG4gIHZhciBodG1sID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpO1xuICB2YXIgZXFFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZXFFbGVtZW50U2VsZWN0b3IpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGVxRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZXFFbGUgPSBlcUVsZW1lbnRzW2ldO1xuICAgIHRoaXMucXVlcmllcy5wdXNoKG5ldyBFbGVtZW50UXVlcnkoZXFFbGUsIGh0bWwpKTtcbiAgfVxufTtcblxuRWxlbWVudFF1ZXJpZXMucHJvdG90eXBlLmNhbGNRdWVyaWVzID0gZnVuY3Rpb24gKCkge1xuICBfLmVhY2godGhpcy5xdWVyaWVzLCBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICBxdWVyeS5jYWxjRWxlbWVudFF1ZXJpZXMoKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRRdWVyaWVzOyIsInZhciBFdmVudGVyID0gZnVuY3Rpb24gKGNhbGxlcikge1xuICB0aGlzLmNhbGxlciA9IGNhbGxlcjtcbiAgdGhpcy5jYWxsZXIuX2V2ZW50cyA9IHt9O1xuICB0aGlzLmNhbGxlci5vbiA9IHRoaXMub247XG4gIHRoaXMuY2FsbGVyLm9mZiA9IHRoaXMub2ZmO1xuICB0aGlzLmNhbGxlci50cmlnZ2VyID0gdGhpcy50cmlnZ2VyO1xufTtcblxuLy8gdGhpcyA9PT0gY2FsbGVyIG5vdCBFdmVudGVyXG5FdmVudGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW107XG4gIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChjYWxsYmFjayk7XG4gIHJldHVybiB0aGlzLl9ldmVudHNbZXZlbnRdLmxlbmd0aCAtIDE7XG59O1xuXG5FdmVudGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGlkKSB7XG4gIGlmIChldmVudCAmJiBpZCkge1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnRdW2lkXSkgdGhpcy5fZXZlbnRzW2V2ZW50XVtpZF0gPSBudWxsO1xuICB9IGVsc2UgaWYgKGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudF0pIHRoaXMuX2V2ZW50c1tldmVudF0gPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICB9XG59O1xuXG5FdmVudGVyLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XG4gIGlmICh0eXBlb2YgYXJncyAhPT0gJ29iamVjdCcpIGFyZ3MgPSBbYXJnc107IFxuICBmb3IgKHZhciBpIGluIHRoaXMuX2V2ZW50c1tldmVudF0pIHtcbiAgICB2YXIgZSA9IHRoaXMuX2V2ZW50c1tldmVudF1baV07XG4gICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudF0uaGFzT3duUHJvcGVydHkoaSkgJiYgdHlwZW9mIGUgPT09ICdmdW5jdGlvbicpIGUuYXBwbHkodGhpcywgYXJncyk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRlcjsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLypcbiAgICBBcnJheSBGdW5jdGlvbnNcbiAgKi9cbiAgLy8gRm9yIGVhY2ggaXRlbSBpbiBBcnJheVxuICBlYWNoOiBmdW5jdGlvbiAoYXJyLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGN0eCA9IGN0eCB8fCBhcnJbaV07XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgsIFthcnJbaV0sIGldKTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBGb3IgZWFjaCBpdGVtIGluIE9iamVjdFxuICBlYWNoSW46IGZ1bmN0aW9uIChvYmosIGNhbGxiYWNrLCBjdHgpIHtcbiAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICBjdHggPSBjdHggfHwgb2JqW2tdO1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIFtvYmpba10sIGtdKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFxuICAvLyBSZXR1cm4gdHJ1ZSBpZiBpdGVtIGlzIGluIEFycmF5XG4gIGluQXJyYXk6IGZ1bmN0aW9uIChuZWVkbGUsIGhheXN0YWNrKSB7XG4gICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgdGhpcy5lYWNoKGhheXN0YWNrLCBmdW5jdGlvbiAoaGF5KSB7XG4gICAgICBpZiAobmVlZGxlID09PSBoYXkpIGZvdW5kID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0sXG4gIFxuICAvLyByZXR1cm4gdGhlIGxhc3QgaXRlbSBpbiB0aGUgYXJyYXlcbiAgbGFzdDogZnVuY3Rpb24gKGFycikge1xuICAgIHJldHVybiBhcnJbYXJyLmxlbmd0aCAtIDFdO1xuICB9LFxuICBcbiAgXG4gIC8qXG4gICAgU3RyaW5nIEZ1bmN0aW9uc1xuICAqL1xuICAvLyBDYXB0aWFsc2UgdGhlIGZpcnN0IGNoYXIgaW4gU3RyaW5nXG4gIGNhcGl0YWxpc2U6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICByZXR1cm4gc3RyWzBdLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG4gIH0sXG4gIFxuICBjYW1lbENhc2U6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbXFwtXFxzXVxcdykvZywgZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzWzFdLnRvVXBwZXJDYXNlKCk7XG4gICAgfSk7XG4gIH0sXG4gIFxuICAvKlxuICAgIEV2ZW50IEZ1bmN0aW9uc1xuICAqL1xuICAvLyBSdW4gY29kZSB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XG4gIHJlYWR5OiBmdW5jdGlvbiAoY2FsbGJhY2ssIGN0eCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHJldHVybjtcbiAgICBcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKSB7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gQ1VTVE9NIEZVTkMgZm9yIHNlaWRvIHRvIHRyaWdnZXIgdGhpbmdzIHdoZW4gdGhlIGNvcmUgaXMgcmVhZHlcbiAgcmVhZHlDb3JlOiBmdW5jdGlvbiAoY2FsbGJhY2ssIGN0eCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHJldHVybjtcbiAgICBcbiAgICBpZiAod2luZG93LlNlaWRvQ29yZS5yZWFkeSkge1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LlNlaWRvQ29yZS5vbigncmVhZHknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBNYWtlIHRoaW5nIG5vdCBoYXBwZW4gdW50aWwgZmluaXNoZWQ/XG4gIC8vIGkuZS4gZG9uJ3QgYWN0IG9uIGV2ZXJ5IHdpbmRvdyByZXNpemUgZXZlbnQsIGp1c3QgdGhlIGxhc3Qgb25lIHdoZW4gd2UgbmVlZCBpdC5cbiAgZGVib3VuY2U6IGZ1bmN0aW9uIChjYWxsYmFjaywgd2FpdCwgY3R4KSB7XG4gICAgdmFyIHRpbWVvdXQsIHRpbWVzdGFtcCwgYXJncztcbiAgICB3YWl0ID0gd2FpdCB8fCAxMDA7XG4gICAgXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZXN0YW1wO1xuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgYXJncyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgY3R4ID0gY3R4IHx8IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICB9O1xuICB9LFxuICBcbiAgLy8gRG9uJ3Qgc3dhbXAgdXMgd2l0aCBldmVudHNcbiAgLy8gZ29vZCBmb3IgdGhpbmdzIGxpa2Ugc2Nyb2xsIGFuZCByZXNpemVcbiAgdGhyb3R0bGU6IGZ1bmN0aW9uIChjYWxsYmFjaywgbGltaXQsIGN0eCkge1xuICAgIGxpbWl0ID0gbGltaXQgfHwgMjAwO1xuICAgIHZhciB3YWl0ID0gZmFsc2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghd2FpdCkge1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIHdhaXQgPSB0cnVlO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB3YWl0ID0gZmFsc2U7XG4gICAgICAgIH0sIGxpbWl0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5LCc6YWZ0ZXInKS5nZXRQcm9wZXJ0eVZhbHVlKCdjb250ZW50JykucmVwbGFjZSgvWydcIl0vZywgJycpO1xufTsiLCIvKlxuICBUbyBzaG93LCBoaWRlIG9yIHRvZ2dsZSBhbiBlbGVtZW50IGFkZCBhIGRhdGEgYXR0cmlidXRlIG9mIGRhdGEtc2hvdz1cIlwiXG4gIHRvIHRoZSBlbGVtZW50IHlvdSB3aXNoIHRvIHRyaWdnZXIgdGhlIHNob3cvaGlkZSBhY3Rpb24sXG4gIHdpdGggdGhlIHZhbHVlIGJlaW5nIGEgY3NzIHNlbGVjdG9yIG9mIHRoZSB0YXJnZXQgZWxlbWVudCB0byBiZSBzaG93bi9oaWRkZW5cbiAgXG4gIGBkYXRhLXRvZ2dsZS1jb250ZW50YFxuICBcbiAgYGRhdGEtdG9nZ2xlLWdyb3VwYFxuKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL19saWIuanMnKTtcbnZhciBFdmVudGVyID0gcmVxdWlyZSgnLi9fZXZlbnRlci5qcycpO1xuXG52YXIgU2hvd0hpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIG5ldyBFdmVudGVyKHRoaXMpO1xuICB0aGlzLmhpZGRlbkNsYXNzID0gJ2hpZGRlbic7XG4gIHRoaXMuc2hvd1NlbGVjdG9yID0gJ1tkYXRhLXNob3ddJztcbiAgdGhpcy5oaWRlU2VsZWN0b3IgPSAnW2RhdGEtaGlkZV0nO1xuICB0aGlzLnRvZ2dsZVNlbGVjdG9yID0gJ1tkYXRhLXRvZ2dsZV0nO1xuICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpO1xufTtcblxuU2hvd0hpZGUucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb25FbGUpIHtcbiAgdmFyIGRpZFNob3cgPSB0aGlzLl9nZXRFbGVzKHRhcmdldCwgZnVuY3Rpb24gKHRhcmdldEVsZSkge1xuICAgIHRhcmdldEVsZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuaGlkZGVuQ2xhc3MpO1xuICB9KTtcbiAgaWYgKGRpZFNob3cpe1xuICAgIHRoaXMudG9nZ2xlQ29udGVudChhY3Rpb25FbGUpO1xuICAgIHRoaXMudHJpZ2dlcignc2hvdycsIFthY3Rpb25FbGUsIHRhcmdldF0pO1xuICB9XG4gIHJldHVybiBkaWRTaG93O1xufTtcblxuU2hvd0hpZGUucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb25FbGUpIHtcbiAgdmFyIGRpZEhpZGUgPSB0aGlzLl9nZXRFbGVzKHRhcmdldCwgZnVuY3Rpb24gKHRhcmdldEVsZSkge1xuICAgIHRhcmdldEVsZS5jbGFzc0xpc3QuYWRkKHRoaXMuaGlkZGVuQ2xhc3MpO1xuICB9KTtcbiAgaWYgKGRpZEhpZGUpIHtcbiAgICB0aGlzLnRvZ2dsZUNvbnRlbnQoYWN0aW9uRWxlKTtcbiAgICB0aGlzLnRyaWdnZXIoJ2hpZGUnLCBbYWN0aW9uRWxlLCB0YXJnZXRdKTtcbiAgfVxuICByZXR1cm4gZGlkSGlkZTtcbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb25FbGUpIHtcbiAgdmFyIGV2ZW50O1xuICB2YXIgZGlkVG9nZ2xlID0gdGhpcy5fZ2V0RWxlcyh0YXJnZXQsIGZ1bmN0aW9uICh0YXJnZXRFbGUpIHtcbiAgICB2YXIgZGlzcGxheSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldEVsZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnZGlzcGxheScpO1xuICAgIGlmIChkaXNwbGF5ID09ICdub25lJykge1xuICAgICAgdGFyZ2V0RWxlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5oaWRkZW5DbGFzcyk7XG4gICAgICBldmVudCA9ICdzaG93JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0RWxlLmNsYXNzTGlzdC5hZGQodGhpcy5oaWRkZW5DbGFzcyk7XG4gICAgICBldmVudCA9ICdoaWRlJztcbiAgICB9XG4gIH0pO1xuICBcbiAgaWYgKGRpZFRvZ2dsZSkge1xuICAgIHRoaXMudG9nZ2xlR3JvdXAoZXZlbnQsIGFjdGlvbkVsZSwgJ3RvZ2dsZScpO1xuICAgIHRoaXMudG9nZ2xlQ29udGVudChhY3Rpb25FbGUpO1xuICAgIHRoaXMudHJpZ2dlcihldmVudCwgW2FjdGlvbkVsZSwgdGFyZ2V0XSk7XG4gIH1cbiAgcmV0dXJuIGRpZFRvZ2dsZTtcbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS50b2dnbGVDb250ZW50ID0gZnVuY3Rpb24gKGFjdGlvbkVsZSkge1xuICBpZiAoYWN0aW9uRWxlLmhhc0F0dHJpYnV0ZSgnZGF0YS10b2dnbGUtY29udGVudCcpKSB7XG4gICAgdmFyIG5ld0NvbnRlbnQgPSBhY3Rpb25FbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRvZ2dsZS1jb250ZW50Jyk7XG4gICAgYWN0aW9uRWxlLnNldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUtY29udGVudCcsIGFjdGlvbkVsZS5pbm5lckhUTUwpO1xuICAgIGFjdGlvbkVsZS5pbm5lckhUTUwgPSBuZXdDb250ZW50O1xuICB9XG59O1xuXG5TaG93SGlkZS5wcm90b3R5cGUudG9nZ2xlR3JvdXAgPSBmdW5jdGlvbiAoZXZlbnQsIGFjdGlvbkVsZSwgZGF0YUF0dHIpIHtcbiAgaWYgKGFjdGlvbkVsZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlLWdyb3VwJykpIHtcbiAgICB2YXIgZ3JvdXBTZWxlY3RvciA9ICdbZGF0YS10b2dnbGUtZ3JvdXA9XCInK2FjdGlvbkVsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlLWdyb3VwJykrJ1wiXSc7XG4gICAgdmFyIGdyb3VwRWxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZ3JvdXBTZWxlY3Rvcik7XG4gICAgXy5lYWNoKGdyb3VwRWxlcywgZnVuY3Rpb24gKGdyb3VwRWxlKSB7XG4gICAgICBpZiAoZ3JvdXBFbGUgIT09IGFjdGlvbkVsZSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZ3JvdXBFbGUuZ2V0QXR0cmlidXRlKCdkYXRhLScrZGF0YUF0dHIpO1xuICAgICAgICBpZiAoZXZlbnQgPT09ICdzaG93Jykge1xuICAgICAgICAgIHRoaXMuaGlkZSh0YXJnZXQsIGdyb3VwRWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9O1xufTtcblxuLy8gUHJpdmF0ZVxuU2hvd0hpZGUucHJvdG90eXBlLl9hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcih0aGlzLnRvZ2dsZVNlbGVjdG9yLCAndG9nZ2xlJywgdGhpcy50b2dnbGUpO1xuICB0aGlzLl9hZGRFdmVudExpc3RlbmVyKHRoaXMuaGlkZVNlbGVjdG9yLCAnaGlkZScsIHRoaXMuaGlkZSk7XG4gIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXIodGhpcy5zaG93U2VsZWN0b3IsICdzaG93JywgdGhpcy5zaG93KTtcbiAgXG59O1xuXG5TaG93SGlkZS5wcm90b3R5cGUuX2FkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGRhdGFBdHRyLCBjYWxsYmFjaykge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB2YXIgZWxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICBfLmVhY2goZWxlcywgZnVuY3Rpb24gKGVsZSkge1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS0nK2RhdGFBdHRyKTtcbiAgICAgIGlmIChjYWxsYmFjay5hcHBseShfdGhpcywgW3RhcmdldCwgZS5jdXJyZW50VGFyZ2V0XSkpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS5fZ2V0RWxlcyA9IGZ1bmN0aW9uICh0YXJnZXQsIGNhbGxiYWNrKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHZhciB0YXJnZXRFbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0YXJnZXQpO1xuICBpZiAodGFyZ2V0RWxlcy5sZW5ndGggPiAwKSB7XG4gICAgXy5lYWNoKHRhcmdldEVsZXMsIGZ1bmN0aW9uICh0YXJnZXRFbGUpIHtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KF90aGlzLCBbdGFyZ2V0RWxlXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG93SGlkZTsiXX0=
