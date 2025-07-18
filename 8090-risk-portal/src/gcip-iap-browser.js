// Browser entry point for gcip-iap
import 'whatwg-fetch';
import 'url-polyfill';
import * as ciap from 'gcip-iap';

// Export everything from gcip-iap for browser use
export * from 'gcip-iap';
export { ciap };

// Also attach to window for global access
if (typeof window !== 'undefined') {
  window.ciap = ciap;
  window.GcipIap = ciap;
}