var currTime = "weekly";
var currIndustry = "all";
var load_start = 15; // Used for infinite scroll
var stocks;

$(".btn-group > .btn").click(function(){
            $(this).parent().siblings().children().removeClass("active");
            $(this).addClass("active");
});

queryDatabase(currTime, currIndustry);

function changeTime(time) {
    if (time != currTime) {
        // Call function to reset accordion here
        clearStockList();
	queryDatabase(time, currIndustry);
        currTime = time;
        load_start = 15;
    }
}

function changeIndustry(industry) {
    if (industry != currIndustry) {
	clearStockList();
        queryDatabase(currTime, industry)
        currIndustry = industry;
        load_start = 15;
    }
}

function clearStockList(){
    $("#accordion").empty();
    idChart = 0;
    idCollapse = 0;
    idButton = 0;
    newsLoaded = [];
}

function queryDatabase(time, industry) {
    $.ajax({
        url: "/stocks/" + time + "/" + industry,
        success: function(data) {
            data.sort(function(a, b) { return b.rangePrct - a.rangePrct });
            stocks = data;
            // data = data.slice(start, start+15);
            console.log(data);
            for (var i = 0; i < 15; i++) {
                loadStock(data[i]._id, data[i].name, data[i].dataset, data[i].openPrct, data[i].closePrct, data[i].rangePrct, data[i].maxPrct, data[i].minPrct, data[i].industry, data[i].openPrice, data[i].closePrice, data[i].range, data[i].max, data[i].min);
            }
        }
    });
}

function updateList(callback) {
    for (var i = load_start; i < load_start + 15 && i < stocks.length; i++) {
        loadStock(stocks[i]._id, stocks[i].name, stocks[i].dataset, stocks[i].openPrct, stocks[i].closePrct, stocks[i].rangePrct, stocks[i].maxPrct, stocks[i].minPrct, stocks[i].industry, stocks[i].openPrice, stocks[i].closePrice, stocks[i].range, stocks[i].max, stocks[i].min);
    }

    if (typeof callback == "function") callback();
}

$(document).ready(function() {
    // $(window).load(function() {
        var preloader = $('.folding-cube-wrapper');
        preloader.delay(200).fadeOut('slow');
    // });
});

$(window).scroll(function(){
    if ($(document).height() - $(window).height() == $(window).scrollTop() && load_start < stocks.length && $(window).scrollTop() != 0) {
        console.log($(document).height() + ", " + $(window).height() + ", " + $(window).scrollTop());
        // Call the function which loads more stocks in
        var preloader = $('.folding-cube-wrapper');
        preloader.fadeIn('slow');
        updateList(function() {
            load_start += 15;   
        });

        preloader.delay(800).fadeOut('slow');
    }
});
