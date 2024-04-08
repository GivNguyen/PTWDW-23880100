'use strict'
const expess = require('express')
const router = expess.Router();
const controller = require('../controllers/indexController');


// router.get('/createTables', (req, res) => {
//     let models = require('../models');
//     models.sequelize.sync().then(() => {
//         res.send('table created');
//     });
// })
router.get('/', controller.showHomepage);
router.get('/:page', controller.showPage);
module.exports = router;