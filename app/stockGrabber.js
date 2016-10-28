var http = require("http");
var https = require("https");
var rehttps = require("follow-redirects").https;
var mongodb = require("mongodb");
var fs = require("fs");
var exec = require("child_process").exec;

var db;
var stockCount = 1;
var index = 0;

// Connect to database
mongodb.MongoClient.connect(require("../config/db").url, function(err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = database;     

    // Update symbol file and database elements
    updateSymbols(function() {
        updateDatabase();
    });
});

function updateSymbols(callback) {
    // Create zip file
    var file = fs.createWriteStream("res/WIKI-datasets-codes.zip");
    // Download symbol zip file from quandle
    rehttps.get("https://www.quandl.com/api/v3/databases/WIKI/codes.css?api_key=6Bc43JXNTrFsXTqtgY3D", function(response) {
        response.pipe(file);

        // Unzip the received file, delete the original zip file, and run the callback function
        response.on("end", function() {
            console.log("symbol file received");
            exec("rm WIKI-datasets-codes.csv | unzip res/WIKI-datasets-codes.zip -d res/", function(error, stdout, stderr) {
                exec("rm res/WIKI-datasets-codes.zip", function(error, stdout, stderr) {
                    if (typeof callback == "function") callback();
                });
            });
        });
    });
}

function updateDatabase() {
    var stockArr;
    //stockArr = ["FB", "GOOG", "MSFT", "YHOO", "INTC", "IBM", "LMT", "CSCO", "TWX", "DIS", "AAPL", "AMD", "AMZN", "TWTR", "COKE"];
   
    // Add all stocks in the sample dataset file to an array
    var cmd = "grep -o '/[^,]*' res/sample-datasets-codes.csv | grep -o [^/]*";
    exec(cmd, function(error, stdout, stderr) {
          stockArr = stdout.split("\n");
          stockArr.pop();
    });

    stockCount = 115 * 5;
    
    // Index the database
    indexCollection("daily");
    indexCollection("weekly");
    indexCollection("monthly");
    indexCollection("yearly");
    indexCollection("alltime");

    // Get the latest available date and call api for all stock in array
    latestDate(function(date1, date2) {
        var dateArr = checkDate([ parseInt(date1.replace(/^\d*-\d*-/, "")), parseInt(date1.replace(/^\d*-|\d*-$/g, "")), parseInt(date1.replace(/\d*-\d*$/, "")) ]);
        var currDay = dateArr[0];
        var currMonth = dateArr[1];
        var currYear = dateArr[2];
        var end = dateArr[2] + "-" + dateArr[1] + "-" + dateArr[0];

        console.log();

        // Loop through all stock in array
        for (var i = 0; i < stockArr.length; i++) {
            // Get industry of stocki and update daily, weekly, monthly, yearly and all time stock data
            getIndustry(i, stockArr[i], function(industry, i) {
                console.log("Updating stock for: " + stockArr[i]);

                console.log("     - Retrieving all time: [1800-01-01] => [" + end + "]");
                grab("alltime", "https://www.quandl.com/api/v3/datasets/WIKI/" + stockArr[i] + ".json?column_index=4&start_date=1800-01-01&end_date=" + end + "&collapse=annual&api_key=6Bc43JXNTrFsXTqtgY3D", industry);

                dateArr[2] = currYear - 1;
                dateArr[1] = currMonth;
                dateArr[0] = currDay;
                start = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
                dateArr[2]++;
                console.log("     - Retrieving yearly: [" + start + "] => [" + end + "]");
                grab("yearly", "https://www.quandl.com/api/v3/datasets/WIKI/" + stockArr[i] + ".json?column_index=4&start_date=" + start + "&end_date=" + end + "&collapse=weekly&api_key=6Bc43JXNTrFsXTqtgY3D", industry);

                dateArr[1]--;
                dateArr = checkDate(dateArr);
                start = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
                console.log("     - Retrieving monthly: [" + start + "] => [" + end + "]");
                grab("monthly", "https://www.quandl.com/api/v3/datasets/WIKI/" + stockArr[i] + ".json?column_index=4&start_date=" + start + "&end_date=" + end + "&collapse=daily&api_key=6Bc43JXNTrFsXTqtgY3D", industry);

                dateArr[2] = currYear;
                dateArr[1] = currMonth;
                dateArr[0] = currDay - 8;
                dateArr = checkDate(dateArr);
                start = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
                console.log("     - Retrieving weekly: [" + start + "] => [" + end + "]");
                grab("weekly", "https://www.quandl.com/api/v3/datasets/WIKI/" + stockArr[i] + ".json?column_index=4&start_date=" + start + "&end_date=" + end + "&collapse=daily&api_key=6Bc43JXNTrFsXTqtgY3D", industry);

                dateArr = checkDate([ parseInt(date2.replace(/^\d*-\d*-/, "")), parseInt(date2.replace(/^\d*-|\d*-$/g, "")), parseInt(date2.replace(/\d*-\d*$/, "")) ]);
                start = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
                console.log("     - Retrieving daily: [" + start + "] => [" + end + "]");
                grab("daily", "https://www.quandl.com/api/v3/datasets/WIKI/" + stockArr[i] + ".json?column_index=4&start_date=" + start + "&end_date=" + end + "&collapse=daily&api_key=6Bc43JXNTrFsXTqtgY3D", industry);
            });
        }
    });
}

