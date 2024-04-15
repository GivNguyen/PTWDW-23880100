const controller = {}

const models = require('../models')


controller.checkout = async (req, res) => {
    let userId = req.user.id
    res.locals.cart = req.session.cart.getCart()
    if (req.locals.cart.items.length > 0) {
        
        res.locals.addresses = await models.Address.findAll({
            where: {userId}
        })
        
        return res.render('checkout')
    }
    res.redirect('/products')
}
controller.placeorders = async (req, res) => {
    let userId = req.user.id
    let cart = req.session.cart
    //let { addressId, payment } = req.body;
    let addressId = isNaN(req.body.addressId) ? 0 : parseInt(req.body.addressId)
    if (cart.quantity > 0) {
        let address = await models.Address.findByPk(addressId);
        if (!address) {
            address = await models.Address.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                mobile: req.body.mobile,
                address: req.body.address,
                country: req.body.country,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode,
                isDefault: req.body.isDefault,
                userId
            })
        }
        cart.shippingAddress = `${address.firstName} ${address.lastName},
        Email: ${address.email}, Mobile: ${address.mobile}, Address: ${address.address},
        ${address.city}, ${address.country}, ${address.state}, ${address.zipCode}`
        cart.paymentMethod = req.body.payment;
        switch (req.body.payment) {
            case 'PAYPAL':
                saveOrders(req, res, 'PAID')
                break;
            case 'COD':
                saveOrders(req, res, 'UNPAID')    
        }
    } else {
        res.redirect('/products/cart')
    } 
}   

async function saveOrders(req, res, status) {
    let userId = req.user.id
    let { items, ...others } = req.session.cart.getCart()
    let order = await models.Order.create({
        userId,
        ...others,
        status
    })
    let orderDetail = [];
    items.forEach(item => {
        orderDetail.push({
            orderId: order.id,
            productId: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
            total: item.total
        });
    });
    await models.OrderDetail.bulkCreate(orderDetail);
    req.session.cart.clear()
    return res.render('error', {message: 'Thank you for your Order!'})
}


module.exports = controller;