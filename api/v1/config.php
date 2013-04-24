<?php
//version
$CONFIG['version'] = '1.0'; // API Version
$CONFIG['twitter_base'] = "http://www.twitter.com/"; // Base URL for Twitter

//sql connections
$CONFIG['host']    = 'localhost';  // SQL Host
$CONFIG['user']    = 'root';   // SQL User
$CONFIG['pass']    = 'root';   // SQL Password
$CONFIG['db']    = '';   // SQL Database Name

//ftp connections
$CONFIG['ftp_host']		= ''; // FTP Host
$CONFIG['ftp_port']		= '21'; // FTP Host [Default: 21]
$CONFIG['ftp_user']		= ''; // FTP User [Default: Anonymous]
$CONFIG['ftp_pass']		= ''; // FTP Password
$CONFIG['ftp_dir']		= '/public_html/images/'; // FTP Default Working Path [Ending with /]


//server name, rates
$CONFIG['name']			=	'';	// name of the server
$CONFIG['cookietime']	=   3600; // Expiration time for cookies [Default: 1209600 (2 weeks)]
$CONFIG['search_items_per_page'] = 10; // Items shown in the search results [Default: 10]

//default language
$CONFIG['language']		=	'English';		// default language (remember to check if the translation exist before set)

//mail
$CONFIG['smtp_server']		=	'localhost';	// the smtp server, the cp will use to send mails
$CONFIG['smtp_port']		=	'25';			// the smtp server port
$CONFIG['smtp_mail']		=	'gamemaster@youremail.com';		// the email of the admin
$CONFIG['smtp_username']	=	'';			// the username of the smtp server
$CONFIG['smtp_password']	=	'';			// the password of the smtp server

//image configurations
$CONFIG['max_thumb_photo_size'] = 700; //Size (in Kb) in the maximum size of a place or event photo
$CONFIG['max_thumb_photo_width'] = 300; //Maximum width (in px) of a place or event photo
$CONFIG['max_thumb_photo_height'] = 300; //Maximum width (in px) of a place or event photo
$CONFIG['image_allowed_extensions'] = Array('jpg','jpeg','JPG','JPEG','gif','GIF'); //Supported file formats
$CONFIG['image_host'] = ''; //Path the pictures folder (can be internet site)

//DO NOT MESS WITH THIS
extract($CONFIG, EXTR_PREFIX_ALL, "CONFIG");
extract($_GET, EXTR_PREFIX_ALL, "GET");
extract($_POST, EXTR_PREFIX_ALL, "POST");
extract($_SERVER, EXTR_PREFIX_ALL, "SERVER");
// error_reporting(0);
?>
