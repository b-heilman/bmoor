bMoor.make( 'bmoor.defer.Stack', [function(){
	'use strict';
	
	function stackOn( stack, func, args ){
		return stack.promise.then(function(){
			return func.apply( {}, args || [] );
		});
	}

	return {
		construct : function(){
			this.promise = null;
		},
		properties : {
			getPromise : function(){
				return this.promise;
			},
			isStacked : function(){
				return this.promise !== null;
			},
            // TODO: there is a bug in here, when a controller uses multiple it will break.
            // -- highly unlikely, but noted
			begin : function(){
				this.promise = null;
			},
			run : function( func ){
				if ( !this.promise ){
					func();
				}else{
					this.promise['finally']( func );
				}
			},
			add : function( func, args ){
				if ( this.promise ){
					this.promise = stackOn( this, func, args );
				}else{
					this.promise = func.apply( {}, args );
					if ( !this.promise.then ){
						this.promise = null;
					}
				}

				return this.promise;
			}
		}
	};
}]);