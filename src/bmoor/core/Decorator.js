bMoor.define( 'bmoor.core.Decorator', [function(){
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

	return {
		onMake : function(){
			var inst = this,
				t = new inst();

			inst.$wrap = function Decoration( obj ){
				var key;
				
				for( key in t ){
					if ( key === '_construct' ){
						continue;
					}else if ( obj[key] ){
						// the default override is post
						override( key, obj, t[key] );
					}else{
						obj[key] = t[key];
					}
				}
			};
		}
	};
}]);