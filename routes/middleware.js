module.exports = exports = {
  isAdminAuthed: function (req, res, next) {
    if (req.session && req.session.admin_authed) {
      next()
    } else {
      res.redirect('/admin/login')
    }
  }
}
