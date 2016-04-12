var server_url = "http://stocksearh.appspot.com/main.php";
var symbols = [];

$(function () {
    loadFavoriteListFromLocalStorage();
});

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
                    symbols = [];
                    for (var key in data) {
                        datum = data[key];
                        var entry = {};
                        entry["label"] = datum.Symbol + " - " + datum.Name + " ( " + datum.Exchange + " )";
                        entry["value"] = datum.Symbol;
                        labels_and_values.push(entry);
                        symbols.push(datum.Symbol);
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
        var what = $("#inputText").val().toUpperCase();
        // validation for 'what' needed here
        if (symbols.includes(what)) {
            console.log(what + " is a valid entry")
            doGet(what);
        }
        else {
            console.log(symbols);
            console.log(what + " is not a valud entry")
            $("#message").html("Select a valid entry");
        }
    });
});

function doGet(what) {
    setCurrentStock(what);
}

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

    var args = {
            chart: {
                reflow: true,
                events: {
                    load: function(event) {
                        // alert ('Chart loaded');
                    } 
                }   
            },
            rangeSelector: {
                selected: 0,
                inputEnabled: false,
                allButtonEnabled: true,

                buttons: [{
                    type: 'week', count: 1, text: '1w'
                }, {
                    type: 'month', count: 1, text: '1m'
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
        };
    // create the chart
    $('#historicalCharts').highcharts('StockChart', args);
};

// $(function () {
//     $('#historicalChartsTab').click(function () {
//         alert("click");
//         $('#historicalCharts').highcharts().reflow();
//     });
// });
$(function () {
    $("#highcharts-0").ready(function(){
        // $('#historicalCharts').highcharts().reflow(); // where to put this sentence?
    });
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
    src += '&width=' + 400;
    src += '&height=' + 300;
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
                $("#myCarousel").carousel(1);

                setStockChart(what); 
                setHistoricalCharts(what);
                setNewsFeeds(what);

                $("#message").html("");
                formatCurrentStock(data);

                $("#nextSlide").prop( "disabled", false);

                if (isInFavoriteList(what)) {
                    $("#favoriteStar").css('color','yellow');
                } else {
                    $("#favoriteStar").css('color','white');
                }

            }
        }, 
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
    if (n > 1000000000) return roundToTwo(n / 1000000000) + ' Billion';
    else if (n > 1000000) return roundToTwo(n / 1000000) + ' Million';
    return roundToTwo(n);
}

function formatChanges(change, changePercent, id) {
    change = roundToTwo(change);
    changePercent = roundToTwo(changePercent);
    var html = change + ' ( ' + changePercent + '% )';

    if (changePercent != 0) {
        var color = '';
        var src = 'http://cs-server.usc.edu:45678/hw/hw8/images/';

        if (changePercent == 0) {
            color = 'black';
        } else {
            if (changePercent > 0) {
                color = 'green';
                src += 'up.png';
            } else {
                color = 'red';
                src += 'down.png';
            }
            html += ' <img class="indicator" src=' + src + '>';
        }
    } 
    return '<span style="color:' + color + '">' + html + '</span>';
}

function formatTime(timestamp) {
    return moment(timestamp).format('DD MMMM YYYY, hh:mm:ss a');
}

/////////////////////////////

var timerID;
var refreshInterval = 5000;

$("#autoRefreshToggle").change(function() {
    if($(this).is(":checked")) {
        timerID = setInterval(partialRefreshFavoriteList, refreshInterval);
    }
    else {
        clearInterval(timerID);
    }
});

function partialRefreshFavoriteList() {
    console.log("Partially Refresh Favorite List!");
    var favoriteList = getFavoriteList();
    for (var key in favoriteList) {
        var symbol = favoriteList[key];
        setPartialFavoriteListStockInfo(symbol);
    }
}

function setPartialFavoriteListStockInfo(what) {
    $.ajax({
        type: "GET",
        url: server_url,
        data: 
        {
            symbol: what
        },
        dataType: "json",
        success: function(data)
        {   
            var id = 'favoriteList-' + what;
            $(id + '-LastPrice').html(addDollarSign(data.LastPrice));
            $(id + '-Change').html(formatChanges(data.Change, data.ChangePercent, id + '-Change'));
            console.log("Partial Favorite List Stock Info updated.");
        },
    })
}
// [ favorite list ]
$("#favoriteStarButton").click(function () {
    var symbol = $("#Symbol").text();

    if (!localStorage.getItem("favoriteList")) {
        localStorage.setItem("favoriteList", JSON.stringify([]));
    }

    if (isInFavoriteList(symbol)) {
        doRemove(symbol);
    } else {
        doAdd(symbol);
    }

    console.log(getFavoriteList());
}); 

function doRemove(symbol) {
    $("#favoriteStar").css('color', 'white');
    removeFromFavoriteListLocalStorage(symbol);
    removeFromFavoriteListTable(symbol);
}

function doAdd(symbol) {
    $("#favoriteStar").css('color', 'yellow');
    addToFavoriteListLocalStorage(symbol);
    addToFavoriteListTable(symbol);
}

function getFavoriteList() {
    return JSON.parse(localStorage.getItem("favoriteList"));
}

function addToFavoriteListLocalStorage(symbol) {
    var favoriteList = getFavoriteList();
    favoriteList.push(symbol);
    localStorage.setItem("favoriteList", JSON.stringify(favoriteList));
}

function removeFromFavoriteListLocalStorage(symbol) {
    var favoriteList = getFavoriteList();
    var index = favoriteList.indexOf(symbol);
    favoriteList.splice(index, 1);
    localStorage.setItem("favoriteList", JSON.stringify(favoriteList));
}

function isInFavoriteList(symbol) {
    var favoriteList = getFavoriteList();
    return favoriteList.includes(symbol);
}

function addToFavoriteListTable(symbol) {
    var id = 'favoriteList-' + symbol;
    var html = '<tr id="' + id + '">';
    html += '<td><a onclick=\"doGet(\'' + symbol + '\')\" style="cursor:pointer">' + symbol + '</a></td>';
    html += '<td id="' + id + '-Name' + '">' + $("#Name").html() + '</td>';
    html += '<td id="' + id + '-LastPrice' + '">' + $("#LastPrice").html() + '</td>';
    html += '<td id="' + id + '-Change' + '">' + $("#Change").html() + '</td>';
    html += '<td id="' + id + '-MarketCap' + '">' + $("#MarketCap").html() + '</td>';
    html += '<td>' + '<button type="submit" class="btn btn-default" ';
    html += 'onclick=\"doRemove(\'' + symbol + '\')\"';//onclick="myFunction()"
    html += '><span class="glyphicon glyphicon-trash"></span></button>' + '</td>';
    html += '</tr>';
    $("#favoriteListTable").append(html);
}

function loadFavoriteListFromLocalStorage() {
    var favoriteList = getFavoriteList();
    console.log(favoriteList);
    for (var key in favoriteList) {
        var symbol = favoriteList[key];
        console.log("this symbol: " + symbol);
        var id = 'favoriteList-' + symbol;
        var html = '<tr id="' + id + '">';
        html += '<td><a onclick=\"doGet(\'' + symbol + '\')\" style="cursor:pointer">' + symbol + '</a></td>';
        html += '<td id="' + id + '-Name' + '">' + '</td>';
        html += '<td id="' + id + '-LastPrice' + '">' + '</td>';
        html += '<td id="' + id + '-Change' + '">' + '</td>';
        html += '<td id="' + id + '-MarketCap' + '">' + '</td>';
        html += '<td>' + '<button type="submit" class="btn btn-default" ';
        html += 'onclick=\"doRemove(\'' + symbol + '\')\"';//onclick="myFunction()"
        html += '><span class="glyphicon glyphicon-trash"></span></button>' + '</td>';
        html += '</tr>';
        $("#favoriteListTable").append(html);
        setFavoriteListStockInfo(symbol);
    }
}

function setFavoriteListStockInfo(what) 
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
                formatFavoriteListStockInfo(data); 
                Success = true;//doesnt goes here
        },
    })
    return Success;
}

function formatFavoriteListStockInfo(data) {
    var id = '#favoriteList-' + data.Symbol;
    $(id + '-Name').html(data.Name);
    $(id + '-LastPrice').html(addDollarSign(data.LastPrice));
    $(id + '-Change').html(formatChanges(data.Change, data.ChangePercent, id + '-Change'));
    $(id + '-MarketCap').html(formatBigNumber(data.MarketCap));
}

function removeFromFavoriteListTable(symbol) {
    $('#favoriteList-' + symbol).remove();
}

// Other events
function resetForm() {
    // CLEAR button: This button must clear the text field, resets the carousel to the favorite list and clear all validation errors if present.

    // 1 clear the text field and set focus
    $("#inputText").val("");
    $("#inputText").focus();

    // 2 resets the carousel and disable next slide button
    $("#nextSlide").disabled = true;
    $("#myCarousel").carousel(0);

    // 3 clear all validation errors
    $("#message").html("");
}