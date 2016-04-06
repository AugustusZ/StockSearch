var server_url = "http://stocksearh.appspot.com/main.php";

$(function () {
    $("#inputText").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                url: server_url,
                //                url: "http://cs-server.usc.edu:38084/main.php",
                data: {
                    input: request.term // checked by "isset($_GET["input"])" in php
                },
                dataType: "json",
                success: function (data) {
                    var labels_and_values = [];
                    for (var key in data) {
                        datum = data[key];
                        var entry = {};
                        entry["label"] = datum.Symbol + " - " + datum.Name + " ( " + datum.Exchange + " )";
                        entry["value"] = datum.Symbol;
                        labels_and_values.push(entry);
                    };
                    response(labels_and_values);
                }
            });
        }
    });
});


$(function () {
    $("form").submit(function(event) {
        event.preventDefault();
        var what = $("#inputText").val();
        // validation for 'what' needed here

        $("#message").html("");
        setCurrentStock(what);
        setNewsFeeds(what);
        $("#myCarousel").carousel(1);
        addStockChart(what); // bug: size parameters are unavailable before cartousel slides
    });
});

// [ News Feeds ] functions ////

function setNewsFeeds(what) {
    $.ajax
    ({
        type: "GET",
        url: server_url,
        data: 
        {
            query: what
        },
        dataType: "json",
        success: function(data)
        {   
            formatNewsFeeds(data); 
        }   
    })
}

function formatNewsFeeds(data) {
    var entries = data.d.results;
    var html = '';
    for (var key in entries) {
        html += formateOneNewsFeed(entries[key]);
    }
    $("#newsFeeds").html(html);
}

function formateOneNewsFeed(entry) {
    var html = '<div class="well">';
    html += '<p><a class="newsFeedsTitle text-primary" href="' + entry.Url + '">' + entry.Title + '</a></p>';
    console.log(html);
    html += '<p class="newsFeedsDescription">' + entry.Description + '</p>';
    html += '<br>';
    html += '<p class="newsFeedsSource"><strong>Publisher: ' + entry.Source + '</strong></p>';
    html += '<p class="newsFeedsDate"><strong>Date: ' + moment(entry.Date).format('DD MMMM YYYY hh:mm:ss') + '</strong></p>';
    html += "</div>";
    return html;

}

/////////////////////////////////

// [ Current Stock ] functions // 

function addStockChart(what) {
    var src = 'http://chart.finance.yahoo.com/t?s=';
    src += what;
    src += '&lang=en-US';
    src += '&width=' + $("#stockDetails").innerWidth();
    src += '&height=' + $("#stockDetails").innerHeight();
    $("#stockChartImage").attr('src',src);
}

function setCurrentStock(what) 
{
    $.ajax
    ({
        type: "GET",
        url: server_url,
        data: 
        {
            symbol: what
        },
        dataType: "json",
        success: function(data)
        {   
            if (data.Status != "SUCCESS") {
                $("#message").html("No data for this symbol.");
            } else {
                formatCurrentStock(data); 
            }
        }   
    })
}

function formatCurrentStock(data) {
    $("#Name").html(data.Name);
    $("#Symbol").html(data.Symbol);
    $("#LastPrice").html(addDollarSign(data.LastPrice));
    $("#Change").html(formatChanges(data.Change, data.ChangePercent, "#Change"));
    $("#Timestamp").html(formatTime(data.Timestamp));
    $("#MarketCap").html(formatBigNumber(data.MarketCap));
    $("#Volume").html(data.Volume);
    $("#ChangeYTD").html(formatChanges(data.ChangeYTD, data.ChangePercentYTD ,"#ChangeYTD"));
    $("#High").html(addDollarSign(data.High));
    $("#Low").html(addDollarSign(data.Low));
    $("#Open").html(addDollarSign(data.Open));
}

function addDollarSign(n) {
    return "$ " + roundToTwo(n);
}

function roundToTwo(n) { 
    return n.toFixed(2);
}

function formatBigNumber(n) {
    if (n > 1000000000000) return roundToTwo(n / 1000000000000) + ' Trillion';
    else if (n > 1000000000) return roundToTwo(n / 1000000000) + ' Billion';
    else if (n > 1000000) return roundToTwo(n / 1000000) + ' Million';
    else if (n > 1000) return roundToTwo(n / 1000) + ' Thousand';
    return roundToTwo(n);
}

function formatChanges(change, changePercent, id) {
    change = roundToTwo(change);
    changePercent = roundToTwo(changePercent);
    var html = change + ' ( ' + changePercent + '% )';

    if (changePercent != 0) {
        var color = '';
        var src = 'http://cs-server.usc.edu:45678/hw/hw8/images/';

        if (changePercent > 0) {
            color = 'green';
            src += 'up.png';
        } else {
            color = 'red';
            src += 'down.png';
        }

        html += ' <img class="indicator" src=' + src + '>';
        $(id).css('color', color);
    } 
    return html;
}

function formatTime(timestamp) {
    return moment(timestamp).format('DD MMMM YYYY, hh:mm:ss a');
}

/////////////////////////////

// Other events
function resetForm() {
    // CLEAR button: This button must clear the text field, resets the carousel to the favorite list and clear all validation errors if present.

    // 1 clear the text field and set focus
    $("[type=text]").val("");
    $("#inputText").focus();

    // 2 resets the carousel
    $("#myCarousel").carousel(0);

    // 3 clear all validation errors
    $("#message").html("");

    // 4 disable next slide button
    $("#nextSlide").disabled = true;
}
