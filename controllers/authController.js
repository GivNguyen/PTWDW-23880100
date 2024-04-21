'use strict'


const passport = require('passport')
const controller = {}
const models = require('../models')

controller.show = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    }
    res.render('login', { loginMessage: req.flash('loginMessage'), reqUrl: req.query.reqUrl,
    registerMessage: req.flash('registerMessage') });
}

controller.login = (req, res, next) => {
    let keepSignedIn = req.body.keepSignedIn;
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/users/my-account'
    let cart = req.session.cart;

    passport.authenticate('local-login', (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`)
        }
        req.logIn(user, (error) => {
            if (error) { return next(error); }
            //luu dang nhap
            req.session.cookie.maxAge = keepSignedIn ? (24*60*60*1000) : null
            //luu trang thai gio hang
            req.session.cart = cart
            return res.redirect(reqUrl)
        }) 
    })(req, res, next);
}

controller.logout = (req, res, next) => {
    let cart = req.session.cart;
    req.logOut((error) => {
        if (error) { return next(error); }
        req.session.cart = cart
        res.redirect('/')
    })
}

controller.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect(`/users/login?reqUrl=${req.originalUrl}`)
}

controller.register = (req, res, next) => {
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/users/my-account'
    let cart = req.session.cart
    passport.authenticate('local-register', (error, user) => {
        if (error) { return next(error) }
        if (!user) { return res.redirect(`/users/login?reqUrl=${reqUrl}`) }
        req.logIn(user, (error) => {
            if (error) { return next(error) }
            req.session.cart = cart
            res.redirect(reqUrl)
        })
    }) (req, res, next);
}

controller.showForgotPassword = (req, res) => {
    res.render('forgot-password')
}

controller.forgotPassword = async (req, res) => {
    let email = req.body.email;
    //ktra email ton tai
    let user = await models.User.findOne({ where: {email} })
    if (user) {
        //tao link
        const { sign } = require('./jwt');
        const host = req.header('host')
        const resetLink = `${req.protocol}://${host}/users/reset?token=${sign(email)}&email=${email}` 
        //gui email
        const { sendForgotPasswordMail } = require('./mail')
        sendForgotPasswordMail(user, host, resetLink)
            .then((result) => {
                console.log('email has been sent')
                return res.render('forgot-password', {done: true})
            })
            .catch(error => {
                console.log(error.statusCode);
                return res.render('forgot-password', {message: 'An error has occured when sending to your email. Please check your email address!'})
            })
        //thong bao thanh cong
        
    } else {
        //nguoc lai thong bao email khong ton tai
        res.render('forgot-password', { message: 'Email does not exist'})
    }
    
    
}

module.exports = controller