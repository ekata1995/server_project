const express=require("express");
const Joi = require('joi');
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');
const db=require('../db/connection');
var ObjectId = require('mongodb').ObjectID;
const users=db.get('users');
const admin=db.get('admin');
const userdb=db.get('userdb');
// users.index('username');
users.createIndex('username',{unique:true});
const router=express.Router();
const cors = require('cors')
const app = express();
app.use(cors())
console.log("Hello1")
const schema_1 = Joi.object({
  title: Joi.string()
      .min(3)
      .max(30)
      .required(),
  category: Joi.string()
      .min(3)
      .max(30)
      .required(),
  content: Joi.string()
      .min(3)
      .max(100)
      .required(),
  image: Joi.string()
      .required(),        
});
// const Post=require("../models/posts");
const fs=require('fs');
const schema = Joi.object({
  username: Joi.string()
      .regex(/(^[a-zA-Z0-9_]+$)/)
      .min(3)
      .max(30)
      .required(),

  password: Joi.string().trim().
      min(10).required(),
});

function createTokenSendResponse(user, res, next) {
const payload = {
  _id: user._id,
  username: user.username
};
console.log("createTokenSendResponse")

jwt.sign(payload, process.env.TOKEN_SECRET, {
  expiresIn: '1d'
}, (err, token) => {
  if (err) {
    console.log(err)
    respondError422(res, next);
  } else {
    res.json({
      token
    });
  }
});
}

function respondError422(res, next) {
res.status(422);
const error = new Error('Unable to login.');
next(error);
}

//any router in here is pre-pended with /auth/
router.get('/',(req,res)=>{
  res.json({
      message:'lock '
  });
});
//post/auth/signup
router.post('/signup',(req,res,next)=>{
  //console.log('body',req.body);
  const result=schema.validate(req.body);
  //console.log(result.error);
  //if(result.error===null){
  if(result.error===undefined){
      console.log("hello_1");
  //if user is undefined, username is not in the db,otherwise dublicate user detected
  users.findOne({
      username:req.body.username
  }).then(user =>{
   if(user){
     
       const error=new Error('That username is not OG.Please choose another username');
       next(error);
   }else{
    
      bcrypt.hash(req.body.password.trim(),12).then(hashedPassword =>{
         const newUser={
             username:req.body.username,
             password:hashedPassword
         };
       
         users.insert(newUser).then(insertedUser=>{
             delete insertedUser.password;
             res.json(insertedUser);
         });
     
      });
   }
  });
  }else{
  console.log("hello");
  next(result.error);
}
});


router.post('/login', (req, res, next) => {
  const result = schema.validate(req.body);
  console.log("hello2")
  if (result.error === undefined) {
  
    users.findOne({
      username: req.body.username,
    }).then(user => {
      if (user) {        
        console.log("hello3")
        bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            if (result) {
              console.log("hello4")
              createTokenSendResponse(user, res, next);
            } else {
              respondError422(res, next);
            }
          });
      } else {
        respondError422(res, next);
      }
    });
  } else {
    respondError422(res, next);
  }
});
class API{
    //FETCH ALL JOB POST
    static async fetchAllPost(req,res){
       try{
           admin.find({}).then(user =>{
             console.log(user)
             res.status(200).json(user)});
           
           
       }catch(err){
           res.status(404).json({message:err.message});
       }
      }
      
    static async fetchPostByTitle(req,res){
        //const id=req.params.id;
        var titles = req.body.title
       try {
        admin.find({title:titles}).then(user =>{
          console.log(user)
          res.status(200).json(user)});

       } catch (err) {
        res.status(404).json({message:err.message});
       }
    }
     //Create a Job category
     static async createPost(req,res){
        try{
            //await Post.create(post);
            const result=schema_1.validate(req.body);
            if(result.error===undefined){
              console.log("hello_5");
              const newPost={
                title:req.body.title,
                category:req.body.category,
                content:req.body.content,
                image:req.body.image
            };
          
            admin.insert(newPost).then(insertedPost=>{
                res.json(insertedPost);
            });
            res.status(201).json({message:'Post created Successfully!'});
        }
      }
      catch(err){
            res.status(400).json({message:err.message});
        }
    }
     
      //Delete post
    static async deletePost(req,res){
        const id=req.params.id;
        try{
            admin.findByIdAndDelete(id);
            
            res.status(200).json({message:'Post deleted successfully'});
        }catch(err){
          res.status(404).json({message:err.message});
        }
    } 
};
//user signup page
const userschema = Joi.object({
  username: Joi.string()
      .regex(/(^[a-zA-Z0-9_]+$)/)
      .min(3)
      .max(30)
      .required(),

  password: Joi.string().trim().
      min(10).required(),
});
router.post('/usersignup',(req,res,next)=>{
  //console.log('body',req.body);
  const result=userschema.validate(req.body);
  //console.log(result.error);
  //if(result.error===null){
  if(result.error===undefined){
      console.log("hello_1");
  //if user is undefined, username is not in the db,otherwise dublicate user detected
  userdb.findOne({
      username:req.body.username
  }).then(user =>{
   if(user){
     
       const error=new Error('That username is not OG.Please choose another username');
       next(error);
   }else{
    
      bcrypt.hash(req.body.password.trim(),12).then(hashedPassword =>{
         const newUser={
             username:req.body.username,
             password:hashedPassword
         };
       
         userdb.insert(newUser).then(insertedUser=>{
             delete insertedUser.password;
             res.json(insertedUser);
         });
     
      });
   }
  });
  }else{
  console.log("hello");
  next(result.error);
}
});

//user login
router.post('/userlogin', (req, res, next) => {
  const result = userschema.validate(req.body);
  console.log("hello2")
  if (result.error === undefined) {
  
    userdb.findOne({
      username: req.body.username,
    }).then(user => {
      if (user) {        
        console.log("hello3")
        bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            if (result) {
              console.log("hello4")
              createTokenSendResponse(user, res, next);
            } else {
              respondError422(res, next);
            }
          });
      } else {
        respondError422(res, next);
      }
    });
  } else {
    respondError422(res, next);
  }
});
router.get("/fetchpost",API.fetchAllPost);
router.get("/title",API.fetchPostByTitle);
router.post("/createpost", API.createPost);
//router.patch("/:id",upload,API.updatePost);
router.delete("/:id",API.deletePost);
module.exports=router;