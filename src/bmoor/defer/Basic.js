(function( undefined ){
	function _then( callback, errback ){
		var dis = this,
			sub = this.sub(),
			tCallback,
			tErrback;

		tCallback = function( value ){
			try{
				sub.resolve( (callback||dis.defaultSuccess)(value) );
			}catch( ex ){
				sub.reject( ex );
				dis.handler( ex );
			}
		};

		tErrback = function( value ){
			try{
				sub.resolve( (errback||dis.defaultFailure)(value) );
			}catch( ex ){
				sub.reject( ex );
				dis.handler( ex );
			}
		};

		if ( this.value ){
			this.value.then( tCallback, tErrback );
		}else{
			this.callbacks.push( [tCallback, tErrback] );
		}

		return sub.promise;
	}

	function resolution( value ){
		if ( value && value.then ) return value;
		return {
			then: function ResolutionPromise( callback ){
				if ( bMoor.isArrayLike(value) && value.$inject ){
					callback.apply( undefined, value );
				}else{
					callback( value );
				}
			}
		};
	}

	function rejection( reason ){
		return {
			then : function RejectionPromise( callback, errback ){
				errback( reason );
			}
		};
	}

	bMoor.define({
		name : 'bmoor.defer.Basic',
		construct : function( exceptionHandler ){
			this.handler = exceptionHandler || this.defaultHandler;
			this.callbacks = [];
			this.value = null;
			this.init();
		},
		properties : {
			defaultHandler : function( ex ){ bMoor.error(ex); },
			defaultSuccess : function( value ){ return value; },
			defaultFailure : function( message ){ return undefined; },
			init : function(){
				var dis = this;

				this.promise = {
					then :  function BasicPromise( callback, errback ){
						return _then.call( dis, callback, errback );
					}
				};
			},
			resolve : function( value ){
				var callbacks,
					cbSet,
					i,
					c;

				if ( this.callbacks ){
					callbacks = this.callbacks;
					this.callbacks = null;
					this.value = resolution( value );

					for( i = 0, c = callbacks.length; i < c; i++ ){
						cbSet = callbacks[i];
						this.value.then( cbSet[0], cbSet[1] );
					}
				}
			},
			reject : function( reason ){
				this.resolve( rejection(reason) );
			},
			sub : function(){
				return new bmoor.defer.Basic( this.handler );
			}
		}
	});
}());
