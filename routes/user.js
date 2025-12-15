const {Router} = require('express');
const {user} = require('../models/user');
const User = require('../models/user');

const router = Router();


router.get('/signin', (req, res)=>{
    res.render('signin');
})

router.get('/signup', (req, res)=>{
    res.render('signup');
})

router.post('/signup', async (req, res)=>{
    const {fullName, email, password} = req.body;

    try{
        await User.create({
          fullName,
          email,
          password,
        });
        return res.redirect('/');

    }catch(error){
        return res.render("signup", {
              error: "Email already registered!!"
          });
    }

});

router.post('/signin', async (req, res)=>{
    const {email, password} = req.body;

    try{
        const token = await User.matchPasswordAndGenerateToken(email, password);
        console.log("Token: ", token);
        return res.cookie("token", token).redirect('/');

    }catch(error){
        return res.render("signin", {
            error: "Invalid Email or Password"
        })
    }
})

router.get('/logout', (req, res)=>{
    res.clearCookie('token').redirect('/');
});




router.get("/profile/edit", async (req, res) => {
  if (!req.user) {
    return res.redirect("/user/signin");
  }

  const user = await User.findById(req.user._id).lean();

  return res.render("editProfile", {
    user,
  });
});

router.post("/profile/edit", async (req, res) => {
  if (!req.user) {
    return res.redirect("/user/signin");
  }

  const {
    fullName,
    currentPassword,
    newPassword,
  } = req.body;

  const user = await User.findById(req.user._id);

  /* ---- Update name (always allowed) ---- */
  user.fullName = fullName;

  /* ---- If user wants to change password ---- */
  if (newPassword) {
    const isMatch = user.verifyPassword(currentPassword);

    if (!isMatch) {
      return res.render("editProfile", {
        user,
        error: "Current password is incorrect",
      });
    }

    user.password = newPassword; // pre-save hook hashes it
  }

  await user.save();

  return res.redirect("/");
});


module.exports = router;