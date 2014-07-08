bMoor.make( 'bmoor.core.Decorator', [function(){
	'use strict';

	function override( key, el, action ){
		var 
			type = typeof(action),
			old = el[key];
		
		if (  bMoor.isFunction(type) ){
			el[key] = function(){
				var backup = this._wrapped,
					rtn;

				this.$wrapped = old;

				rtn = action.apply( this, arguments );

				this.$wrapped = backup;

				return rtn;
			};
		}else if ( bMoor.isString(type) ){
			// for now, I am just going to append the strings with a white space between...
			el[key] += ' ' + action;
		}
	}

	return {
		construct : function Decorator(){},
		onMake : function(){
			var Inst = this,
				t = new Inst();

			Inst.$wrap = function Decoration( obj ){
				var key;
				
				for( key in t ){
					// TODO : do I still need this, isn't it an artifact?
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