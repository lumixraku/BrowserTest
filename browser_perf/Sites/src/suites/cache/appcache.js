module.exports = function(next) {
  var iframe = document.createElement('iframe');
  iframe.onload = function() {
    next();
  };
  // iframe.src = 'http://test1.dolphin-browser.com/pychen/ua/test.html';
  iframe.src = '/Sites/src/suites/cache/cache.html';
  document.getElementById('cache-area').appendChild(iframe);
  console.log('appcache working...');
};
