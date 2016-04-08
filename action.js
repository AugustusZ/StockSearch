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
        $("#myCarousel").carousel(1);

        $("#message").html("");
        setCurrentStock(what);
        setStockChart(what); // bug: size parameters are unavailable before cartousel slides
        setNewsFeeds(what);
        setHistoricalCharts(what);

    });
});

// [ Historical Charts ] functions //

function setHistoricalCharts(what) {
    
    var Success = false;
    $.ajax
    ({
        beforeSend: function() {
            $("#historicalCharts").html("Loading chart...");
        },
        type: "GET",
        url: server_url,
        data: 
        {
            parameters: getParameterJsonString(what)
        },
        dataType: "json",
        success: function(data)
        {   
            if (!data || data.Message) {
                console.error("Error: ", data.Message);
                $("#historicalCharts").html("No chart for <strong>" + what + "</strong>.");
                return Success;
            }
            drawHistoricalCharts(data, what); 
            Success = true;//doesnt goes here
        },
        error: function(textStatus, errorThrown) {
            Success = false;//doesnt goes here
        }  
    })
    return Success;
}

function getParameterJsonString(what) {
    var parameterJson = {
        Normalized: false,
        NumberOfDays: 1096,
        DataPeriod: "Day",
        Elements: [{
                Symbol: what,
                Type: "price",
                Params: ["ohlc"] 
        }]
    }
    return JSON.stringify(parameterJson);
}


// from: https://goo.gl/4hG9VA

function _fixDate(dateIn) {
    var dat = new Date(dateIn);
    return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
};

function _getOHLC(json) {
    var dates = json.Dates || [];
    var elements = json.Elements || [];
    var chartSeries = [];

    if (elements[0]){

        for (var i = 0, datLen = dates.length; i < datLen; i++) {
            var dat = _fixDate( dates[i] );
            var pointData = [
                dat,
                elements[0].DataSeries['open'].values[i],
                elements[0].DataSeries['high'].values[i],
                elements[0].DataSeries['low'].values[i],
                elements[0].DataSeries['close'].values[i]
            ];
            chartSeries.push( pointData );
        };
    }
    return chartSeries;
};

function drawHistoricalCharts(data, what) {
    //console.log(data)
    // split the data set into ohlc and volume
    var ohlc = _getOHLC(data);

    // set the allowed units for data grouping
    var groupingUnits = [[
        'week',                         // unit name
        [1]                             // allowed multiples
    ], [
        'month',
        [1, 2, 3, 4, 6]
    ]];

    // create the chart
    $('#historicalCharts').highcharts('StockChart', {
        rangeSelector: {
            selected: 0,
            inputEnabled: false,
            allButtonEnabled: true,

            buttons: [{
                type: 'week', count: 1, text: '1w'
            }, {
                type: 'month', count: 3, text: '3m'
            }, {
                type: 'month', count: 6, text: '6m'
            }, {
                type: 'ytd', text: 'YTD'
            }, {
                type: 'year', count: 1, text: '1y'
            }, {
                type: 'all', text: 'All'
            }]
            // enabled: false
        },

        title: {
            text: what + ' Historical Price'
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%e of %b'
            }
        },
        yAxis: [{
            title: {
                text: 'Stock Value'
            },
            height: 300,
            lineWidth: 2
        }],
        
        series: [{
            type: 'area',
            name: what,
            data: ohlc,
            dataGrouping: {
                units: groupingUnits
            },
            tooltip : {
                valueDecimals : 2,
                valuePrefix: '$'
            },
            fillColor : {
                linearGradient : {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops : [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        }],
        credits: {
            enabled: true
        },
        navigation: {
            buttonOptions: {
                enabled: false
            }
        }
    });
};

$("#highcharts-0").ready(function(){
    $('#historicalCharts').highcharts().reflow(); // where to put this sentence?
});
////////////////////////////////
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
            formatNewsFeeds(data, what); 
        },
        error: function(data) {

        }   
    })
}

function formatNewsFeeds(data, what) {
    var entries = data.d.results;
    var html = '';
    for (var key in entries) {
        html += formateOneNewsFeed(entries[key], what);
    }
    $("#newsFeeds").html(html);
}

function formateOneNewsFeed(entry, what) {
    var html = '<div class="well">';

    html += '<p><a class="newsFeedsTitle text-primary" href="' + entry.Url + '">' + entry.Title + '</a></p>';
    html += '<p class="newsFeedsDescription">' + entry.Description.replace(what, '<strong>' + what + '</strong>') + '</p>';
    html += '<br>';
    html += '<p class="newsFeedsSource"><strong>Publisher: ' + entry.Source + '</strong></p>';
    html += '<p class="newsFeedsDate"><strong>Date: ' + moment(entry.Date).format('DD MMMM YYYY hh:mm:ss') + '</strong></p>';
    html += "</div>";

    return html;
}

/////////////////////////////////

// [ Current Stock ] functions // 

function setStockChart(what) {
    var src = 'http://chart.finance.yahoo.com/t?s=';
    src += what;
    src += '&lang=en-US';
    src += '&width=' + $("#stockDetails").innerWidth();
    src += '&height=' + $("#stockDetails").innerHeight();
    $("#stockChartImage").attr('src',src);
}

function setCurrentStock(what) 
{
    var Success = false;
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
                Success = false;//doesnt goes here
            } else {
                formatCurrentStock(data); 
                Success = true;//doesnt goes here
            }
        },
        error: function (textStatus, errorThrown) {
            Success = false;//doesnt goes here
        }  
    })
    return Success;
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
    $("#inputText").val("");
    $("#inputText").focus();

    // 2 resets the carousel
    $("#myCarousel").carousel(0);

    // 3 clear all validation errors
    $("#message").html("");

    // 4 disable next slide button
    $("#nextSlide").disabled = true;
}
