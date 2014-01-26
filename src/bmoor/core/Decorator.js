(function( bMoor ){

	function override( key, el, action ){
		var 
			type = typeof(action),
			old = el[key];
		
		if (  type == 'function' ){
			el[key] = function(){
				var backup = this._wrapped,
					rtn;

				this.$wrapped = old;

				rtn = action.apply( this, arguments );

				this.$wrapped = backup;

				return rtn;
			};
		}else if ( type == 'string' ){
			// for now, I am just going to append the strings with a white space between...
			el[key] += ' ' + action;
		}
	}

	bMoor.define({
		name : 'bmoor.core.Decorator',
		postMake : function( inst ){
			inst.$singleton = new inst();
		},
		properties : {
			$decorate : function( obj ){
				var key;
				
				for( key in this ){
					if ( key === '_construct' || key === '$decorate' ){
						// 
						continue;
					}else if ( key === '__construct' ){
						// the default override is post
						override( '_construct', obj, this[key] );
					}else if ( obj[key] ){
						// the default override is post
						override( key, obj, this[key] );
					}else{
						obj[key] = this[key];
					}
				}
			}
		}
	});

}( this.bMoor ));