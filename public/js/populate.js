var $template = $(".template");
var idChart = 0;
var idCollapse = 0;
var idMediaList = 0;
var idButton = 0;
var type = 2;

//var webhoseToken = "c843d910-7bfc-4cc5-9bda-cfd3eabb85a0";
//var webhoseToken = "7674fb94-391f-4197-9295-aa2e316330d1";

// new api key
var webhoseToken = "4b402a0e-521c-424e-ad3e-cb95aa55b6ac"; 

var newsLoaded = [];
        
function loadStock(id, name, data, startPrct, endPrct, rangePrct, maxPrct, minPrct, industry, start, end, range, max, min){
    var $newPanel = $template.clone();
    $newPanel.find(".collapse").removeClass("in");
    // $newPanel.find(".accordion-toggle").attr("href",  "#collapse" + (idCollapse))
    //     .text((idChart + 1) + " - " + name);
    $newPanel.find(".accordion-toggle").attr("href",  "#" + id)
        .text((idChart + 1) + " - " + name);
    $newPanel.find(".panel-collapse").attr("id", id).addClass("collapse").removeClass("in");
    var chart = "chart" + idChart;
    var mediaList = "mediaList" + idCollapse;
    $newPanel.find("canvas").attr("id", chart);
    var newsList = $newPanel.find("#tempNewsList").attr("id", mediaList);
   
    
    //$newPanel.find("p")[1].innerHTML = "<b>Min</b>: " + min + "%" + " <i class=\"glyphicon glyphicon-arrow-down\" style=\"color: #92050e;\"></i>";
    //$newPanel.find("p")[2].innerHTML = "<b>Max</b>: " + max + "%" + "<i class=\"glyphicon glyphicon-arrow-up\" style=\"color: #008542;\"></i>";
    //$newPanel.find("p")[3].innerHTML = "<b>Range</b>: " + range + "%" + " <i class=\"glyphicon glyphicon-resize-horizontal\" style=\"color: #0099CC;\"></i>";
    
    var paragraphs = $newPanel.find("p");
    for(var i = 0; i < paragraphs.length; i++){
        if (paragraphs[i].id == "industry") {
            paragraphs[i].innerHTML = "<b>Industry</b>: " + industry;
        } else if (paragraphs[i].id == "open") {
            paragraphs[i].innerHTML = "<b>Open Price</b>: $" + start;
        } else if (paragraphs[i].id == "close") {
            paragraphs[i].innerHTML = "<b>Close Price</b>: $" + end;
        } else if(paragraphs[i].id == "min"){
            paragraphs[i].innerHTML = "<b>Min</b>: " + minPrct + "%" + " ($" + min + ") <i class=\"glyphicon glyphicon-arrow-down\" style=\"color: #92050e;\"></i>";
        }else if(paragraphs[i].id == "max"){
            paragraphs[i].innerHTML = "<b>Max</b>: " + maxPrct + "%" + " ($" + max + ") <i class=\"glyphicon glyphicon-arrow-up\" style=\"color: #008542;\"></i>";
        }else if(paragraphs[i].id == "range"){
            paragraphs[i].innerHTML = "<b>Range</b>: " + rangePrct + "%" + " ($" + range + ") <i class=\"glyphicon glyphicon-resize-horizontal\" style=\"color: #0099CC;\"></i>";
        }else if(paragraphs[i].id == "news_spinner"){
            paragraphs[i].id = "news_spinner" + idCollapse;
        }
    }
    var tempID = idCollapse;
    $newPanel.find(".accordion-toggle").click(function(){
         if($.inArray(tempID, newsLoaded)){
             console.log("ID: " + tempID);
             getNews(name, newsList, tempID);
             newsLoaded.push(tempID);
         }
    });
    
    $("#accordion").append($newPanel.fadeIn());
    $newPanel.find("button").val(id);
    $newPanel.find("button").click(function(){
            loadCompare(id);
    });
    

    var ctx = document.getElementById(chart);
    createChart(ctx, name, data, startPrct, endPrct);
    var newsList = document.getElementById(mediaList);
    //console.log(newsList);
    
    //getNews(name, newsList, idCollapse);
    
    idChart++;
    idCollapse++;
    idMediaList++;
}

function loadCompare(id){
    var b = id,
    url = '/compare?' + encodeURIComponent(b) + "&" + currTime;
    console.log("url");
    document.location.href = url;
}

