let controller = {}
const { where } = require('sequelize');
const models = require('../models')
const sequelize = require('sequelize')
const Op = sequelize.Op; //toan tu sequelize kiem tra co chua

controller.getData = async (req, res, next) => {
    //category query from Database
    //include: gop bang trong CSDL
    let categories = await models.Category.findAll({
        include: [{
            model: models.Product //Khoa ngoai den products, lay so luong products
        }]
    })
    res.locals.categories = categories
    //brands query from Database
    
    let brands = await models.Brand.findAll({
        include: [{
            model: models.Product //Khoa ngoai den products, lay so luong products
        }]
    })
    res.locals.brands = brands
    //Tags query from Database
    
    let tags = await models.Tag.findAll()
    res.locals.tags = tags
    next();
}
controller.show = async (req, res) => {
    //get parameter from client
    let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
    let brand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
    let tag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
    let keyword = req.query.keyword || '';
    let sort = ['Price', 'Newest', 'Popular'].includes(req.query.sort) ? req.query.sort : 'Price';
    let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page))
    //option show
    let options = {
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'], //lay attributes
        where: {}
    };
    if (category > 0) {
        options.where.categoryId = category;
    }
    if (brand > 0) {
        options.where.brandId = brand;
    }
    if (tag > 0) {
        options.include = [{
            model: models.Tag,
            where: { id: tag }
        }]
    }
    if (keyword.trim() != ''){
        options.where.name = {
            [Op.iLike]: `%${keyword}%`
        }
    }
    switch (sort){
        case 'Newest':
            options.order = [['createdAt', 'DESC']] //DESC: giam dan
            break;
        case 'Popular': 
            options.order = [['stars', 'DESC']]
            break;
        default:
            options.order = [['price', 'ASC']] //ASC: Tang dan
    }
    res.locals.sort = sort
    // console.log(req.originalUrl)
    res.locals.originalUrl = removeParam('sort', req.originalUrl)
    //Object class make all javascript object
    if (Object.keys(req.query).length == 0){
        res.locals.originalUrl = res.locals.originalUrl + '?'
    }
    //pagination
    const limit = 6;
    options.limit = limit;
    options.offset = limit * (page - 1);
    let {rows, count} = await models.Product.findAndCountAll(options)
    res.locals.pagination = {
        page: page,
        limit: limit,
        totalRows: count,
        queryParams: req.query
    }
    //show products
    // let products = await models.Product.findAll(options)
    res.locals.keyword = keyword;
    res.locals.products = rows;
    res.render('product-list')
}

controller.showDetail = async (req, res) => {   
    //product query
    let id = isNaN(req.params.id) ? 0 : (req.params.id)
    let product = await models.Product.findOne({ //get 1 item
        attributes: ['id', 'name', 'stars', 'oldPrice', 'price', 'summary', 'description',
        'specification'],
        where: { id },
        include: [{
            model: models.Image,
            attributes: ['name', 'imagePath']
        }, {
            model: models.Review,
            attributes: ['id', 'review', 'stars', 'createdAt'],
            include: [{
                model: models.User,
                attributes: ['firstName', 'lastName']
            }]
        }, {
            model: models.Tag,
            attributes: ['id']
        }]
    });
    
    res.locals.product = product
    let tagId = []
    product.Tags.forEach(tag => tagId.push(tag.id));
    let relatedProduct = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        include: [{
            model: models.Tag,
            attributes: ['id'],
            where: {
                id: { [Op.in]: tagId }
            }
        }],
        limit: 10
    });
    res.locals.relatedProduct = relatedProduct
    res.render('product-detail')
}
//remove params in url
function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}
module.exports = controller;