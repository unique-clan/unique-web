'use strict'

/**
 * A Generic Form Handler Class
 */
class FormHandler {
  /**
   * The form constructor
   * @param {*} formID The form id
   * @param {*} url The url to perfom the action on.
   * @param {*} type The http request type, e.g POST, GET, PUT
   */
  constructor (formID, url, type, multipart) {
    this.id = formID
    this.url = url
    this.type = type
    this.multipart = multipart ? true : false
    this.form = $(this.id)
    this.onSuccessCallbacks = []
    this.onFailureCallbacks = []
    this.onInternalCallbacks = []
    this.onGeneralCallbacks = []
    this.beforeSendCallbacks = []

    if (!this.form.length) {
      throw new Error('Error finding the form DOM.')
    }

    // Subscribe to form submit event
    this.form.submit(e => {
      e.preventDefault()
      let ajax = this.buildAjax()
      if (this.multipart) {
        ajax.processData = false;
        ajax.contentType = false;
      }
      $.ajax(ajax)
    })
  }

  buildAjax () {
    return {
      url: this.url,
      type: this.type,
      data: this.multipart ? new FormData(this.form[0]) : this.objectifyForm(),
      beforeSend: () => {
        this.beforeSendCallbacks.forEach(x => x(this))
      },
      success: (res, status, xhr) => {
        this.onSuccessCallbacks.forEach(x => x(xhr.status, xhr))
        this.onGeneralCallbacks.forEach(x => x(xhr.status, xhr))
      },
      error: (res) => {
        if (res.status === 500) {
          this.onInternalCallbacks.forEach(x => x(res.status, res))
        }
        this.onFailureCallbacks.forEach(x => x(res.status, res))
        this.onGeneralCallbacks.forEach(x => x(res.status, res))
      }
    }
  }

  objectifyForm () {
    var formArray = this.form.serializeArray()
    var returnArray = {}
    for (var i = 0; i < formArray.length; i++) {
      returnArray[formArray[i]['name']] = formArray[i]['value']
    }
    return returnArray
  }

  /**
   * Executed before sending the request
   * @param {Function} callback The callback, a FormHandler is passed as argument
   */
  beforeSend (callback) {
    this.beforeSendCallbacks.push(callback)
  }

  /**
   * Called when a response, callback args are (code, response)
   * @param {function} callback The callback
   */
  onResponse (callback) {
    this.onGeneralCallbacks.push(callback)
  }

  /**
   * Called on a success http response, callback args are (code, response)
   * @param {function} callback The callback
   */
  onSuccess (callback) {
    this.onSuccessCallbacks.push(callback)
  }

  /**
   * Called on a failure http response, callback args are (code, response)
   * @param {function} callback The callback
   */
  onFailure (callback) {
    this.onFailureCallbacks.push(callback)
  }

  /**
   * Called on a internal error http response, callback args are (code, response)
   * @param {function} callback The callback
   */
  onInternal (callback) {
    this.onInternalCallbacks.push(callback)
  }

  find (selector) {
    return this.form.find(selector)
  }
}

/**
 * This is a generic bulma form handler.
 * How to use:
 * - The inputs must have a id like: #input-{name}
 * - The inputs must have a help paragraph with a id like: #help-{name}
 */
class BulmaFormHandler extends FormHandler {

  getHelpNode(field) {
    return this.find('#help-' + field)
  }

  getIndicatorNode(field) {
    let input = this.find(`input[name=${field}]`)
    if (input.attr('type') === 'tags') {
      input = input.next('div')
    }
    if (!input.length) {
      input = this.find(`textarea[name=${field}]`)
    }
    if (!input.length) {
      input = this.find(`select[name=${field}]`).parent()
    }
    return input
  }

  /**
   * Turns the input green and removes the help message.
   * @param {*} field
   */
  turnGreen (field) {
    // If the DOM has the danger class, remove it.
    let input = this.getIndicatorNode(field)
    let help = this.getHelpNode(field)

    if (input.hasClass('is-danger')) {
      input.toggleClass('is-danger')
    }
    // If the DOM doesn't have the success class, add it.
    if (!input.hasClass('is-success')) {
      input.toggleClass('is-success')
    }
    // Clean the help text.
    help.text('')
  }

  handleErrors (errors, prefix = '') {
    for (let fieldName in errors) {
      let err = errors[fieldName]
      let input = this.getIndicatorNode(fieldName)
      let help = this.getHelpNode(fieldName)

      help.text(err.message)

      // Check if exists
      if (!input.length) {
        continue
      }
      
      if (!input.hasClass('is-danger')) {
        input.toggleClass('is-danger')
      }
    }
    // Check if there is no error, then make it green
    let data = this.objectifyForm()
    // Get the first fields from the error list
    let fields = Object.keys(errors)
    for (let obj in data) {
      if (!fields.includes(obj)) {
        this.turnGreen(prefix + obj)
      }
    }
  }

  turnAllGreen () {
    let data = this.objectifyForm()
    for (let obj in data) {
      this.turnGreen(obj)
    }
    this.find('button').prop('disabled', true)
  }
}
