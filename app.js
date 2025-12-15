require('dotenv').config();

const path = require('path');
const express = require('express');
const userRoute = require('./routes/user');
const blogRoute = require('./routes/bolg');
const profileRoute = require('./routes/profile')
const Blog = require('./models/blog');
const mongoose = require('mongoose');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const cookieParser = require('cookie-parser')

app = express();
PORT = process.env.PORT;

mongoose
.connect(process.env.MONGO_URL)
.then(e => console.log('Database Connected Sucessflully'))
.catch(err => onsole.log('Database failed to Connect'));


app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.resolve('./public')));

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.get('/', async (req, res)=>{
    const allBlogs = await Blog.find({});
    return res.render('home', {
        user:req.user,
        blogs: allBlogs,
    });
})

app.use('/user', userRoute);

app.use('/blog', blogRoute);

app.use('profile', profileRoute);

app.listen(PORT, ()=> console.log(`Server started at port ${PORT}` ));