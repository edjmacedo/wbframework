var service = window.service || {};

var BASE_URL = '';


var URLS = {};

service = {
	getBaseUrl: function() {
		return BASE_URL;
	},
	getUrl: function(id) {
		return BASE_URL + URLS[id];
	},
	call: function(url, method, ssl, params, success, error, makeCache, isXML) {
		var instance = this;
		if (ssl) {
			url = url.replace('http', 'https');
		}
	
		if (typeof isXML === 'undefined') {
			isXML = false;
		}
		var sparams = instance.serialize(params, "&");
		url += (/\/$/.test(url) || sparams.length === 0) ? sparams: '?' + sparams;
	
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		} catch(e) {
		}
		var request = new XMLHttpRequest();
		var timeRequest = 20000;
		var requestDone = false,
		isOut = false;
		setTimeout(function() {
			if (requestDone == false) {
				isOut = true;
				error.apply(instance, []);
				return;
			}
		},
		timeRequest);
		try {
			request.open(method, url, true);
			request.onreadystatechange = function() {
				try {
					if (request.readyState == 4) {
						requestDone = true;
						if (request.status === 0 || (request.status >= 200 && request.status <= 206) || request.status === 304) {
							if (request.responseText === '') {
								if (error) {
									error.apply(instance, []);
								}
								return;
							}
							var data = isXML ? (request.responseXML !== null ? request.responseXML: request.responseText) : eval('(' + request.responseText + ')');
							if (makeCache && data) {

							}
							if (success) {
								if (typeof(data.status) != 'undefined' && typeof(data.status.code) != 'undefined' && ((data.status.code < 200 || data.status.code > 206) && data.status.code !== 304))
									error.apply(instance, []);
								else
									success.apply(instance, [data]);
							}
						}
						else {
							if (error && isOut == false) {
								error.apply(instance, []);
							}
						}
					}
				} catch(e) {
					if (error && isOut == false) {
						error.apply(instance, []);
					}
				}
			};
			if (!isXML) {
				request.setRequestHeader('Accept', 'application/json');
				request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
			}
			request.send('');
		} catch(er) {
			if (error && isOut == false) {
				error.apply(instance, []);
			}
		}
	},

	serialize: function(hash, glue) {
		var str = [];
		for (var i in hash) {
			str.push(i + "=" + escape(hash[i]));
		}
		str.sort();
		return str.join(glue || " ");
	}
};
window.service = service;
