Theme = {};

require('jsdom-global')();
var fs = require('fs');
var assert = require('chai').assert;

Theme._ = require('../_src/js/utils/_lib.js');
var View = require('../_src/js/view/view.js');
var fixture = fs.readFileSync('./_tests/fixtures/view.html', 'utf8');

describe('View', function () {
  
  beforeEach(function () {
    document.body.innerHTML = fixture;
  });
  
  describe('View element', function () {
    it('collects the element from the given element selector', function () {
      var ele = document.querySelector('[data-view]');
      var view = new View({
        ele: '[data-view]'
      });
      assert.equal(view.ele, ele);
    });
  });
  
  describe('Data', function () {
    it('stores data with custom properties', function () {
      var view = new View({
        ele: '[data-view]',
        data: [
          'store'
        ]
      });
      assert.equal(view.store, undefined);
      view.store = 'moose';
      assert.equal(view.store, 'moose');
    });
    
    
    it('binds a data property to an element', function () {
      var ele = document.querySelector('[data-property-element]');
      var view = new View({
        ele: '[data-view]',
        data: [
          'property-element'
        ]
      });
      
      assert.equal(ele.innerHTML, 'moose');
      assert.equal(view.propertyElement, 'moose');
      
      view.propertyElement = 'monkey';
      
      assert.equal(ele.innerHTML, 'monkey');
      assert.equal(view.propertyElement, 'monkey');
    });
    
    it('binds a data property to an input element', function () {
      var ele = document.querySelector('[data-property-input]');
      var view = new View({
        ele: '[data-view]',
        data: [
          'property-input'
        ]
      });
      
      assert.equal(ele.value, 'moose');
      assert.equal(view.propertyInput, 'moose');
      
      view.propertyInput = 'monkey';
      
      assert.equal(ele.value, 'monkey');
      assert.equal(view.propertyInput, 'monkey');
    });
    
    it('keeps the data up to date if the element is altered outside of the view', function () {
      var ele = document.querySelector('[data-property-element]');
      var view = new View({
        ele: '[data-view]',
        data: [
          'property-element'
        ]
      });
      
      assert.equal(ele.innerHTML, 'moose');
      assert.equal(view.propertyElement, 'moose');
      
      ele.innerHTML = 'monkey';
      
      assert.equal(ele.innerHTML, 'monkey');
      assert.equal(view.propertyElement, 'monkey');
    });
    
    it('keeps the data up to date if the element is altered outside of the view', function () {
      var ele = document.querySelector('[data-property-input]');
      var view = new View({
        ele: '[data-view]',
        data: [
          'property-input'
        ]
      });
      
      assert.equal(ele.value, 'moose');
      assert.equal(view.propertyInput, 'moose');
      
      ele.value = 'monkey';
      
      assert.equal(ele.value, 'monkey');
      assert.equal(view.propertyInput, 'monkey');
    });
  });
  
  describe('Methods', function () {
    it('can have custom methods', function () {
      var t, i = 0;
      var view = new View({
        ele: '[data-view]',
        methods: {
          myMethod: function () {
            i++;
            t = this;
          }
        }
      });
      assert.equal(i, 0);
      assert.equal(t, undefined);
      view.myMethod();
      assert.equal(i, 1);
      assert.equal(t, view);
    });
    
    it('has an afterInit hook method', function () {
      var t, i = 0;
      var view = new View({
        ele: '[data-view]',
        methods: {
          afterInit: function () {
            i++;
            t = this;
          }
        }
      });
      assert.equal(i, 1);
      assert.equal(t, view);
    });
  });
  
  describe('Events', function () {
    
  });
});