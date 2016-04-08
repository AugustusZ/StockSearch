<?php
  header("Access-Control-Allow-Origin: *");

	$lookup_api_url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=";
	$quote_api_url = "http://dev.markitondemand.com/MODApis/Api/v2/Quote/json?symbol=";
  $interactive_chart_url = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=";

  if (isset($_GET["input"])) { 
    echo file_get_contents($lookup_api_url.urlencode($_GET["input"]));
  } else if (isset($_GET["symbol"])) {
  	echo file_get_contents($quote_api_url.urlencode($_GET["symbol"]));
  } else if (isset($_GET['query'])) {
  	echo getBingSearchResult($_GET['query']);
  } else if (isset($_GET['parameters'])) {
    echo file_get_contents($interactive_chart_url.urlencode($_GET['parameters']));
  }
?>

<?php            
  function getBingSearchResult($query) {
    $accountKey = 'pWZPGiXLvJZyIdRVmXoSVrSaVrXA38UOP4idctL9xhM';
    $ServiceRootURL = 'https://api.datamarket.azure.com/Bing/Search/v1/';
    $WebSearchURL = $ServiceRootURL . '/News?$format=json&Query=';

    $context = stream_context_create(array(
       'http' => array(
           'request_fulluri' => true,
           'header'  => "Authorization: Basic " . base64_encode($accountKey . ":" . $accountKey)
       )
    ));

    $request = $WebSearchURL . urlencode( '\'' . $query . '\'');
    return file_get_contents($request, 0, $context);
  }
?>