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
  
  camelCase: function (str) {
    return str.replace(/([\-\s]\w)/g, function (s) {
      return s[1].toUpperCase();
    });
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