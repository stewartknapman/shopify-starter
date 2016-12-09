// To use add an `onswipeLeft`, `onswipeRight`, `onswipeUp` or `onswipeDown` function on any dom element
// i.e. document.querySelector('.my-ele').onswipeLeft = function () { ... };

module.exports = function (threshold) {
  var Swipe = function () {
    this.threshold = threshold || 5;
    this.xDown = null;
    this.yDown = null;
    this.add_event_listeners();
  };
  
  Swipe.prototype.add_event_listeners = function () {
    var _this = this;
    if (Element.prototype.addEventListener) {
      document.addEventListener('touchstart', function (evt) {
        _this.handleTouchStart(evt);
      }, false);
      document.addEventListener('touchmove', function (evt) {
        _this.handleTouchMove(evt);
      }, false);
    }
  };
  
  Swipe.prototype.handleTouchStart = function (evt) {
    this.xDown = evt.touches[0].clientX;
    this.yDown = evt.touches[0].clientY;
  };
  
  Swipe.prototype.handleTouchMove = function (evt) {
    if ( ! this.xDown || ! this.yDown ) return;
    
    var current_target = evt.targetTouches[0].target;
    
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    
    var xDiff = this.xDown - xUp;
    var yDiff = this.yDown - yUp;
    
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
      if ( xDiff > 0 ) {
        if (xDiff > this.threshold) {
          this.trigger('swipeLeft', current_target);
        }
      } else {
        if (xDiff * -1 > this.threshold) {
          this.trigger('swipeRight', current_target);
        }
      }
    } else {
      if ( yDiff > 0 ) {
        if (yDiff > this.threshold) {
          this.trigger('swipeUp', current_target);
        }
      } else {
        if (yDiff * -1 > this.threshold) {
          this.trigger('swipeDown', current_target);
        }
      }
    }
    // Reset values
    this.xDown = null;
    this.yDown = null;
  };
  
  Swipe.prototype.trigger = function (event, current_target) {
    // Don't do events on text and comment nodes
    if (current_target.nodeType === 3 || current_target.nodeType === 8) {
      return;
    }
    
    // Get elements for bubbling
    var element = current_target,
      elements = [];
    while (element) {
      elements.push(element);
      element = element.offsetParent;
    }
    
    // Bubble up through the elements to trigger events
    var ele,
      handle,
      result,
      data = {
        type: event,
        target: current_target
      };
    for (var i = 0; i < elements.length; i++) {
      ele = elements[i];
      handle = ele['on'+event];
      if (handle && handle.apply) {
        result = handle.apply(ele, [data]);
        if (result === false) {
          break;
        }
      }
    }
  };
  
  new Swipe();
};