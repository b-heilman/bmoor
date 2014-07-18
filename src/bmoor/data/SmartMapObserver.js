bMoor.make('bmoor.data.SmartMapObserver', 
	['@undefined', 'bmoor.data.MapObserver', function( undefined, MapObserver ){
		'use strict';

		function mapUpdate( observer, update, value ){
			var key;

			if ( bMoor.isString( update ) ){
				observer.updates[ update ] = bMoor.set( update, value, observer.model );
			}else if ( bMoor.isObject(update) ){
				for( key in update ){
					if ( update.hasOwnProperty(key) ){
						mapUpdate( observer, key, update[key] );
					}
				}
			}
		}

		function mapDelete( observer, deletion ){
			if ( bMoor.isString( deletion ) ){
				observer.updates[ deletion ] = bMoor.del( deletion, observer.model );
			}
		}

		return {
			parent : MapObserver,
			construct : function SmartMapObserver(){
				MapObserver.apply( this, arguments );
			},
			properties : {
				observe : function( map ){
					var dis = this;
					
					this.updates = {};

					MapObserver.prototype.observe.call( this, map );

					map.$set = function( update, value ){
						mapUpdate( dis, update, value );
					};

					map.$delete = function( deletion ){
						mapDelete( dis, deletion );
					};
				},
				check : function(){
					var dis = this;

					bMoor.iterate( this.updates, function( oValue, path ){
						var i, c,
							watch = dis.watching[ path ],
							val;

						if ( watch ){
							val = dis.evaluate( path );

							for( i = 0, c = watch.calls.length; i < c; i++ ){
								watch.calls[ i ]( val, oValue );
							}
						}
					});

					this.updates = {};
				}
			}
		};
	}]
);

