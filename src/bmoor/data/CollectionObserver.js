bMoor.make('bmoor.data.CollectionObserver',
	['bmoor.data.MapObserver',
	function( MapObserver ){
		'use strict';
		
		return {
			parent : MapObserver,
			construct : function CollectionObserver(){
				MapObserver.apply( this, arguments );
			},
			properties : {
				observe : function( collection ){
					var i, c,
						val;
					
					this._old = [];
					this.watches = [];
					
					for( i = 0, c = collection.length; i < c; i++ ){
						val = collection[ i ];

						// do some autoboxing here
						if( bMoor.isString(val) ){
							// i need this so is passes by reference and not value
							val = new String( val ); // jshint ignore:line
						}

						this._old[ i ] = collection[ i ] = val;
					}

					MapObserver.prototype.observe.call( this, collection );
				},
				watchChanges : function( func ){
					this.watches.push( func );
				},
				check : function(){
					var dis = this;
					
					if ( this.active && !this.checking ){
						MapObserver.prototype.check.call( this );
						
						this.checking = true;
						this.changes = this.checkChanges();
						
						if ( this._needNotify(this.changes) ){
							bMoor.loop( this.watches, function( f ){
								f( dis.changes );
							});
						}
						this.checking = false;
					}
				}, 
				checkChanges : function(){
					var i, c,
						val,
						model = this.model,
						old = this._old,
						insert = {},
						change = {},
						remove = {};

					/* 
					TODO : bring this back in
					if ( val.$remove ){
						// allow for a model to force its own removal
						this.model.splice( i, 1 );
					}
					*/
					for( i = 0, c = old.length; i < c; i++ ) {
						old[i]._pos = i;
						remove[ i ] = old[ i ];
					}

					for( i = 0, c = model.length; i < c; i++ ) {
						val = model[ i ];

						if ( val._pos === undefined ){
							insert[ i ] = model[ i ];
						}else{
							delete remove[ val._pos ];
							if ( val._pos !== i ){
								change[ i ] = val._pos;
							}
						}
					}

					// clean up the old data
					old.length = model.length;
					for( i in insert ){
						val = insert[ i ];

						if ( bMoor.isString(val) ){
							val = new String( val ); // jshint ignore:line
							insert[ i ] = model[ i ] = val; 
						}

						old[ i ] = val;
					}

					for( i = 0, c = model.length; i < c; i++ ) {
						delete model[ i ]._pos;
						old[ i ] = model[ i ];
					}

					return {
						moves : change,
						inserts : insert,
						removals : remove
					};
				},
				_needNotify : function( changes ){
					return !bMoor.isEmpty( changes.moves ) ||
						!bMoor.isEmpty( changes.inserts ) ||
						!bMoor.isEmpty( changes.removals );
				}
			}
		};
	}]
);

