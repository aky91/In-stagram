const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middleware/requireLogin')

router.post('/signup',(req,res)=>{
    const {name,email,password,pic} = req.body
    if(!name || !email || !password){
        res.status(422).json({error:"Some fields are empty"})
    }
    
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"User with this email already exist"})
        }

        bcrypt.hash(password,12)
        .then(hashedPassword=>{
            const user = new User({
                email,
                password:hashedPassword,
                name,
                pic
            })
    
            user.save()
            .then(user=>{
                res.json({message:"Saved Successfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        })
        .catch(err=>{
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })


})

router.post('/signin', (req,res)=>{
    //restructure
    const {email,password} = req.body

    if(!email || !password){
        res.status(422).json({error:"Missing Username or Password"})
    }

    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            res.status(422).json({error:"Invalid Email or Password"})
        }

        bcrypt.compare(password,savedUser.password)
        .then(matched=>{
            if(matched){
                //res.json({message:"Successfully signed in"})
                const token = jwt.sign({_id:savedUser._id}, JWT_SECRET)
                const {id,name,email,followers,following,pic} = savedUser
                res.json({token, user:{id,name,email,followers,following,pic}})
            }
            else{
                return res.status(422).json({error:"Invalid Email or Password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})

module.exports = router