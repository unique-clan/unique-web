var isAuthed = function (req, res, next) {
  if (req.session && req.session.authed) {
    next();
  } else {
    res.redirect('/');
  }
};

var isNotAuthed = function (req, res, next) {
  if (!req.session || !req.session.authed) {
    next();
  } else {
    res.redirect('/');
  }
};

module.exports = exports = {
  isAuthed: isAuthed,
  isNotAuthed: isNotAuthed
};
