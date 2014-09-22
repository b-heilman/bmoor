bMoor.define('bmock.comm.Http', 
	['bmoor.defer.Basic',
	function( Basic ){
		var lastRequest = null,
			expecting = [];

		function MockConnector( request ){
			var t,
				r = new Basic();

			if ( expecting.length ){
				lastRequest = null;

				t = expecting.shift();

				expect( request.url ).toBe( t.url );

				r.resolve({
					data : t.data,
					code : t.code || 200
				});
			}else{
				lastRequest = r;
			}

			return r.promise;
		}

		MockConnector.clear = function(){
			expecting = [];
		};

		MockConnector.expect = function( url, code, content ){
			expecting.push({
				url : url,
				code : code,
				data : content
			});
		};

		MockConnector.hasNoOutstandingRequests = function(){
			return lastRequest === null;
		};

		MockConnector.hasMetExpectations = function(){
			return expecting.length === 0;
		};

		MockConnector.respond = function( content ){
			lastRequest.resolve({
				code : 200,
				data : content
			});
		};

		MockConnector.reject = function( code, content ){
			lastRequest.reject({
				code : code,
				response : content
			});
		};

		return MockConnector;
	}]
);