const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/iNotebook-Development";

const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("connected to databse💾");
  });
};

module.exports = connectToMongo;
