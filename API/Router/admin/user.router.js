var express = require('express')

var router = express.Router()

const User = require('../../Controller/admin/user.controller')
const Mailing = require('../../../mailing')

router.get('/', User.index)
router.get('/:id', User.details)

router.post('/create', User.create)

router.post('/login', User.login)

router.patch('/update', User.update)

router.delete('/delete', User.delete)

router.patch('/changePassword', User.changePassword)

router.post('/sendOTP', User.sendOTP, Mailing.contentOTP, Mailing.sendMail);
router.post('/checkOTP', Mailing.checkOTP);

router.post('/checkLogin', User.checkLogin)


module.exports = router