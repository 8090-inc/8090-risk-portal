// Wrapper to load gcip-iap in browser environment
(function(global) {
  // Polyfills
  if (!global.Promise) {
    console.error('Promise polyfill required for gcip-iap');
  }

  // Mock Node.js globals that gcip-iap might expect
  if (typeof process === 'undefined') {
    global.process = { env: {} };
  }

  // Define module exports for CommonJS
  var module = { exports: {} };
  var exports = module.exports;

  // Load the gcip-iap CommonJS module
  (function() {
    // The gcip-iap code will be included here
    // For now, we'll load it dynamically
    var script = document.createElement('script');
    script.src = '/gcip-iap.js';
    script.onload = function() {
      // Expose gcip-iap to global scope
      global.ciap = module.exports;
      global.GcipIap = module.exports;
      console.log('gcip-iap loaded successfully');
    };
    script.onerror = function() {
      console.error('Failed to load gcip-iap');
    };
    document.head.appendChild(script);
  })();
})(window);