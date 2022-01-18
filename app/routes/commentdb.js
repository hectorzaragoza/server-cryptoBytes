const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const mongoose = require('mongoose')
const crypto = require('crypto')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')
const bcryptSaltRounds = 10

// pull in error types and the logic to handle them and set status codes
const errors = require('../../lib/custom_errors')

const BadParamsError = errors.BadParamsError
const BadCredentialsError = errors.BadCredentialsError

const Saved = require('../models/savedCoin')
const commentSchema = require('../models/comment')
const { ObjectId } = require('mongodb')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// instantiate a router (mini app that only handles routes)
const router = express.Router()

// POST (create) route to add a comment to a followed coin
router.post('/dashboard/comment/:coinName', requireToken, (req, res, next) => {
    req.body.matchedCoin.owner = req.body.user._id
    Saved.findById(req.body.matchedCoin[0]._id)
    .then(coin => {
        coin.comments.push({ content: req.body.content })
        return coin.save()
    })
    .then(
        coin => {
            console.log('Second .then: ', coin)
            res.status(201).json({ coin: coin.toObject() })
        }
    )
    .catch(next)
})

// DELETE Route for Comments
router.delete('/dashboard/comment/:id', (req, res, next) => {
    console.log("Deleting comment from database")
    console.log("ID of comment", req.params.id)
    console.log("This is the matchedCoin id :", req.body.matchedCoin[0]._id)
    Saved.updateOne({
        "_id": ObjectId(req.body.matchedCoin[0]._id)
    },
    {
        "$pull": {
            "comments": {
                "_id": ObjectId(req.params.id)
            }
        }
    })
    .then(deletedComment => {
        res.json({ message: 'This is the deleted comment ', deletedComment})
    })
    .catch(err => {
        console.log('Failed to delete: ', err)
    })
})

// UPDATE Route for comments
router.patch('/dashboard/comment/:id', (req, res, next) => {
    console.log('This is the req.body from the PUT route: ', req)
	Saved.findOneAndUpdate({ "_id": req.body.matchedCoin[0]._id,
        "comments._id": req.params.id}, {
            "$set" : {
                "comments.$" : { content: req.body.editedContent }
            }
        })
		// .then(handle404)
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router

