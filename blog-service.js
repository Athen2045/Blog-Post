const Sequelize = require('sequelize');

var sequelize = new Sequelize('zommepob', 'zommepob', 'xm7wMqgdN6v1FFrTI74z-V5jEaRqslmN', {
    host: 'babar.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define a "Post" model

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

// Define a "Category" model

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// set up association between Post & Category
Post.belongsTo(Category, {foreignKey: 'category'})


module.exports.initialize = function () {
    return sequelize.sync()
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll().then(data=>{
            resolve(data);
        }).catch( err =>{
            reject("no results returned");
        });
    });
}

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        }).then( data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getPostsByMinDate = function (minDateStr) {

    const { gte } = Sequelize.Op;

    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                  }
            }
        }).then( data => {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then( data => {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        postData.published = postData.published ? true : false;

        for (var prop in postData) {
            if (postData[prop] === '')
            postData[prop] = null;
        }

        postData.postDate = new Date();

        Post.create(postData).then(() => {
            resolve();
        }).catch((e) => {
            reject("unable to create post");
        });

    });
}

module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        }).then( data => {
            resolve();
        }).catch(() => {
            reject("unable to delete post");
        });
    });
}

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then( data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then( data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll().then(data=>{
            resolve(data);
        }).catch( err =>{
            reject("no results returned")
        });
    });
}

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {

        for (var prop in categoryData) {
            if (categoryData[prop] === '')
            categoryData[prop] = null;
        }

        Category.create(categoryData).then(() => {
            resolve();
        }).catch((e) => {
            reject("unable to create category");
        });

    });
}

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then( data => {
            resolve();
        }).catch(() => {
            reject("unable to delete category");
        });
    });
}

