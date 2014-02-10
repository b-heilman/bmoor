(function(){

	/***
	- FuncName
		-- Setup
		- massage : takes in arguments passed in, allows for modification of data object
		- validation : validated data object being sent, can reject via throw
		-- Connect
		- responseType
		- url : function or string
		- request : use this to send the request rather than the http object (returns defer) 
		- http : the connection object to send
		- headers
		- cached : defaults to false
		- method : get,post
		-- Response
		- success : handles unchanged results
		- failure : handles unchanged results
		- process : modifies results in either case (shorthand), changes response
	***/

	var cache = {};

	function makeServiceCall( service, options ){
		var success,
			failure;

		if ( options.success ){
			success = function serviceSuccess(){
				return options.success.apply( service, arguments );
			};
		} 

		if ( options.failure ){
			failure = function serviceFailure(){
				return options.failure.apply( service, arguments );
			};
		}

		return function(){
			var args = arguments,
				r,
				http,
				url,
				content,
				response;

			if ( bMoor.isString(options) ){
				options = {
					url : options
				};
			}
			// data setup
			if ( options.massage ){
				args[ args.length - 1 ] = options.massage.apply( service, args );
			}

			if ( !options.validation || options.validation.apply(service,args) ){
				// make the request
				url = bMoor.isFunction( options.url ) ? options.url.apply( service, args ) : options.url;

				if ( !options.cached || !cache[url] ){
					// respond
					content = args[ args.length - 1 ];

					if ( options.request ){
						response = new bmoor.defer.Basic();

						r = [
							options.request.call( service,content ),
							200
						];
						r.$inject = true;
						response.resolve( r );

						response = response.promise;
					}else{
						http = bMoor.get( options.http || 'bmoor.comm.Http' );
						response = ( 
								new http({
									url : url,
									headers : options.headers,
									method : options.type || 'GET',
									responseType : options.responseType
								}) 
							).$defer.promise;
					}

					if ( options.cached ){
						cache[ url ] = response;
					}
				}else{
					response = cache[ url ];
				}
			}

			return response.then( success, failure );
		};
	}

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 10, 'bmoor.build.ModServices', ['services', function( services ){
			var dis = this;

			bMoor.iterate( services, function( service, name ){
				dis.prototype[name] = makeServiceCall( dis, service );
			});
		}]);
	});

}());
