'use strict'

const passport = require('passport')
const controller = {}

controller.show = (req, res) => {
    res.render('login', { loginMessage: req.flash('loginMessage') });
}

controller.login = (req, res, next) => {
    let keepSignedIn = req.body.keepSignedIn;
    passport.authenticate('local-login', (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            return res.redirect('/users/login')
        }
        req.logIn(user, (error) => {
            if (error) { return next(error); }
            //luu dang nhap
            req.session.cookie.maxAge = keepSignedIn ? (24*60*60*1000) : null
            return res.redirect('/users/my-account')
        }) 
    })(req, res, next);
}

module.exports = controller