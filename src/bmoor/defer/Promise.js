(function( undefined ){
	
	bMoor.define( 'bmoor.defer.Promise', {
		construct : function( defer ){
			this.defer = defer;
		},
		properties : {
			"then" :  function( callback, errback ){
				var defer = this.defer,
					sub = this.defer.sub(),
					tCallback,
					tErrback;

				tCallback = function( value ){
					try{
						sub.resolve( (callback||defer.defaultSuccess)(value) );
					}catch( ex ){
						sub.reject( ex );
						defer.handler( ex );
					}
				};

				tErrback = function( value ){
					try{
						sub.resolve( (errback||defer.defaultFailure)(value) );
					}catch( ex ){
						sub.reject( ex );
						defer.handler( ex );
					}
				};

				defer.register( tCallback, tErrback );

				return sub.promise;
			},
			"done": function(callback){
				this.then( callback );
				return this; // for chaining with the defer
			},
			"fail": function(callback){
				this.then( null, callback );
				return this; 
			},
			"always": function(callback){
				this['finally']( callback );
				return this;
			},
			"catch": function(callback) {
				return this.then(null, callback);
			},
			"finally": function(callback) {
				function makePromise(value, resolved) {
					var result = bmoor.defer.Basic();

					if (resolved) {
						result.resolve(value);
					} else {
						result.reject(value);
					}

					return result.promise;
				}

				function handleCallback(value, isResolved) {
					var callbackOutput = null;
					try {
						callbackOutput = (callback || dis.defaultSuccess)();
					} catch(e) {
						return makePromise(e, false);
					}

					if (callbackOutput && bMoor.isFunction(callbackOutput.then)) {
						return callbackOutput.then(
							function() {
								return makePromise(value, isResolved);
							}, 
							function(error) {
								return makePromise(error, false);
							}
						);
					} else {
						return makePromise(value, isResolved);
					}
				}

				return this.then(
					function(value) {
						return handleCallback(value, true);
					}, 
					function(error) {
						return handleCallback(error, false);
					}
				);
			}
		}
	});

}());
