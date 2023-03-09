/*********************************************************************************
* *  WEB322 – Assignment 03
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

const app = express();
const port = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dpmjj6lbl',
  api_key: '156344881968523',
  api_secret: 'OImPV7Odg5MCdvEG1fxkYvzRGLo',
  secure: true
});

const upload = multer(); 

app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', function(req, res) {
  res.render('about');
});


app.get('/blog', (req, res) => {
  blogService.getPublishedPosts()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({message: err});
    });
});

app.get('/posts', (req, res) => {
  if (req.query.category) {
    const category = parseInt(req.query.category);
    blogService.getPostsByCategory(category)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({message: err});
      });
  } else if (req.query.minDate) {
    const minDateStr = req.query.minDate;
    blogService.getPostsByMinDate(minDateStr)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({message: err});
      });
  } else {
    blogService.getAllPosts()
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({message: err});
      });
  }
});

app.get('/categories', (req, res) => {
  blogService.getCategories()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({message: err});
    });
});

app.get('/post/add', (req, res) => {
  res.render('addPost');
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

