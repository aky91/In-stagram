const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const requireLogin = require('../middleware/requireLogin')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {SENDGRID_API, EMAIL} = require('../config/keys')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:SENDGRID_API
    }
}))

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

                //send welcome email to the user
                transporter.sendMail({
                    to:user.email,
                    from:"dread.rainmaker@gmail.com",
                    subject:"Signup Success",
                    html:"<h1>Welcome to Instagram</h1>"
                })

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

router.post('/reset-password', (req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"User with that email does not exist"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then(result=>{
                transporter.sendMail({
                    to:user.email,
                    from:"dread.rainmaker@gmail.com",
                    subject:"Password Reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>Chick on this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
                    `
                })
                res.json({message:"Please check your email"})
            })
        })
    })
})

router.post('/new-password', (req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedPassword=>{
            user.password = hashedPassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then((saveduser)=>{
                res.json({message:"Password Updated Successfully"})
            })
        }).catch(err=>{
            console.log(err)
        })
    })
})

module.exports = router