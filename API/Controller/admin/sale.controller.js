const Sale = require('../../../Models/sale');
const Product = require('../../../Models/product');
const Producer = require('../../../Models/producer');

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;

    let start = (page - 1) * perPage;
    let end = page * perPage;

    const sale = await Sale.find();

    if (!keyWordSearch) {
        const totalPage = Math.ceil(sale.length / perPage);
        res.json({
            sales: sale.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = sale.filter(value => {
            return value.describe.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.promotion.toString().toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.status.toString().toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })
        const totalPage = Math.ceil(newData.length / perPage);


        res.json({
            sales: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.getCreate = async (req, res) => {
    const page = req.query.page

    const count = req.query.count || 5

    const category = req.query.category

    const start = category == "true" ? (page - 1) * count : (page - 2) * count
    const end = category == "true" ? page * count : (page - 1) * count

    let products = []

    if (category == "true") {
        products = await Producer.find()

    } else {
        products = await Product.find()
    }


    res.json(products.slice(start, end))
}

module.exports.postCreate = async (req, res) => {
    req.body.describe = req.body.describe.toLowerCase().trim().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
    const check = await Sale.findOne({ describe: req.body.describe });
    const product = req.body.product
    if (check) {
        return res.json({ msg: "Sale đã tồn tại" })
    }


    const sale = await Sale.create(req.body)

    await product.forEach(async e => {
        if (e.producer) {
            await Product.updateMany({ id_producer: e._id }, {
                id_sale: sale._id
            })
        } else {
            await Product.updateOne({ _id: e._id }, {
                id_sale: sale._id
            })
        }

    })

    res.json({ msg: "Bạn đã thêm thành công" })
}

module.exports.delete = async (req, res) => {
    const id = req.params.id;
    await Sale.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })
}

module.exports.detail = async (req, res) => {
    const coupon = await Sale.findOne({ _id: req.params.id }).populate('id_payment');
    res.json(coupon)
}


module.exports.update = async (req, res) => {
    req.query.describe = req.query.describe.toLowerCase().trim().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
    const check = await Sale.findOne({ describe: req.query.describe });
    const product = req.body.product
    if (check && check.id !== req.query.id) {
        return res.json({ msg: "Sale đã tồn tại" })
    }

    await Sale.updateOne({ _id: req.query.id },
        req.query
    )

    if (product) {
        await product.forEach(async e => {
            if (!e.check) {
                await Product.updateOne({ _id: e._id, id_sale: req.query.id }, {
                    $unset: { id_sale: "" }
                })
            }
            else {
                if (e.producer) {
                    await Product.updateMany({ id_producer: e._id }, {
                        id_sale: req.query.id
                    })
                } else {
                    await Product.updateOne({ _id: e._id }, {
                        id_sale: req.query.id
                    })
                }
            }


        })
    }


    res.json({ msg: "Bạn đã update thành công" })
}

module.exports.all = async (req, res) => {
    const sale = await Sale.find();
    res.json(sale)
}