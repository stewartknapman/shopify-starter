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
Theme._ = _ = require('./utils/_lib.js');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NvcmUuanMiLCJfc3JjL2pzL3V0aWxzL19lbGVtZW50LXF1ZXJpZXMuanMiLCJfc3JjL2pzL3V0aWxzL19ldmVudGVyLmpzIiwiX3NyYy9qcy91dGlscy9fbGliLmpzIiwiX3NyYy9qcy91dGlscy9fbXEtc2l6ZS5qcyIsIl9zcmMvanMvdXRpbHMvX3Nob3ctaGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gIFRoZW1lIENvcmVcbiAgLSBTZXRzIHVwIHJldXNhYmxlIG9iamVjdHMgbGlrZSBfbGliLCBhbmQgbXEtc2l6ZVxuICAtIFNldHMgdXAgZ2VuZXJpYyBvYmplY3RzIGxpa2Ugc2hvdy1hbmQtaGlkZSwgYW5kIGVsZW1lbnQtcXVlcmllc1xuICAtIGltYWdlIGdhbGxlcmllcz9cbiAgLSBjdXN0b21lciBsb2dpbiBoZWFkZXIgd2lkZ2V0XG4gIFxuICBTdG9yYWdlIG1vZGVsIHVzZXMgYnJvd3NlciBEQiBhbmQgY29va2llcz9cbiovXG5cbi8vIENoZWNrIHRoYXQgd2UgaGF2ZSB3aGF0IHdlIG5lZWQgdG8gbW92ZSBmb3J3YXJkXG52YXIgc3VwcG9ydHMgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJiYgISF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcbmlmICghc3VwcG9ydHMpIHJldHVybjtcblxuLy8gTWFpbiBUaGVtZSBvYmplY3RcbndpbmRvdy5UaGVtZSA9IHdpbmRvdy5UaGVtZSB8fCB7fTtcblxuLy8gTW9kdWxlcyBuZWVkZWQgZm9yIGNvcmUganNcblRoZW1lLl8gPSBfID0gcmVxdWlyZSgnLi91dGlscy9fbGliLmpzJyk7XG5UaGVtZS5tcVNpemUgPSByZXF1aXJlKCcuL3V0aWxzL19tcS1zaXplLmpzJyk7XG5cbnZhciBFbGVtZW50UXVlcmllcyA9IHJlcXVpcmUoJy4vdXRpbHMvX2VsZW1lbnQtcXVlcmllcy5qcycpO1xuVGhlbWUuZWxlbWVudFF1ZXJpZXMgPSBuZXcgRWxlbWVudFF1ZXJpZXMoKTtcblxudmFyIFNob3dIaWRlID0gcmVxdWlyZSgnLi91dGlscy9fc2hvdy1oaWRlLmpzJyk7XG5UaGVtZS5zaG93SGlkZSA9IG5ldyBTaG93SGlkZSgpO1xuXG5fLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coJ3JlYWR5JywgVGhlbWUsIFRoZW1lLm1xU2l6ZSgpKTtcbn0pOyIsIi8qXG4gIEVsZW1lbnQgUXVlcmllczpcbiAgTWVkaWEgcXVlcmllcyBidXQgZm9yIGVsZW1lbnRzIHJhdGhlciB0aGFuIHRoZSB3aW5kb3cuXG4gIFxuICBodG1sOiA8ZGl2IGNsYXNzPVwibXktZWxlXCIgZGF0YS1lbGVtZW50LXF1ZXJ5PVwibWluLXdpZHRoOiAxMGVtLCBtaW4td2lkdGg6IDMwZW1cIj4gLi4uIDwvZGl2PlxuICBjc3M6IC5teS1lbGVbZGF0YS1taW4td2lkdGh+PVwiMzBlbVwiXSB7IC4uLiB9XG4gIFxuKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL19saWIuanMnKTtcbnZhciBlcUVsZW1lbnRTZWxlY3RvciA9ICdbZGF0YS1lbGVtZW50LXF1ZXJ5XSc7XG5cbnZhciBFbGVtZW50UXVlcnkgPSBmdW5jdGlvbiAoZXFFbGUsIGh0bWwpIHtcbiAgdGhpcy5lcUVsZSA9IGVxRWxlO1xuICB0aGlzLmh0bWwgPSBodG1sO1xuICB0aGlzLnF1ZXJpZXMgPSB0aGlzLmdldFF1ZXJpZXMoZXFFbGUuZGF0YXNldC5lbGVtZW50UXVlcnkpO1xuICBcbiAgdGhpcy5hZGRFdmVudExpc3RlbmVycygpO1xuICB0aGlzLmNhbGNFbGVtZW50UXVlcmllcygpO1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIF8uZGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgIF90aGlzLmNhbGNFbGVtZW50UXVlcmllcygpO1xuICB9KSk7XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmNhbGNFbGVtZW50UXVlcmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5lbXB0eUN1cnJlbnRRdWVyaWVzKCk7XG4gIHRoaXMuZWFjaCh0aGlzLnF1ZXJpZXMsIGZ1bmN0aW9uIChxdWVyeSkge1xuICAgIHRoaXMuY2FsY0VsZW1lbnRRdWVyeShxdWVyeSk7XG4gIH0pO1xuICB0aGlzLmFwcGx5UXVlcmllcygpO1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5jYWxjRWxlbWVudFF1ZXJ5ID0gZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gIHZhciBvZmZzZXRWYWx1ZSA9IHRoaXMuZ2V0T2Zmc2V0VmFsdWUocXVlcnkuZGltZW5zaW9uKTtcbiAgdmFyIGNvbXB1dGVkVmFsdWUgPSB0aGlzLmdldENvbXB1dGVkVmFsdWUocXVlcnkudmFsdWUsIHF1ZXJ5LnVuaXQpO1xuICBpZiAocXVlcnkubGltaXQgPT09ICdtaW4nKSB7XG4gICAgaWYgKG9mZnNldFZhbHVlID49IGNvbXB1dGVkVmFsdWUpIHtcbiAgICAgIHRoaXMuY3VycmVudFF1ZXJpZXNbcXVlcnkuZGF0YUtleV0ucHVzaChxdWVyeSk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHF1ZXJ5LmxpbWl0ID09PSAnbWF4Jykge1xuICAgIGlmIChvZmZzZXRWYWx1ZSA8PSBjb21wdXRlZFZhbHVlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRRdWVyaWVzW3F1ZXJ5LmRhdGFLZXldLnB1c2gocXVlcnkpO1xuICAgIH1cbiAgfVxufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5nZXRPZmZzZXRWYWx1ZSA9IGZ1bmN0aW9uIChkaW1lbnNpb24pIHtcbiAgaWYgKGRpbWVuc2lvbiA9PT0gJ3dpZHRoJykge1xuICAgIHJldHVybiB0aGlzLmVxRWxlLm9mZnNldFdpZHRoO1xuICB9IGVsc2UgaWYgKGRpbWVuc2lvbiA9PT0gJ2hlaWdodCcpIHtcbiAgICByZXR1cm4gdGhpcy5lcUVsZS5vZmZzZXRIZWlnaHQ7XG4gIH1cbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZ2V0Q29tcHV0ZWRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSwgdW5pdCkge1xuICB2YXIgY29tcHV0ZWRWYWx1ZSxcbiAgICBiYXNlRm9udFNpemU7XG4gIHN3aXRjaCAodW5pdCkge1xuICAgIGNhc2UgJ3JlbSc6XG4gICAgICBiYXNlRm9udFNpemUgPSB0aGlzLmdldEZvbnRTaXplKHRoaXMuaHRtbCk7XG4gICAgICBjb21wdXRlZFZhbHVlID0gYmFzZUZvbnRTaXplICogdmFsdWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlbSc6XG4gICAgICBiYXNlRm9udFNpemUgPSB0aGlzLmdldEZvbnRTaXplKHRoaXMuZXFFbGUpO1xuICAgICAgY29tcHV0ZWRWYWx1ZSA9IGJhc2VGb250U2l6ZSAqIHZhbHVlO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbXB1dGVkVmFsdWUgPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gY29tcHV0ZWRWYWx1ZTtcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuYXBwbHlRdWVyaWVzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBkYXRhS2V5IGluIHRoaXMuY3VycmVudFF1ZXJpZXMpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50UXVlcmllcy5oYXNPd25Qcm9wZXJ0eShkYXRhS2V5KSkge1xuICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgIHZhciBkYXRhU2V0ID0gdGhpcy5jdXJyZW50UXVlcmllc1tkYXRhS2V5XTtcbiAgICAgIHRoaXMuZWFjaChkYXRhU2V0LCBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgZGF0YS5wdXNoKHF1ZXJ5LnZhbHVlICsgcXVlcnkudW5pdCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZXFFbGUuZGF0YXNldFtkYXRhS2V5XSA9IGRhdGEuam9pbignICcpO1xuICAgIH1cbiAgfVxufVxuXG4vKiBJbml0aWFsIFNldHVwICovXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmVtcHR5Q3VycmVudFF1ZXJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuY3VycmVudFF1ZXJpZXMgPSB7XG4gICAgbWluV2lkdGg6IFtdLFxuICAgIG1heFdpZHRoOiBbXSxcbiAgICBtaW5IZWlnaHQ6IFtdLFxuICAgIG1heEhlaWdodDogW11cbiAgfTtcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZ2V0UXVlcmllcyA9IGZ1bmN0aW9uIChxdWVyeVN0cikge1xuICB2YXIgcXVlcmllcyA9IFtdLFxuICAgIHF1ZXJ5U3RycyA9IHF1ZXJ5U3RyLnNwbGl0KCcsJyk7XG4gIHRoaXMuZWFjaChxdWVyeVN0cnMsIGZ1bmN0aW9uIChxdWVyeSkge1xuICAgIHZhciBxdWVyeU9iaiA9IHRoaXMuZ2V0UXVlcnlPYmplY3QocXVlcnkpO1xuICAgIGlmIChxdWVyeU9iaikge1xuICAgICAgcXVlcmllcy5wdXNoKHF1ZXJ5T2JqKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcXVlcmllcztcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZ2V0UXVlcnlPYmplY3QgPSBmdW5jdGlvbiAocXVlcnlTdHIpIHtcbiAgdmFyIHF1ZXJ5TWF0Y2ggPSBxdWVyeVN0ci5tYXRjaCgvKG1pbnxtYXgpLSh3aWR0aHxoZWlnaHQpOlxccz8oXFxkKikocHh8cmVtfGVtKS8pO1xuICBpZiAocXVlcnlNYXRjaCkge1xuICAgIHJldHVybiB7XG4gICAgICBsaW1pdDogcXVlcnlNYXRjaFsxXSxcbiAgICAgIGRpbWVuc2lvbjogcXVlcnlNYXRjaFsyXSxcbiAgICAgIHZhbHVlOiBwYXJzZUZsb2F0KHF1ZXJ5TWF0Y2hbM10pLFxuICAgICAgdW5pdDogcXVlcnlNYXRjaFs0XSxcbiAgICAgIGRhdGFLZXk6IHRoaXMuZ2V0RGF0YUtleShxdWVyeU1hdGNoWzFdLCBxdWVyeU1hdGNoWzJdKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZ2V0Rm9udFNpemUgPSBmdW5jdGlvbiAoZWxlKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJykpO1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5nZXREYXRhS2V5ID0gZnVuY3Rpb24gKGxpbWl0LCBkaW1lbnNpb24pIHtcbiAgcmV0dXJuIGxpbWl0ICsgZGltZW5zaW9uLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZGltZW5zaW9uLnNsaWNlKDEpO1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5lYWNoID0gZnVuY3Rpb24gKG9iaiwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IG9ialtpXTtcbiAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBbaXRlbSwgaV0pO1xuICB9XG59O1xuXG4vKiBXcmFwcGVyIGZvciBtdWx0aXBsZSBvYmplY3RzICovXG52YXIgRWxlbWVudFF1ZXJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucXVlcmllcyA9IFtdO1xuICB2YXIgaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2h0bWwnKTtcbiAgdmFyIGVxRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGVxRWxlbWVudFNlbGVjdG9yKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcUVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVxRWxlID0gZXFFbGVtZW50c1tpXTtcbiAgICB0aGlzLnF1ZXJpZXMucHVzaChuZXcgRWxlbWVudFF1ZXJ5KGVxRWxlLCBodG1sKSk7XG4gIH1cbn07XG5cbkVsZW1lbnRRdWVyaWVzLnByb3RvdHlwZS5jYWxjUXVlcmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgXy5lYWNoKHRoaXMucXVlcmllcywgZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgcXVlcnkuY2FsY0VsZW1lbnRRdWVyaWVzKCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50UXVlcmllczsiLCJ2YXIgRXZlbnRlciA9IGZ1bmN0aW9uIChjYWxsZXIpIHtcbiAgdGhpcy5jYWxsZXIgPSBjYWxsZXI7XG4gIHRoaXMuY2FsbGVyLl9ldmVudHMgPSB7fTtcbiAgdGhpcy5jYWxsZXIub24gPSB0aGlzLm9uO1xuICB0aGlzLmNhbGxlci5vZmYgPSB0aGlzLm9mZjtcbiAgdGhpcy5jYWxsZXIudHJpZ2dlciA9IHRoaXMudHJpZ2dlcjtcbn07XG5cbi8vIHRoaXMgPT09IGNhbGxlciBub3QgRXZlbnRlclxuRXZlbnRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtdO1xuICB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xuICByZXR1cm4gdGhpcy5fZXZlbnRzW2V2ZW50XS5sZW5ndGggLSAxO1xufTtcblxuRXZlbnRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBpZCkge1xuICBpZiAoZXZlbnQgJiYgaWQpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2ZW50XVtpZF0pIHRoaXMuX2V2ZW50c1tldmVudF1baWRdID0gbnVsbDtcbiAgfSBlbHNlIGlmIChldmVudCkge1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnRdKSB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgfVxufTtcblxuRXZlbnRlci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChldmVudCwgYXJncykge1xuICBpZiAodHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSBhcmdzID0gW2FyZ3NdOyBcbiAgZm9yICh2YXIgaSBpbiB0aGlzLl9ldmVudHNbZXZlbnRdKSB7XG4gICAgdmFyIGUgPSB0aGlzLl9ldmVudHNbZXZlbnRdW2ldO1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnRdLmhhc093blByb3BlcnR5KGkpICYmIHR5cGVvZiBlID09PSAnZnVuY3Rpb24nKSBlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50ZXI7IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8qXG4gICAgQXJyYXkgRnVuY3Rpb25zXG4gICovXG4gIC8vIEZvciBlYWNoIGl0ZW0gaW4gQXJyYXlcbiAgZWFjaDogZnVuY3Rpb24gKGFyciwgY2FsbGJhY2ssIGN0eCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjdHggPSBjdHggfHwgYXJyW2ldO1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBbYXJyW2ldLCBpXSk7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gRm9yIGVhY2ggaXRlbSBpbiBPYmplY3RcbiAgZWFjaEluOiBmdW5jdGlvbiAob2JqLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgY3R4ID0gY3R4IHx8IG9ialtrXTtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBbb2JqW2tdLCBrXSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcbiAgLy8gUmV0dXJuIHRydWUgaWYgaXRlbSBpcyBpbiBBcnJheVxuICBpbkFycmF5OiBmdW5jdGlvbiAobmVlZGxlLCBoYXlzdGFjaykge1xuICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgIHRoaXMuZWFjaChoYXlzdGFjaywgZnVuY3Rpb24gKGhheSkge1xuICAgICAgaWYgKG5lZWRsZSA9PT0gaGF5KSBmb3VuZCA9IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZvdW5kO1xuICB9LFxuICBcbiAgLy8gcmV0dXJuIHRoZSBsYXN0IGl0ZW0gaW4gdGhlIGFycmF5XG4gIGxhc3Q6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXTtcbiAgfSxcbiAgXG4gIFxuICAvKlxuICAgIFN0cmluZyBGdW5jdGlvbnNcbiAgKi9cbiAgLy8gQ2FwdGlhbHNlIHRoZSBmaXJzdCBjaGFyIGluIFN0cmluZ1xuICBjYXBpdGFsaXNlOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHN0clswXS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xuICB9LFxuICBcbiAgXG4gIC8qXG4gICAgRXZlbnQgRnVuY3Rpb25zXG4gICovXG4gIC8vIFJ1biBjb2RlIHdoZW4gdGhlIHBhZ2UgaXMgcmVhZHlcbiAgcmVhZHk6IGZ1bmN0aW9uIChjYWxsYmFjaywgY3R4KSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgIFxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBDVVNUT00gRlVOQyBmb3Igc2VpZG8gdG8gdHJpZ2dlciB0aGluZ3Mgd2hlbiB0aGUgY29yZSBpcyByZWFkeVxuICByZWFkeUNvcmU6IGZ1bmN0aW9uIChjYWxsYmFjaywgY3R4KSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgIFxuICAgIGlmICh3aW5kb3cuU2VpZG9Db3JlLnJlYWR5KSB7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuU2VpZG9Db3JlLm9uKCdyZWFkeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8vIE1ha2UgdGhpbmcgbm90IGhhcHBlbiB1bnRpbCBmaW5pc2hlZD9cbiAgLy8gaS5lLiBkb24ndCBhY3Qgb24gZXZlcnkgd2luZG93IHJlc2l6ZSBldmVudCwganVzdCB0aGUgbGFzdCBvbmUgd2hlbiB3ZSBuZWVkIGl0LlxuICBkZWJvdW5jZTogZnVuY3Rpb24gKGNhbGxiYWNrLCB3YWl0LCBjdHgpIHtcbiAgICB2YXIgdGltZW91dCwgdGltZXN0YW1wLCBhcmdzO1xuICAgIHdhaXQgPSB3YWl0IHx8IDEwMDtcbiAgICBcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lc3RhbXA7XG4gICAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+PSAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBjdHggPSBjdHggfHwgdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIGlmICghdGltZW91dCkgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgIH07XG4gIH0sXG4gIFxuICAvLyBEb24ndCBzd2FtcCB1cyB3aXRoIGV2ZW50c1xuICAvLyBnb29kIGZvciB0aGluZ3MgbGlrZSBzY3JvbGwgYW5kIHJlc2l6ZVxuICB0aHJvdHRsZTogZnVuY3Rpb24gKGNhbGxiYWNrLCBsaW1pdCwgY3R4KSB7XG4gICAgbGltaXQgPSBsaW1pdCB8fCAyMDA7XG4gICAgdmFyIHdhaXQgPSBmYWxzZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF3YWl0KSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgd2FpdCA9IHRydWU7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHdhaXQgPSBmYWxzZTtcbiAgICAgICAgfSwgbGltaXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmJvZHksJzphZnRlcicpLmdldFByb3BlcnR5VmFsdWUoJ2NvbnRlbnQnKS5yZXBsYWNlKC9bJ1wiXS9nLCAnJyk7XG59OyIsIi8qXG4gIFRvIHNob3csIGhpZGUgb3IgdG9nZ2xlIGFuIGVsZW1lbnQgYWRkIGEgZGF0YSBhdHRyaWJ1dGUgb2YgZGF0YS1zaG93PVwiXCJcbiAgdG8gdGhlIGVsZW1lbnQgeW91IHdpc2ggdG8gdHJpZ2dlciB0aGUgc2hvdy9oaWRlIGFjdGlvbixcbiAgd2l0aCB0aGUgdmFsdWUgYmVpbmcgYSBjc3Mgc2VsZWN0b3Igb2YgdGhlIHRhcmdldCBlbGVtZW50IHRvIGJlIHNob3duL2hpZGRlblxuICBcbiAgYGRhdGEtdG9nZ2xlLWNvbnRlbnRgXG4gIFxuICBgZGF0YS10b2dnbGUtZ3JvdXBgXG4qL1xuXG52YXIgXyA9IHJlcXVpcmUoJy4vX2xpYi5qcycpO1xudmFyIEV2ZW50ZXIgPSByZXF1aXJlKCcuL19ldmVudGVyLmpzJyk7XG5cbnZhciBTaG93SGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgbmV3IEV2ZW50ZXIodGhpcyk7XG4gIHRoaXMuaGlkZGVuQ2xhc3MgPSAnaGlkZGVuJztcbiAgdGhpcy5zaG93U2VsZWN0b3IgPSAnW2RhdGEtc2hvd10nO1xuICB0aGlzLmhpZGVTZWxlY3RvciA9ICdbZGF0YS1oaWRlXSc7XG4gIHRoaXMudG9nZ2xlU2VsZWN0b3IgPSAnW2RhdGEtdG9nZ2xlXSc7XG4gIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXJzKCk7XG59O1xuXG5TaG93SGlkZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICh0YXJnZXQsIGFjdGlvbkVsZSkge1xuICB2YXIgZGlkU2hvdyA9IHRoaXMuX2dldEVsZXModGFyZ2V0LCBmdW5jdGlvbiAodGFyZ2V0RWxlKSB7XG4gICAgdGFyZ2V0RWxlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5oaWRkZW5DbGFzcyk7XG4gIH0pO1xuICBpZiAoZGlkU2hvdyl7XG4gICAgdGhpcy50b2dnbGVDb250ZW50KGFjdGlvbkVsZSk7XG4gICAgdGhpcy50cmlnZ2VyKCdzaG93JywgW2FjdGlvbkVsZSwgdGFyZ2V0XSk7XG4gIH1cbiAgcmV0dXJuIGRpZFNob3c7XG59O1xuXG5TaG93SGlkZS5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICh0YXJnZXQsIGFjdGlvbkVsZSkge1xuICB2YXIgZGlkSGlkZSA9IHRoaXMuX2dldEVsZXModGFyZ2V0LCBmdW5jdGlvbiAodGFyZ2V0RWxlKSB7XG4gICAgdGFyZ2V0RWxlLmNsYXNzTGlzdC5hZGQodGhpcy5oaWRkZW5DbGFzcyk7XG4gIH0pO1xuICBpZiAoZGlkSGlkZSkge1xuICAgIHRoaXMudG9nZ2xlQ29udGVudChhY3Rpb25FbGUpO1xuICAgIHRoaXMudHJpZ2dlcignaGlkZScsIFthY3Rpb25FbGUsIHRhcmdldF0pO1xuICB9XG4gIHJldHVybiBkaWRIaWRlO1xufTtcblxuU2hvd0hpZGUucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICh0YXJnZXQsIGFjdGlvbkVsZSkge1xuICB2YXIgZXZlbnQ7XG4gIHZhciBkaWRUb2dnbGUgPSB0aGlzLl9nZXRFbGVzKHRhcmdldCwgZnVuY3Rpb24gKHRhcmdldEVsZSkge1xuICAgIHZhciBkaXNwbGF5ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0RWxlLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdkaXNwbGF5Jyk7XG4gICAgaWYgKGRpc3BsYXkgPT0gJ25vbmUnKSB7XG4gICAgICB0YXJnZXRFbGUuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLmhpZGRlbkNsYXNzKTtcbiAgICAgIGV2ZW50ID0gJ3Nob3cnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRFbGUuY2xhc3NMaXN0LmFkZCh0aGlzLmhpZGRlbkNsYXNzKTtcbiAgICAgIGV2ZW50ID0gJ2hpZGUnO1xuICAgIH1cbiAgfSk7XG4gIFxuICBpZiAoZGlkVG9nZ2xlKSB7XG4gICAgdGhpcy50b2dnbGVHcm91cChldmVudCwgYWN0aW9uRWxlLCAndG9nZ2xlJyk7XG4gICAgdGhpcy50b2dnbGVDb250ZW50KGFjdGlvbkVsZSk7XG4gICAgdGhpcy50cmlnZ2VyKGV2ZW50LCBbYWN0aW9uRWxlLCB0YXJnZXRdKTtcbiAgfVxuICByZXR1cm4gZGlkVG9nZ2xlO1xufTtcblxuU2hvd0hpZGUucHJvdG90eXBlLnRvZ2dsZUNvbnRlbnQgPSBmdW5jdGlvbiAoYWN0aW9uRWxlKSB7XG4gIGlmIChhY3Rpb25FbGUuaGFzQXR0cmlidXRlKCdkYXRhLXRvZ2dsZS1jb250ZW50JykpIHtcbiAgICB2YXIgbmV3Q29udGVudCA9IGFjdGlvbkVsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlLWNvbnRlbnQnKTtcbiAgICBhY3Rpb25FbGUuc2V0QXR0cmlidXRlKCdkYXRhLXRvZ2dsZS1jb250ZW50JywgYWN0aW9uRWxlLmlubmVySFRNTCk7XG4gICAgYWN0aW9uRWxlLmlubmVySFRNTCA9IG5ld0NvbnRlbnQ7XG4gIH1cbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS50b2dnbGVHcm91cCA9IGZ1bmN0aW9uIChldmVudCwgYWN0aW9uRWxlLCBkYXRhQXR0cikge1xuICBpZiAoYWN0aW9uRWxlLmhhc0F0dHJpYnV0ZSgnZGF0YS10b2dnbGUtZ3JvdXAnKSkge1xuICAgIHZhciBncm91cFNlbGVjdG9yID0gJ1tkYXRhLXRvZ2dsZS1ncm91cD1cIicrYWN0aW9uRWxlLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUtZ3JvdXAnKSsnXCJdJztcbiAgICB2YXIgZ3JvdXBFbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChncm91cFNlbGVjdG9yKTtcbiAgICBfLmVhY2goZ3JvdXBFbGVzLCBmdW5jdGlvbiAoZ3JvdXBFbGUpIHtcbiAgICAgIGlmIChncm91cEVsZSAhPT0gYWN0aW9uRWxlKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBncm91cEVsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtJytkYXRhQXR0cik7XG4gICAgICAgIGlmIChldmVudCA9PT0gJ3Nob3cnKSB7XG4gICAgICAgICAgdGhpcy5oaWRlKHRhcmdldCwgZ3JvdXBFbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgdGhpcyk7XG4gIH07XG59O1xuXG4vLyBQcml2YXRlXG5TaG93SGlkZS5wcm90b3R5cGUuX2FkZEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLl9hZGRFdmVudExpc3RlbmVyKHRoaXMudG9nZ2xlU2VsZWN0b3IsICd0b2dnbGUnLCB0aGlzLnRvZ2dsZSk7XG4gIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXIodGhpcy5oaWRlU2VsZWN0b3IsICdoaWRlJywgdGhpcy5oaWRlKTtcbiAgdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcih0aGlzLnNob3dTZWxlY3RvciwgJ3Nob3cnLCB0aGlzLnNob3cpO1xuICBcbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS5fYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgZGF0YUF0dHIsIGNhbGxiYWNrKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHZhciBlbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIF8uZWFjaChlbGVzLCBmdW5jdGlvbiAoZWxlKSB7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLScrZGF0YUF0dHIpO1xuICAgICAgaWYgKGNhbGxiYWNrLmFwcGx5KF90aGlzLCBbdGFyZ2V0LCBlLmN1cnJlbnRUYXJnZXRdKSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcblxuU2hvd0hpZGUucHJvdG90eXBlLl9nZXRFbGVzID0gZnVuY3Rpb24gKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdmFyIHRhcmdldEVsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRhcmdldCk7XG4gIGlmICh0YXJnZXRFbGVzLmxlbmd0aCA+IDApIHtcbiAgICBfLmVhY2godGFyZ2V0RWxlcywgZnVuY3Rpb24gKHRhcmdldEVsZSkge1xuICAgICAgY2FsbGJhY2suYXBwbHkoX3RoaXMsIFt0YXJnZXRFbGVdKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNob3dIaWRlOyJdfQ==
