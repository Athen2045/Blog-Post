/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Allan Mathew John Student ID: 159852219 Date: 2-2-2023
*
*  Online (Cyclic) Link: https://breakable-hem-ray.cyclic.app
*
********************************************************************************/ 

const blogService = require('./blog-service');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
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
  blogService.getAllPosts()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({message: err});
    });
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

