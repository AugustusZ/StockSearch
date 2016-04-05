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
        // validation for needed here
        $("#message").html("");
        setCurrentStock();
        $("#myCarousel").carousel(1);
        addStockChart();
    });
});

function addStockChart() {
    var src = 'http://chart.finance.yahoo.com/t?s=';
    src += $("#inputText").val();
    src += '&lang=en-US';
    src += '&width=' + $("#stockDetails").innerWidth();
    src += '&height=' + $("#stockDetails").innerHeight();
    $("#stockChartImage").attr('src',src);
}

function setCurrentStock() 
{
    $.ajax
    ({
        type: "GET",
        url: server_url,
        data: 
        {
            symbol: $("#inputText").val()
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
