var $ranking_template = $(".ranking-list-template");
var idNum = 0;

var hash = 2;
$(".btn-add-panel").on("click", function () {
    addEntries();
});

function addEntries() {
    var $newPanel = $ranking_template.clone();
    $newPanel.find(".collapse").removeClass("in");
    $newPanel.find(".accordion-toggle").attr("href",  "#" + (++hash))
             .text("Dynamic panel #" + hash);
    $newPanel.find(".panel-collapse").attr("id", hash).addClass("collapse").removeClass("in");
    var id = "chart" + idNum;
    $newPanel.find("canvas").attr("id", id);
    $("#accordion").append($newPanel.fadeIn());
    
    
    var ctx = document.getElementById(id);
    console.log(ctx);
    createChart(ctx);
    idNum++;
}

function createChart(ctx){
    var data = [];
    for(var i = 0; i < 50; i++){
        var rand = Math.floor((Math.random() * 100) + 1);
        data.push(rand);
    }
    
    var labels = [];
    for(var i = 0; i < 50; i++){
        if(i % 10 == 0){
            labels.push(i);
        }else{
            labels.push("");
        }
    }
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
                //labels: ["January", "February", "March", "April", "May", "June", "July"],
                labels: labels,
                datasets: [
                    {
                        label: "Random Numbers: 0 - 100",
                        fill: true,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        //data: [65, 59, 80, 81, 56, 55, 40],
                        data: data,
                        spanGaps: false,
                    }
                ]
            }
    });

}
