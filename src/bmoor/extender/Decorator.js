bMoor.make('bmoor.extender.Decorator', [
	function(){
		'use strict';

		function override( key, target, action ){
			var old = target[key];
			
			if ( old === undefined ){
				target[key] = action;
			} else {
				if ( bMoor.isFunction(action) ){
					if ( bMoor.isFunction(old) ){
						target[key] = function(){
							var backup = this.$old,
								rtn;

							this.$old = old;

							rtn = action.apply( this, arguments );

							this.$old = backup;

							return rtn;
						};
					} else {
						console.log( 'attempting to decorate '+key+' an instance of '+typeof(old) );
					}
				}else{
					console.log( 'attempting to decorate with '+key+' and instance of '+typeof(action) );
				}
			}
		}

		return {
			abstract: true,
			properties : {
				_$extend : function( target ){
					var key;

					for( key in this ){
						if ( key.charAt(0) !== '_' || key.charAt(1) !== '$' ){
							override( key, target, this[key] );
						}
					}
				}
			}
		};
	}]
);