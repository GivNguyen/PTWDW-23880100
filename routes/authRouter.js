'use strict'

const express = require('express');
const controller = require('../controllers/authController');
const router = express.Router()
const { body, getErrorMessage } = require('../controllers/validator')


router.get('/login', controller.show);
router.post('/login', 
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage
    ('Invalid email address'),
    body('password').trim().notEmpty().withMessage('Email is required'),
    (req, res, next) => {
        let message = getErrorMessage(req);
        if (message) {
            return res.render('login', { loginMessage: message })
        }
    },
    controller.login
);
router.get('/logout', controller.logout)

module.exports = router;