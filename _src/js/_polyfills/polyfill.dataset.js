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