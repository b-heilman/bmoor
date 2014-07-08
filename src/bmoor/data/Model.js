bMoor.define( 'bmoor.data.Model', [function(){
	'use strict';

	function merge( from, to ){
		var key, f, t;

		// merge in the 'from'
		for( key in from ){
			if ( from.hasOwnProperty(key) ){
				f = from[key];
				t = to[key];

				if ( t === undefined ){
					to[key] = f;
				}else if ( bMoor.isArrayLike(f) ){
					if ( !bMoor.isArrayLike(t) ){
						t = to[key] = [];
					}

					arrayMerge( f, t );
				}else if ( bMoor.isObject(f) ){
					if ( !bMoor.isObject(t) ){
						t = to[key] = {};
					}

					merge( f, t );
				}else if ( f !== t ){
					to[key] = f;
				}
			}
		}

		// now we prune the 'to'
		for( key in to ){
			if ( to.hasOwnProperty(key) ){
				if ( from[key] === undefined ){
					delete to[key];
				}
			}
		}

		return to;
	}

	function arrayMerge( from, to ){
		var i, c,
			f,
			t;

		for( i = 0, c = from.length; i < c; i++ ){
			f = from[i];
			t = to[i];

			if ( t === undefined ){
				to[ i ] = f;
			} else if ( bMoor.isArrayLike(f) ){
				if ( !bMoor.isArrayLike(t) ){
					t = to[i] = [];
				}

				arrayMerge( f, t );
			} else if ( bMoor.isObject(f) ){
				if ( !bMoor.isObject(t) ){
					t = to[i] = {};
				}

				merge( f, t );
			} else if ( f !== t ){
				to[ i ] = f;
			}
		}

		for( i = c, c = to.length; i < c; i++ ){
			to.pop();
		}
	}

	return {
		_merge : function( from ){
			if ( bMoor.isArray(from) ){
				arrayMerge( from, this );
			}else{
				merge( from, this );
			}

			return this;
		},
		_validate : function(){ 
			return null; 
		},
		_inflate : function( content ){
			return content;
		},
		_deflate : function(){
			return this; 
		},
		_update : function( content ){
			this._merge( content, this );
		},
		_simplify : function(){
			return this._deflate();
		},
		toJson : function(){
			return JSON.stringify( this._simplify() );
		}
	};
}]);

