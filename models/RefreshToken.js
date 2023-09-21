const mongoose = require('mongoose')
const { Schema } = mongoose

const RefreshTokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})



module.exports = mongoose.model('refreshToken', RefreshTokenSchema, 'RefreshTokens')