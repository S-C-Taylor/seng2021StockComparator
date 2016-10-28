var selectedStock;

$(function() {
    $(".autocomplete").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "/stocks/" + currTime + "/" + currIndustry,
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
                            openPrct: item.openPrct,
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
            selectedStock = ui.item;
        }
    })
    .autocomplete("instance")._renderItem = function(ul, item) {
        var arrow_down = "<i class=\"glyphicon glyphicon-arrow-down\" style=\"color: #92050e;\"></i>";
        var arrow_up = "<i class=\"glyphicon glyphicon-arrow-up\" style=\"color: #008542;\"></i>";
        var arrow_range = "<i class=\"glyphicon glyphicon-resize-horizontal\" style=\"color: #0099CC;\"></i>";
        return $("<li>")
            .append("<div><b>" + item.label + "</b><br>" + " <b>Min</b>: " + item.minPrct + "%" + arrow_down + " <b>Max</b>: " + item.maxPrct + "%" + arrow_up + " <b>Range</b>: " + item.rangePrct + "%" + arrow_range + "</div>")
            .appendTo(ul);
    };
});

$("#searchBarButton").on("click", function () {
    jumpToPanel(selectedStock._id);
});

function jumpToPanel(stockID) {
    if ($('#' + stockID).length) { // It if exists
        $("#" + stockID).collapse('show');
        $('html, body').animate({
            scrollTop: $("#" + stockID).offset().top - 300
        }, 'slow');
    } else {
    }
}
