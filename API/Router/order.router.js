var express = require('express')

var router = express.Router()

const Order = require('../Controller/order.controller')

// Hiển thị danh sách đơn đặt hàng
router.get('/order/:id', Order.get_order)

// Hiển thị chi tiết đơn đặt hàng
router.get('/order/detail/:id', Order.get_detail)

// Đặt Hàng thêm vào hóa đơn
router.post('/order', Order.checkorder, Order.post_order)
router.post('/order2', Order.post_order2)

router.post('/checkcart', Order.checkCart)

router.post('/momo', Order.momo)
router.post('/momo2', Order.momo)

router.post('/email', Order.send_mail)

module.exports = router
