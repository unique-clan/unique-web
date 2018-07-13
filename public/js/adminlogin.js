/* eslint-disable */
$(document).ready(function () {
    var form = new BulmaFormHandler('#form-admin', '/admin/login', 'POST')
    form.onResponse((status, res) => {
      switch (status) {
        case 400:
        case 422:
        {
          $('#response-message').text('Invalid password.')
          break
        }
        case 201:
        {
            window.location.replace('/admin')
            break
        }
      }
    })
  })
