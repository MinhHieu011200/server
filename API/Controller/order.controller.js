
const { Base64 } = require('js-base64')
const crypto = require('crypto')
const mailer = require('../../mailer')

const Order = require('../../Models/order')
const Detail_Order = require('../../Models/detail_order')
const Note = require('../../Models/note')
const MoMo = require('../../Models/momo')
const Products = require('../../Models/product')
const Coupon = require('../../Models/coupon')


// Đặt hàng
module.exports.post_order = async (req, res) => {
    let cartItem = req.body.cartItem
    await cartItem.map(async e => {
        var products = await Products.findOne({ _id: e.id_product })
        products.number = products.number - Number(e.count)
        products.save()
    })



    let coupon = await Coupon.findOne({ code: req.body.code });
    if (coupon) {
        req.body.id_coupon = coupon._id
        coupon.number = coupon.number - 1
        coupon.save()
    }
    const note = await Note.create(req.body)

    const order = await Order.create(Object.assign({}, req.body, { id_note: note._id }))

    let cartArr = cartItem.map(e => {
        return Object.assign({}, e, { id_order: order._id });
    })

    await Detail_Order.insertMany(cartArr);

    res.json({ msg: 'Thanh Cong' })
}

module.exports.post_order2 = async (req, res) => {
    const order = await Order.create(req.body)
    res.json(order)

}

module.exports.checkorder = async (req, res, next) => {
    let cart = []
    let cartItem = req.body.cartItem
    let flag = false;
    var products = await Products.find().populate('id_sale')
    await cartItem.map(async e => {
        let flag2 = false;
        await products.map((p) => {
            if (e.id_product == p._id && p.number > 0) {
                flag2 = true
                if (p.id_sale && p.id_sale.status) {
                    p.price_product = Number(p.price_product) * (100 - Number(p.id_sale.promotion)) / 100
                }

                if (Number(p.number) - Number(e.count) < 0) {
                    flag = true;
                    e.count = p.number
                }
                if (p.price_product != e.price_product) {
                    flag = true;
                    e.price_product = p.price_product
                    cart.push(e)
                } else {
                    cart.push(e)
                }
            }
        })
        if (!flag2) {
            flag = true;
        }
    })


    if (flag) {
        return res.json({ msg: "Có sự thay đổi trong giỏ hàng. Vui lòng kiểm tra lại!", cart: cart })
    }
    next();
}

module.exports.checkCart = async (req, res) => {
    let cart = []
    let cartItem = req.body.cartItem
    let flag = false;
    var products = await Products.find().populate('id_sale')
    await cartItem.map(async e => {
        let flag2 = false;
        await products.map((p) => {
            if (e.id_product == p._id && p.number > 0) {
                flag2 = true
                if (p.id_sale && p.id_sale.status) {
                    p.price_product = Number(p.price_product) * (100 - Number(p.id_sale.promotion)) / 100
                }

                if (Number(p.number) - Number(e.count) < 0) {
                    flag = true;
                    e.count = p.number
                }
                if (p.price_product != e.price_product) {
                    flag = true;
                    e.price_product = p.price_product
                    cart.push(e)
                } else {
                    cart.push(e)
                }
            }
        })
        if (!flag2) {
            flag = true;
        }
    })

    if (flag) {
        res.json({ msg: "Có sự thay đổi trong giỏ hàng. Vui lòng kiểm tra lại!", cart: cart })
    } else {
        res.json({ msg: "Thanh Cong" })
    }
}

module.exports.send_mail = async (req, res) => {

    const carts = await Detail_Order.find({ id_order: req.body.id_order }).populate('id_product')

    //B3: Bắt đầu gửi Mail xác nhận đơn hàng
    const htmlHead = '<table style="width:50%">' +
        '<tr style="border: 1px solid black;"><th style="border: 1px solid black;">Tên Sản Phẩm</th><th style="border: 1px solid black;">Hình Ảnh</th><th style="border: 1px solid black;">Giá</th><th style="border: 1px solid black;">Số Lượng</th><th style="border: 1px solid black;">Size</th><th style="border: 1px solid black;">Thành Tiền</th>'

    let htmlContent = ""

    for (let i = 0; i < carts.length; i++) {
        htmlContent += '<tr>' +
            '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].id_product.name_product + '</td>' +
            '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;"><img src="' + carts[i].id_product.image + '" width="80" height="80"></td>' +
            '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].id_product.price_product + '$</td>' +
            '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].count + '</td>' +
            '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + carts[i].size + '</td>' +
            '<td style="border: 1px solid black; font-size: 1.2rem; text-align: center;">' + (parseInt(carts[i].id_product.price_product) * parseInt(carts[i].count)) + '$</td>' +
            '<tr>'
    }

    const htmlResult = '<h1>Xin Chào ' + req.body.fullname + '</h1>' + '<h3>Phone: ' + req.body.phone + '</h3>' + '<h3>Address:' + req.body.address + '</h3>' +
        htmlHead + htmlContent + '<h1>Phí Vận Chuyển: ' + req.body.price + '$</h1></br>' + '<h1>Tổng Thanh Toán: ' + req.body.total + '$</h1></br>' + '<p>Cảm ơn bạn!</p>'

    // Thực hiện gửi email (to, subject, htmlContent)
    await mailer.sendMail(req.body.email, 'Hóa Đơn Đặt Hàng', htmlResult)

    res.send("Gui Email Thanh Cong")

}

