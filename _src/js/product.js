// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if (!supports) return;

window._.ready(function () {
  console.log('PRODUCT ready');
});