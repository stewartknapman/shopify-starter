/*
  Go is a tiny wrapper for running DOM related async code.
  It will fire the callback as soon as it can once the DOM is ready.
*/

module.exports = function (callback) {
  if (document.readyState !== "loading") {
    callback.call();
  } else {
    document.addEventListener("DOMContentLoaded", function() {
      callback.call();
    });
  }
};