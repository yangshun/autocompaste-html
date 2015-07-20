$(document).ready(function () {
  $('#notifications').click(function () {
    $('#notifications').css('opacity', '0');
  });

  $('#primary-method-other').focus(function () {
    $('#primary-method-choice-other').click();
  });

  // Is there ACP on this page?
  if ($('#autocompaste').length > 0) {
    $('.spacer').css ('height', '0px');

    // Stretch to fill entire display.
    $('#autocompaste-display').css ('height',
      $(window).height () - 50);
  }

  $(window).resize (function () {
    // Stretch to fill entire display.
    $('#autocompaste-display').css('height', $(window).height() - 50);
  });
});

/* vim: set ts=2 sw=2 et: */
