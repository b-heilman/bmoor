bMoor.define( "bmoor.core.Model", [function(){
	function merge( from, to ){
		var key, f, t;

		// merge in the 'from'
		for( key in from ){
			if ( from.hasOwnProperty(key) ){
				f = from[key];
				t = to[key];

				if ( t === undefined ){
					to[key] = f;
				}else if ( angular.isArray(f) ){
					if ( !angular.isArray(t) ){
						t = to[key] = [];
					}

					arrayMerge( f, t );
				}else if ( angular.isObject(f) ){
					if ( !angular.isObject(t) ){
						t = to[key] = {};
					}

					merge( f, t );
				}else if ( f != t ){
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
			}else if ( angular.isObject(f) ){
				if ( !angular.isObject(t) ){
					t = to[i] = {};
				}

				merge( f, t );
			}else if ( angular.isArray(f) ){
				if ( !anguar.isArray(t) ){
					t = to[i] = [];
				}

				arrayMerge( f, t );
			}else if ( f !== t ){
				to[ i ] = f;
			}
		}

		for( i = c, c = to.length; i < c; i++ ){
			to.pop();
		}
	}

	return {
		parent : 'bmoor.model.Trait',
		properties : {
			merge : function( from ){
				if ( bMoor.isArray(from) ){
					arrayMerge( from, this );
				}else{
					merge( from, this );
				}

				return this;
			},
			validate : function(){ 
				return this.null; 
			},
			inflate : function( obj ){
				return obj;
			},
			deflate : function(){
				return this.$wrapped(); 
			},
			update : function( content ){
				this.merge( content, this );
			},
			simplify : function(){
				var key,
                    content = {};

				this._deflate();

				for( key in this ){
					if ( this.hasOwnProperty(key) && key.charAt(0) !== '&' ){
						content[ key ] = this[ key ];
					}
				}

				return content;
			},
			
			toJson : function(){
				return JSON.stringify( this.simplify() );
			}
		}
	};
}]);

