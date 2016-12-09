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