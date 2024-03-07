const mongoose = require("mongoose");

const recipeModel = new mongoose.Schema(
    {
        image:{
            type: String,
            default: "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE="
        },
        title: String,
        ingredients: String,
        steps: String,
        categories: {
            type: String,
            enum: ["Veg", "Non-Veg", "Desserts", "Drinks"]
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    { timestamps: true }  //This provides the date time of the post when it is posted By the user
);

module.exports = mongoose.model("recipe", recipeModel);