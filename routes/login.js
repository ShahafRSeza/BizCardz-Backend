const express = require('express')
const joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User')
const router = express.Router()

const loginSchema = joi.object({
    email: joi.string().required().min(5).max(1024).email(),
    password: joi.string().required().min(6).max(1024),
})

router.post('/', async (req, res)=> {
    try {
        // Joi Validation:
        const { error } = loginSchema.validate(req.body)
        if(error) return res.status(400).send(error.details[0].message)

        // Check if user already exist:
        let user = await User.findOne({email: req.body.email})
        if(!user) return res.status(400).send('Invalid Email or Password, Please try again.')

        // Check if Password is correct:
        const result = await bcrypt.compare(req.body.password, user.password)
        if(!result) return res.status(400).send('Invalid Email or Password, Please try again.')

        // Provide and Show Token:
        const token = jwt.sign({_id: user._id, biz: user.biz}, process.env.secretKey)
        res.status(200).send({token: token})

    } catch(err){
        res.status(400).send('ERROR in POST Login')
    }
})

module.exports = router;