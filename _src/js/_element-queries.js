require('./_pollyfills/pollyfill.getComputedStyle.js')();
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
  window.addEventListener('resize', function () {
    _this.calcElementQueries();
  });
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
  var html = document.querySelector('html');
  var eqElements = document.querySelectorAll(eqElementSelector);
  for (var i = 0; i < eqElements.length; i++) {
    var eqEle = eqElements[i];
    new ElementQuery(eqEle, html);
  }
};

module.exports = ElementQueries;