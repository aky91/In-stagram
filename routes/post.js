const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Post = mongoose.model("Post")
const requireLogin = require('../middleware/requireLogin')


router.get('/allpost', requireLogin, (req,res)=>{
    Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/getsubpost', requireLogin, (req,res)=>{
    
    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy", "_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body,pic} = req.body

    if(!title || !body || !pic){
        res.status(422).json({error:"Please add all the fields"})
    }

    //this is done to hide the password
    req.user.password = undefined

    //create a new Post object
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })

    //save the post
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/mypost', requireLogin, (req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("PostedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
})

router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
})

router.put('/comment',requireLogin,(req,res)=>{
    
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
})

router.delete('/deletepost/:postId',requireLogin,(req,res)=>{

    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(result)
            }).catch(err=>{
                console.log(err)
            })
        }
    })
})

router.delete('/deletecomment/:postId/:commentId',requireLogin,(req,res)=>{
    
    Post.findOne({_id:req.params.postId})
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        
        const updatedComments = post.comments.filter(function(el) { return el._id != req.params.commentId; })

        const query = { "_id": req.params.postId }
        const update = { "$set": {"comments": updatedComments}}
        const options = { new: true }

        Post.findOneAndUpdate(query, update, options)
        .populate("comments.postedBy","_id name")
        .populate("postedBy","_id name")
        .then(updatedDocument => {
            if(updatedDocument) {
                //console.log(`Successfully updated document: ${updatedDocument}.`)
                res.json(updatedDocument)
            } else {
              console.log("No document matches the provided query.")
            }
          })
          .catch(err => console.error(`Failed to find and update document: ${err}`))
    })
})

module.exports = router