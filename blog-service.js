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

module.exports = {
    initialize,
  getPublishedPosts,
  getAllPosts,
  getCategories
};
