<?php
class Api {
	public static function getDb() {
		include_once('query.php');
		include('config.php');
		$db = new db_class();
		if (!$db->connect($CONFIG_host, $CONFIG_user, $CONFIG_pass, $CONFIG_db)) {
			Api::error(500, "Database error");
		}
		if (!$db->select_db()){
			Api::error(500, "Database not found");
		}
		return $db;
	}
	public static function getMethod() {
		return strtolower($_SERVER['REQUEST_METHOD']);	
	}
	public static function getConfig($config) {
		include('config.php');
		return $CONFIG[$config];
	}
	public static function getData($showErrors = true) {
		switch(API::getMethod()) {
			case 'get':
				$data = $_GET;
				if (isset($_SESSION['ipdata']) && !isset($data['coordinates']))
					$data['coordinates'] = $_SESSION['ipdata']['latitude'].",".$_SESSION['ipdata']['longitude'];				
				break;
			case 'post':
				$data = $_POST;
				break;
			case 'put':
				// basically, we read a string from PHP's special input location,
				// and then parse it out into an array via parse_str... per the PHP docs:
				// Parses str  as if it were the query string passed via a URL and sets
				// variables in the current scope.
				parse_str(file_get_contents('php://input'), $put_vars);
				$data = $put_vars;
				break;
		}
		if (!isset($data) || $data == null)
			return;
		foreach($data as $key => $value)
			if (is_string($value))
				$data[$key] = utf8_encode(urldecode($value));
			if (strcasecmp($key,'size') == 0 && $value < 1 && $showErrors)
				API::error(400, "Size cannot be less than 1");
			
		return $data;
	}
	public static function response($items, $total = 0) {
		include('config.php');
		include_once('utils.php');
		
		$output = Array();
		$output['version'] = $CONFIG_version;
		
		$request = Array();
		$request['url'] = curPageURL();
		$request['method'] = $_SERVER['REQUEST_METHOD'];
		$request['time'] = $_SERVER['REQUEST_TIME'];
		$request['query'] = API::getData();
		$output['request'] = $request;
		
		if ($total > 0) {
			$output['total'] = $total;
		}
		
		$results = Array();
		if (sizeof($items) > 0)
			$results['count'] = sizeof($items);
		else 
			$results['count'] = 0;
		$results['items'] = $items;
		$output['results'] = $results;
		
		$status = Array();
		$status['code'] = 200;
		$status['message'] = 'OK';
		$output['status'] = $status;
		
		header('Content-Type: application/json; charset=UTF-8');
		die(json_encode($output));
	}
	
	public static function error($code = 500, $message = "Internal server error.") {
		include('config.php');
		include_once('utils.php');
		
		$output = Array();
		$output['version'] = $CONFIG_version;
		
		$request = Array();
		$request['url'] = curPageURL();
		$request['method'] = $_SERVER['REQUEST_METHOD'];
		$request['time'] = $_SERVER['REQUEST_TIME'];
		$request['query'] = API::getData(false);
		$output['request'] = $request;
		
		$results = Array();
		$results['count'] = 0;
		$output['results'] = $results;
		
		$status = Array();
		$status['code'] = $code;
		$status['message'] = $message;
		$output['status'] = $status;
		
		header('Content-Type: application/json; charset=UTF-8');
		die(json_encode($output));
	}
	
	public static function debug($return) {
		header('Content-Type: text/html; charset=UTF-8');
		die($return);
	}
}
?>
