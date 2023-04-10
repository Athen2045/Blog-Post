const bcrypt = require('bcryptjs');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
let userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://allanmj2045:G8RrJr3UE3r8BuP@senecaweb.tdqursh.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function(userData){
    return new Promise(function(resolve, reject){
        // Check if the passwords match
        if (userData.password !== userData.password2) {
            reject('Passwords do not match');
            return;
        }
        
        // Hash the password
        bcrypt.hash(userData.password, 10)
        .then(hash => {
            // Replace the user entered password with its hashed version
            userData.password = hash;

            // Save userData to the database
            const newUser = new User(userData);
            newUser.save()
            .then(() => {
                resolve();
            })
            .catch(err => {
                if (err.code === 11000) {
                    reject('User Name already taken');
                } else {
                    reject(`There was an error creating the user: ${err}`);
                }
            });
        })
        .catch(err => {
            reject('There was an error encrypting the password');
        });
    });
};


module.exports.checkUser = function(userData){
    return new Promise((resolve, reject) => {
      // Find the user in the database by their userName
      User.find({ userName: userData.userName }).then((users) => {
        if (users.length === 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          const user = users[0];
          // Compare the hashed password with the password entered by the user
          bcrypt.compare(userData.password, user.password).then((result) => {
            if (result === true) {
              // Update the user's login history
              const loginEntry = {
                dateTime: (new Date()).toString(),
                userAgent: userData.userAgent
              };
              user.loginHistory.push(loginEntry);
              User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } }).then(() => {
                resolve(user);
              }).catch((err) => {
                reject(`There was an error verifying the user: ${err}`);
              });
            } else {
              reject(`Incorrect Password for user: ${userData.userName}`);
            }
          }).catch((err) => {
            reject(err);
          });
        }
      }).catch((err) => {
        reject(`Unable to find user: ${userData.userName}`);
      });
    });
  };
  