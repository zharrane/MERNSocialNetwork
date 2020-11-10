const user = "zaki";
const password = "zharrane";
const databaseName = "zharraneDb";

module.exports = {
  mongoURI: `mongodb://${user}:${password}@cluster0-shard-00-00.sagty.mongodb.net:27017,cluster0-shard-00-01.sagty.mongodb.net:27017,cluster0-shard-00-02.sagty.mongodb.net:27017/${databaseName}?ssl=true&replicaSet=atlas-ompoo8-shard-0&authSource=admin&retryWrites=true&w=majority`,
};
