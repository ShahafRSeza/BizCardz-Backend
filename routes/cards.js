const express = require('express')
const { Card } = require('../models/Card')
const joi = require('joi')
const _ = require('lodash')
const auth = require('../middlewares/auth')

const router = express.Router()

const cardSchema = joi.object({
    name: joi.string().required().min(2),
    address: joi.string().required().min(2),
    description: joi.string().required().min(5),
    phone: joi.string().required().min(9).max(10).regex(/^0[2-9]\d{7,8}$/),
    image: joi.string().required()
})

const genCardNumber = async () => {
        try {
            while(true){
                let randomNumber = _.random(1000, 9999);
                let card = await Card.findOne({cardNumber: randomNumber});
                if(!card) return randomNumber;
            }
        } catch(err){
            res.status(400).send('Error generate new Card Number')
        }
}

// Post New Card:
router.post('/', auth, async (req, res)=> {
    try{
        // Joi Validation:
        const { error } = cardSchema.validate(req.body)
        if(error) return res.status(400).send(error.details[0].message)

        // Provide CardNumber + user_id to each Card:
        let card = new Card(req.body)
        card.cardNumber = await genCardNumber()
        card.user_id = req.payload._id;

        // Save card to DataBase:
        await card.save()
        res.status(201).send(card)
    } catch(err){
        res.status(400).send('ERROR in POST New Card')
    }
})

// Get all Cards belongs to Specific User:
router.get('/my-cards', auth, async(req,res)=> {
    try {
        const myCards = await Card.find({user_id: req.payload._id})
        if(myCards.length == 0) return res.status(404).send('There are no Cards')
        res.status(200).send(myCards)
    } catch(err){
        res.status(400).send('ERROR in GET Cards of User')
    }
})

// Get Specific Card whos belong to Specific User:
router.get('/:id', auth, async (req,res) => {
    try{
        let card = await Card.findOne({_id: req.params.id, user_id: req.payload._id})
        if(!card) return res.status(400).send('Card was not found')
        res.status(200).send(card)
    } catch(err){
        res.status(400).send('ERROR in GET Specific Card')
    }
})

// Put Specific Card whos belong to Specific User:
router.put('/:id', auth, async (req,res) => {
    try{
        // Joi Validation:
        const { error } = cardSchema.validate(req.body)
        if(error) return res.status(400).send(error.details[0].message)

        let card = await Card.findOneAndUpdate({_id: req.params.id, user_id: req.payload._id}, req.body, {new: true})
        if(!card) return res.status(400).send('Card was not found')
        res.status(200).send(card)
    } catch(err){
        res.status(400).send('ERROR in PUT Specific Card')
    }
})

// Delete Specific Card whos belong to Specific User:
router.delete('/:id', auth, async (req,res) => {
    try{
        let card = await Card.findOneAndRemove({_id: req.params.id, user_id: req.payload._id})
        if(!card) return res.status(400).send('Card was not found')
        res.status(200).send(`Card number ${req.params.id} was Deleted from DataBase`)
    } catch(err){
        res.status(400).send('ERROR in DELETE Specific Card')
    }
})

// Get ALL Cards in DataBase:
router.get('/', auth, async (req,res) => {
    try{
        let allCards = await Card.find()
        if(allCards.length==0) return res.status(400).send('There are no Cards here')
        res.status(200).send(allCards)
    } catch(err){
        res.status(400).send('ERROR in GET All Cards')
    }
})

module.exports = router;