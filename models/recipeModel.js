const mongoose = require("mongoose");

const recipeModel = new mongoose.Schema(
    {
        image: String,
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