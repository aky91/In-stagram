const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")
const User = mongoose.model("User")


router.get('/user/:id',requireLogin,(req,res)=>{
    User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id name")
        .exec((err,posts)=>{
            if(err){
                return res.status(422).json({error:err})
            }
            res.json({user,posts})
        })
    }).catch(err=>{
        return res.status(404).json({error:"User not found"})
    })
})

//Let UserA --follow--> UserB
//Step 1: UserB.followers.add(UserA)
//Step 2: UserA.following.add(UserB)
//Note: User A made this API call
//User A = req.user.id
//User B = req.body.followId
router.put('/follow',requireLogin,(req,res)=>{

    //Step 1
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }

        //Step 2
        User.findByIdAndUpdate(req.user._id,{
            $push:{following:req.body.followId}  
        },{new:true}).select("-password").then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
})

router.put('/unfollow',requireLogin,(req,res)=>{
    //Step 1
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }

        //Step 2
        User.findByIdAndUpdate(req.user._id,{
            $pull:{following:req.body.followId}  
        },{new:true}).select("-password").then(result=>{
            res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
    })
})

router.put('/updatepic', requireLogin, (req,res)=>{
    User.findByIdAndUpdate(req.user._id, {$set:{pic:req.body.pic}}, {new:true}, (err, result)=>{
        if(err){
            return res.status(422).json({error:"Could not find and update profile photo"})
        }
        res.json(result)
    }) 
})

router.post('/search-user',(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({email:{$regex:userPattern}})
    .select("_id email")
    .then(user=>{
        res.json({user})
    }).catch(err=>{
        console.log(err)
    })
})

module.exports = router