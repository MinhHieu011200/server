var express = require('express')

var router = express.Router()

const Producer = require('../../Controller/admin/producer.controller')

router.get('/', Producer.index)

router.get('/:id', Producer.detail)

router.get('/detail/:id', Producer.detailProduct)

router.post('/create', Producer.create)

router.delete('/delete', Producer.delete)

router.put('/update', Producer.update)



module.exports = router