function getNews(name, list, id){
    var mediaList = list;
    var stockName = name;
    name = name.replace(/\s/g, '%20');
    var query = "https://webhose.io/search?token=" + webhoseToken + "&format=json&q=" + name + "%20thread.title%3A(" + name + ")%20language%3A(english)%20thread.country%3AUS";
    
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        
        if (this.readyState == 4 && this.status == 200) {
            console.log("QueryA: " + query);
           // Typical action to be performed when the document is ready:
           //console.log(xhttp.responseText);
           var spinner = document.getElementById("news_spinner" + id);
           console.log("Spinner: " + id + " " + spinner);
           $(list).css("height", "400px");
           $(list).css("visibility", "visible");
           $(spinner).css("display", "none");
           console.log("Success: " + id);
           
           var posts = JSON.parse(xhttp.responseText).posts;
           if(posts == undefined) return;
           if(posts.length > 0){
               for(var i = posts.length - 1; i >= 0; i--){
                   var title = posts[i].title;
                   var link = posts[i].url;
                   var text = posts[i].text;
                   
                   //var image = "http://placehold.it/64x64";
                   var image = "images/placeholder.png";
                   if(posts[i].thread.main_image != undefined){
                       image = posts[i].thread.main_image;
                   }
                   
                   addNews(list, title, image, text, link);
               }
           }else{
               
           }
           
           //console.log(posts);
           //addNews(list, name,  "http://placehold.it/64x64", "Lorem Ipsum ... Something", "www.google.com");
        }else if(this.status == 429){
            console.log("Error: " + id);
            getNews(name, list, id);
        }
    };
    //console.log("Query: " + query);
    //xhttp.open("GET", "https://webhose.io/search?token=d86a00a5-fb4a-426c-ac97-877d5fb05e6e&format=json&q=Grand%20Canyon%20Education%20Inc%20thread.title%3A(Grand%20Canyon%20Education%20Inc)%20language%3A(english)%20thread.country%3AUS%20(site_type%3Anews)&ts=1475303704815", true);
    xhttp.open("GET", query, true);
    xhttp.send();
    
}

function addNews(list, title, img, text, link){
    
    if(text.length > 100){
        text = text.substring(0, 100);
        text = text + "...";
        text = text + "<a href='" + link + "'>Read More</a>"
    }
    
    var mediaTemplate = "<li class='media'>" +
                                            "<div class='media-left'>" +
                                              "<a href='" + link +"'>" +
                                                "<img class='media-object' src='" + img + "' alt='Image not found' style='width: 64px;' onError='imgError(this);'/>" +
                                              "</a>" +
                                            "</div>" +
                                            "<div class='media-body'>" +
                                              "<h4 class='media-heading'><font size='2'>"+ title+ "</font></h4>" +
                                             
                                            "</div>" +
                                          "</li>";
      //console.log(list);
      
      $(list).append(mediaTemplate);
}

function imgError(image) {
    image.onerror = "";
    image.src = "/images/placeholder.png";
    return true;
}

function createChart(ctx, name, data, start, end){
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    var labels = [];
    var dataPointSize = 8;
    var dataPointHoverRadius = 10;
    var dataPointBorderWidth = 3;
    var dataPointBorderHoverRadius = 4;
    var dataPointHitRadius = 5;
    var x = 1;
    if(data.length > 20 && data.length < 50){
        x = 3;
        dataPointSize = 5;
        dataPointHoverRadius = 7;
        dataPointBorderWidth = 2;
        dataPointBorderHoverRadius = 3;
    }else if(data.length > 50) {
        x = 5;
        dataPointSize = 2;
        dataPointHoverRadius = 3;
        dataPointBorderWidth = 1;
        dataPointBorderHoverRadius = 1;
        dataPointHitRadius = 1;
    }
    
    for(var i = 0; i < data.length; i++){
        if(i % x == 0){
            labels.push(data[data.length - 1 - i][0]);
        }else{
            labels.push("");
        }
    }

    var chartData = [];
    for(var i = 0; i < data.length; i++){
         chartData.push(data[data.length - 1 - i][1]);
    }

    var color = randomColor({
                    luminosity: 'dark',
                    format: 'rgba',
                    seed: name,
                });

    color = color.replace(/, [10]\.?\d*\)$/, ', 0.4)');
    console.log(color);

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
            {
                label: name,
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
                pointHitRadius: dataPointHitRadius,
                //data: [65, 59, 80, 81, 56, 55, 40],
                data: chartData,
                spanGaps: false,
            }
            ]
        }
    });
}
