/*********************************************************************************
WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Allan Mathew John Student ID: 159852219 Date: 24-3-2023
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

app.use(express.urlencoded({extended: true}));

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
  },
  formatDate: function(dateObj){
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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
        if (data.length > 0) {
          res.render("posts", {posts: data});
        } else {
          res.render("posts", {message: "no results"});
        }
      })
      .catch(err => {
        res.render("posts", {message: "error fetching posts"});
      });
  } else if (req.query.minDate) {
    const minDateStr = req.query.minDate;
    blogService.getPostsByMinDate(minDateStr)
      .then(data => {
        if (data.length > 0) {
          res.render("posts", {posts: data});
        } else {
          res.render("posts", {message: "no results"});
        }
      })
      .catch(err => {
        res.render("posts", {message: "error fetching posts"});
      });
  } else {
    blogService.getAllPosts()
      .then(data => {
        if (data.length > 0) {
          res.render("posts", {posts: data});
        } else {
          res.render("posts", {message: "no results"});
        }
      })
      .catch(err => {
        res.render("posts", {message: "error fetching posts"});
      });
  }
});

app.get('/categories', (req, res) => {
  blogService.getCategories()
    .then(data => {
      if (data.length > 0) {
        res.render("categories", {categories: data});
      } else {
        res.render("categories", {message: "no results"});
      }
    })
    .catch(err => {
      res.render("categories", {message: "error"});
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

app.get('/categories/add', (req, res) => {
  res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
  const { name, description } = req.body;
  blogService.addCategory(name, description)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred while adding the category');
    });
});

app.get('/categories/delete/:id', (req, res) => {
  const id = req.params.id;
  blogService.deleteCategoryById(id)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      res.status(500).send('Unable to Remove Category / Category not found');
    });
});


app.get('/posts/add', (req, res) => {
  blogService.getCategories()
    .then(data => {
      res.render('addPost', {categories: data});
    })
    .catch(error => {
      console.error(error);
      res.render('addPost', {categories: []});
    });
});

app.get('/posts/delete/:id', (req, res) => {
  const postId = req.params.id;

  blogService.deletePostById(postId)
    .then(() => {
      res.redirect('/posts');
    })
    .catch(() => {
      res.status(500).send('Unable to Remove Post / Post not found');
    });
});

app.get('/posts/delete/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    await blogService.deletePostById(postId);
    res.redirect('/posts');
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to Remove Post / Post not found');
  }
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

