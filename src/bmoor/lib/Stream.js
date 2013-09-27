;(function( global, undefined ){
	bMoor.constructor.factory({
		name : 'Stream',
		namespace : ['bmoor','lib'],
		require : {
			classes : [ 
				['bmoor','observer','Map'],
			]
		},
		factory : function( stream, defintion ){
			if ( !this[stream] ){
				this[stream] = new defintion();
			}

			return this[stream];
		},
		construct : function(){
			this._listeners = [];
			this._data = {};
		},
		properties : {
			// map : my var -> stream var, or a function
			// reverse : stream var -> my var, or a function
			bind : function( observer, map, reverse ){
				var 
					key,
					dis = this;

				// registers anything going from the observer into the stream
				if ( map ){
					if ( typeof(map) == 'function' ){
						// this is impossible, they really meant reverse
						reverse = map;
					}else{
						// flip the map inside out
						if ( !reverse ){
							reverse = {};
							for( key in map ){
								reverse[ map[key] ] = key;
							}
						}

						observer.bind(function( alterations ){
							var key;

							for( key in alterations ) if ( alterations.hasOwnProperty(key) ){
								if ( map[key] ) {
									dis.push( map[key], this.model[key] );
								}
							}
						});
					}
				}else{
					observer.bind(function( alterations ){
						var key;

						for( key in alterations ) if ( alterations.hasOwnProperty(key) ){
							dis.push( key, this.model[key] );
						}
					});
				}
				
				// registers anything going from the stream into the observer
				if ( reverse ){
					if ( typeof(reverse) == 'function' ){
						this._listeners.push( reverse );
					}else{
						this._listeners.push(function( key, val ){
							var field = reverse[ key ];
							
							if ( field ) {
								observer.model[ field ] = val;
							}
						});
					}
				}else{
					this._listeners.push(function( key, val ){
						observer.model[key] = val;
					});
				}
			},
			pull : function(){
				var 
					t = {},
					key;

				for( key in this._data ){
					t[ key ] = this._data[ key ];
				}

				return t;
			},
			push : function( key, val ){
				var list, i, c;

				// snap shot of the current state
				this._data[ key ] = val;

				if ( arguments.length == 2 ){
					for( i = 0, list = this._listeners, c = list.length; i < c; i++ ){
						list[i]( key, val );
					}
				}else{
					for( i in key ){
						this.push( i, key[i] );
					}
				}
			}
		}
	});
}( this ));