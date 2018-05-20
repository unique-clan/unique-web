$(document).ready(function () {
  var form = new BulmaFormHandler('#form-apply', '/apply', 'POST')
  form.onResponse((status, res) => {
    switch (status) {
      case 400:
      case 422:
      {
        console.log(res.responseJSON)
        if(res.responseJSON.duplicate)
          form.find('p#response-message').html(res.responseJSON.message)
        else
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
