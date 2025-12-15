const {Router} = require('express');
const User = require('../models/user');

const router = Router();

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