'use strict'

const expess = require('express')
const router = expess.Router();
const controller = require('../controllers/productsController');
const cartController = require('../controllers/cartController');
const { route } = require('./indexRouter');


router.get('/',controller.getData, controller.show)

//show cart list must before add cart
router.get('/cart', cartController.show)
router.get('/:id',controller.getData, controller.showDetail)

router.post('/cart', cartController.add)
router.put('/cart', cartController.update)
router.delete('/cart', cartController.remove)
router.delete('/cart/all', cartController.clear)
module.exports = router;