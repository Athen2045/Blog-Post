//blog-service.js
const fs = require('fs');
var posts = [];
var categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json',  (err, data) => {
            if (err) {
                return reject(err);
            } 
            posts = JSON.parse(data);
            

                fs.readFile('./data/categories.json',  (err, data) => {
                    if (err) {
                       return reject(err);
                    }
                    categories = JSON.parse(data);
                    resolve();
                });
            
        });
    });
  }
  

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        var published = posts.filter(post => post.published === true)
        if(published.length == 0){
           reject("no results returned");
        }
        else{
           resolve(published);
        }
       })
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        if (posts.length == 0){
            reject("no results returned");
        }
        else{
            resolve(posts);
        }
    })
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length == 0){
            reject("no results returned");
        }
        else{
            resolve(categories);
        }
    })
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    if (!postData.published) {
      postData.published = false;
    } else {
      postData.published = true;
    }
    postData.id = posts.length + 1;
    postData.postDate = new Date().toISOString().substr(0, 10); // Add this line to set the postDate to the current date in the format YYYY-MM-DD
    posts.push(postData);
    resolve(postData);
  });
}

  function getPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter(post => post.category === category);
        if (filteredPosts.length === 0) {
          reject("No results returned");
        } else {
          resolve(filteredPosts);
        }
      });
  }
  
  function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
        if (filteredPosts.length === 0) {
          reject("No results returned");
        } else {
          resolve(filteredPosts);
        }
      });
  }
  
  function getPostById(id) {
    return new Promise((resolve, reject) => {
      const foundPost = posts.find(post => post.id === id);
      if (!foundPost) {
        reject("No result returned");
      } else {
        resolve(foundPost);
      }
    });
  }

  function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
      const publishedAndFilteredPosts = posts.filter(
        (post) => post.published === true && post.category === category
      );
      if (publishedAndFilteredPosts.length === 0) {
        reject("no results returned");
      } else {
        resolve(publishedAndFilteredPosts);
      }
    });
  }
  

module.exports = {
    initialize,
  getPublishedPosts,
  getAllPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory
};
