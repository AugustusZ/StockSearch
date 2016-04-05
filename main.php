<?php
    header("Access-Control-Allow-Origin: *");

	$lookup_api_url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=";
	$quote_api_url = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=";

    if (isset($_GET["input"])) { 
        echo file_get_contents($lookup_api_url.urlencode($_GET["input"]));
    } else if (isset($_GET["symbol"])) {
    	echo file_get_contents($quote_api_url.urlencode($_GET["symbol"]));
    }

?>
