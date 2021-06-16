var express = require('express')

var router = express.Router()

const Sale = require('../../Controller/admin/sale.controller')

router.get('/', Sale.index)

router.get('/all', Sale.all)

router.get('/create', Sale.getCreate)
router.post('/create', Sale.postCreate)

router.get('/:id', Sale.detail)

router.patch('/update', Sale.update)

router.delete('/delete/:id', Sale.delete)



module.exports = router