// Ensure that the date passed as an array is a correct date
function checkDate(d) {
    while (d[1] < 1) {
        d[1] = 12 + d[1];
        d[2]--;
    }

    while (d[0] < 1) {
        if ((d[1] <= 7 && d[1] % 2 == 1) || (d[1] >= 8 && d[1] % 2 == 0)) {
            d[0] = 31 + d[0];
        } else if (d[1] == 2) {
            d[0] = 28;
        } else {
            d[0] = 30;
        }

        d[1]--;
        if (d[1] < 1) {
            d[1] = 12;
            d[2]--;
        } else {
            d[1]--;
        }
    }

    return d;
}

// Pass url to https.get and return result
function grab(collection, url, industry) {
    https.get(url, function(response) {
        var body = "";

        response.on("data", function(data) {
            body += data; 
        });

        response.on("end", function() {
            handleResponse(body, collection, industry);
        });
    });
}

// Get latest available dat from quandl
function latestDate(callback) {
    https.get("https://www.quandl.com/api/v3/datasets/WIKI/GOOG.json?column_index=4&start_date=2016-4-20&end_date=3000-4-21&collapse=daily&api_key=6Bc43JXNTrFsXTqtgY3D", function(response) {
        var body = "";

        response.on("data", function(data) {
            body += data;   
        });

        response.on("end", function() {
            var res = JSON.parse(body);
            if (typeof callback == "function") callback(res.dataset.data[0][0], res.dataset.data[1][0]);
        });
    });
}

// Index database collection
function indexCollection(collection) {
    db.collection(collection).ensureIndex({ name: 1 }, function(err, result) {
        if (err) console.log("Error generating index: ", err);
    });
}

// Format quandl json and place into database
function handleResponse(string, collection, industry) {
    var response = JSON.parse(string);

    if (response.dataset.data.length < 1) return;

    var name = response.dataset.name;
    name = name.replace(" Prices, Dividends, Splits and Trading Volume", "");

    var power = Math.pow(10, 2);

    var openPrice = response.dataset.data[response.dataset.data.length - 1][1].toFixed(2);
    var closePrice = response.dataset.data[0][1].toFixed(2);

    var openPrct = 0; 
    var closePrct = ~~((((closePrice - openPrice) / openPrice) * 100) * power) / power;

    var rangePrct = closePrct;
    var range = (closePrice - openPrice).toFixed(2);
    var dataPoints = response.dataset.data;

    var maxPrct = 0;
    var minPrct = 1;

    var max = Number.MIN_SAFE_VALUE;
    var min = Number.MAX_SAFE_VALUE;

    for (var i = 0; i < response.dataset.data.length; i++) {
        var prct = ~~((((response.dataset.data[i][1] - openPrice) / openPrice) * 100) * power) / power;
        if (maxPrct < prct) { 
            max = response.dataset.data[i][1].toFixed(2);
            maxPrct = prct;
        }
        if (minPrct > prct) { 
            min = response.dataset.data[i][1].toFixed(2);
            minPrct = prct;
        }

	response.dataset.data[i][1] = prct;
    }

    console.log(name + ", " + industry);
    var newStock = {name:name, industry:industry, closePrice:closePrice, openPrice:openPrice, closePrct:closePrct, openPrct:openPrct, range:range, max:max, min:min, maxPrct:maxPrct, minPrct:minPrct, rangePrct:rangePrct, dataset:dataPoints};

    try {
        db.collection(collection).updateOne({ name:name }, { $set: newStock }, { upsert: true });
    } catch (e) {
        console.log(e);
    }

    index++;

    if (stockCount == index) process.exit();
}

// Scrape nasdaq for the industry of a symbol
function getIndustry(i, symbol, callback) {
    var s = symbol.toLowerCase();
    http.get("http://www.nasdaq.com/symbol/" + s, function(response) {
        var body = "";

        response.on("data", function(data) {
            body += data; 
        });

        response.on("end", function() {
            var regex = /Industry.*?>([^<]*)<\/a>/;
            var match = regex.exec(body);
            if (typeof callback == "function" && match != null) {
                callback(match[1], i);
            }
        });
    });   
}
