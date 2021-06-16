
const Comment = require('../../Models/comment')

// Phương thức GET
module.exports.index = async (req, res) => {
    const id_product = req.params.id

    let star = 0;

    const comment = await (await Comment.find({ id_product: id_product }).populate('id_user')).reverse()

    comment.map((value) => {
        star += Number(value.star);
        value
    })

    if (comment.length > 0) {
        star = Number(star) / Number(comment.length)
    }

    star = (Math.round(star))

    res.json({ comment: comment, star: star })

}

// Gửi comment
// Phương Thức Post
module.exports.post_comment = async (req, res) => {

    const id_product = req.params.id

    const data = {
        id_product: id_product,
        id_user: req.body.id_user,
        content: req.body.content,
        star: req.body.star
    }

    await Comment.create(data)

    res.send('Thanh Cong')

}

module.exports.delete = async (req, res) => {
    const id = req.params.id;
    const userID = req.query.userID;
    const permission = req.query.permission

    if (permission === "Nhân Viên") {
        Comment.deleteOne({ _id: id }, (err) => {
            if (err) {
                return res.json({ msg: err })
            }
        })
        return res.json({ msg: "Thanh Cong" })
    }

    await Comment.deleteOne({ _id: id, id_user: userID }, (err) => {
        if (err) {
            return res.json({ msg: err })
        }
        res.json({ msg: "Thanh Cong" })
    })
}