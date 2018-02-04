$(document).ready(function () {
  var form = new BulmaFormHandler('#form-register', '/auth/register', 'POST')
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
        console.log('CALLED OMG')
        form.turnAllGreen()
        $('#response-message').html(res.responseJSON.msg)
        break
      }
    }
  })
})
