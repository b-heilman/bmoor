bMoor.define('bmoor.core.SmartMapObserver', 
	['@undefined', 'bmoor.core.MapObserver', function( undefined, MapObserver ){

		function mapUpdate( update, value ){
			var key, 
				val,
				model = this.model;

			if ( bMoor.isString( update ) ){
				// TODO : this isn't entirely right
				this.updates[ update ] = bMoor.set( update, value, this.model );
			}else if ( bMoor.isObject(update) ){
				for( key in update ){
					if ( update.hasOwnProperty(key) ){
						mapUpdate.call( this, key, update[key] );
					}
				}
			}
		}

		function mapDelete( deletion ){
			var key, 
				val,
				model = this.model;

			if ( bMoor.isString( deletion ) ){
				// TODO : this isn't entirely right
				this.updates[ update ] = bMoor.del( deletion, this.model );
			}
		}

		return {
			parent : MapObserver,
			properties : {
				observe : function( map ){
					var dis = this;
					
					this.updates = {};

					MapObserver.prototype.observe.call( this, map );

					map.$set = function(){
						mapUpdate.apply( dis, arguments );
					};

					map.$delete = function(){
						mapDelete.apply( dis, arguments );
					};
				},
				check : function(){
					var dis = this,
						key,
						watch;

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

