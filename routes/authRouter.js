'use strict'

const express = require('express');
const controller = require('../controllers/authController');
const router = express.Router()

router.get('/login', controller.show);
router.post('/login', controller.login)

module.exports = router;