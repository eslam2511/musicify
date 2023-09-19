require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const Auth = require('../models/Auth')


router.post('/signup', (req, res) => {
    const {username, email, password} =req.body
    res.send('done')
})

module.exports = router