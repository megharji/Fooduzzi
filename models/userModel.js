const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");


const userModel = new mongoose.Schema({
    image:{
        type: String,
        default: "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE="
     },
    username: {
        type: String,
        unique : true,
        required: [true, "Username is required!"],
        minLength: [4, "Username field must have atleast 4 characters"]
    },
    email: {
        type: String,
        lowercase: true,
        required: [true, "Email is required!"],
        match : [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ , 'Please fill a valid email address'
        ]
    },
    password: {
        type: String,
        
        //required: [true, "Password is required!"],
        //minLength: [4, "Password field must have atleast 4 characters"],
        //maxlength : [15, "Password field must have atmost 15 characters"]
        
    },

    resetPasswordOtp: {
        type: Number,
        default: -1,
    },

    token: {
        type: Number,
        default: -1,
    },

    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipe" }], 

    },
    { timestamps: true }


);
userModel.plugin(plm)


module.exports = mongoose.model("user", userModel) // in database data will be stored in the name of user