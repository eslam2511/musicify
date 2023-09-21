const mongoose = require('mongoose')
const { Schema } = mongoose

const AuthSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        reqired: true,
    }
})

module.exports  = mongoose.model('auth', AuthSchema, 'Auth')