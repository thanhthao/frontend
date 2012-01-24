with (Hasher('Billing','Application')) {
  
  define('purchase_modal', function(callback, necessary_credits) {
    var payment_methods = ((BadgerCache.cached_payment_methods && BadgerCache.cached_payment_methods.data) || []);
		
    show_modal(
      form({ id: "credits-form", action: curry(purchase_credits, callback) },
        h1('Purchase Credits'),
        //div({ style: 'margin-bottom: 15px' }, 'Use credits to buy new domains, transfer in existing domains, or renew expiring domain.'),
        div({ id: 'modal-errors' },
          (necessary_credits ?
            div({ 'class': 'error-message' }, "You need at least ", necessary_credits, " Credits to continue.")
          : [])
        ),
        table({ style: 'width: 100%; border-collapse: collapse' }, tbody(
          tr(
            td({ style: 'vertical-align: top; width: 300px' },
							table({ style: "border-collapse: collapse" }, tbody(
								tr(
									td({ style: "width: 100%" },
										credits_selector(necessary_credits)
									),
									td({ style: "width: 100%; padding-left: 20px" },
										credits_table()
									)
								)
							))
            )
					),
					
					tr(
						div({ style: "margin: 0px auto 8px auto; font-style: italic", align: "center" },
							div({ style: "font-size: 19px; padding-bottom: 5px; font-weight: bold" }, "1 domain credit = 1 domain for 1 year"),
							div("Transfers are 1 credit and extend the current registration by a year.")
						)
					),
					
					tr({ style: 'vertical-align: top' },
						div({ style: 'font-weight: bold' }, 'Cards on File'),
            select({ id: 'payment_method_id', name: 'payment_method_id', events: { change: function() { $('#new-card-fields')[($('#payment_method_id').val() == '0') ? 'show' : 'hide']();  }}},
              payment_methods.map(function(payment_method) {
                return option({ value: payment_method.id }, payment_method.name)
              }),
              option({ value: '0' }, 'New card')
            ),

						div({ id: 'new-card-fields', style: (payment_methods.length > 0 ? 'display: none' : '') },
            	table({ 'style': 'width: 100%' }, tbody(
								tr({ 'class': "table-header" },
									td(
										div({ style: 'font-weight: bold; margin-top: 10px' }, 'Billing Address'),
			              div(
			                input({ name: 'first_name', placeholder: 'First Name', style: "width: 110px; margin: 2px" }),
			                input({ name: 'last_name', placeholder: 'Last Name', style: "width: 110px; margin: 2px" })
			              ),
			              div(
			                input({ name: 'street_address', placeholder: 'Address', style: "width: 240px; margin: 2px" })
			              ),
			                //             div(
			                // input({ name: 'extended_address', placeholder: 'Address Line 2 (Optional)', style: "width: 240px; margin: 2px"  })
			                //             ),
			              div(
			                input({ name: 'city', placeholder: 'City', style: 'width: 100px; margin: 2px' }),
			                input({ name: 'state', placeholder: 'State', style: 'width: 40px; margin: 2px' }),
			                input({ name: 'zip', placeholder: 'Zip', style: 'width: 50px; margin: 2px' })
			              ),
			              div(
			                select({ name: 'country_name', style: "width: 170px; margin: 2px" }, option({ disabled: 'disabled' }, 'Country:'), country_options())
			              )
									),
									td(
										div({ style: 'font-weight: bold; margin-top: 12px' }, 'Credit Card'),
			              div(
			                'Number: ', input({ name: 'cc_number', placeholder: 'XXXX-XXXX-XXXX-XXXX', style: "width: 160px" })
			              ),
			              div(
			                'Expiration: ',
			                select({ name: 'cc_expiration_date_month', style: 'width: 46px' },
			                  option({ value: '01' }, '01 - January'),
			                  option({ value: '02' }, '02 - February'),
			                  option({ value: '03' }, '03 - March'),
			                  option({ value: '04' }, '04 - April'),
			                  option({ value: '05' }, '05 - May'),
			                  option({ value: '06' }, '06 - June'),
			                  option({ value: '07' }, '07 - July'),
			                  option({ value: '08' }, '08 - August'),
			                  option({ value: '09' }, '09 - September'),
			                  option({ value: '10' }, '10 - October'),
			                  option({ value: '11' }, '11 - November'),
			                  option({ value: '12' }, '12 - December')
			                ),
			                '/',
			                select({ name: 'cc_expiration_date_year' },
			                  option('2012'),
			                  option('2013'),
			                  option('2014'),
			                  option('2015'),
			                  option('2016'),
			                  option('2017'),
			                  option('2018'),
			                  option('2019'),
			                  option('2020')
			                )
			              ),
			              div(
			                'Security Code: ',
			                input({ name: 'cc_cvv', placeholder: '123', style: 'width: 40px' })
			              ),
			              input({ type: 'checkbox', name: 'save_card', checked: 'checked' }), ' Keep this card on file'
									)
								)
							))
						)
					)
        )),
				div({ style: 'text-align: right;' },
					input({ 'class': 'myButton', id: 'purchase-button', type: 'submit', value: 'Purchase Credits' })
				)
      )
    );
		
		// determine which tier to select first
		var credits = $("#credits-form").find("input[name=credits]").val()
		if (credits == 1) {
			$("#credit-tier-1").css({ "background": "#CDEC96", "border-width": "3px" });
		} else if (credits >= 2 && credits <= 10) {
			$("#credit-tier-2").css({ "background": "#CDEC96", "border-width": "3px" });
		} else if (credits >= 11 && credits <= 25) {
			$("#credit-tier-11").css({ "background": "#CDEC96", "border-width": "3px" });
		} else {
			$("#credit-tier-26").css({ "background": "#CDEC96", "border-width": "3px" });
		}
		
		$("#credits-form").find("input[name=credits]").focus();
		$("#credits-form").find("input[name=credits]").select();
		$("input[name=credits]").trigger("keyup");
  });
  
  define('purchase_credits', function(callback, form_data) {
    if (form_data.credits == '1' && form_data.credits_variable) form_data.credits = form_data.credits_variable;
    delete form_data.credits_variable;

    $('#modal-errors').empty();

    start_modal_spin();
    Badger.purchaseCredits(form_data, function(response) {
      if (response.meta.status == 'ok') {
        BadgerCache.reload('account_info');
        BadgerCache.reload('payment_methods');

        BadgerCache.getAccountInfo(function(response) {
          update_credits();
          hide_modal();
          if (callback) callback();
        });
      } else {
        stop_modal_spin();
        $('#modal-errors').empty().append(error_message(response));
      }
    });
  });

	define('credits_selector', function(necessary_credits) {
		// var necessary_credits = typeof(necessary_credits) == "undefined" ? 0 : parseInt(necessary_credits);
		
		var credit_selector = div({ 'class': 'info-message', id: "credits-selector", style: "padding: 10px 5px 10px 5px; height: 100px; text-align: center" },
			div({ style: "font-size: 20px; font-weight: bold; padding-top: 5px; padding-bottom: 10px" }, "How many credits? "),
			input({ style: "font-size: 30px", name: "credits", maxlength: 3, value: necessary_credits > 0 ? necessary_credits : 1, size: "2" }),
			
			div({ id: "savings", style: "display: none; font-size: 16px; color: red; text-align: center; padding-top: 5px" }, 'You save: ', span({ id: "price-savings", style: "font-weight: bold; font-size: 18px" }))
		);
		
		jQuery.fn.ForceNumericOnly = function() {
			return this.each(function()
			{
				$(this).keydown(function(e) {
					var key = e.charCode || e.keyCode || 0;
					// allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
					return (
						key == 8 || 
						key == 9 ||
						key == 46 ||
						(key >= 37 && key <= 40) ||
						(key >= 48 && key <= 57) ||
						(key >= 96 && key <= 105)
					);
				});
			});
		};
		
		$(credit_selector).find('input').ForceNumericOnly();

		var tier; //track the credit tier		
		var previous_tier = 1;
		var num_credits = 0;
		
		updateCreditsFieldsAndTierSelected = function(inputField, force) {
			force = typeof(force) == 'undefined' ? false : force;
			
			if ( $(inputField).val() ) {
				num_credits = parseInt($(inputField).val());
			} else {
				num_credits = 0;
			}
			
			var price = 0;
			if ( num_credits == 1) {
				price = 15;
				tier = 1;
			} else if ( num_credits >= 2 && num_credits <= 10 ) {
				price = 14;
				tier = 2;
			} else if ( num_credits >= 11 && num_credits <= 25 ) {
				price = 13;
				tier = 11;
			} else if ( num_credits >= 26 ) {
				price = 12;
				tier = 26;
			} else {
				price = 0;
				tier = -1;
			}
			
			//update the price fields
			$('#price-each').empty().append("$" + price.toString());
			$('#price-total').empty().append("$" + (price * num_credits).toString());
			$('#price-savings').empty().append("$" + (num_credits*15 - price*num_credits).toString())				
	
			// change text on the purchase button
			$("#purchase-button").attr("value", "Purchase " + num_credits + (num_credits == 1 ? " credit" : " credits") + " for $" + (price*num_credits));
			
			// how/hide savings
			if (num_credits >= 2) {
				$("#savings").show();
			} else {
				$("#savings").hide();
			}

			//change the tier hilighting if changed
			if ( tier == -1 ) {
				$("#credit-tier-" + previous_tier).css({ "background": "#E6F8D8", "border-width": "1px" }); // change back to unselected
			} else {
				$("#credit-tier-" + tier).css({ "background": "#CDEC96", "border-width": "3px" }); // the selected color
				if (tier != previous_tier) {
					$("#credit-tier-" + previous_tier).css({ "background": "#E6F8D8", "border-width": "1px" }); // change back to unselected
				}
			}
			
			pervious_num_credits = num_credits;
			previous_tier = tier;
		};
		
		$(credit_selector).find('input[name=credits]').keyup(function(e) {
			if( $(this).is(":focus") ) {
				updateCreditsFieldsAndTierSelected(this);
			}
		});
		
		// update fields on page load
		$(function() {
			updateCreditsFieldsAndTierSelected($(credit_selector).find('input[name=credits]'), true);
		});
		
		return credit_selector;
	});
	
	define('update_credits_input_with', function(num_credits) {
		$('input[name=credits]').val(num_credits);
		$('input[name=credits]').select();
		$('input[name=credits]').focus();
		$('input[name=credits]').trigger("keyup", true);
	});

	define('credits_tier', function(min_credits, max_credits, price, savings_message) {
		return a({ href: curry(update_credits_input_with, min_credits), style: "text-decoration: none" },
			div({ id: ("credit-tier-" + min_credits.toString()), 'class': 'success-message', style: "padding: 10px 5px 10px 5px; color: black; text-align: center; height: 100px; width: 70px" },
				div({ style: "font-size: 16px; font-weight: bold;" }, (min_credits == max_credits) ? min_credits.toString() : min_credits.toString() + (max_credits == null ? "+" : "-" + max_credits.toString())),
				div({ style: "font-size: 14px" }, (min_credits == max_credits) ? "Credit" : "Credits"),
				div({ style: "font-size: 20px; font-weight: bold; padding-top: 8px" }, price),
				div({ style: "font-size: 12px; padding-bottom: 6px" }, "each"),
				(function() { typeof(savings_message) == 'undefined' ? null : div({ style: "font-size: 12px" }, "each") })(),
				(function() {
					if ( typeof(savings_message) == 'string' ) {
						return div(
							div({ style: "color: red" }, savings_message)
						)
					}
				})()
			)
		)
	}); 

  define('credits_table', function() {
    return div({ id: "credits-table" },
			table( tbody(
				tr(
					td({ style: "width: 25%" },
						credits_tier(1, 1, "$15")
					),
					td({ style: "width: 25%" },
						credits_tier(2, 10, "$14", "6% off")
					),
					td(
						credits_tier(11, 25, "$13", "13% off")
					),
					td(
						credits_tier(26, null, "$12", "20% off!")
					)
				)
			))
		);
	});  
}
