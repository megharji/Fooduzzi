var express = require('express');   //route ke liye hota hain
var router = express.Router();       
var upload = require("../utils/multer").single("avatar");
const User = require("../models/userModel");
const Recipe  = require("../models/recipeModel");
const nodemailer = require("nodemailer");
const passport = require("passport");
const LocalStrategy = require("passport-local");      //kud ka method lagaya hai
passport.use(new LocalStrategy(User.authenticate()));    //login ka fasality 
const { sendmail } = require("../utils/sendmail");



/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
  // Fetch all recipes from the database
  const allRecipes = await Recipe.find().populate('user', 'username');  // Assuming 'user' is the field referencing the user who created the recipe

  res.render('index', { recipes: allRecipes, admin: req.user, file: req.file });
} catch (error) {
  console.error(error);
 
}
  
});


router.get('/showrecipe/:id', async function(req, res, next) {
  const user1 = await Recipe.findById(req.params.id).populate("user") 
  res.render("showrecipe", {user1, admin: req.user, file: req.file})
});



router.get('/about', function(req, res, next) {            
  res.render('about', { admin: req.user });
});

router.get('/login', function(req, res, next) {  

  res.render('login', { admin: req.user });
});

router.post("/login", passport.authenticate("local", {               
      successRedirect: "/",
      failureRedirect: "/login",
      failureMessage: true,
      
  }),
  function (req, res, next) {}
);

router.get('/register', function(req, res, next) {                            //SIGN UP 
  res.render('register', { admin: req.user });
});

router.post('/register', async function(req, res, next) {               //SIGN UP 
  try {
        await User.register({
          username: req.body.username, email:req.body.email},
          req.body.password
        );
        res.redirect("/login")
  } catch (error) {
    console.log(error);
    res.send(error)
  }                        
});

router.get('/image', function(req, res, next) {            
  res.render('image', { admin: req.user });
});

router.post("/upload", function (req, res, next) {
  upload(req, res, async function (err) {
      if (err) throw err;
      const currentUser = await User.findOne({
        _id:req.user._id
      })

      currentUser.image = req.file.filename

      await currentUser.save()
      res.redirect("/")
      
  });
});

router.get('/createimage', function(req, res, next) {            
  res.render('createimage', { admin: req.user });
});

router.post("/createupload", function (req, res, next) {
  upload(req, res, async function (err) {
    req.flash("createimage", req.file.filename)


    res.redirect("/createrecipe")

  });
});


router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    const { recipes } = await req.user.populate("recipes");     // Populate is written so that the full Details of the user Is received in post who is logged in
    console.log(req.user, recipes);
    res.render("profile", { admin: req.user, recipes, file: req.file, });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.get("/signout", isLoggedIn, function (req, res, next) {
  req.logout(() => {
      res.redirect("/");
  });
});

router.get('/delete/:id', isLoggedIn,async function(req, res){
  try { 
    const recipeIndex = await req.user.recipes.findIndex((rec)=>rec._id.toString() === req.params.id);  // await req.user.recipes.findIndex((rec) => rec._id.toString() === req.params.id); This line finds the index of a recipe within the recipes array of the logged-in user (req.user). It iterates through each recipe in the array and compares the string representation of its _id property with the _id parameter received in the request (req.params.id). It uses findIndex to find the index of the recipe that matches the given ID.The found index is stored in the variable recipeIndex.
    req.user.recipes.splice(recipeIndex, 1);
    await req.user.save();

    await Recipe.findByIdAndDelete(req.params.id);
    res.redirect('/profile')
  } catch (error) {
    console.log(error);
    res.send(err)

  }
})

router.get('/update/:id',isLoggedIn, async function(req, res, next) {
  try{
   const user = await Recipe.findById(req.params.id)  // data le rha 
   res.render("update",{user, admin: req.user})
}
  catch(err){
    res.send(err)
  }
});

router.post('/update/:id',isLoggedIn,  async function(req, res, next) {
  try{
  await Recipe.findByIdAndUpdate(req.params.id,req.body) //   Expense mai se data nikal rhe hai findById(req.params.id) req.params.id se id mil gya and findById se id find kiya aur  AndUpdate(req.body) isse req.body se form ka data mila usko And Update se update kr diya
   res.redirect("/profile")
}
  catch(err){
    res.send(err)
  }
});

router.get('/forget', function(req, res, next) {
  res.render('forget', { admin: req.user });
});

router.post("/send-mail", async function (req, res, next) {
  try {
      const user = await User.findOne({ email: req.body.email });
      if (!user)
          return res.send("User Not Found! <a href='/forget'>Try Again</a>");

      sendmail(user.email, user, res, req);
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.post("/forget/:id", async function (req, res, next) {
  try {
      const user = await User.findById(req.params.id);
      if (!user)
          return res.send("User not found! <a href='/forget'>Try Again</a>.");

      if (user.token == req.body.token) {
          user.token = -1;
          await user.setPassword(req.body.newpassword);
          await user.save();
          res.redirect("/login");
      } else {
          user.token = -1;
          await user.save();
          res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
      }
  } catch (error) {
      res.send(error);
      console.log(error);
  }
});

router.get("/reset", isLoggedIn, async function (req, res, next) {
  res.render("reset", { admin: req.user });
});

router.post("/reset", isLoggedIn, async function (req, res, next) {
  try {
      await req.user.changePassword(
          req.body.oldpassword,
          req.body.newpassword
      );
      await req.user.save();
      res.redirect("/profile");
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.get("/createrecipe", isLoggedIn, function (req, res, next) {
  res.render("createrecipe", { admin: req.user });
});

router.post("/createrecipe", isLoggedIn, async function (req, res, next) {
  try {
      const recipe = new Recipe(req.body);  // form ka data save kr rhe hai
      const filename = req.flash("createimage")
      if(filename.length > 0 ){
      recipe.image =  filename[0] 
      console.log(filename);
    }
      req.user.recipes.push(recipe._id);    //user ko bata rhe hai konsa data create kiya hai expnse ka 
      recipe.user = req.user._id;     
      await recipe.save();
      await req.user.save();
      res.redirect("/profile");
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});


router.get("/profilefilter", isLoggedIn, async function (req, res, next) {
  try {
      let { recipes } = await req.user.populate("recipes");
      recipes = recipes.filter((e) => {if(e[req.query.key].toLowerCase().includes(req.query.value.toLowerCase())){
        return e;
      }});
      res.render("profile", { admin: req.user, recipes });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.get("/homefilter", async function (req, res, next) {
  try {
      let recipes = await Recipe.find();
      recipes = recipes.filter((e) => {if(e[req.query.key].toLowerCase().includes(req.query.value.toLowerCase())){
        return e;
      }});
      res.render("index", { admin: req.user, recipes });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {                 
      next();    
  } else {
      res.redirect("/login");
  }
}



module.exports = router;
