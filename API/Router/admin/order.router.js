var express = require('express')

var router = express.Router()

const Order = require('../../Controller/admin/order.controller')

router.get('/', Order.index)
router.get('/statistic', Order.statistic)

router.get('/detail/:id', Order.details)

router.get('/detailorder/:id', Order.detailOrder)

router.patch('/confirmorder', Order.confirmOrder)
router.patch('/cancelorder', Order.cancelOrder)
router.patch('/delivery', Order.delivery)
router.patch('/confirmdelivery', Order.confirmDelivery)

router.patch('/refund', Order.refund)

module.exports = router