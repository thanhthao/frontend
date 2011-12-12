var BadgerCache = {
  flush: function(key) {
    if (!key || (key == 'domains')) BadgerCache.cached_domains = null;
    if (!key || (key == 'payment_methods')) BadgerCache.cached_payment_methods = null;
    if (!key || (key == 'contacts')) BadgerCache.cached_contacts = null;
    if (!key || (key == 'account_info')) BadgerCache.cached_account_info = null;
  },

  reload: function(key) {
    BadgerCache.flush(key);
    BadgerCache.load();
  },
  
  load: function() {
    if (Badger.getAccessToken()) {
      BadgerCache.getDomains();
      BadgerCache.getPaymentMethods();
      BadgerCache.getContacts();
      BadgerCache.getAccountInfo();
    }
  },
  
  getAccountInfo: function(callback) {
    callback = callback || function(){};
    if (BadgerCache.cached_account_info) {
      callback(BadgerCache.cached_account_info);
    } else {
      Badger.accountInfo(function(results) { 
        BadgerCache.cached_account_info = results;
        callback(BadgerCache.cached_account_info);
      });
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
        // console.log("SETTING PAYMENT METHOD");
        // console.log(results);
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
  },

  getInviteStatus: function(callback) {
    callback = callback || function(){};
    if (BadgerCache.cached_invite_status) {
      callback(BadgerCache.cached_invite_status);
    } else {
      Badger.getInviteStatus(function(results) {
        BadgerCache.cached_invite_status = results;
        callback(BadgerCache.cached_invite_status);
      });
    }
  }
};