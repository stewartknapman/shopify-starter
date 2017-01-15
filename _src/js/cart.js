/*
  Cart
  - cart count
  - cart template
  - micro cart (if different to cart template)
*/

// Check that we have what we need to move forward
var supports = !!document.querySelector && !!window.addEventListener;
if (!supports) return;

window.Theme = window.Theme || {};

var cartCount = Theme.cartCount = require('./modules/cart-count.js');

Theme._.ready(function () {
  console.log('CART ready', cartCount.itemCount);
});