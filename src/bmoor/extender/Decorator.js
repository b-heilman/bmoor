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
							var backup = this.$wrapped,
								rtn;

							this.$wrapped = old;

							rtn = action.apply( this, arguments );

							this.$wrapped = backup;

							return rtn;
						};
					} else {
						throw 'attempting to decorate '+key+' an instance of '+typeof(old);
					}
				}else{
					throw 'attempting to decorate with '+key+' and instance of '+typeof(action);
				}
			}
		}

		return {
			construct : function Decorator(){
				throw 'You neex to extend Decorator, no instaniating it directly';
			},
			properties : {
				_extend : function( target ){
					var key;

					for( key in this ){
						if ( key.charAt(0) !== '_' ){
							override( key, target, this[key] );
						}
					}
				}
			}
		};
	}]
);