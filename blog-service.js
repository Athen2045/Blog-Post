//blog-service.js
const Sequelize = require('sequelize');

var sequelize = new Sequelize('babar.db.elephantsql.com', 'zommepob', 'xm7wMqgdN6v1FFrTI74z-V5jEaRqslmN', {
  host: 'babar.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

const Post = sequelize.define('post', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN
});

const Category = sequelize.define('category', {
  category: Sequelize.STRING
});

// Defining the relationship between Post & Category
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        console.log('Database sync successfully');
        resolve();
      })
      .catch(err => {
        console.error('Unable to sync the database:', err);
        reject("unable to sync the database");
      });
  });
}

function getPublishedPosts() {
  return Post.findAll({ where: { published: true } })
    .then(posts => {
      return Promise.resolve(posts);
    })
    .catch(error => {
      return Promise.reject("no results returned");
    });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then(posts => {
        resolve(posts);
      })
      .catch(error => {
        reject("no results returned");
      });
  });
}

function getCategories() {
  return Category.findAll()
    .then(categories => {
      return Promise.resolve(categories);
    })
    .catch(error => {
      return Promise.reject("no results returned");
    });
}

function addPost(postData) {
  postData.published = (postData.published) ? true : false;
  for (let key in postData) {
    if (postData[key] === "") {
      postData[key] = null;
    }
  }
  postData.postDate = new Date();
  return Post.create(postData)
    .then(() => {
      return Promise.resolve();
    })
    .catch(err => {
      console.error("Unable to create post:", err);
      return Promise.reject("unable to create post");
    });
}

function addCategory(categoryData) {
  for (let key in categoryData) {
    if (categoryData[key] === "") {
      categoryData[key] = null;
    }
  }
  return Category.create(categoryData)
    .then(() => {
      return Promise.resolve();
    })
    .catch(err => {
      console.error("Unable to create category:", err);
      return Promise.reject("unable to create category");
    });
}


function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { category } })
      .then(posts => {
        if (posts.length === 0) {
          reject("no results returned");
        } else {
          resolve(posts);
        }
      })
      .catch(err => reject(err));
  });
}

function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [Op.gte]: new Date(minDateStr)
        }
      }
    }).then(posts => {
      resolve(posts);
    }).catch(err => {
      reject("no results returned");
    });
  });
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: id
      }
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("No results returned");
        }
      })
      .catch((err) => {
        reject("Error retrieving data: " + err);
      });
  });
}


function getPublishedPostsByCategory(category) {
  return Post.findAll({
    where: { published: true, category: category }
  })
  .then(posts => {
    return Promise.resolve(posts);
  })
  .catch(error => {
    return Promise.reject("no results returned");
  });
}

function deleteCategoryById(id) {
  return Category.destroy({
      where: {
        id: id
      }
    })
    .then((deletedRows) => {
      if (deletedRows > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject("Category not found");
      }
    })
    .catch((err) => {
      console.error("Unable to delete category:", err);
      return Promise.reject("Unable to delete category");
    });
}

function deletePostById(id) {
  return Post.destroy({
    where: {
      id: id
    }
  })
  .then(result => {
    if (result === 1) {
      return Promise.resolve();
    } else {
      return Promise.reject("No post was deleted");
    }
  })
  .catch(err => {
    console.error("Unable to delete post:", err);
    return Promise.reject("Unable to delete post");
  });
}

async function deletePostById(id) {
  try {
    const result = await Post.destroy({ where: { id } });
    if (result === 1) {
      // Post was deleted successfully
      return Promise.resolve();
    } else {
      // Post was not found
      return Promise.reject(`Post with ID ${id} not found.`);
    }
  } catch (error) {
    // An error occurred while trying to delete the Post
    return Promise.reject(error);
  }
}

module.exports = {
  initialize,
  getPublishedPosts,
  getAllPosts,
  getCategories,
  addPost,
  addCategory,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
  deleteCategoryById,
  deletePostById
};

