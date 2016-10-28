var $stockTemplate = $(".stock-template");
var $buttonTemplate = $(".pull-right");
var compareList = [];
var newStock;
var myLineChart;
var id;
var currTime = "weekly";

$(".btn-group > .btn").click(function(){
            $(this).parent().siblings().children().removeClass("active");
            $(this).addClass("active");
});

$(document).ready( function () {
    if(window.location.href.includes("?")) {
        id = getId();
        currTime = getMethod();
        getStock(id, currTime, function(stock) {
            newStock = stock;
            document.getElementById("btnweekly").classList.remove("active");
            document.getElementById("btn" + currTime).classList.add("active");
            addToList(stock.name, true);
        });
    }
});

$(".btn-add-panel").on("click", function () {
});

$("#searchBarButton").on("click", function () {
    addToList($("#searchBar").val(), false);
});

/* Twitter typeahead.js code */
// var stocks_typeahead = new Bloodhound ({
//     datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
//     queryTokenizer: Bloodhound.tokenizers.whitespace,
//     remote: {
//         url: '/stocks/' + currTime
//     }
// });
//
// $('#custom-templates .typeahead').typeahead(null, {
//     hint: true,
//     highlight: true,
//     minLength: 2
// },
// {
//     limit: 12,
//     async: true,
//     source: function(query, syncResults, asyncResults) {
//         syncResults
//         $.ajax({
//             url: "/stocks/" + currTime, 
//             data: { name: request.term }, 
//             success: function(data) {
//                 response($.map(data, function(item) { 
//                     return {
//                         label: item.name,
//                         value: item.name,
//                         name: item.name, 
//                         _id: item._id,
//                         name: item.name,
//                         openPrice: item.openPrice,
//                         closePrice: item.closePrice,
//                         range: item.range,
//                         dataset: item.dataset,
//                         max: item.max,
//                         min: item.min
//                     }
//                 }));
//             }
//         });
//     }
// });

$(function () {
    $(".autocomplete").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "/stocks/" + currTime + "/all", 
                data: { name: request.term }, 
                success: function(data) {
                    response($.map(data, function(item) { 
                        return {
                            label: item.name,
                            value: item.name,
                            name: item.name, 
                            _id: item._id,
                            name: item.name,
                            openPrice: item.openPrice,
                            openPrct: item.Prct,
                            closePrice: item.closePrice,
                            closePrct: item.closePrct,
                            range: item.range,
                            dataset: item.dataset,
                            max: item.max,
                            min: item.min,
                            maxPrct: item.maxPrct,
                            minPrct: item.minPrct,
                            rangePrct: item.rangePrct
                        }
                    }));
                }
            });
        },
        minLength: 2,
        select: function(event, ui) {
            newStock = ui.item; // VERY SKETCHY CODE
        }
    })
    .autocomplete("instance")._renderItem = function(ul, item) {
        var arrow_down = "<i class=\"glyphicon glyphicon-arrow-down\" style=\"color: #92050e;\"></i>";
        var arrow_up = "<i class=\"glyphicon glyphicon-arrow-up\" style=\"color: #008542;\"></i>";
        var arrow_range = "<i class=\"glyphicon glyphicon-resize-horizontal\" style=\"color: #0099CC;\"></i>";
        return $("<li>")
            .append("<div><b>" + item.label + "</b><br>" + "<b>Min</b>: " + item.minPrct + "%" + arrow_down + " <b>Max</b>: " + item.maxPrct + "%" + arrow_up + " <b>Range</b>: " + item.rangePrct + "%" + arrow_range + "</div>")
            .appendTo(ul);
    };
});

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function changeTime(time) {
    if (time != currTime) {
        currTime = time;
        var datasets = [];
        
        if (typeof myLineChart !== "undefined") {
            datasets = myLineChart.data.datasets;
        }
        
        for (var i = 0; i < datasets.length; i++) {
            if (i == 0) {
                $.ajax({
                    url: "/stocks/" + currTime + "/all",
                    data: { name: datasets[i].label.replace(/\(.*?\)/g, "") },
                    success: function(data) {
                        updateChart(data[0], true);
                    }
                });
            } else {
                $.ajax({
                    url: "/stocks/" + currTime + "/all",
                    data: { name: datasets[i].label.replace(/\(.*?\)/g, "") },
                    success: function(data) {
                        console.log(data);
                        sleep(50 * i).then(() => {
			    updateChart(data[0], false);
                        });
                    }
                });
            }
        }    
    }
}

