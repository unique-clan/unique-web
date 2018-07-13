/* eslint-disable */
$(document).ready(function () {
  var form = new BulmaFormHandler('#form-register', '/auth/register', 'POST')
  form.onResponse((status, res) => {
    grecaptcha.reset()
    switch (status) {
      case 400:
      case 422:
      {
        form.handleErrors(res.responseJSON.errors)
        break
      }
      case 201:
      {
        form.turnAllGreen()
        form.find('p#response-message').html(res.responseJSON.msg)
        break
      }
    }
  })
})
