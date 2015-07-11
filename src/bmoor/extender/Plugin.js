bMoor.make('bmoor.extender.Plugin', [
	function(){
		'use strict';

		function override( key, target, plugin ){
			var action = plugin[key],
				old = target[key];
			
			if ( old === undefined ){
				if ( bMoor.isFunction(action) ){
					target[key] = function(){
						return action.apply( plugin, arguments );
					};
				} else {
					target[key] = action;
				}
			} else {
				if ( bMoor.isFunction(action) ){
					if ( bMoor.isFunction(old) ){
						target[key] = function(){
							var backup = plugin.$old,
								reference = plugin.$target,
								rtn;

							plugin.$target = target;
							plugin.$old = function(){
								return old.apply( target, arguments );
							};

							rtn = action.apply( plugin, arguments );

							plugin.$old = backup;
							plugin.$target = reference;

							return rtn;
						};
					}else{
						console.log( 'attempting to plug-n-play '+key+' an instance of '+typeof(old) );
					}
				}else{
					console.log( 'attempting to plug-n-play with '+key+' and instance of '+typeof(action) );
				}
			}
		}

		return {
			construct : function Plugin(){
				throw 'You neex to extend Plugin, no instaniating it directly';
			},
			properties : {
				_$extend : function( target ){
					var key;

					if ( this._$onExtend ){
						this._$onExtend( target );
					}

					for( key in this ){
						if ( key.charAt(0) !== '_' || key.charAt(1) !== '$' ){
							override( key, target, this );
						}
					}
				}
			}
		};
	}]
);