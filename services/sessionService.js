var sessionService = window.sessionService || {};

var BASE_SESSION_URL = service.getBaseUrl();

var SESSION_URLS = {
	'login'  : 'login.php',	
	'logout' : 'logout.php'
};

sessionService = {
	getUrlSession: function(id) {
		return BASE_SESSION_URL + SESSION_URLS[id];
	},
	getLogin: function(data,successCallback, errorCallback) {
		var url = sessionService.getUrlSession('login');
		service.call(url, 'GET', false, data, successCallback, errorCallback, false, false);
	},
	getLogout: function(successCallback, errorCallback) {
		var url = sessionService.getUrlSession('logout');
		service.call(url, 'GET', false, {},successCallback, errorCallback, false, false);
	},	
};
window.sessionService = sessionService;
