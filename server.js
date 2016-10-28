const PORT = 3000;

// Import modules
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var exec = require("child_process").exec;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

var port = process.env.PORT || PORT;
var db;

// Connect to mongodb
mongodb.MongoClient.connect(require("./config/db").url, function (err, database) {
    // Output to console if there's an error
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = database;     
    console.log("Establised connection to database");

    // Start listening on port
    var server = app.listen(port, function () {
        console.log("Server running on port", port);
    });

    // Import routes module
    require("./app/routes")(app, db); 
});
