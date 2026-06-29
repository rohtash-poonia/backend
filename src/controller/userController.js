 const Users = require("../model/userModels");

 const GetUsers =async (req,res)=>{
 const getUsers = await Users.find()
 res.send({message:"get all users", getUsers})

 }

 const PostUsers = async (req,res)=>{
 const postUsers = await Users.create(req.body)
 res.send("new user createdsucessfully", postUsers);
     
}

module.exports = { GetUsers, PostUsers };