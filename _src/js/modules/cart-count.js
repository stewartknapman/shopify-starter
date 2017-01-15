var View = require('../view/view.js');
var cartCount = new View({
  ele: '[data-cart-count]',
  data: [
    'item-count',
    'cart-total'
  ],
  events: {
    
  },
  methods: {
    afterInit: function () {
      console.log('cartCount afterInit');
    },
    test: function () {
      console.log('method test', this);
      this.itemCount = 1;
    }
  }
});
module.exports = cartCount;