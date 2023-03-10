/*********************************************************************************
* *  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Allan Mathew John Student ID: 159852219 Date: 18-2-2023
*
*  Online (Cyclic) Link: https://breakable-hem-ray.cyclic.app
*
********************************************************************************/ 
//server.js
const blogService = require('./blog-service');
const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

const app = express();
const port = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs' ,
  helpers: {
  navLink: function(url, options) {
    return '<li' +
      ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
      '><a href="' + url + '">' + options.fn(this) + '</a></li>';
  },
  equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
  },
  safeHTML: function(context){
    return stripJs(context);
  }
}
}));
app.set('view engine', '.hbs');

//Middleware function
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});
// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dpmjj6lbl',
  api_key: '156344881968523',
  api_secret: 'OImPV7Odg5MCdvEG1fxkYvzRGLo',
  secure: true
});

const upload = multer(); 

app.use(express.static('public')); 

app.get('/', function(req, res) {
  res.redirect('/blog');
});


app.get('/about', function(req, res) {
  res.render('about');
});


app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

app.get('/posts', (req, res) => {
  if (req.query.category) {
    const category = parseInt(req.query.category);
    blogService.getPostsByCategory(category)
      .then(data => {
        res.render("posts", {posts: data});
      })
      .catch(err => {
        res.render("posts", {message: "no results"});
      });
  } else if (req.query.minDate) {
    const minDateStr = req.query.minDate;
    blogService.getPostsByMinDate(minDateStr)
      .then(data => {
        res.render("posts", {posts: data});
      })
      .catch(err => {
        res.render("posts", {message: "no results"});
      });
  } else {
    blogService.getAllPosts()
      .then(data => {
        res.render("posts", {posts: data});
      })
      .catch(err => {
        res.render("posts", {message: "no results"});
      });
  }
});

app.get('/categories', (req, res) => {
  blogService.getCategories()
    .then(data => {
      res.render("categories", {categories: data});
    })
    .catch(err => {
      res.render("categories", {message: "no results"});
    });
});


app.post('/posts/add', upload.single('featureImage'), (req, res) => {
  let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                  if (result) {
                      resolve(result);
                  } else {
                      reject(error);
                  }
              }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
  };

  async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
  }

  upload(req).then((uploaded) => {
      req.body.featureImage = uploaded.url;
      // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
      const { title, body } = req.body;
      const newPost = {
        title: title,
        body: body,
        featureImage: uploaded.url,
        createdAt: new Date(),
      };
      
      blogService.addPost(newPost)
        .then((post) => {
          res.redirect('/posts');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/posts/add');
        });
  }).catch((error) => {
      console.log(error);
      res.redirect('/posts/add');
  });
});

app.get('/post/add', (req, res) => {
  res.render('addPost');
});

app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogService.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

app.get('/post/:id', (req, res) => {
  const id = parseInt(req.params.id);
  blogService.getPostById(id)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({message: err});
    });
});

app.use(function(req, res, next) {
  res.status(404);
  res.render('404', {title: '404: Not Found'});
});


app.use((req, res) => {
  res.status(404).send(__dirname + "Page Not Found");
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});

blogService.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { 
      console.log('Express http server listening on port: ' + HTTP_PORT); 
  });
}).catch((err)=>{
  console.log('Error: promise cant be fulfilled');
})

