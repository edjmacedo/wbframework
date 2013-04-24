<?php		  
include_once('api.php');
include('config.php');

session_start();
session_destroy();
session_unset();

Api::response(Array());
?>
