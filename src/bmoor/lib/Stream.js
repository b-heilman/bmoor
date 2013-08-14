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
		},
		properties : {
			// map : my var -> stream var
			// reverse : stream var -> my var
			bind : function( observer, map, reverse ){
				var 
					key,
					dis = this;

				if ( map ){
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
				}else{
					observer.bind(function( alterations ){
						var key;

						for( key in alterations ) if ( alterations.hasOwnProperty(key) ){
							dis.push( key, this.model[key] );
						}
					});
				}
				
				if ( reverse ){
					this._listeners.push(function( key, val ){
						var field = reverse[ key ];
						
						if ( field ) {
							observer.model[ field ] = val;
						}
					});
				}else{
					this._listeners.push(function( key, val ){
						observer.model[key] = val;
					});
				}
			},
			push : function( key, val ){
				var list, i, c;

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