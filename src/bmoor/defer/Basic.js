(function( undefined ){
	
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
			var dis = this;
			this.handler = exceptionHandler || this.defaultHandler;
			this.callbacks = [];
			this.value = null;
			this.promise = new bmoor.defer.Promise( this );
		},
		properties : {
			defaultHandler : function( ex ){ bMoor.error(ex); },
			defaultSuccess : function( value ){ return value; },
			defaultFailure : function( message ){ return undefined; },
			register : function( callback, failure ){
				if ( this.value ){
					this.value.then( callback, failure );
				}else{
					this.callbacks.push( [callback, failure] );
				}
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
