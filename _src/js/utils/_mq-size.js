module.exports = function () {
  return window.getComputedStyle(document.body,':after').getPropertyValue('content').replace(/['"]/g, '');
};