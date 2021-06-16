const Coupon = require('../../../Models/coupon');
const Payment = require('../../../Models/payment');
const Rank = require('../../../Models/rank');
const Order = require('../../../Models/order');

module.exports.index = async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await Coupon.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;

    const coupon = await Coupon.find().populate('id_payment');

    if (!keyWordSearch) {
        res.json({
            coupons: coupon.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = coupon.filter(value => {
            return value.code.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.promotion.toString().toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.number.toString().toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            coupons: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.getCreate = async (req, res) => {
    const payment = await Payment.find();
    const rank = await Rank.find();
    res.json({ payment: payment, rank: rank })
}

module.exports.postCreate = async (req, res) => {

    const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (coupon) {
        return res.json({ msg: "Coupon đã tồn tại" })
    }
    else {
        req.body.code = req.body.code.toString().toUpperCase()
        req.body.describe = req.body.describe.toLowerCase().trim().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
        const note = await Coupon.create(req.body)
        res.json({ msg: "Bạn đã thêm thành công" })
    }

}

module.exports.delete = async (req, res) => {
    console.log(id)
    await Coupon.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })
}

module.exports.detail = async (req, res) => {
    const coupon = await Coupon.findOne({ _id: req.params.id }).populate('id_payment');
    res.json(coupon)
}

module.exports.update = async (req, res) => {
    const coupon = await Coupon.find({ code: req.query.code.toUpperCase() });

    const couponnFilter = coupon.filter((c) => {
        return c._id !== req.query.id
    });
    if (couponnFilter.length > 0) {
        return res.json({ msg: "Coupon đã tồn tại" })
    }
    else {
        req.query.code = req.query.code.toString().toUpperCase()
        req.query.describe = req.query.describe.toLowerCase().trim().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
        await Coupon.updateOne({ _id: req.query.id },
            req.query
            , function (err, res) {
                if (err) return res.json({ msg: err });
            });
        res.json({ msg: "Bạn đã update thành công" })
    }
}

module.exports.checkCoupon = async (req, res) => {

    const code = req.body.code
    const payment = req.body.payment
    const date = new Date()

    const coupon = await Coupon.findOne({ code: code }).populate('id_payment');

    if (!coupon) {
        return res.json({ msg: "Coupon không tồn tại" })
    }
    const checkCoupon = await Order.findOne({ id_user: req.body.id_user, id_coupon: coupon._id, "status": { $ne: "5" } })

    if (coupon.number <= 0 || coupon.startDate >= date || coupon.endDate < date || checkCoupon) {
        return res.json({ msg: "Coupon đã hết lượt sử dụng" })
    }
    if (payment && coupon.id_payment && coupon.id_payment._id != payment) {
        return res.json({ msg: "Coupon không áp dụng cho hình thức thanh toán này" })
    }

    return res.json({ msg: "Thành công", coupon: coupon })

}

