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