const Producer = require('../../Models/producer')

module.exports.index = async (req, res) => {

    const producer = await Producer.find()
    // console.log(category)

    res.json(producer)

}