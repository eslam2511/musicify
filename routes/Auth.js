require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const express = require('express')
const router = express.Router()
const Auth = require('../models/Auth')
const RefreshToken = require('../models/RefreshToken')
const BlackList = require('../models/TokensBlackList')

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
        const addRefreshToken = new RefreshToken({
            token: refreshToken
        })

        await addRefreshToken.save()

        const response = {
            accesstoken: token,
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
        const addRefreshToken = new RefreshToken({
            token: refreshToken
        })

        await addRefreshToken.save()

        const response = {
            accesstoken: token,
            refreshtoken: refreshToken 
        }
        res.status(200).json(response)
    } catch (err) {
        res.status(500)
    }
})

router.post('/token', async (req, res) =>{
    const {token} = req.body
    if (!token) return res.status(400).json({error: "refresh token is missing", message: "please provide a refresh token"})
    
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_ACCESS_TOKEN_SECRET)
        const newTokenData = {
            id: decoded.id,
            email: decoded.email,
            password: decoded.password
        }

        const newToken = jwt.sign(newTokenData, process.env.ACCESS_TOKEN_SECRET)
        res.json({accesstoken: newToken})

    } catch (err) {
        res.status(400).json({err: err.name, message: err.message})
    }
})

router.post('/logout', async (req,res) =>{
    const {accesstoken, refreshtoken} = req.body
    if (!accesstoken || !refreshtoken) return res.status(400).json({error: "missing fields", message: "please provide both refresh and accesss token"})

    const isLogedIn = RefreshToken.find({token: refreshtoken})


    const token = new BlackList({
        token: accesstoken
    })
    await token.save()
    res.status(200).send(true)

})

module.exports = router