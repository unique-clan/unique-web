/* eslint-disable */
$(document).ready(function () {
  $.extend($.fn.dataTable.defaults, {
    paging: false,
    searching: false,
    info: false,
    autoWidth: false
  })

  $('#short-table').DataTable()
  $('#middle-table').DataTable()
  $('#long-table').DataTable()
  $('#fastcap-table').DataTable()
})
