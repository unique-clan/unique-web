$(document).ready(function () {
  var form = new BulmaFormHandler('#form-login', '/auth/login', 'POST')
  form.onResponse((status, res) => {
    switch (status) {
      case 400:
      case 422:
      case 404:
      {
        form.handleErrors(res.responseJSON.errors)
        break
      }
      case 403:
      {
        form.find('#response-message').html(res.responseJSON.msg)
        break
      }
      case 200:
      {
        window.location.replace('/')
        break
      }
    }
  })
})
