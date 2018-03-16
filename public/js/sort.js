$(document).ready(function () {
  $('#short-table').DataTable({
    'paging': false,
    'scrollCollapse': true,
    'scrollY': '400px',
    autoWidth: false,
    responsive: false
  })

  $('#middle-table').DataTable({
    'paging': false,
    'scrollCollapse': true,
    'scrollY': '400px',
    autoWidth: false,
    responsive: false
  })

  $('#long-table').DataTable({
    'paging': false,
    'scrollCollapse': true,
    'scrollY': '400px'
  })
})
