var express = require('express')

var router = express.Router()

const Coupon = require('../../Controller/admin/coupon.controller')

router.get('/', Coupon.index)

router.get('/create', Coupon.getCreate)
router.post('/create', Coupon.postCreate)

router.get('/:id', Coupon.detail)

router.patch('/update', Coupon.update)

router.delete('/delete/:id', Coupon.delete)

router.post('/check', Coupon.checkCoupon)

// router.patch('/promotion/:id', Coupon.createCoupon)

module.exports = router