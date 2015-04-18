//  - 1.0.2
// https://github.com/subkit
// Copyright 2012 - 2015 http://subkit.io
// MIT License

!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Subkit=e():"undefined"!=typeof global?global.Subkit=e():"undefined"!=typeof self&&(self.Subkit=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(subkit, subscriptions, poll){
	'use strict';
	
	return function(){
		
		return {
			list: function(callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/events/streams';
				subkit.httpRequest.get(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			log: function(stream, callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/events/log/' + stream;

				subkit.httpRequest.get(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			remove: function(stream, callback){
                var deferred = subkit.$q.defer();
                var url = subkit.baseUrl + '/events/log/' + stream;
				subkit.httpRequest.del(url, subkit.options, function(status, result){
                    if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200 && status!==202 && status!==204) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
                return deferred.promise.nodeify(callback);
			},
			emit: function(stream, payload, persistent, metadata, callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/events/emit/' + stream;
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.data = payload;
				if(persistent) msg.headers['X-Subkit-Event-Persistent'] = true;
				if(metadata) msg.headers['X-Subkit-Event-Metadata'] = JSON.stringify(metadata);

				subkit.httpRequest.post(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200 && status !== 201 && status !== 202) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			on: function(stream, callback) {
				stream = stream.replace('/', '_');
				subscriptions[stream] = poll(stream, callback);
				return {
					off: function(){
						delete subscriptions[stream];
						if(subscriptions[stream]) subscriptions[stream]().abort();
					},
					emit: function(value, callback){
						subkit.events.emit(stream, value, callback);
					}
				};
			},
			off: function(stream){
				if(subscriptions[stream]) subscriptions[stream]().abort();
				delete subscriptions[stream];
                return false;	
			}
		};

	};
};
},{}],2:[function(require,module,exports){
module.exports = function(subkit){
	'use strict';
	
	return function(){

		return {
			login: function(callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/manage/login';
				subkit.httpRequest.authBasic(subkit.options.username, subkit.options.password);
				subkit.httpRequest.post(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else {
						subkit.options.apiKey = result.json().api.apiKey;
						deferred.resolve({
							apiKey: subkit.options.apiKey,
							username: subkit.options.username,
							password: subkit.options.password,
							baseUrl: subkit.baseUrl
						});
					}
				});
				return deferred.promise.nodeify(callback);
			},		
			import: function(file, callback){
				var deferred = subkit.$q.defer();
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.headers = {
				  'Content-Type': 'application/octed-stream'
				};
				msg.data = file;
				var url = subkit.baseUrl + '/manage/import';
				subkit.httpRequest.post(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 201) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			export: function(callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/manage/export';
				subkit.httpRequest.get(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else deferred.resolve('data:application/octet-stream,' + result.text());
				});
				return deferred.promise.nodeify(callback);
			},
			backup: function(callback){
				if(callback) callback();
			},
			restore: function(name, callback){
				if(callback) callback();
			},
			password: {
				set: function(oldPassword, newPassword, verifyPassword, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/password/action/reset';
					var msg = JSON.parse(JSON.stringify(subkit.options));
					msg.data = {
						password: oldPassword,
						newPassword: newPassword,
						newPasswordValidation: verifyPassword
					};
					subkit.httpRequest.put(url, msg, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				}
			},
			user: {
				set: function(username, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/user';
					var msg = JSON.parse(JSON.stringify(subkit.options));
					msg.data = {
						username: username
					};
					subkit.httpRequest.put(url, msg, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				}
			},
			apikey: {
				reset: function(callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/apikey/action/reset';
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				}
			},
			certificate:{
				get: function(callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/certificate';
					subkit.httpRequest.get(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				set: function(certificate, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/certificate/action/change';
					var msg = JSON.parse(JSON.stringify(subkit.options));
					msg.data = certificate;
					subkit.httpRequest.put(url, msg, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 201 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				}
			},
			status: {
				get: function(callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/os';
					subkit.httpRequest.get(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				kill: function(callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/kill';
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status!==202 && status!==204) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				}				
			},
			plugins: {
				list: function(callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/plugins';
					subkit.httpRequest.get(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				install: function(name,callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/plugins/' + name;
					subkit.httpRequest.post(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 201 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				update: function(name,callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/plugins/' + name;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status!==202 && status!==204) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},				
				uninstall: function(name,callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/plugins/' + name;
					subkit.httpRequest.del(url, subkit.options, function(status, result){
	                    if (status === 0) deferred.reject(new Error('No network connection.'));
	                    else if (status !== 200 && status!==202 && status!==204) deferred.reject(new Error(result.json().message));
	                    else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				}			 
			},
			permissions:{
				roles: function(callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/identities';
					subkit.httpRequest.get(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				list: function(identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + identity;
					subkit.httpRequest.get(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				set: function(key, callback){
					var deferred = subkit.$q.defer();				
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key);
					subkit.httpRequest.post(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 201 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				remove: function(key, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key);
					subkit.httpRequest.del(url, subkit.options, function(status, result){
	                    if (status === 0) deferred.reject(new Error('No network connection.'));
	                    else if (status !== 200 && status!==202 && status!==204) deferred.reject(new Error(result.json().message));
	                    else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				grantInsert: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/grantinsert/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				grantUpdate: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/grantupdate/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},			
				grantDelete: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/grantdelete/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				grantRead: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/grantread/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				revokeInsert: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/revokeinsert/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				revokeUpdate: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/revokeupdate/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},			
				revokeDelete: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/revokedelete/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				},
				revokeRead: function(key, identity, callback){
					var deferred = subkit.$q.defer();
					var url = subkit.baseUrl + '/manage/permissions/' + encodeURIComponent(key) + '/action/revokeread/' + identity;
					subkit.httpRequest.put(url, subkit.options, function(status, result){
						if (status === 0) deferred.reject(new Error('No network connection.'));
						else if (status !== 200 && status !== 202) deferred.reject(new Error(result.json().message));
						else deferred.resolve(result.json());
					});
					return deferred.promise.nodeify(callback);
				}
			}	
		};
	};
};
},{}],3:[function(require,module,exports){
module.exports = function(subkit, subscriptions, poll){
	'use strict';
	
	return function(store){
		var _prepareUrl = function(key){
			if(store && !key) return subkit.baseUrl + '/stores/' + store;
			if(store && key) return subkit.baseUrl + '/stores/' + store + '/' + key;
			if(!store && key && key.indexOf('!') !== -1) {
				key = key.replace(/^[a-zA-z0-9]\/\//, '!');
				return subkit.baseUrl + '/stores/' + key;
			}
			if(!store && key) return subkit.baseUrl + '/stores/' + key;
			return subkit.baseUrl + '/stores';
		};
		var _prepareParams = function(url, params){
			var queryString = '';
			for(var key in params){
				if(key === 'where') {
					var jsonFilter = JSON.stringify(params[key]);
					queryString += '&where=' + jsonFilter;
				} else {
					queryString += '&' + key + '=' + params[key];
				}
			}
			queryString = queryString.substring(1, queryString.length);
			return url + '?' + queryString;
		};

		var ref = {
			key: function(){
				return Subkit.UUID();
			},
			import: function(file, callback){
				var deferred = subkit.$q.defer();
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.headers = {
					'Content-Type': 'application/octed-stream',
					apiKey: config.apiKey
				};
				msg.data = file;
				var url = subkit.baseUrl + '/manage/import/' + store;
				subkit.httpRequest.post(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200 && status!==201 && status!==202) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			export: function(callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/manage/export/' + store;
				subkit.httpRequest.get(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200) deferred.reject(new Error(result.json().message));
                    else deferred.resolve('data:application/octet-stream,' + result.text());
				});
				return deferred.promise.nodeify(callback);
			},
			add: function(key, value, callback){
				var deferred = subkit.$q.defer();
				key = arguments[0];
				value = arguments[1];

				if(arguments.length === 1 && key instanceof Object){
					value = key;
					key = Subkit.UUID();
				}
				var url = _prepareUrl(key);
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.data = value;
				
				subkit.httpRequest.post(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status!==201) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
				
				return deferred.promise.nodeify(callback);
			},			
			set: function(key, value, version, callback){
				if(typeof version === 'function') {
					callback = version;
					version = undefined;
				}

				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/stores/' + store + '/' + key;
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.data = value;
				if(version) msg.headers['If-Match'] = version;	

				subkit.httpRequest.put(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200 && status!==202) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
				
				return deferred.promise.nodeify(callback);
			},			
			get: function(key, callback){
                var deferred = subkit.$q.defer();
				subkit.httpRequest.get(_prepareUrl(key), subkit.options, function(status, result){
                    if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
                return deferred.promise.nodeify(callback);
			},
			find: function(query, callback){
				var url = _prepareUrl(query.key);
				url = _prepareParams(url, query);
                var deferred = subkit.$q.defer();
				subkit.httpRequest.get(url, subkit.options, function(status, result){
                    if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
                return deferred.promise.nodeify(callback);
			},
			remove: function(key, version, callback){
				if(typeof version === 'function') {
					callback = version;
					version = undefined;
				}
				
                var deferred = subkit.$q.defer();
				var msg = JSON.parse(JSON.stringify(subkit.options));
                if(version) msg.headers['If-Match'] = version;

				subkit.httpRequest.del(_prepareUrl(key), msg, function(status, result){
                    if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200 && status!==202 && status!==204) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
                return deferred.promise.nodeify(callback);
			},
			log: function(callback){
                var deferred = subkit.$q.defer();
				subkit.httpRequest.get('', subkit.options, function(status, result){
                    if (status === 0) deferred.reject(new Error('No network connection.'));
                    else if (status !== 200) deferred.reject(new Error(result.json().message));
                    else deferred.resolve(result.json());
				});
                return deferred.promise.nodeify(callback);
			},
			on: function(callback){
				if(subscriptions[store]) subscriptions[store]().abort();
				subscriptions[store] = poll(store, callback);
                return true;	
			},
			off: function(){
				if(subscriptions[store]) subscriptions[store]().abort();
				delete subscriptions[store];
                return false;	
			}
		};
		return ref;
	};

};
},{}],4:[function(require,module,exports){
module.exports = function(subkit){
	'use strict';
	
	return function(){
		
		return {
			set: function(task, callback){
				var deferred = subkit.$q.defer();
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.data = task;
				var url = subkit.baseUrl + '/tasks/' + task.name;
				subkit.httpRequest.put(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200 && status !== 201 && status!==202) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},	
			get: function(taskName, callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/tasks/' + taskName;
				subkit.httpRequest.get(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			remove: function(taskName, callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/tasks/' + taskName;
				subkit.httpRequest.del(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200 && status!==202 && status!==204) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			list: function(callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/tasks';
				subkit.httpRequest.get(url, subkit.options, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			},
			runDebug: function(taskName, value, callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/tasks/api/' + taskName;
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.data = value;
				subkit.httpRequest.get(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else deferred.resolve({
						result: result.json(),
	                    raw: result.text(),
						headers: result.headers(),
	                    log: result.log()  
					});
				});
				return deferred.promise.nodeify(callback);
			},		
			run: function(taskName, value, callback){
				var deferred = subkit.$q.defer();
				var url = subkit.baseUrl + '/tasks/action/run/' + taskName;
				var msg = JSON.parse(JSON.stringify(subkit.options));
				msg.data = value;
				subkit.httpRequest.get(url, msg, function(status, result){
					if (status === 0) deferred.reject(new Error('No network connection.'));
					else if (status !== 200) deferred.reject(new Error(result.json().message));
					else deferred.resolve(result.json());
				});
				return deferred.promise.nodeify(callback);
			}	
		};
	};
};
},{}],5:[function(require,module,exports){
/** @module Subkit */

/**
* Subkit
* @param {object} config - A Subkit configuration
*/
var Subkit = function (config){
	'use strict';
	
	var self = this;
	var subscriptions = {};

	self.clientId = config.clientId || initClientId();
	self.baseUrl = config.baseUrl || ((window.location.origin.indexOf('http') !== -1) ? window.location.origin : 'https://localhost:8080');
    self.options = { 
    	apiKey: config.apiKey || '',
    	username: config.username || '',
    	password: config.password || '',
    	headers : {
    		'Content-Type': 'application/json'
    	}
    };	
	self.httpRequest = {
		authBasic: function (username, password) {
		  self.httpRequest.headers({});
		  ajax.headers['Authorization'] = 'Basic ' + base64(username + ':' + password);
		},
		connect: function (url, options, callback) {
		  return ajax('CONNECT', url, options, callback);      
		},
		del: function (url, options, callback) {
		  return ajax('DELETE', url, options, callback);      
		},
		get: function (url, options, callback) {
		  return ajax('GET', url, options, callback);
		},
		head: function (url, options, callback) {
		  return ajax('HEAD', url, options, callback);
		},
		headers: function (headers) {
		  ajax.headers = headers || {};
		},
		isAllowed: function (url, verb, callback) {
		  this.options(url, function (status, data) {
		    callback(data.text().indexOf(verb) !== -1);
		  });
		},
		options: function (url, options, callback) {
		  return ajax('OPTIONS', url, options, callback);
		},
		patch: function (url, options, callback) {
		  return ajax('PATCH', url, options, callback);      
		},
		post: function (url, options, callback) {
		  return ajax('POST', url, options, callback);      
		},
		put: function (url, options, callback) {
		  return ajax('PUT', url, options, callback);      
		},
		trace: function (url, options, callback) {
		  return ajax('TRACE', url, options, callback);
		}
	};

	self.$q = require('q');
	self.manage = require('./lib/manage')(self);
	self.tasks = require('./lib/tasks')(self);
	self.stores = require('./lib/stores')(self, subscriptions, poll);
	self.events = require('./lib/events')(self, subscriptions, poll);

	function getXhr(callback) {
		if (window.XMLHttpRequest) {
		  return callback(null, new XMLHttpRequest());
		} else if (window.ActiveXObject) {
		  try {
		    return callback(null, new ActiveXObject('Msxml2.XMLHTTP'));
		  } catch (e) {
		    return callback(null, new ActiveXObject('Microsoft.XMLHTTP'));
		  }
		}
		return callback(new Error());
	}
	function encodeUsingUrlEncoding(data) {
		if(typeof data === 'string') {
		  return data;
		}

		var result = [];
		for(var dataItem in data) {
		  if(data.hasOwnProperty(dataItem)) {
		    result.push(encodeURIComponent(dataItem) + '=' + encodeURIComponent(data[dataItem]));
		  }
		}

		return result.join('&');
	}
	function utf8(text) {
		text = text.replace(/\r\n/g, '\n');
		var result = '';

		for(var i = 0; i < text.length; i++) {
		  var c = text.charCodeAt(i);

		  if(c < 128) {
		      result += String.fromCharCode(c);
		  } else if((c > 127) && (c < 2048)) {
		      result += String.fromCharCode((c >> 6) | 192);
		      result += String.fromCharCode((c & 63) | 128);
		  } else {
		      result += String.fromCharCode((c >> 12) | 224);
		      result += String.fromCharCode(((c >> 6) & 63) | 128);
		      result += String.fromCharCode((c & 63) | 128);
		  }
		}

		return result;
	}
	function base64(text) {
		var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

		text = utf8(text);
		var result = '',
		    chr1, chr2, chr3,
		    enc1, enc2, enc3, enc4,
		    i = 0;

		do {
		  chr1 = text.charCodeAt(i++);
		  chr2 = text.charCodeAt(i++);
		  chr3 = text.charCodeAt(i++);

		  enc1 = chr1 >> 2;
		  enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		  enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		  enc4 = chr3 & 63;

		  if(isNaN(chr2)) {
		    enc3 = enc4 = 64;
		  } else if(isNaN(chr3)) {
		    enc4 = 64;
		  }

		  result +=
		    keyStr.charAt(enc1) +
		    keyStr.charAt(enc2) +
		    keyStr.charAt(enc3) +
		    keyStr.charAt(enc4);
		  chr1 = chr2 = chr3 = '';
		  enc1 = enc2 = enc3 = enc4 = '';
		} while(i < text.length);

		return result;
	}
	function mergeHeaders() {
		var result = arguments[0];
		for(var i = 1; i < arguments.length; i++) {
		  var currentHeaders = arguments[i];
		  for(var header in currentHeaders) {
		    if(currentHeaders.hasOwnProperty(header)) {
		      result[header] = currentHeaders[header];
		    }
		  }
		}
		return result;
	}
	function ajax(method, url, options, callback) {
		if(typeof options === 'function') {
		  callback = options;
		  options = {};
		}
		options.cache = options.cache || true;
		options.headers = options.headers || {};
		options.jsonp = options.jsonp || false;

		var headers = mergeHeaders({
		  'Accept': '*/*',
		  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
		  'X-Auth-Token': options.apiKey
		}, ajax.headers, options.headers);

		var payload;
		
		if(options.data) {
			if ((method === 'GET') && (headers['Content-Type'] === 'application/json')) {
			  	payload = encodeUsingUrlEncoding(options.data);
			} 
			else if (headers['Content-Type'] === 'application/json') {
				payload = JSON.stringify(options.data);
			} 
			else if(headers['Content-Type'].indexOf('application/octed-stream') !== -1){
			  	payload = options.data;
			}
			else {
			  	payload = encodeUsingUrlEncoding(options.data);      
			}
		}

		if(method === 'GET') {
		  var queryString = [];
		  if(payload) {
		    queryString.push(payload);
		    payload = null;
		  }

		  if(!options.cache) {
		    queryString.push('_=' + (new Date()).getTime());
		  }

		  if(options.jsonp) {
		    queryString.push('callback=' + options.jsonp);
		    queryString.push('jsonp=' + options.jsonp);
		  }

		  queryString = '?' + queryString.join('&');
		  url += queryString !== '?' ? queryString : '';

		  if(options.jsonp) {
		    var head = document.getElementsByTagName('head')[0];
		    var script = document.createElement('script');
		    script.type = 'text/javascript';
		    script.src = url;
		    head.appendChild(script);        
		    return;
		  }
		}
		var xhrRef = null;
		getXhr(function (err, xhr) {
		  xhrRef = xhr;
		  if(err) return callback(err);
		  xhr.open(method, url, options.async || true);
		  for(var header in headers) {
		    if(headers.hasOwnProperty(header)) {
		      xhr.setRequestHeader(header, headers[header]);
		    }
		  }
		  xhr.timeout = 240000;
    	  xhr.ontimeout = function (){
    	  	callback(0, {
				text: function () {
				  	return 'Connection timeout';
				},
				json: function(){
					return {message: 'Connection timeout'}
				}
			});
    	  }
		  xhr.onerror = function(){
			callback(xhr.status, {
				text: function () {
				  	return xhr.statusText;
				},
				json: function(){
					return {message: xhr.statusText}
				}
			});
		  };
		  xhr.onreadystatechange = function () {
		    if(xhr.readyState === 4 && xhr.status !== 0) {
				if(!callback) return;
				var data = xhr.responseText || '';
				callback(xhr.status, {
					text: function () {
					  return data;
					},
					json: function () {
						if(data) return JSON.parse(data);
						return {};
					},
					headers: function(){
 						return xhr.getAllResponseHeaders();
  					},
                    log: function(){
                        return xhr.getResponseHeader('subkit-log');
                    }
				});
		    }
		  };

		  xhr.send(payload);
		});
		return xhrRef;
	}
	function initClientId(){
		var clientId = window.sessionStorage.getItem('clientId');
		if(!clientId) {
			clientId = Subkit.UUID();
			window.sessionStorage.setItem('clientId', clientId);
		}
		return clientId;
	}
	function poll(stream, callback) {
		var subscribeUrl = self.baseUrl + '/events/bind/' + stream;
		var request = null;
		var count = 1;

		(function _pollRef(){
			request = self.httpRequest.get(subscribeUrl, self.options, function(status, result){
				if(status !== 200) {
					if(subscriptions[stream]){
						callback({message: 'subscription error - retry'});
						setTimeout(function(){_pollRef(stream, callback);},300*count++);
					}
				}else{
					count = 1;
					result.json().forEach(function(item){
						callback(null, item);
					});
					if(subscriptions[stream]) _pollRef(stream, callback);
				}
			});
		})();

		return function(){
			return request;
		};
	}
};

Subkit.UUID = function () {
	// http://www.ietf.org/rfc/rfc4122.txt
	var s = [];
	var hexDigits = '0123456789abcdef';
	for (var i = 0; i < 36; i++) {
	    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = '-';

	var uuid = s.join('');
	return uuid;
};

module.exports = Subkit
},{"./lib/events":1,"./lib/manage":2,"./lib/stores":3,"./lib/tasks":4,"q":7}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],7:[function(require,module,exports){
var process=require("__browserify_process");// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof self !== "undefined") {
        self.Q = definition();

    } else {
        throw new Error("This environment was not anticipated by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var pendingCount = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++pendingCount;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (pendingCount === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
    if (promises.length === 0) {
        return Q.resolve();
    }

    var deferred = Q.defer();
    var pendingCount = 0;
    array_reduce(promises, function(prev, current, index) {
        var promise = promises[index];

        pendingCount++;

        when(promise, onFulfilled, onRejected, onProgress);
        function onFulfilled(result) {
            deferred.resolve(result);
        }
        function onRejected() {
            pendingCount--;
            if (pendingCount === 0) {
                deferred.reject(new Error(
                    "Can't get fulfillment value from any promise, all " +
                    "promises were rejected."
                ));
            }
        }
        function onProgress(progress) {
            deferred.notify({
                index: index,
                value: progress
            });
        }
    }, undefined);

    return deferred.promise;
}

Promise.prototype.any = function() {
    return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

},{"__browserify_process":6}],8:[function(require,module,exports){
'use strict';

var Subkit = require('Subkit');
module.exports = Subkit;

angular
  .module('subkit', [])
  .value('Subkit', Subkit);

angular
  .module('subkit')
  .factory('angularSubkit', function($rootScope) {
    return function(ref, name, initial) {
      var ask = new AngularSubkit(ref);
      return ask.associate($rootScope, name, initial);
    };
  });

var AngularSubkit = function(ref) {
  if (typeof ref == 'string') throw new Error('Please provide a Subkit reference instead of a URL, eg: new Subkit(url)');
  this._fRef = ref;
};

AngularSubkit.prototype = {
  associate: function($rootScope, name, initial) {
    var self = this;
    if(!$rootScope[name]) $rootScope[name] = initial;
    
    var storeRef = this._fRef.stores(name);
    storeRef
      .get()
      .done(function(data){
        $rootScope[name] = data.results;
        $rootScope.$apply();
      });

    storeRef.on(function(error, data) {
      if(error) return console.log(error);
      if(initial instanceof Array){
        if(data.$metadata.type === 'put') {
          var map = $rootScope[name].map(function(itm){ return itm.$key; });
          var itmIdx = map.indexOf(data.$metadata.key);
          if(itmIdx!==-1) {
            $rootScope[name][itmIdx].$metadata = data.$metadata;
            $rootScope[name][itmIdx].$payload = data.$payload;
          }
          else $rootScope[name].unshift(data);
        }
        if(data.$metadata.type === 'del') {
          var map = $rootScope[name].map(function(itm){ return itm.$key; });
          var itmIdx = map.indexOf(data.$metadata.key);
          if(itmIdx !== -1) $rootScope[name].splice(itmIdx, 1);
        }
      } else if(initial instanceof Object){
        $rootScope[name] = data;
      }
      $rootScope.$apply();
    });

    return storeRef;
  },
  disassociate: function(name) {
    var self = this;
    this._fRef.off(name);
  },
  _log: function(msg) {
    if (console && console.log) {
      console.log(msg);
    }
  }
};
},{"Subkit":5}]},{},[8])
(8)
});
;