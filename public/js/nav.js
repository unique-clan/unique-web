document.addEventListener('DOMContentLoaded', function () {
  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener('click', function () {
        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);

        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }

  $('#login-close').click(() => $('#login-modal-close').click());
  $('#login-modal-close').click(e => {
    e.preventDefault();
    $('#login-modal').removeClass('is-active');
  });

  $('#login-enable').click(() => {
    if (!$('#login-modal').hasClass('is-active')) {
      $('#login-modal').addClass('is-active');
    }
  });

  $(document).mouseup((e) => {
    var container = $('#login-card');

    if ($('#login-modal').hasClass('is-active')) {
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('#login-modal').removeClass('is-active');
      }
    }
  });
});
