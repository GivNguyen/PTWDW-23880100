'use strict'

const controller = {}
const models = require('../models')


controller.showHomepage = async (req, res) => {
    //show recentProducts
    const recentProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        order: [['createdAt', 'DESC']],
        limit: 10,
    });
    res.locals.recentProducts = recentProducts
    //show featuredProducts
    const featuredProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        order: [['stars', 'DESC']],
        limit: 10,
    });
    res.locals.featuredProducts = featuredProducts;
    //Category query
    
    const category = await models.Category.findAll();
    //[1, 2, 3, 4] => [[1], [3, 4]. [2]]
    const secondArray = category.splice(2, 2);
    const thirdArray = category.splice(1, 1);
    res.locals.categoryArray = [
        category,
        secondArray,
        thirdArray,
    ]
    const categories = await models.Category.findAll();
    res.locals.categories = categories
    //Brand query
    // const Brand = models.Brand;
    const brands = await models.Brand.findAll(); 
    res.locals.brands = brands
    res.render('index');
};

//show separated page
controller.showPage = (req, res, next) => {
    const pages = ['cart', 'checkout', 'contact', 'login', 'my-account', 'product-detail',
    'product-list', 'wishlist'];
    if (pages.includes(req.params.page))
        return res.render(req.params.page)
    next();
}
module.exports = controller;