const mongoose = require('mongoose')
const { Schema } = mongoose

const TokenBlackList = new Schema({
    token: {
        type: String,
        required: true
    },
    addedAt: {
        type: Date,
        default: new Date(Date.now())
    },
    expireAt: {
        type: Date,
        default: new Date(new Date().valueOf() + 60000),
        expires: 10800
    }
})

module.exports = mongoose.model('tokenBlackList', TokenBlackList, 'TokenBlackList')