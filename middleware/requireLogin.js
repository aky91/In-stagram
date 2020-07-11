const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const mongoose = require('mongoose')
const User = mongoose.model("User")

// returns a function that checks if a user is signed in
module.exports = (req,res,next)=>{

    //get authorization from header
    const {authorization} = req.headers

    if(!authorization){
        res.status(401).json({error:"You must be logged in 1"})
    }

    //Authorization value starts with "Bearer ", removing that
    const token = authorization.replace("Bearer ","")

    // id + secret = token
    // get id from token and secret
    jwt.verify(token, JWT_SECRET, (err,payload)=>{
        if(err){
            return res.status(401).json({error:"You must be logged in 2"})
        }

        const _id = payload

        //if user with this id exists, 
        //set current user(user requesting) = user corresponding to id
        User.findById(_id).then(userdata=>{
            req.user = userdata
            //continue with next function
            next()
        })
    })
}