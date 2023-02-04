const blogService = require('./blog-service');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'css')));

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
  res.status(404).send("Page Not Found");
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});

app.listen(port, () => {
  console.log(`Express http server listening on port ${port}`);
});
