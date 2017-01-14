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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL2NvcmUuanMiLCJfc3JjL2pzL3V0aWxzL19lbGVtZW50LXF1ZXJpZXMuanMiLCJfc3JjL2pzL3V0aWxzL19ldmVudGVyLmpzIiwiX3NyYy9qcy91dGlscy9fbGliLmpzIiwiX3NyYy9qcy91dGlscy9fbXEtc2l6ZS5qcyIsIl9zcmMvanMvdXRpbHMvX3Nob3ctaGlkZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gIFRoZW1lIENvcmVcbiAgLSBTZXRzIHVwIHJldXNhYmxlIG9iamVjdHMgbGlrZSBfbGliLCBhbmQgbXEtc2l6ZVxuICAtIFNldHMgdXAgZ2VuZXJpYyBvYmplY3RzIGxpa2Ugc2hvdy1hbmQtaGlkZSwgYW5kIGVsZW1lbnQtcXVlcmllc1xuICAtIGltYWdlIGdhbGxlcmllcz9cbiAgLSBjdXN0b21lciBsb2dpbiBoZWFkZXIgd2lkZ2V0XG4gIFxuICBTdG9yYWdlIG1vZGVsIHVzZXMgYnJvd3NlciBEQiBhbmQgY29va2llcz9cbiovXG5cbi8vIENoZWNrIHRoYXQgd2UgaGF2ZSB3aGF0IHdlIG5lZWQgdG8gbW92ZSBmb3J3YXJkXG52YXIgc3VwcG9ydHMgPSAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJiYgISF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcbmlmICghc3VwcG9ydHMpIHJldHVybjtcblxuLy8gTWFpbiBUaGVtZSBvYmplY3RcbndpbmRvdy5UaGVtZSA9IHdpbmRvdy5UaGVtZSB8fCB7fTtcblxuLy8gTW9kdWxlcyBuZWVkZWQgZm9yIGNvcmUganNcbnZhciBfID0gVGhlbWUuXyA9IHJlcXVpcmUoJy4vdXRpbHMvX2xpYi5qcycpO1xuVGhlbWUubXFTaXplID0gcmVxdWlyZSgnLi91dGlscy9fbXEtc2l6ZS5qcycpO1xuXG52YXIgRWxlbWVudFF1ZXJpZXMgPSByZXF1aXJlKCcuL3V0aWxzL19lbGVtZW50LXF1ZXJpZXMuanMnKTtcblRoZW1lLmVsZW1lbnRRdWVyaWVzID0gbmV3IEVsZW1lbnRRdWVyaWVzKCk7XG5cbnZhciBTaG93SGlkZSA9IHJlcXVpcmUoJy4vdXRpbHMvX3Nob3ctaGlkZS5qcycpO1xuVGhlbWUuc2hvd0hpZGUgPSBuZXcgU2hvd0hpZGUoKTtcblxuXy5yZWFkeShmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKCdyZWFkeScsIFRoZW1lLCBUaGVtZS5tcVNpemUoKSk7XG59KTsiLCIvKlxuICBFbGVtZW50IFF1ZXJpZXM6XG4gIE1lZGlhIHF1ZXJpZXMgYnV0IGZvciBlbGVtZW50cyByYXRoZXIgdGhhbiB0aGUgd2luZG93LlxuICBcbiAgaHRtbDogPGRpdiBjbGFzcz1cIm15LWVsZVwiIGRhdGEtZWxlbWVudC1xdWVyeT1cIm1pbi13aWR0aDogMTBlbSwgbWluLXdpZHRoOiAzMGVtXCI+IC4uLiA8L2Rpdj5cbiAgY3NzOiAubXktZWxlW2RhdGEtbWluLXdpZHRofj1cIjMwZW1cIl0geyAuLi4gfVxuICBcbiovXG5cbnZhciBfID0gcmVxdWlyZSgnLi9fbGliLmpzJyk7XG52YXIgZXFFbGVtZW50U2VsZWN0b3IgPSAnW2RhdGEtZWxlbWVudC1xdWVyeV0nO1xuXG52YXIgRWxlbWVudFF1ZXJ5ID0gZnVuY3Rpb24gKGVxRWxlLCBodG1sKSB7XG4gIHRoaXMuZXFFbGUgPSBlcUVsZTtcbiAgdGhpcy5odG1sID0gaHRtbDtcbiAgdGhpcy5xdWVyaWVzID0gdGhpcy5nZXRRdWVyaWVzKGVxRWxlLmRhdGFzZXQuZWxlbWVudFF1ZXJ5KTtcbiAgXG4gIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgdGhpcy5jYWxjRWxlbWVudFF1ZXJpZXMoKTtcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBfLmRlYm91bmNlKGZ1bmN0aW9uICgpIHtcbiAgICBfdGhpcy5jYWxjRWxlbWVudFF1ZXJpZXMoKTtcbiAgfSkpO1xufTtcblxuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5jYWxjRWxlbWVudFF1ZXJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZW1wdHlDdXJyZW50UXVlcmllcygpO1xuICB0aGlzLmVhY2godGhpcy5xdWVyaWVzLCBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICB0aGlzLmNhbGNFbGVtZW50UXVlcnkocXVlcnkpO1xuICB9KTtcbiAgdGhpcy5hcHBseVF1ZXJpZXMoKTtcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuY2FsY0VsZW1lbnRRdWVyeSA9IGZ1bmN0aW9uIChxdWVyeSkge1xuICB2YXIgb2Zmc2V0VmFsdWUgPSB0aGlzLmdldE9mZnNldFZhbHVlKHF1ZXJ5LmRpbWVuc2lvbik7XG4gIHZhciBjb21wdXRlZFZhbHVlID0gdGhpcy5nZXRDb21wdXRlZFZhbHVlKHF1ZXJ5LnZhbHVlLCBxdWVyeS51bml0KTtcbiAgaWYgKHF1ZXJ5LmxpbWl0ID09PSAnbWluJykge1xuICAgIGlmIChvZmZzZXRWYWx1ZSA+PSBjb21wdXRlZFZhbHVlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRRdWVyaWVzW3F1ZXJ5LmRhdGFLZXldLnB1c2gocXVlcnkpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChxdWVyeS5saW1pdCA9PT0gJ21heCcpIHtcbiAgICBpZiAob2Zmc2V0VmFsdWUgPD0gY29tcHV0ZWRWYWx1ZSkge1xuICAgICAgdGhpcy5jdXJyZW50UXVlcmllc1txdWVyeS5kYXRhS2V5XS5wdXNoKHF1ZXJ5KTtcbiAgICB9XG4gIH1cbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZ2V0T2Zmc2V0VmFsdWUgPSBmdW5jdGlvbiAoZGltZW5zaW9uKSB7XG4gIGlmIChkaW1lbnNpb24gPT09ICd3aWR0aCcpIHtcbiAgICByZXR1cm4gdGhpcy5lcUVsZS5vZmZzZXRXaWR0aDtcbiAgfSBlbHNlIGlmIChkaW1lbnNpb24gPT09ICdoZWlnaHQnKSB7XG4gICAgcmV0dXJuIHRoaXMuZXFFbGUub2Zmc2V0SGVpZ2h0O1xuICB9XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmdldENvbXB1dGVkVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUsIHVuaXQpIHtcbiAgdmFyIGNvbXB1dGVkVmFsdWUsXG4gICAgYmFzZUZvbnRTaXplO1xuICBzd2l0Y2ggKHVuaXQpIHtcbiAgICBjYXNlICdyZW0nOlxuICAgICAgYmFzZUZvbnRTaXplID0gdGhpcy5nZXRGb250U2l6ZSh0aGlzLmh0bWwpO1xuICAgICAgY29tcHV0ZWRWYWx1ZSA9IGJhc2VGb250U2l6ZSAqIHZhbHVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZW0nOlxuICAgICAgYmFzZUZvbnRTaXplID0gdGhpcy5nZXRGb250U2l6ZSh0aGlzLmVxRWxlKTtcbiAgICAgIGNvbXB1dGVkVmFsdWUgPSBiYXNlRm9udFNpemUgKiB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb21wdXRlZFZhbHVlID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGNvbXB1dGVkVmFsdWU7XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmFwcGx5UXVlcmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgZGF0YUtleSBpbiB0aGlzLmN1cnJlbnRRdWVyaWVzKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoZGF0YUtleSkpIHtcbiAgICAgIHZhciBkYXRhID0gW107XG4gICAgICB2YXIgZGF0YVNldCA9IHRoaXMuY3VycmVudFF1ZXJpZXNbZGF0YUtleV07XG4gICAgICB0aGlzLmVhY2goZGF0YVNldCwgZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgIGRhdGEucHVzaChxdWVyeS52YWx1ZSArIHF1ZXJ5LnVuaXQpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmVxRWxlLmRhdGFzZXRbZGF0YUtleV0gPSBkYXRhLmpvaW4oJyAnKTtcbiAgICB9XG4gIH1cbn1cblxuLyogSW5pdGlhbCBTZXR1cCAqL1xuRWxlbWVudFF1ZXJ5LnByb3RvdHlwZS5lbXB0eUN1cnJlbnRRdWVyaWVzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmN1cnJlbnRRdWVyaWVzID0ge1xuICAgIG1pbldpZHRoOiBbXSxcbiAgICBtYXhXaWR0aDogW10sXG4gICAgbWluSGVpZ2h0OiBbXSxcbiAgICBtYXhIZWlnaHQ6IFtdXG4gIH07XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmdldFF1ZXJpZXMgPSBmdW5jdGlvbiAocXVlcnlTdHIpIHtcbiAgdmFyIHF1ZXJpZXMgPSBbXSxcbiAgICBxdWVyeVN0cnMgPSBxdWVyeVN0ci5zcGxpdCgnLCcpO1xuICB0aGlzLmVhY2gocXVlcnlTdHJzLCBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICB2YXIgcXVlcnlPYmogPSB0aGlzLmdldFF1ZXJ5T2JqZWN0KHF1ZXJ5KTtcbiAgICBpZiAocXVlcnlPYmopIHtcbiAgICAgIHF1ZXJpZXMucHVzaChxdWVyeU9iaik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHF1ZXJpZXM7XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmdldFF1ZXJ5T2JqZWN0ID0gZnVuY3Rpb24gKHF1ZXJ5U3RyKSB7XG4gIHZhciBxdWVyeU1hdGNoID0gcXVlcnlTdHIubWF0Y2goLyhtaW58bWF4KS0od2lkdGh8aGVpZ2h0KTpcXHM/KFxcZCopKHB4fHJlbXxlbSkvKTtcbiAgaWYgKHF1ZXJ5TWF0Y2gpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGltaXQ6IHF1ZXJ5TWF0Y2hbMV0sXG4gICAgICBkaW1lbnNpb246IHF1ZXJ5TWF0Y2hbMl0sXG4gICAgICB2YWx1ZTogcGFyc2VGbG9hdChxdWVyeU1hdGNoWzNdKSxcbiAgICAgIHVuaXQ6IHF1ZXJ5TWF0Y2hbNF0sXG4gICAgICBkYXRhS2V5OiB0aGlzLmdldERhdGFLZXkocXVlcnlNYXRjaFsxXSwgcXVlcnlNYXRjaFsyXSlcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5FbGVtZW50UXVlcnkucHJvdG90eXBlLmdldEZvbnRTaXplID0gZnVuY3Rpb24gKGVsZSkge1xuICByZXR1cm4gcGFyc2VGbG9hdCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGUsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpKTtcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZ2V0RGF0YUtleSA9IGZ1bmN0aW9uIChsaW1pdCwgZGltZW5zaW9uKSB7XG4gIHJldHVybiBsaW1pdCArIGRpbWVuc2lvbi5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGRpbWVuc2lvbi5zbGljZSgxKTtcbn07XG5cbkVsZW1lbnRRdWVyeS5wcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uIChvYmosIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBvYmpbaV07XG4gICAgY2FsbGJhY2suYXBwbHkodGhpcywgW2l0ZW0sIGldKTtcbiAgfVxufTtcblxuLyogV3JhcHBlciBmb3IgbXVsdGlwbGUgb2JqZWN0cyAqL1xudmFyIEVsZW1lbnRRdWVyaWVzID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnF1ZXJpZXMgPSBbXTtcbiAgdmFyIGh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XG4gIHZhciBlcUVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlcUVsZW1lbnRTZWxlY3Rvcik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZXFFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlcUVsZSA9IGVxRWxlbWVudHNbaV07XG4gICAgdGhpcy5xdWVyaWVzLnB1c2gobmV3IEVsZW1lbnRRdWVyeShlcUVsZSwgaHRtbCkpO1xuICB9XG59O1xuXG5FbGVtZW50UXVlcmllcy5wcm90b3R5cGUuY2FsY1F1ZXJpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIF8uZWFjaCh0aGlzLnF1ZXJpZXMsIGZ1bmN0aW9uIChxdWVyeSkge1xuICAgIHF1ZXJ5LmNhbGNFbGVtZW50UXVlcmllcygpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudFF1ZXJpZXM7IiwidmFyIEV2ZW50ZXIgPSBmdW5jdGlvbiAoY2FsbGVyKSB7XG4gIHRoaXMuY2FsbGVyID0gY2FsbGVyO1xuICB0aGlzLmNhbGxlci5fZXZlbnRzID0ge307XG4gIHRoaXMuY2FsbGVyLm9uID0gdGhpcy5vbjtcbiAgdGhpcy5jYWxsZXIub2ZmID0gdGhpcy5vZmY7XG4gIHRoaXMuY2FsbGVyLnRyaWdnZXIgPSB0aGlzLnRyaWdnZXI7XG59O1xuXG4vLyB0aGlzID09PSBjYWxsZXIgbm90IEV2ZW50ZXJcbkV2ZW50ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaykge1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcbiAgdGhpcy5fZXZlbnRzW2V2ZW50XS5wdXNoKGNhbGxiYWNrKTtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c1tldmVudF0ubGVuZ3RoIC0gMTtcbn07XG5cbkV2ZW50ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgaWQpIHtcbiAgaWYgKGV2ZW50ICYmIGlkKSB7XG4gICAgaWYgKHRoaXMuX2V2ZW50c1tldmVudF1baWRdKSB0aGlzLl9ldmVudHNbZXZlbnRdW2lkXSA9IG51bGw7XG4gIH0gZWxzZSBpZiAoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gIH1cbn07XG5cbkV2ZW50ZXIucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGFyZ3MpIHtcbiAgaWYgKHR5cGVvZiBhcmdzICE9PSAnb2JqZWN0JykgYXJncyA9IFthcmdzXTsgXG4gIGZvciAodmFyIGkgaW4gdGhpcy5fZXZlbnRzW2V2ZW50XSkge1xuICAgIHZhciBlID0gdGhpcy5fZXZlbnRzW2V2ZW50XVtpXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2ZW50XS5oYXNPd25Qcm9wZXJ0eShpKSAmJiB0eXBlb2YgZSA9PT0gJ2Z1bmN0aW9uJykgZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudGVyOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAvKlxuICAgIEFycmF5IEZ1bmN0aW9uc1xuICAqL1xuICAvLyBGb3IgZWFjaCBpdGVtIGluIEFycmF5XG4gIGVhY2g6IGZ1bmN0aW9uIChhcnIsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgY3R4ID0gY3R4IHx8IGFycltpXTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgW2FycltpXSwgaV0pO1xuICAgIH1cbiAgfSxcbiAgXG4gIC8vIEZvciBlYWNoIGl0ZW0gaW4gT2JqZWN0XG4gIGVhY2hJbjogZnVuY3Rpb24gKG9iaiwgY2FsbGJhY2ssIGN0eCkge1xuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgIGN0eCA9IGN0eCB8fCBvYmpba107XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgW29ialtrXSwga10pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXG4gIC8vIFJldHVybiB0cnVlIGlmIGl0ZW0gaXMgaW4gQXJyYXlcbiAgaW5BcnJheTogZnVuY3Rpb24gKG5lZWRsZSwgaGF5c3RhY2spIHtcbiAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICB0aGlzLmVhY2goaGF5c3RhY2ssIGZ1bmN0aW9uIChoYXkpIHtcbiAgICAgIGlmIChuZWVkbGUgPT09IGhheSkgZm91bmQgPSB0cnVlO1xuICAgIH0pO1xuICAgIHJldHVybiBmb3VuZDtcbiAgfSxcbiAgXG4gIC8vIHJldHVybiB0aGUgbGFzdCBpdGVtIGluIHRoZSBhcnJheVxuICBsYXN0OiBmdW5jdGlvbiAoYXJyKSB7XG4gICAgcmV0dXJuIGFyclthcnIubGVuZ3RoIC0gMV07XG4gIH0sXG4gIFxuICBcbiAgLypcbiAgICBTdHJpbmcgRnVuY3Rpb25zXG4gICovXG4gIC8vIENhcHRpYWxzZSB0aGUgZmlyc3QgY2hhciBpbiBTdHJpbmdcbiAgY2FwaXRhbGlzZTogZnVuY3Rpb24gKHN0cikge1xuICAgIHJldHVybiBzdHJbMF0udG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbiAgfSxcbiAgXG4gIFxuICAvKlxuICAgIEV2ZW50IEZ1bmN0aW9uc1xuICAqL1xuICAvLyBSdW4gY29kZSB3aGVuIHRoZSBwYWdlIGlzIHJlYWR5XG4gIHJlYWR5OiBmdW5jdGlvbiAoY2FsbGJhY2ssIGN0eCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHJldHVybjtcbiAgICBcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKSB7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBcbiAgLy8gQ1VTVE9NIEZVTkMgZm9yIHNlaWRvIHRvIHRyaWdnZXIgdGhpbmdzIHdoZW4gdGhlIGNvcmUgaXMgcmVhZHlcbiAgcmVhZHlDb3JlOiBmdW5jdGlvbiAoY2FsbGJhY2ssIGN0eCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHJldHVybjtcbiAgICBcbiAgICBpZiAod2luZG93LlNlaWRvQ29yZS5yZWFkeSkge1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LlNlaWRvQ29yZS5vbigncmVhZHknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIFxuICAvLyBNYWtlIHRoaW5nIG5vdCBoYXBwZW4gdW50aWwgZmluaXNoZWQ/XG4gIC8vIGkuZS4gZG9uJ3QgYWN0IG9uIGV2ZXJ5IHdpbmRvdyByZXNpemUgZXZlbnQsIGp1c3QgdGhlIGxhc3Qgb25lIHdoZW4gd2UgbmVlZCBpdC5cbiAgZGVib3VuY2U6IGZ1bmN0aW9uIChjYWxsYmFjaywgd2FpdCwgY3R4KSB7XG4gICAgdmFyIHRpbWVvdXQsIHRpbWVzdGFtcCwgYXJncztcbiAgICB3YWl0ID0gd2FpdCB8fCAxMDA7XG4gICAgXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZXN0YW1wO1xuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgYXJncyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgY3R4ID0gY3R4IHx8IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICB9O1xuICB9LFxuICBcbiAgLy8gRG9uJ3Qgc3dhbXAgdXMgd2l0aCBldmVudHNcbiAgLy8gZ29vZCBmb3IgdGhpbmdzIGxpa2Ugc2Nyb2xsIGFuZCByZXNpemVcbiAgdGhyb3R0bGU6IGZ1bmN0aW9uIChjYWxsYmFjaywgbGltaXQsIGN0eCkge1xuICAgIGxpbWl0ID0gbGltaXQgfHwgMjAwO1xuICAgIHZhciB3YWl0ID0gZmFsc2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghd2FpdCkge1xuICAgICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIHdhaXQgPSB0cnVlO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB3YWl0ID0gZmFsc2U7XG4gICAgICAgIH0sIGxpbWl0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5LCc6YWZ0ZXInKS5nZXRQcm9wZXJ0eVZhbHVlKCdjb250ZW50JykucmVwbGFjZSgvWydcIl0vZywgJycpO1xufTsiLCIvKlxuICBUbyBzaG93LCBoaWRlIG9yIHRvZ2dsZSBhbiBlbGVtZW50IGFkZCBhIGRhdGEgYXR0cmlidXRlIG9mIGRhdGEtc2hvdz1cIlwiXG4gIHRvIHRoZSBlbGVtZW50IHlvdSB3aXNoIHRvIHRyaWdnZXIgdGhlIHNob3cvaGlkZSBhY3Rpb24sXG4gIHdpdGggdGhlIHZhbHVlIGJlaW5nIGEgY3NzIHNlbGVjdG9yIG9mIHRoZSB0YXJnZXQgZWxlbWVudCB0byBiZSBzaG93bi9oaWRkZW5cbiAgXG4gIGBkYXRhLXRvZ2dsZS1jb250ZW50YFxuICBcbiAgYGRhdGEtdG9nZ2xlLWdyb3VwYFxuKi9cblxudmFyIF8gPSByZXF1aXJlKCcuL19saWIuanMnKTtcbnZhciBFdmVudGVyID0gcmVxdWlyZSgnLi9fZXZlbnRlci5qcycpO1xuXG52YXIgU2hvd0hpZGUgPSBmdW5jdGlvbiAoKSB7XG4gIG5ldyBFdmVudGVyKHRoaXMpO1xuICB0aGlzLmhpZGRlbkNsYXNzID0gJ2hpZGRlbic7XG4gIHRoaXMuc2hvd1NlbGVjdG9yID0gJ1tkYXRhLXNob3ddJztcbiAgdGhpcy5oaWRlU2VsZWN0b3IgPSAnW2RhdGEtaGlkZV0nO1xuICB0aGlzLnRvZ2dsZVNlbGVjdG9yID0gJ1tkYXRhLXRvZ2dsZV0nO1xuICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpO1xufTtcblxuU2hvd0hpZGUucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb25FbGUpIHtcbiAgdmFyIGRpZFNob3cgPSB0aGlzLl9nZXRFbGVzKHRhcmdldCwgZnVuY3Rpb24gKHRhcmdldEVsZSkge1xuICAgIHRhcmdldEVsZS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuaGlkZGVuQ2xhc3MpO1xuICB9KTtcbiAgaWYgKGRpZFNob3cpe1xuICAgIHRoaXMudG9nZ2xlQ29udGVudChhY3Rpb25FbGUpO1xuICAgIHRoaXMudHJpZ2dlcignc2hvdycsIFthY3Rpb25FbGUsIHRhcmdldF0pO1xuICB9XG4gIHJldHVybiBkaWRTaG93O1xufTtcblxuU2hvd0hpZGUucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb25FbGUpIHtcbiAgdmFyIGRpZEhpZGUgPSB0aGlzLl9nZXRFbGVzKHRhcmdldCwgZnVuY3Rpb24gKHRhcmdldEVsZSkge1xuICAgIHRhcmdldEVsZS5jbGFzc0xpc3QuYWRkKHRoaXMuaGlkZGVuQ2xhc3MpO1xuICB9KTtcbiAgaWYgKGRpZEhpZGUpIHtcbiAgICB0aGlzLnRvZ2dsZUNvbnRlbnQoYWN0aW9uRWxlKTtcbiAgICB0aGlzLnRyaWdnZXIoJ2hpZGUnLCBbYWN0aW9uRWxlLCB0YXJnZXRdKTtcbiAgfVxuICByZXR1cm4gZGlkSGlkZTtcbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAodGFyZ2V0LCBhY3Rpb25FbGUpIHtcbiAgdmFyIGV2ZW50O1xuICB2YXIgZGlkVG9nZ2xlID0gdGhpcy5fZ2V0RWxlcyh0YXJnZXQsIGZ1bmN0aW9uICh0YXJnZXRFbGUpIHtcbiAgICB2YXIgZGlzcGxheSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldEVsZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnZGlzcGxheScpO1xuICAgIGlmIChkaXNwbGF5ID09ICdub25lJykge1xuICAgICAgdGFyZ2V0RWxlLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5oaWRkZW5DbGFzcyk7XG4gICAgICBldmVudCA9ICdzaG93JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0RWxlLmNsYXNzTGlzdC5hZGQodGhpcy5oaWRkZW5DbGFzcyk7XG4gICAgICBldmVudCA9ICdoaWRlJztcbiAgICB9XG4gIH0pO1xuICBcbiAgaWYgKGRpZFRvZ2dsZSkge1xuICAgIHRoaXMudG9nZ2xlR3JvdXAoZXZlbnQsIGFjdGlvbkVsZSwgJ3RvZ2dsZScpO1xuICAgIHRoaXMudG9nZ2xlQ29udGVudChhY3Rpb25FbGUpO1xuICAgIHRoaXMudHJpZ2dlcihldmVudCwgW2FjdGlvbkVsZSwgdGFyZ2V0XSk7XG4gIH1cbiAgcmV0dXJuIGRpZFRvZ2dsZTtcbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS50b2dnbGVDb250ZW50ID0gZnVuY3Rpb24gKGFjdGlvbkVsZSkge1xuICBpZiAoYWN0aW9uRWxlLmhhc0F0dHJpYnV0ZSgnZGF0YS10b2dnbGUtY29udGVudCcpKSB7XG4gICAgdmFyIG5ld0NvbnRlbnQgPSBhY3Rpb25FbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRvZ2dsZS1jb250ZW50Jyk7XG4gICAgYWN0aW9uRWxlLnNldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUtY29udGVudCcsIGFjdGlvbkVsZS5pbm5lckhUTUwpO1xuICAgIGFjdGlvbkVsZS5pbm5lckhUTUwgPSBuZXdDb250ZW50O1xuICB9XG59O1xuXG5TaG93SGlkZS5wcm90b3R5cGUudG9nZ2xlR3JvdXAgPSBmdW5jdGlvbiAoZXZlbnQsIGFjdGlvbkVsZSwgZGF0YUF0dHIpIHtcbiAgaWYgKGFjdGlvbkVsZS5oYXNBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlLWdyb3VwJykpIHtcbiAgICB2YXIgZ3JvdXBTZWxlY3RvciA9ICdbZGF0YS10b2dnbGUtZ3JvdXA9XCInK2FjdGlvbkVsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlLWdyb3VwJykrJ1wiXSc7XG4gICAgdmFyIGdyb3VwRWxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZ3JvdXBTZWxlY3Rvcik7XG4gICAgXy5lYWNoKGdyb3VwRWxlcywgZnVuY3Rpb24gKGdyb3VwRWxlKSB7XG4gICAgICBpZiAoZ3JvdXBFbGUgIT09IGFjdGlvbkVsZSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZ3JvdXBFbGUuZ2V0QXR0cmlidXRlKCdkYXRhLScrZGF0YUF0dHIpO1xuICAgICAgICBpZiAoZXZlbnQgPT09ICdzaG93Jykge1xuICAgICAgICAgIHRoaXMuaGlkZSh0YXJnZXQsIGdyb3VwRWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9O1xufTtcblxuLy8gUHJpdmF0ZVxuU2hvd0hpZGUucHJvdG90eXBlLl9hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcih0aGlzLnRvZ2dsZVNlbGVjdG9yLCAndG9nZ2xlJywgdGhpcy50b2dnbGUpO1xuICB0aGlzLl9hZGRFdmVudExpc3RlbmVyKHRoaXMuaGlkZVNlbGVjdG9yLCAnaGlkZScsIHRoaXMuaGlkZSk7XG4gIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXIodGhpcy5zaG93U2VsZWN0b3IsICdzaG93JywgdGhpcy5zaG93KTtcbiAgXG59O1xuXG5TaG93SGlkZS5wcm90b3R5cGUuX2FkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGRhdGFBdHRyLCBjYWxsYmFjaykge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB2YXIgZWxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICBfLmVhY2goZWxlcywgZnVuY3Rpb24gKGVsZSkge1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS0nK2RhdGFBdHRyKTtcbiAgICAgIGlmIChjYWxsYmFjay5hcHBseShfdGhpcywgW3RhcmdldCwgZS5jdXJyZW50VGFyZ2V0XSkpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn07XG5cblNob3dIaWRlLnByb3RvdHlwZS5fZ2V0RWxlcyA9IGZ1bmN0aW9uICh0YXJnZXQsIGNhbGxiYWNrKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHZhciB0YXJnZXRFbGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0YXJnZXQpO1xuICBpZiAodGFyZ2V0RWxlcy5sZW5ndGggPiAwKSB7XG4gICAgXy5lYWNoKHRhcmdldEVsZXMsIGZ1bmN0aW9uICh0YXJnZXRFbGUpIHtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KF90aGlzLCBbdGFyZ2V0RWxlXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaG93SGlkZTsiXX0=
