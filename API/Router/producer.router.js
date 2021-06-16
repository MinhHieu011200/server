var express = require('express')

var router = express.Router()

const Producer = require('../Controller/producer.controller')

router.get('/', Producer.index)


module.exports = router