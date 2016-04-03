$(function () {
    $("#inputText").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                url: "http://stocksearh.appspot.com/main.php",
                //                url: "http://cs-server.usc.edu:38084/main.php",
                data: {
                    symbol: request.term // checked by "isset($_GET["symbol"])" in php
                },
                dataType: "json",
                success: function (data) {
                    console.log(data);
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

function resetForm() {
    // CLEAR button: This button must clear the text field, resets the carousel to the favorite list and clear all validation errors if present.

    // 1 clear the text field and set focus
    $("[type=text]").val("");
    $("#inputText").focus();

    // 2 resets the carousel
    $("#myCarousel").carousel(0);

    // 3 clear all validation errors
    $("#validationMessage").html("");
}
