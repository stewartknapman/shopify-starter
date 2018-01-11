var _ = require('./utils/_lib.js');
var Liquid = require('liquidjs');

var Render = function () {
  this.engine = Liquid();
  this.templatesSelector = '[type="text/template"]';
  this.templates = {};
};

Render.prototype.init = function () {
  this._collectTemplates();
};

Render.prototype.renderTemplate = function (key, data) {
  var tmpl = this.templates[key];
  this.engine
    .render(tmpl.template, data)
    .then(function (html) {
      tmpl.target.innerHTML = html;
    });
};

// Private
Render.prototype._collectTemplates = function () {
  var _this = this,
    templates = document.querySelectorAll(this.templatesSelector);
  _.each(templates, function (tmpl) {
    _this._collectTemplate(tmpl);
  });
};

Render.prototype._collectTemplate = function (template) {
  var name = template.id;
  this.templates[name] = {
    name: name,
    template: this.engine.parse(template.innerHTML),
    target: document.querySelector(template.dataset.target)
  }
};

var render = new Render();
_.ready(function () {
  render.init();
});

window.go = function () {
  console.log('go');
  render.renderTemplate('test', { name: 'Liquid' });
};
