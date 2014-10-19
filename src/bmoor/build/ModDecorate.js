bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';
	
	function override( key, el, action ){
		var old = el[key];
		
		if (  bMoor.isFunction(action) ){
			el[key] = function(){
				var backup = this._wrapped,
					rtn;

				this.$wrapped = old;

				rtn = action.apply( this, arguments );

				this.$wrapped = backup;

				return rtn;
			};
		}else if ( bMoor.isString(action) ){
			// for now, I am just going to append the strings with a white space between...
			el[key] += ' ' + action;
		}
	}

	compiler.addModule( 9, 'bmoor.build.ModDecorate', 
		['-decorators', function( decorators ){
			var proto = this.prototype;

			if ( decorators ){
				if ( !bMoor.isArray( decorators ) ){
					throw 'the decoration list must be an array';
				}
				
				bMoor.loop( decorators, function( Dec ){
					var t,
						key;

					if ( bMoor.isFunction(Dec) ){
						t = new Dec( proto );
					}else{
						t = Dec;
					}

					for( key in t ){
						// TODO : do I still need this, isn't it an artifact?
						if ( proto[key] ){
							// the default override is post
							override( key, proto, t[key] );
						}else{
							proto[key] = t[key];
						}
					}
				});
			}
		}]
	);
}]);