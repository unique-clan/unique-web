$(document).ready(function () {
  var form = new BulmaFormHandler('#form-login', '/auth/login', 'POST')
  form.onResponse((status, res) => {
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
        form.find('#response-message').html(res.responseJSON.msg)
        break
      }
    }
  })
})
