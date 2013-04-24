<?php		  
include_once('api.php');
session_start();
include_once 'config.php';
include_once 'query.php';
include_once 'utils.php';
include_once 'ftp.php';

$db = new db_class();
if (!$db->connect($CONFIG_host, $CONFIG_user, $CONFIG_pass, $CONFIG_db)) {
        $db->print_last_error();
}
if (!$db->select_db()){
        die("Banco de dados não encontrado!");
}

$username = $_POST['login'];
$password = $_POST['password'];


?>
