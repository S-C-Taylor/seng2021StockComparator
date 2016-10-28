var ObjectID = require("mongodb").ObjectID;
var path = require("path");

module.exports = function(app, db) {
    var coll;

    // ========== Backend server routing ========== //
    
    // Return all stocks of given time period and industry
    app.get("/stocks/:timePeriod/:industry", function(request, response) {
        // Get time period and industry parameters
        coll = request.params.timePeriod;
        var industry = request.params.industry

        console.log("%s collection and %s industry queried", coll, industry);
        
        // Check if a name was queried
        if (request.query.name) {
            // Query database by stock name
            console.log("%s query made", request.query.name);
            var query = new RegExp(request.query.name, "i");

            // Check if all category for industry was selected
            if (industry == "all") {
                // Retrieve all documents matching queried name
                db.collection(coll).find({ "name": query }).toArray(function(err, docs) {
                    if (err) {
                        // Handle error
                        handleError(response, err.message, "Failed to find stock.");
                    } else {
                        // Send response to frontend
                        response.status(200).json(docs);
                    }
                });
            } else {
                // Retrieve documents matching queried stock name and industry
                db.collection(coll).find({ "name": query, "industry": industry }).toArray(function(err, docs) {
                    if (err) {
                        handleError(response, err.message, "Failed to find stock.");
                    } else {
                        response.status(200).json(docs);
                    }
                });
            }
        } else {
            if (industry == "all") {
                // Retrieve all documents in collection
                db.collection(coll).find({}).toArray(function(err, docs) {
                    if (err) {
                        handleError(response, err.message, "Failed to get stocks.");
                    } else {
                        response.status(200).json(docs);                
                    }
                });
            } else {
                // Retrieve documents matching industry category
                db.collection(coll).find({ "industry": industry }).toArray(function(err, docs) {
                    if (err) {
                        handleError(response, err.message, "Failed to get stocks.");
                    } else {
                        response.status(200).json(docs);                
                    }
                });
            }
        }
    });
    
    // Return individual stock
    app.get("/stocks/:timePeriod/:industry/:id", function(request, response) {
        coll = request.params.timePeriod;
        var industry = request.params.industry;

        console.log("%s in %s collection queried", request.params.id, coll);

        // Return the document which has the passed document id
        if (industry == "all") {
            db.collection(coll).findOne({ _id: ObjectID(request.params.id ) }, function(err, doc) {
                if (err) {                    
                    handleError(response, err.message, "Failed to get stock.");
                } else {
                    response.status(200).json(doc);
                }
            });
        } else {
            db.collection(coll).findOne({ _id: ObjectID(request.params.id ), "industry": industry }, function(err, doc) {
                if (err) {                    
                    handleError(response, err.message, "Failed to get stock.");
                } else {
                    response.status(200).json(doc);
                }
            });
        }
    });

    // ========== Frontend routes ========== //

    // Route default url to index.html
    app.get("/", function(request, response) {
        response.sendFile("/views/index.html", { root : path.join(__dirname, "../public") });
    });

    // Route compare url to compare.html
    app.get("/compare", function(request, response) {
        response.sendFile("views/compare.html", { root : path.join(__dirname, "../public") }); 
    });
};

// Handle errors
function handleError(response, reason, message, code) {
    console.log("ERROR: %s", reason);
    response.status(code || 500).json({"error":message});
}
