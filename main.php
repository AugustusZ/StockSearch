<?php
    header("Access-Control-Allow-Origin: *");
    if (isset($_GET["symbol"])) { 
        echo autocomplete_list($_GET["symbol"]); 
    } 

    function autocomplete_list($symbol) {
        $markitondemandURL = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=".urlencode($symbol);
        $json_string = file_get_contents($markitondemandURL); 
//        $json_obj = json_decode($json_string);
        return $json_string;
    }

?>
