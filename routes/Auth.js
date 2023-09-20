require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const Auth = require('../models/Auth')

router.use(express.json())
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body
    
    if (!password) return res.status(400).json({
        error: "Missing password field",
        message: "Please provide a password when signing up."
    })

    if (!email) return res.status(400).json({
        error: "Missing email field",
        message: "Please provide an email when signing up."
    })

    if (!username) return res.status(400).json({
        error: "Missing uesrname field",
        message: "Please provide an username when signing up."
    })

    const isEmail = await Auth.find({email: email})
    if (isEmail.length) return res.status(409).json({
        error: "email already exist",
        message: "Please use a diffrent email"
    })

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))
    const userAuth = new Auth({
        email: email,
        password: hashedPassword
    })

    try {
        const user = await userAuth.save()
        const User = { id: user._id, email: user.email, password: user.password }
        const token = jwt.sign(User, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'})
        const refreshToken = jwt.sign(User, process.env.REFRESH_ACCESS_TOKEN_SECRET)
        const response = {
            token: token,
            refreshtoken: refreshToken 
        }
        res.status(200).json(response)
    } catch (err) {
        res.status(500)
    }
})


router.post('/login', async (req, res) =>{
    const {email, password} = req.body
    if(!email || !password) return res.json({error: 'Missing email or password', message: 'Please make sure you provided both email and password'})
    
    const user = await Auth.findOne({email: email})
    if (!user) return res.status(404).json({
        error: "wrong credintials",
        message: "please provide a correct email or password"
    })

    const checkPass = await bcrypt.compare(password, user.password)
    if(!checkPass) return res.status(404).json({
        error: "wrong credintials",
        message: "please provide a correct email or password"
    })

    try {
        const User = { id: user._id, email: user.email, password: user.password }
        const token = jwt.sign(User, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'})
        const refreshToken = jwt.sign(User, process.env.REFRESH_ACCESS_TOKEN_SECRET)
        const response = {
            token: token,
            refreshtoken: refreshToken 
        }
        res.status(200).json(response)
    } catch (err) {
        res.status(500)
    }
})

module.exports = router