var Badger = {
  api_host: 'https://api.badger.com/',
  back_url: "",

  api: function() {
    // parse arguments: url, [http_method], [params], [callback]
    var args = Array.prototype.slice.call(arguments, 0);

    // TODO: hard-code this and braintreeEncrypt() and make dev/qa work differently
    var url = Badger.api_host + args.shift().replace(/^\//,'');
    var method = typeof(args[0]) == 'string' ? args.shift() : 'GET';
    var params = typeof(args[0]) == 'object' ? args.shift() : {};
    var callback = typeof(args[0]) == 'function' ? args.shift() : function(){};
    
    // callback sequence number
    Badger.callback_sequence = (Badger.callback_sequence || 0) + 1;
    var callback_name = 'callback_' + Badger.callback_sequence;

    // default params
    params.cache = (new Date().getTime());
    params.callback = 'Badger.jsonp_callbacks.' + callback_name;
    if (method != 'GET') params._method = method;
    params.access_token = Badger.getAccessToken();

    // params to url string
    for (var key in params) {
      url += (url.indexOf('?') == -1 ? '?' : '&');

      url += key + '=' + encodeURIComponent(params[key]||'');
    }
    
    // TODO: alert if url is too long

    var script = document.createElement("script");        
    script.async = true;
    script.type = 'text/javascript';
    script.src = url;

    Badger.jsonp_callbacks[callback_name] = function(response) {
      // var error = JSON.parse(data.responseText);
      // if (response.data && response.data.errors) {
      //   response.data.errors.forEach(function(err) {
      //    console.log("Error with " + err.resource + ". Field: '" + err.field + "' Code: '" + err.code + "'");
      //   });
      // }

      delete Badger.jsonp_callbacks[callback_name];
      var head = document.getElementsByTagName('head')[0];
      head.removeChild(script);

      if (response && response.meta && response.meta.status == 'unauthorized') {
        Badger.logout();
      } else {
        callback.call(null,response);
      }
    };

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
  },
  jsonp_callbacks: {},
  
  // reads from "badger_access_token" cookie
  getAccessToken: function() {
    if (document.location.protocol == 'file:') {
      return localStorage.getItem('badger_access_token');
    } else {
      var ca = document.cookie.split(';');
      for (var i=0; i < ca.length; i++) {
        while (ca[i].charAt(0)==' ') ca[i] = ca[i].substring(1,ca[i].length);
        if (ca[i].length > 0) {
          var kv = ca[i].split('=');
          if (kv[0] == 'badger_access_token') return kv[1];
        }
      }
    }
  },
  
  // writes to "badger_access_token" cookie
  setAccessToken: function(token) {
    if (document.location.protocol == 'file:') {
      token ? localStorage.setItem('badger_access_token', token) : localStorage.removeItem('badger_access_token')
    } else {
      document.cookie = token ? "badger_access_token="+token+"; path=/" : "badger_access_token=; path=/; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    }
  },

  onLogin: function(callback) {
    Badger.login_callbacks.push(callback);
  },
  login_callbacks: [],
  
  onLogout: function(callback) {
    Badger.logout_callbacks.push(callback);
  },
  logout_callbacks: [],
  
  // given email+password, returns an access token
  login: function(email, password, callback) {
    Badger.api("/account/access_token", { email: email, password: password }, function(response) {
      if (response.meta.status == 'ok') Badger.setAccessToken(response.data.access_token);
      if (callback) callback(response);
      for (var i=0; i < Badger.login_callbacks.length; i++) Badger.login_callbacks[i].call(null);
    });
  },
  
  // erases local cookie
  logout: function(callback) {
    Badger.setAccessToken(null);
    if (callback) callback();
    for (var i=0; i < Badger.logout_callbacks.length; i++) Badger.logout_callbacks[i].call(null);
  },
  
  accountInfo: function(callback) {
    Badger.api("/account/info", callback);
  },
  
  requestInvite: function(email, callback) {
    Badger.api("/account/request_invite", 'POST', { email: email }, callback);
  },

  requestInviteExtraInfo: function(data, callback) {
    Badger.api("/account/request_invite_extra_info", 'POST',
      { invite_request_id: data.invite_request_id, full_name: data.full_name,
        total_domains_registered: data.total_domains_registered, suggestions: data.suggestions }, callback);
  },

  createAccount: function(data, callback) {
    Badger.api("/account", 'POST', data, function(response) {
      if (response.meta.status == 'ok') Badger.setAccessToken(response.data.access_token);
      if (callback) callback(response);
    });
  },
  
  domainSearch: function(query, use_serial, callback) {
    Badger.__search_serial_next = (Badger.__search_serial_next || 1) + 1;
    Badger.__search_serial_last = (Badger.__search_serial_last || 0);
    
    Badger.api("/domains/search", 'POST', { query: query, serial: Badger.__search_serial_next }, function(results) {
      if (!use_serial || parseInt(results.data.serial) > Badger.__search_serial_last) {
        Badger.__search_serial_last = parseInt(results.data.serial);
        callback(results);
      }
    });
  },

  getDomains: function(callback) {
    Badger.api("/domains", function(response) { callback(response.data); });
  },

  getDomain: function(name, callback) {
    Badger.api("/domains/" + name, callback);
  },
  
  

  
  
  getRecords: function(name, callback) {
    Badger.api("/domains/" + name + "/records", function(response) { callback(response.data); });   
  },

  addRecord: function(name, data, callback) {
    Badger.api("/domains/" + name + "/records", 'POST', data, function(response) {
      callback(response);
    });   
  },

  deleteRecord: function(name, id, callback) {
    Badger.api("/domains/" + name + "/records/" + id, "DELETE", function(resp) {
      callback(resp);
    });
  },
  

  registerDomain: function(data, callback) {
    Badger.api("/domains", 'POST', data, callback);
  },

  updateDomain: function(domain, options, callback) {
    Badger.api("/domains/" + domain, 'PUT', options, function(resp) {
      callback(resp);
    }); 
  },

  getContacts: function(callback) {
    Badger.api("/account/contacts", callback);
  },

  createContact: function(data, callback) {
    Badger.api("/account/contacts", 'POST', data, callback);
  },

	updateContact: function(contact_id, data, callback) {
		Badger.api("/account/contacts/" + contact_id, 'PUT', data, callback);
	},


  braintreeEncrypt: function(data) {
    if (!Badger.braintree) {
      if (Badger.api_host == 'https://api.badger.com/') {
        Badger.braintree = Braintree.create("MIIBCgKCAQEA7q46U13zKcfozxhNgL8RxF1LEXm2M1NMyromzybYIuwMnXRKg9/DsbQDls2V1uGv8zhqrS3lMmBIvNR6gv2vAMTSwYDKE2VJcUlJveNAP1q5EMMqwTFTlPoBr8uwhT6Q7919O2UDTVi6t/8dm8k6RZsdL+TDcjc7gpNNK4JHOJbqnKpAKPc9uTpo6IlUan2FJVBRk0GVhrRwR+S1YU9aJW8rHPrMovkUpOUUFhzfgGcrFdbbLUTNkxB4OwKxkwYME82i6UlHNxUoRPYama/Tpn+68gu+oV27nJmAF/iuMsV5iLrCyXzbSvt3YBwOctb+WFIqsc/kSd1SsYKZgh9RWQIDAQAB");
      } else {
        Badger.braintree = Braintree.create("MIIBCgKCAQEAvypnA1PqZrAN2nPiWEcPitpEqF/4spcVFvZjCp9T/34nM8sakWQMm9RfKLj24wLYJlgpTdSfQCsU7jms7XOwFyLAajEWk+bRy5E4GheaLOsQsUvZuzgMr4BncDlL4jwxpgiQ67ngSxp2mOB6qySWHlD7E5kNtkl97Q1WyH3IJlSi3Crd/QCsnafMeJhvziuRGIKIX/QBmblcqRXqfjbkmG9VcLUiwsMYuIwuksm3fWHJBYncHoPeZ29lu4eUXuAwLL78VZqtEbxoP9KqW+8yUfX7JBRUq/e6beTtEYc6bhQ9UWxAXANH8jmFOhTu9cPTyGOmI6BgJdfBEPjWncM7GQIDAQAB");
      }
    }
    if( data.cc_number && data.cc_number.length > 0) data.cc_number = Badger.braintree.encrypt(data.cc_number);
    if( data.cc_cvv && data.cc_cvv.length > 0 ) data.cc_cvv = Badger.braintree.encrypt(data.cc_cvv);
    return data;
  },

  getPaymentMethods: function(callback) {
    Badger.api("/account/payment_methods", callback);
  },

  purchaseCredits: function(data, callback) {
		if(!data.payment_method_id) data.payment_method_id = "0"
		if(!data.cc_expiration_date) data.cc_expiration_date = data.cc_expiration_date_month + "/" + data.cc_expiration_date_year
		
    Badger.api("/account/purchase_credits", 'POST', Badger.braintreeEncrypt(data), callback);
  },

	// not implemented
  // getPendingTransfers: function(callback) {
  //   Badger.api("/domains/pending_transfers", callback);
  // },

  getCreditHistory: function(callback) {
    Badger.api("/account/credit_history", callback);
  },

	sendPasswordResetEmail: function(data, callback) {
		Badger.api("/account/forgot_password", 'POST', data, callback);
  },

	resetPasswordWithCode: function(data, callback) {
		Badger.api("/account/reset_password", 'POST', data, callback);
  },

	changePassword: function(data, callback) {
		Badger.api("/account/change_password", 'POST', data, callback);
	},
	
	getDomainInfo: function(data, callback) {
		Badger.api("/domains/" + data.name + "/info", data, callback);
	},
  
  sendEmail: function(subject, body, callback) {
		Badger.api("account/contact_us", "POST", { subject: subject, body: body }, callback);
  },



	getEmailForwards: function(domain, callback) {
		Badger.api("domains/" + domain + "/email_forwards", callback);
	},
	
	createEmailForward: function(domain, data, callback) {
		Badger.api("domains/" + domain + "/email_forwards", "POST", data, callback);
	},
	
	updateEmailForward: function(domain, id, data, callback) {
		Badger.api("domains/" + domain + "/email_forwards/" + id, "PUT", data, callback);
	},
	
	deleteEmailForward: function(domain, id, callback) {
		Badger.api("domains/" + domain + "/email_forwards/" + id, "DELETE", callback);
	},


	
	getWebForwards: function(domain, callback) {
		Badger.api("domains/" + domain + "/web_forwards", callback);
	},
	
	createWebForward: function(domain, data, callback) {
		Badger.api("domains/" + domain + "/web_forwards", "POST", data, callback);
	},
	
	updateWebForward: function(domain, id, data, callback) {
		Badger.api("domains/" + domain + "/web_forwards/" + id, "PUT", data, callback);
	},
	
	deleteWebForward: function(domain, id, callback) {
		Badger.api("domains/" + domain + "/web_forwards/" + id, "DELETE", callback);
	},
	


  //ADMIN COMMANDS, requires person to have admin flag set to true
	
	isAdmin: function(callback) {
		Badger.api("/account/is_admin", callback);
	},
	
	getContactsAdmin: function(callback) {
		Badger.api("/admin/contacts", callback);
	},
	
	getContactAdmin: function(id, callback) {
		Badger.api("/admin/contacts/" + id, callback);
	},
	
	getContactsForPersonAdmin: function(id, callback) {
		Badger.api("/admin/people/" + id + "/contacts", callback);
	},
	
	getInviteCodesAdmin: function(callback) {
		Badger.api("/admin/invite_codes", callback);
	},

	getInviteCodeAdmin: function(id, callback) {
		Badger.api("/admin/invite_codes/" + id, callback);
	},
	
	getPeopleAdmin: function(callback) {
		Badger.api("/admin/people", callback);
	},
	
	getPersonAdmin: function(id, callback) {
		Badger.api("/admin/people/" + id, callback);
	},
	
	getDomainsAdmin: function(callback) {
		Badger.api("/admin/domains", callback);
	},
		
	getDomainAdmin: function(id, callback) {
		Badger.api("/admin/domains/" + id, callback);
	},

	getDomainsForPersonAdmin: function(id, callback) {
		Badger.api("/admin/people/" + id + "/domains", callback);
	},
  
	getTransactionsAdmin: function(callback) {
		Badger.api("/admin/transactions", callback);
	},
	
	getTransactionAdmin: function(id, callback) {
		Badger.api("/admin/transactions/" + id, callback);
	},
	
	getTransactionsForPersonAdmin: function(id, callback) {
		Badger.api("/admin/people/" + id + "/transactions", callback);
	},
	
	getPurchaseRecordsAdmin: function(callback) {
		Badger.api("/admin/purchase_records", callback);
	},
	
	getPurchaseRecordAdmin: function(id, callback) {
		Badger.api("/admin/purchase_records/" + id, callback);
	},
	
	getPurchaseRecordsForPersonAdmin: function(id, callback) {
		Badger.api("/admin/people/" + id + "/purchase_records", callback);
	},
	
  getPaymentMethodsAdmin: function(callback) {
		Badger.api("/admin/payment_methods", callback);
	},
	
  getPaymentMethodAdmin: function(id, callback) {
		Badger.api("/admin/payment_methods/" + id, callback);
	},
	
	getPaymentMethodsForPersonAdmin: function(id, callback) {
		Badger.api("/admin/people/" + id + "/payment_methods", callback);
	},
	
	getRecordsAdmin: function(domain_id, callback) {
		Badger.api("/admin/domains/" + domain_id + "/records", callback);
	},
	
	getRecordAdmin: function(domain_id, record_id, callback) {
		Badger.api("/admin/domains/" + domain_id + "/records/" + record_id, callback);
	},

	sendInvite: function(data, callback) {
		Badger.api("/account/send_invite", "POST", { first_name: data.first_name, last_name: data.last_name, email: data.invitation_email, credits_to_gift: data.credits_to_gift, custom_message: data.custom_message }, callback);
	},
	
	confirmEmail: function(code, callback) {
		Badger.api("/account/confirm_email", "POST", { code: code }, callback);
	}
  


  // getRecordsByType: function(accessToken, name, type, callback) {
  //   Badger.api("/domains/" + name + "/records/" + type, { headers: { access_token: accessToken } }, function(records) {
  //     callback(records);
  //   });
  // },
  // 
  // getRecord: function(accessToken, name, id, callback) {
  //   Badger.api("/domains/" + name + "/records/" + id, { headers: { access_token: accessToken } }, function(record) {
  //     callback(record);
  //   });   
  // },
  // 
  // 
  // deleteRecordsByType: function(accessToken, name, type, callback) {
  //   Badger.api("/domains/" + name + "/records/" + type, { type: "DELETE", headers: { access_token: accessToken } }, function(resp) {
  //     callback(resp);
  //   });   
  // },
  // 
  // updateRecord: function(accessToken, name, id, data, callback) {
  //   Badger.api("/domains/" + name + "/records/" + id, { type: "PUT", headers: { access_token: accessToken }, data: data }, function(resp) {
  //     callback(resp);
  //   });
  // },  
  // 
  // showAccount: function(accessToken, callback) {
  //   Badger.api("/account", function(account) {
  //     callback(account);
  //   });
  // },
  // 
  // checkEmail: function(email, callback) {
  //   Badger.api("/account/check_email", 'POST', { email: email }, callback);
  // },
  // 
  // 
  // updateAccount: function(accessToken, data, callback) {
  //   Badger.api("/account", "POST", data, callback);
  // },
  // 
  // resetPassword: function(email, newPassword, code, callback) {
  //   Badger.api("/account/reset_password", { type: "POST", data: { email: email, new_password: newPassword, code: code} }, function(resp) {
  //     callback(resp);
  //   });
  // },
  // 
  // changePassword: function(accessToken, newPassword, callback) {
  //   Badger.api("/account/change_password", { type: "POST", headers: { access_token: accessToken }, data: { new_password: newPassword } }, function(resp) {
  //     callback(resp);
  //   });
  // },
  // 
  // unregisterDomain: function(accessToken, name, callback) {
  //   Badger.api("/domains/" + name, { type: "DELETE", headers: { access_token: accessToken } }, function(resp) {
  //     callback(resp);
  //   });
  // },
  // 
  // renewDomain: function(accessToken, data, callback) {
  //   Badger.api("/domains/" + data.name + "/renew", { type: "PUT", headers: { access_token: accessToken }, data: data }, function(resp) {
  //     callback(resp);
  //   });
  // },
  // 
  // getWhois: function(accessToken, name, callback) {
  //   Badger.api("/domains/" + name + "/whois", { headers: { access_token: accessToken } }, function(whois) {
  //     callback(whois);
  //   });
  // },
  
};