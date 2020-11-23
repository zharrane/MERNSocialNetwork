const mongoose = require("mongoose");
const config = require("config");
const database = config.get("mongoURI");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("MongoDb Connected!");
  } catch (error) {
    console.error(error.message);
    //Exiting proccess with failure
    process.exit(1);
  }
};

module.exports = connectToDatabase;
