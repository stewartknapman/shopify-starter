/*
var view = new View({
  ele: 'master element',
  template: '#id of template <script>',
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

// var _ = Theme._;
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
  
};

View.prototype._buildMethods = function (data) {
  
};

View.prototype._buildEventListeners = function (events) {
  
};

module.exports = View;