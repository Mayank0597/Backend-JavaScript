import mongoose, {Schema}  from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
  username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
  },
  fullName:{
    type:String,
    required:true,  
    trim:true,
    index:true,
  },
  avatar:{
    type:String, // cloudinary url
    required:true,
  },
  coverImage:{
    type:String,
  },
  watchHistory:[
    {
      type:Schema.Types.ObjectId,
      ref:"Video",
    }
  ],
  password:{
    type:String,
    required:[true,'Password is required']
  },
  refreshToken:{
    type:String
  },
},{timestamps:true})

userSchema.pre("save", async function (next) {
  if(!this.isModified("password")){
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  console.log("Plain password:", password);
  console.log("Hashed password from DB:", this.password);

  
  return await bcrypt.compare(password, this.password)
}

// console.log("userSchema.methods.isPasswordCorrect",userSchema.methods.isPasswordCorrect);


userSchema.methods.generateAccessToken = function(){
  
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
  // console.log("ACCESS_TOKEN_SECRET",process.env.ACCESS_TOKEN_SECRET);
  // console.log("ACCESS_TOKEN_EXPIRY",process.env.ACCESS_TOKEN_EXPIRY);
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
  // console.log("REFRESH_TOKEN_SECRET",process.env.REFRESH_TOKEN_SECRET);
  // console.log("REFRESH_TOKEN_EXPIRY",process.env.REFRESH_TOKEN_EXPIRY);
}

export const User = mongoose.model("User",userSchema)