function addToList(stock, newChart) {
    var $newPanel = $stockTemplate.clone();
    var $newButton = $buttonTemplate.clone();
    $newPanel.find(".panel-body").text(stock);
    $newPanel.find(".panel-body").append($newButton);
    $newButton.on("click", function() {
        $(this).parent().parent().remove();
        removeStockFromChart($(this).parent().text());
    });
    $("#stocks-list").append($newPanel.fadeIn());
    updateChart(newStock, newChart);
}

function updateChart(stock, newChart) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    var labels = [];
    var dataPointSize = 8;
    var dataPointHoverRadius = 10;
    var dataPointBorderWidth = 3;
    var dataPointBorderHoverRadius = 4;
    var dataPointHitRadius = 5;
    var x = 1;
    if(stock.dataset.length > 20 && stock.dataset.length < 50){
        x = 3;
        dataPointSize = 5;
        dataPointHoverRadius = 7;
        dataPointBorderWidth = 2;
        dataPointBorderHoverRadius = 3;
    }else if(stock.dataset.length > 50) {
        x = 5;
        dataPointSize = 2;
        dataPointHoverRadius = 3;
        dataPointBorderWidth = 1;
        dataPointBorderHoverRadius = 1;
        dataPointHitRadius = 1;
    }
    
    for(var i = 0; i < stock.dataset.length; i++){
        if(i % x == 0){
            labels.push(stock.dataset[stock.dataset.length - 1 - i][0]);
        }else{
            labels.push("");
        }
    }

    var chartData = [];
    for(var i = 0; i < stock.dataset.length; i++){
         chartData.push(stock.dataset[stock.dataset.length - 1 - i][1]);
    }
    
    var oldDataset = [];
    if (typeof myLineChart !== "undefined") {
        if (!newChart) {
            oldDataset = myLineChart.data.datasets;
        }
        myLineChart.destroy();
    }

    var color = randomColor({
                    luminosity: 'dark',
                    format: 'rgba',
                    seed: stock.name,
                });

    color = color.replace(/, [10]\.?\d*\)$/, ', 0.4)');
    console.log(color);
    
    oldDataset.push({
        label: stock.name,
        fill: true,
        lineTension: 0.1,
        backgroundColor: color,
        borderColor: color,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: color,
        pointBackgroundColor: "#fff",
        pointBorderWidth: dataPointBorderWidth,
        pointHoverRadius: dataPointHoverRadius,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color,
        pointHoverBorderWidth: dataPointBorderHoverRadius,
        pointRadius: dataPointSize,
        pointHitRadius:dataPointHitRadius,
        data: chartData,
        spanGaps: false,
    });
    
    myLineChart = new Chart(compareChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: oldDataset
        }
    });
}

function removeStockFromChart(stock) {
    // Look for the json and delete it
    var found = false;
    var index = 0;
    for (var i=0; i < myLineChart.data.datasets.length; i++) {
        if (myLineChart.data.datasets[i].label == stock) {
            found = true;
            index = i;
        }
    }
    if (found == true) {
        myLineChart.data.datasets.splice(index, 1);
    }
    myLineChart.update();
}

function getStock(id, timePeriod, callback) {
    $.ajax({
        url: "/stocks/" + timePeriod + "/all/" + id,
        success: function(data) {
            if (typeof callback == "function") callback(data);
        }
    });
}

function getId() {
    var url = document.location.href,
        params = url.split(/[?&]/);
        return params[1];
}

function getMethod() {
    var url = document.location.href,
        params = url.split('&');
        return params[1];
}
