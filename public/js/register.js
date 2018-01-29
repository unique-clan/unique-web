$(document).ready(function () {
  function objectifyForm (formArray) { // serialize data function
    var returnArray = {}
    for (var i = 0; i < formArray.length; i++) {
      returnArray[formArray[i]['name']] = formArray[i]['value']
    }
    return returnArray
  }

  $('#register-form').submit(e => {
    e.preventDefault()

    let data = objectifyForm($('#register-form').serializeArray())

    $.post('/auth/register', data, (res) => {
      console.log(res)
    })
  })
})
