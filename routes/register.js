const express = require('express')
const bcrypt = require('bcrypt')
const joi = require('joi')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User')
const router = express()

const registerSchema = joi.object({
    name: joi.string().required().min(2).max(1024),
    email: joi.string().required().min(5).max(1024).email(),
    password: joi.string().required().min(6).max(1024),
    biz: joi.boolean().required()
})

router.post('/', async (req, res)=> {
    try {
        // Joi Validation:
        const { error } = registerSchema.validate(req.body)
        if(error) return res.status(400).send(error.details[0].message)

        // Check if user already exist:
        let user = await User.findOne({email: req.body.email})
        if(user) return res.status(400).send('User already exist in DataBase')

        // Create new User:
        user = new User(req.body)

        // Encryption password in DataBase:
        let salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        // Save User:
        await user.save()

        // Provide and Show Token:
        let token = jwt.sign({_id: user._id, biz: user.biz}, process.env.secretKey)
        res.status(201).send({token: token})

    } catch(err){
        res.status(400).send('ERROR in POST Register')
    }
})

module.exports = router;