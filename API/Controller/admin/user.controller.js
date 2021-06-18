const User = require('../../../Models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order = require('../../../Models/order')

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;

    let start = (page - 1) * perPage;
    let end = page * perPage;
    let users;
    if (req.query.permission) {
        users = await User.find({ id_permission: req.query.permission }).populate('id_permission')
    } else {
        users = await User.find({}).populate('id_permission')
    }

    if (!keyWordSearch) {
        const totalPage = Math.ceil(users.length / perPage);
        res.json({
            users: users.slice(start, end),
            totalPage: totalPage
        })

    } else {
        const totalPage = Math.ceil(users.length / perPage);
        var newData = users.filter(value => {
            return value.fullname.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.email.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                (value.id_permission && value.id_permission.permission.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1) ||
                (value.id_permission && value.id_permission._id.toString().toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1)
        })

        res.json({
            users: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.create = async (req, res) => {
    const user = await User.find();

    const userFilter = user.filter((c) => {
        return c.email === req.query.email.trim() || c.username === req.query.username.trim()
    });

    if (userFilter.length > 0) {
        res.json({ msg: 'Email hoặc username đã tồn tại' })
    } else {
        var newUser = new User()
        const salt = await bcrypt.genSalt();
        req.query.password = await bcrypt.hash(req.query.password, salt);
        req.query.name = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
        newUser.fullname = req.query.name
        newUser.username = req.query.username
        newUser.password = req.query.password
        if (!req.query.rank) {
            newUser.id_rank = "60cb0ede375d6898906d2b1e"
        }
        if (!req.query.permission) {
            newUser.id_permission = "6087dcb5f269113b3460fce4"
        } else newUser.id_permission = req.query.permission
        newUser.email = req.query.email

        newUser.save();
        res.json({ msg: "Bạn đã thêm thành công" })
    }
}

module.exports.delete = async (req, res) => {
    const id = req.query.id;

    await User.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })

}

module.exports.details = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });

    res.json(user)
}

module.exports.update = async (req, res) => {
    const user = await User.findOne({ _id: req.query.id });
    if (req.query.email && req.query.email !== user.email) {
        req.query.email = user.email
    }
    if (req.query.username && req.query.username !== user.username) {
        req.query.username = user.username
    }
    if (!req.query.password) {
        req.query.password = user.password;
    } else {
        const salt = await bcrypt.genSalt();
        req.query.password = await bcrypt.hash(req.query.password, salt);
    }

    req.query.fullname = req.query.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })
    await User.updateOne({ _id: req.query.id },
        req.query
        , function (err, res) {
            if (err) return res.json({ msg: err });
        });
    res.json({ msg: "Bạn đã update thành công" })
}

module.exports.login = async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    const body = [{ username: email }, { email: email }]

    const user = await User.findOne({ $or: body }).populate(['id_permission', 'id_rank'])

    if (user === null) {
        res.json({ msg: "Không Tìm Thấy User" })
    }
    else {
        const auth = await bcrypt.compare(password, user.password)
        if (auth) {
            var token = jwt.sign(user._id.toJSON(), 'gfdgfd');

            res.json({ msg: "Đăng nhập thành công", user: user, jwt: token })
        } else {
            res.json({ msg: "Sai mật khẩu" })
        }
    }
}

module.exports.changePassword = async (req, res) => {
    let user
    if (req.query.id) {
        user = await User.findOne({ _id: req.query.id }).populate('id_permission')
    }

    if (req.query.password) {
        const auth = await bcrypt.compare(req.query.password, user.password)
        if (!auth) {
            return res.json({ msg: "Sai mật khẩu" })
        }
    }
    const salt = await bcrypt.genSalt();
    req.query.newPassword = await bcrypt.hash(req.query.newPassword, salt);

    await User.updateOne({ $or: [{ _id: req.query.id }, { email: req.query.email }] },
        { password: req.query.newPassword }
        , function (err, res) {
            if (err) return res.json({ msg: err });
        });
    res.json({ msg: "Bạn đã update thành công" })



}

module.exports.sendOTP = async function (req, res, next) {
    const user = await User.findOne({ email: req.query.email })

    if (!user) {
        return res.json({ msg: "Email chưa được đăng ký" })
    }

    next();

}

module.exports.checkLogin = async function (req, res) {
    const user = req.body.user
    const jwt2 = req.body.jwt

    const check = await User.findOne({ _id: user._id })
    if (!check) {
        return res.json({ msg: "Thất bại" })
    }

    var token = jwt.sign(check._id.toJSON(), 'gfdgfd');

    if (token !== jwt2) {
        return res.json({ msg: "Thất bại" })
    }
    res.json({ msg: "Thành công" })
}
