var BadgerCache = {
  flush: function(key) {
    if (!key || (key == 'domains')) BadgerCache.cached_domains = null;
    if (!key || (key == 'payment_methods')) BadgerCache.cached_payment_methods = null;
    if (!key || (key == 'contacts')) BadgerCache.cached_contacts = null;
  },
  
  load: function() {
    if (Badger.getAccessToken()) {
      console.log('loading')
      BadgerCache.getDomains();
      BadgerCache.getPaymentMethods();
      BadgerCache.getContacts();
    }
  },

  getDomains: function(callback) {
    callback = callback || function(){};
    if (BadgerCache.cached_domains) {
      callback(BadgerCache.cached_domains);
    } else {
      Badger.getDomains(function(results) { 
        BadgerCache.cached_domains = results;
        callback(BadgerCache.cached_domains);
      });
    }
  },

  getPaymentMethods: function(callback) {
    callback = callback || function(){};
    if (BadgerCache.cached_payment_methods) {
      callback(BadgerCache.cached_payment_methods);
    } else {
      Badger.getPaymentMethods(function(results) { 
        BadgerCache.cached_payment_methods = results;
        callback(BadgerCache.cached_payment_methods);
      });
    }
  },
  
  getContacts: function(callback) {
    callback = callback || function(){};
    if (BadgerCache.cached_contacts) {
      callback.call(null,BadgerCache.cached_contacts);
    } else {
      Badger.getContacts(function(results) { 
        BadgerCache.cached_contacts = results;
        callback.call(null,BadgerCache.cached_contacts);
      });
    }
  }
  
};