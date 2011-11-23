
jQuery(function() {
	jQuery.support.placeholder = false;
	test = document.createElement('input');
	if('placeholder' in test) jQuery.support.placeholder = true;
});
var Placeholder = {
  fix_ie: function() {
    if(!$.support.placeholder) {
      var active = document.activeElement;
      $.each([':text', ':password', 'textarea'], function() {
        $(this.toString()).focus(function () {
          if ($(this).attr('placeholder') != '' && $(this).val() == $(this).attr('placeholder')) {
            $(this).val('').removeClass('has-placeholder');
          }
        }).blur(function () {
          if ($(this).attr('placeholder') != '' && ($(this).val() == '' || $(this).val() == $(this).attr('placeholder'))) {
            $(this).val($(this).attr('placeholder')).addClass('has-placeholder');
          }
        });
        $(this.toString()).blur();
      });

      $(active).focus();
      $('form').submit(function () {
        $(this).find('.has-placeholder').each(function() { $(this).val(''); });
      });
    }
}};