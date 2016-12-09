require('jsdom-global')();
var fs = require('fs');
var assert = require('chai').assert;
var ShowHide = require('../_src/js/utils/_show-hide.js');
var fixture = fs.readFileSync('./_tests/fixtures/show-hide.html', 'utf8');
var showHide;
var hiddenClass = 'hidden';

var getDisplay = function (ele) {
  return window.getComputedStyle(ele, null).getPropertyValue('display');
};

describe('Show and Hide', function() {
  
  beforeEach(function () {
    document.body.innerHTML = fixture;
    showHide = new ShowHide();
  });
  
  describe('Basic show, hide and toggle', function() {
    
    it('shows a target element', function () {
      var ele = document.querySelector('#show-test-1');
      var action = ele.querySelector('[data-show]');
      var target = ele.querySelector('.target');
      
      assert.equal(getDisplay(target), 'none');
      assert.isTrue(target.classList.contains(hiddenClass));
      
      action.click();
      
      assert.equal(getDisplay(target), 'block');
      assert.isFalse(target.classList.contains(hiddenClass));
    });
    
    it('hides a target element', function () {
      var ele = document.querySelector('#hide-test-1');
      var action = ele.querySelector('[data-hide]');
      var target = ele.querySelector('.target');
      
      assert.equal(getDisplay(target), 'block');
      assert.isFalse(target.classList.contains(hiddenClass));
      
      action.click();
      
      assert.equal(getDisplay(target), 'none');
      assert.isTrue(target.classList.contains(hiddenClass));
    });
    
    it('toggles a target element', function () {
      var ele = document.querySelector('#toggle-test-1');
      var action = ele.querySelector('[data-toggle]');
      var target = ele.querySelector('.target');
      
      assert.equal(getDisplay(target), 'none');
      assert.isTrue(target.classList.contains(hiddenClass));
      
      action.click();
      
      assert.equal(getDisplay(target), 'block');
      assert.isFalse(target.classList.contains(hiddenClass));
      
      action.click();
      
      assert.equal(getDisplay(target), 'none');
      assert.isTrue(target.classList.contains(hiddenClass));
    });
    
  });
  
  describe('Show, hide and toggle multiple targets with one action', function() {
    
    it('shows multiple targets with one show action', function () {
      var ele = document.querySelector('#show-test-2');
      var action = ele.querySelector('[data-show]');
      var targets = ele.querySelectorAll('.target');
      
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        assert.equal(getDisplay(target), 'none');
        assert.isTrue(target.classList.contains(hiddenClass));
      }
      
      action.click();
      
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        assert.equal(getDisplay(target), 'block');
        assert.isFalse(target.classList.contains(hiddenClass));
      }
    });
    
    it('hides multiple targets with one hide action', function () {
      var ele = document.querySelector('#hide-test-2');
      var action = ele.querySelector('[data-hide]');
      var targets = ele.querySelectorAll('.target');
      
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        assert.equal(getDisplay(target), 'block');
        assert.isFalse(target.classList.contains(hiddenClass));
      }
      
      action.click();
      
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        assert.equal(getDisplay(target), 'none');
        assert.isTrue(target.classList.contains(hiddenClass));
      }
    });
    
    it('toggles multiple targets with one toggle action', function() {
      var ele = document.querySelector('#toggle-test-2');
      var action = ele.querySelector('[data-toggle]');
      var targets = ele.querySelectorAll('.target');
      
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        assert.equal(getDisplay(target), 'none');
        assert.isTrue(target.classList.contains(hiddenClass));
      }
      
      action.click();
      
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        assert.equal(getDisplay(target), 'block');
        assert.isFalse(target.classList.contains(hiddenClass));
      }
      
      action.click();
      
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        assert.equal(getDisplay(target), 'none');
        assert.isTrue(target.classList.contains(hiddenClass));
      }
    });
    
  });
  
  describe('Toggle action content', function() {
  
    it('toggles the content of the action button when showing', function () {
      var ele = document.querySelector('#show-test-3');
      var action = ele.querySelector('[data-show]');
      
      assert.equal(action.innerHTML, 'Show');
      
      action.click();
      
      assert.equal(action.innerHTML, 'Hide');
    });
  
    it('toggles the content of the action button when hiding', function () {
      var ele = document.querySelector('#hide-test-3');
      var action = ele.querySelector('[data-hide]');
      
      assert.equal(action.innerHTML, 'Hide');
      
      action.click();
      
      assert.equal(action.innerHTML, 'Show');
    });
  
    it('toggles the content of the action button when toggling', function () {
      var ele = document.querySelector('#toggle-test-3');
      var action = ele.querySelector('[data-toggle]');
      
      assert.equal(action.innerHTML, 'Show');
      
      action.click();
      
      assert.equal(action.innerHTML, 'Hide');
      
      action.click();
      
      assert.equal(action.innerHTML, 'Show');
    });
  
  });
  
  describe('Toggle group', function() {
  
    it('hides the other visible targets in the group when one target is shown', function () {
      var ele = document.querySelector('#toggle-test-4');
      var action1 = ele.querySelector('[data-toggle="#toggle-test-4-target-1"]');
      var action2 = ele.querySelector('[data-toggle="#toggle-test-4-target-2"]');
      var action3 = ele.querySelector('[data-toggle="#toggle-test-4-target-3"]');
      var target1 = ele.querySelector('#toggle-test-4-target-1');
      var target2 = ele.querySelector('#toggle-test-4-target-2');
      var target3 = ele.querySelector('#toggle-test-4-target-3');
      
      assert.equal(getDisplay(target1), 'block');
      assert.isFalse(target1.classList.contains(hiddenClass));
      assert.equal(getDisplay(target2), 'none');
      assert.isTrue(target2.classList.contains(hiddenClass));
      assert.equal(getDisplay(target3), 'none');
      assert.isTrue(target3.classList.contains(hiddenClass));
      
      action2.click();
      
      assert.equal(getDisplay(target1), 'none');
      assert.isTrue(target1.classList.contains(hiddenClass));
      assert.equal(getDisplay(target2), 'block');
      assert.isFalse(target2.classList.contains(hiddenClass));
      assert.equal(getDisplay(target3), 'none');
      assert.isTrue(target3.classList.contains(hiddenClass));
      
      action3.click();
      
      assert.equal(getDisplay(target1), 'none');
      assert.isTrue(target1.classList.contains(hiddenClass));
      assert.equal(getDisplay(target2), 'none');
      assert.isTrue(target2.classList.contains(hiddenClass));
      assert.equal(getDisplay(target3), 'block');
      assert.isFalse(target3.classList.contains(hiddenClass));
    });
    
    it('doesnt show the other hidden targets in the group when one target is hidden', function () {
      var ele = document.querySelector('#toggle-test-4');
      var action1 = ele.querySelector('[data-toggle="#toggle-test-4-target-1"]');
      var action2 = ele.querySelector('[data-toggle="#toggle-test-4-target-2"]');
      var action3 = ele.querySelector('[data-toggle="#toggle-test-4-target-3"]');
      var target1 = ele.querySelector('#toggle-test-4-target-1');
      var target2 = ele.querySelector('#toggle-test-4-target-2');
      var target3 = ele.querySelector('#toggle-test-4-target-3');
      
      assert.equal(getDisplay(target1), 'block');
      assert.isFalse(target1.classList.contains(hiddenClass));
      assert.equal(getDisplay(target2), 'none');
      assert.isTrue(target2.classList.contains(hiddenClass));
      assert.equal(getDisplay(target3), 'none');
      assert.isTrue(target3.classList.contains(hiddenClass));
      
      action1.click();
      
      assert.equal(getDisplay(target1), 'none');
      assert.isTrue(target1.classList.contains(hiddenClass));
      assert.equal(getDisplay(target2), 'none');
      assert.isTrue(target2.classList.contains(hiddenClass));
      assert.equal(getDisplay(target3), 'none');
      assert.isTrue(target3.classList.contains(hiddenClass));
      
      action1.click();
      
      assert.equal(getDisplay(target1), 'block');
      assert.isFalse(target1.classList.contains(hiddenClass));
      assert.equal(getDisplay(target2), 'none');
      assert.isTrue(target2.classList.contains(hiddenClass));
      assert.equal(getDisplay(target3), 'none');
      assert.isTrue(target3.classList.contains(hiddenClass));
    });
  
  });
  
});