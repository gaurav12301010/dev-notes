const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const {requireAuth} = require('../middlewares/authentication');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./public/uploads/`);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.get('/add-new',requireAuth, (req, res) => {
  return res.render('addBlog', {
    user: req.user,
  })
})
router.post('/', requireAuth, upload.single("coverImageURL"), async (req, res) => {
  const { title, body } = req.body;

  const blog = await Blog.create({
    title,
    body,
    coverImageURL: `uploads/${req.file.filename}`,
    createdBy: req.user._id,
  })
  return res.redirect(`/blog/${blog._id}`);
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id}).populate("createdBy");
  // console.log(comments);

  return res.render('blog', {
    user: req.user,
    blog,
    comments,
  });

});

router.post('/comment/:blogId', async (req, res)=>{
  const comment = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`)
});

router.get('/edit/:blogId', requireAuth, async (req, res) => {
  const blog = await Blog.findOne({
    _id: req.params.blogId,
    createdBy: req.user._id,
  });

  if (!blog) {
    return res.render('home', {
      error: "Not Authorized to edit!!"
    });
  }

  return res.render('editBlog', {user: req.user, blog :blog });
});

router.post('/edit/:blogId', async (req, res) => {
  const { title, body } = req.body;

  const blog = await Blog.findOneAndUpdate(
    {
      _id: req.params.blogId,
      createdBy: req.user._id,
    },
    {
      title,
      body,
    },
    { new: true }
  );

  if (!blog) {
    return res.status(403).send('Not authorized');
  }

  return res.redirect(`/blog/${blog._id}`);
});

router.post('/delete/:blogId', async (req, res) => {
  const blog = await Blog.findOneAndDelete({
    _id: req.params.blogId,
    createdBy: req.user._id,
  });

  if (!blog) {
    return res.status(403).send('Not authorized');
  }

  return res.redirect('/');
});

module.exports = router;