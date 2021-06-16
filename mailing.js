const nodemailer = require('nodemailer');
let content = '';
// const User = require('./model/user.model')

// module.exports.contentMail = async function (req, res, next) {
//     const carts = await Cart.find({ userID: req.body.userID })
//     let count = 0;
//     let tong = 0;
//     content = '<div style="text-align:center"><h1>Thông tin người mua là</h1>' +
//         `<h3>Tên: ${req.body.name}</h3>` +
//         `<h3>SĐT: ${req.body.phone}</h3>` +
//         `<h3>Địa chỉ: ${req.body.address}</h3></div>` +
//         '<h1 style="text-align:center">Sản phẩm đã mua là </h1>' +
//         '<table><tr><th>Tên</th><th>Gía</th><th>Số lượng</th></tr>'
//     carts.map(carts => {
//         count += carts.count
//         tong += carts.count * carts.price
//         content += `<tr><td><h3>${carts.nameProduct}</h3></td>` +
//             `<td><h3>${new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(carts.price)} đ</h3>` +
//             `</td>` + `<td><h3>${carts.count}</h3></td></tr>`
//     })
//     content += `</table><h2 style="text-align:right">Tổng tiền: ${new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(tong)} đ</h2>` +
//         `<h2 style="text-align:right">Tổng số lượng đã mua: ${count}</h2>`
//     next();
// }

module.exports.contentOTP = async function (req, res, next) {

    content = '<div style="text-align:center">' +
        '<p style="font-size: 15px;">Mã OTP của bạn là</p>' +
        `<h1>${req.query.otp}</h1>` +
        '</div>'

    next();
}

// module.exports.sendMail = async function (req, res, next) {
//     const option = {
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL, // email hoặc username
//             pass: process.env.PASSWORD // password
//         }
//     };

//     var transporter = nodemailer.createTransport(option);

//     const mail = {
//         from: process.env.EMAIL, // Địa chỉ email của người gửi
//         to: req.query.email, // Địa chỉ email của người gửi
//         subject: 'Thông tin từ shop Respresent', // Tiêu đề mail
//         html: content
//     };

//     await transporter.sendMail(mail, function (error, info) {
//         if (error) { // nếu có lỗi
//             return res.json({ msg: error })
//         } else { //nếu thành công
//             // console.log(info)
//         }
//     });

//     res.json({ msg: 'Vui lòng kiểm tra mail để lấy mã OTP' })

// }

module.exports.checkOTP = async function (req, res) {

    if (req.query.otp === otp) {
        res.json({ msg: 'Thành công' })
    }
    else {
        res.json({ msg: 'Sai mã OTP' })
    }

}


module.exports.sendMail = async function (req, res, next) {
    let transporter = nodemailer.createTransport({
        pool: true,
        service: 'Gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            refreshToken: process.env.REFRESH_TOKEN,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
        }

    });

    // transporter.verify((error, success) => {
    //     if (error) return console.log(error)
    //     console.log('Server is ready to take our messages: ', success)
    //     transporter.on('token', token => {
    //         console.log('A new access token was generated')
    //         console.log('User: %s', token.user)
    //         console.log('Access Token: %s', token.accessToken)
    //         console.log('Expires: %s', new Date(token.expires))
    //     })
    // })

    const mail = {
        from: process.env.EMAIL, // Địa chỉ email của người gửi
        to: req.query.email, // Địa chỉ email của người gửi
        subject: 'Thông tin từ shop Respresent', // Tiêu đề mail
        html: content
    };
    //Tiến hành gửi email
    await transporter.sendMail(mail, function (error, info) {
        if (error) { // nếu có lỗi
            return res.json({ msg: error })
        } else { //nếu thành công
            console.log(info)
        }
    });
    res.json({ msg: 'Vui lòng kiểm tra mail để lấy mã OTP' })
}

