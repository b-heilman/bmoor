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

	bMoor.define( 'bmoor.core.Decorator', {
		onMake : function(){
			var inst = this,
				t = new inst();

			inst.$decorate = function Decoration( obj ){
				t.$decorate( obj );
			};
		},
		properties : {
			$decorate : function( obj ){
				var key;
				
				for( key in this ){
					if ( key === '_construct' || key === '$decorate' ){
						// 
						continue;
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