const fs = require('fs');
var posts = [];
var categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
      fs.readFile('./data/posts.json', (err, data) => {
        if (err) {
          reject("unable to read file");
        } else {
          posts = JSON.parse(data);
          fs.readFile('./data/categories.json', (err, data) => {
            if (err) {
              reject("unable to read file");
            } else {
              categories = JSON.parse(data);
              resolve();
            }
          });
        }
      });
    });
  }
  

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/posts.json',(err, data) => {
      if (err) {
        reject(err);
      }
      const posts = JSON.parse(data);
      const publishedPosts = posts.filter(post => post.isPublished);
      resolve(publishedPosts);
    });
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/posts.json', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/categories.json',(err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
}

module.exports = {
    initialize,
  getPublishedPosts,
  getAllPosts,
  getCategories
};
