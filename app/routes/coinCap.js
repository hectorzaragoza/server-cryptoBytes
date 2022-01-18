require('dotenv').config()
const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const axios = require('axios')

const passport = require('passport')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()
var config = {
    method: 'GET',
    url: 'http://api.coincap.io/v2/assets',
    headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`
    } 
}

router.get('/', (req, res, next) => {
    console.log("ProccessENV", process.env.API_KEY)
    axios(config)
        .then(function(response) {
            //console.log('Response data:\n', JSON.stringify(response.data))
            console.log(res.json(response.data))
        })
        .catch(function (error) {
            console.log(error);
        })
        
})

// Historical Data Route
router.get('/dashboard/:id', (req, res, next) => {
    const getHist = {
        method: 'GET',
        // endpoing for historical data: api.coincap.io/v2/assets/bitcoin/history?interval=d1
        url: `http://api.coincap.io/v2/assets/${req.params.id}/history?interval=d1`,
        headers: {
            "Authorization": `Bearer ${process.env.API_KEY}`
        }
    }

    console.log('This is the coin for hist data req: ', req.params.id)
    axios(getHist)
    .then(function(response) {
        console.log('This is the hist data response', res.json(response.data))
    })
    .catch(function(error) {
        console.log(error)
    })
})

module.exports = router