module.exports.get_order = async (req, res) => {
    const page = req.query.page

    const count = req.query.count || 5

    const start = (page - 1) * count
    const end = page * count

    const id_user = req.params.id

    const order = await Order.find({ id_user }).sort({ createDate: -1 }).populate(['id_user', 'id_note', 'id_payment', 'id_momo'])

    res.json(order.slice(start, end))

}

module.exports.get_detail = async (req, res) => {
    const id_order = req.params.id

    const order = await Order.findOne({ _id: id_order }).populate(['id_user', 'id_note', 'id_payment', 'id_momo', 'id_coupon'])

    res.json(order)

}

module.exports.momo = async (req, res) => {
    const serectkey = process.env.SECRET_KEY
    const accessKey = req.body.accessKey
    const amount = req.body.amount
    const extraData = req.body.extraData
    const errorCode = req.body.errorCode
    const localMessage = req.body.localMessage
    const message = req.body.message
    const orderId = req.body.orderId
    const orderInfo = req.body.orderInfo
    const orderType = req.body.orderType
    const partnerCode = req.body.partnerCode
    const payType = req.body.payType
    const requestId = req.body.requestId
    const responseTime = req.body.responseTime
    const transId = req.body.transId

    const check = await MoMo.findOne({ orderId: orderId, transId: transId })

    if (check) {
        return res.send("Đơn hàng đã tồn tại")
    }

    let param = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&message=${message}&localMessage=${localMessage}&responseTime=${responseTime}&errorCode=${errorCode}&payType=${payType}&extraData=${extraData}`

    var signature = crypto.createHmac('sha256', serectkey)
        .update(param)
        .digest('hex');

    if (req.body.signature !== signature) {
        res.send("Thông tin request không hợp lệ")
        return;
    }
    const data = JSON.parse(Base64.decode(extraData))
    let cartItem = data.cartItem

    if (errorCode == 0) {
        await cartItem.map(async e => {
            var products = await Products.findOne({ _id: e.id_product })
            products.number = products.number - Number(e.count)
            products.save()
        })

        let coupon = await Coupon.findOne({ code: data.code });
        if (coupon) {
            data.id_coupon = coupon._id
            coupon.number = coupon.number - 1
            coupon.save()
        }

        const momo = await MoMo.create(req.body)

        const note = await Note.create(data)

        const order = await Order.create(Object.assign({}, data, { pay: true, status: '1', id_note: note._id, id_momo: momo._id }))

        let cartArr = cartItem.map(e => {
            return Object.assign({}, e, { id_order: order._id });
        })

        await Detail_Order.insertMany(cartArr);
        res.send("Thanh Cong")
    } else {
        let coupon = await Coupon.findOne({ code: data.code });
        if (coupon) {
            data.id_coupon = coupon._id
        }

        const momo = await MoMo.create(req.body)
        const note = await Note.create(data)
        const order = await Order.create(Object.assign({}, data, { pay: false, status: '5', id_note: note._id }))

        let cartArr = cartItem.map(e => {
            return Object.assign({}, e, { id_order: order._id });
        })

        await Detail_Order.insertMany(cartArr);
        res.send("Thanh toán thất bại")
    }
}

module.exports.momo2 = async (req, res) => {
    const serectkey = process.env.SECRET_KEY
    const accessKey = req.body.accessKey
    const amount = req.body.amount
    const extraData = req.body.extraData
    const errorCode = req.body.errorCode
    const localMessage = req.body.localMessage
    const message = req.body.message
    const orderId = req.body.orderId
    const orderInfo = req.body.orderInfo
    const orderType = req.body.orderType
    const partnerCode = req.body.partnerCode
    const payType = req.body.payType
    const requestId = req.body.requestId
    const responseTime = req.body.responseTime
    const transId = req.body.transId

    let param = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&message=${message}&localMessage=${localMessage}&responseTime=${responseTime}&errorCode=${errorCode}&payType=${payType}&extraData=${extraData}`

    var signature = crypto.createHmac('sha256', serectkey)
        .update(param)
        .digest('hex');

    if (req.body.signature !== signature) {
        res.send("Thông tin request không hợp lệ")
        return;
    }
    if (errorCode == 0) {

        await Order.updateOne({ _id: req.body.orderId }, { pay: true }, function (err, res) {
            if (err) return res.json({ msg: err });
        });
        res.send("Thanh Cong")
    } else {
        res.send("Thanh toán thất bại")
    }

}












































// module.exports.post_paypal = async (req, res) => {

//     var create_payment_json = {
//         "intent": "authorize",
//         "payer": {
//             "payment_method": "paypal"
//         },
//         "redirect_urls": {
//             "return_url": "http://localhost:3000/success",
//             "cancel_url": "http://localhost:3000/fail"
//         },
//         "transactions": [{
//             "item_list": {
//                 "items": [{
//                     "name": "item", // Tên sản phẩm
//                     "sku": "item", // mã sản phẩm
//                     "price": "1.00", // giá tiền
//                     "currency": "USD",
//                     "quantity": 1 // số lượng
//                 }]
//             },
//             "amount": {
//                 "currency": "USD",
//                 "total": "1.00" // tổng số tiền phụ thuộc vào mình code
//             },
//             "description": "This is the payment description."
//         }]
//     };

//     paypal.payment.create(create_payment_json, function (error, payment) {
//         if (error) {
//             console.log(error.response);
//             throw error;
//         } else {
//             for (var index = 0; index < payment.links.length; index++) {
//             //Redirect user to this endpoint for redirect url
//                 if (payment.links[index].rel === 'approval_url') {
//                     console.log(payment.links[index].href);
//                 }
//             }
//             console.log(payment);
//         }
//     });

//     res.send("Thanh Cong")

// }