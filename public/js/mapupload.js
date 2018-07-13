/* eslint-disable */
$(document).ready(function () {
  var form = new BulmaFormHandler('#form-mapupload', '/mapupload', 'POST', true)
  form.onResponse((status, res) => {
    switch (status) {
      case 400:
      case 422:
      {
        form.handleErrors(res.responseJSON.errors)
        if(res.responseJSON.message) {
          $('#response-message').html(res.responseJSON.message)
        }
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

var file = $('#file')
function updateFilename() {
  let filename = file.val().split('\\').pop()
  if (filename) {
    $('#filename').text(filename)
    $('#filename').removeClass('has-text-grey-light')
  }
}
file.change(updateFilename)
$(document).ready(updateFilename)
