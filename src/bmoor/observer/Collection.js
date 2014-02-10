;(function( $, global, undefined ){
	// TODO : allow traits, so I can pull in functionality from Model.js
	bMoor.constructor.mutate({
		name : 'Collection',
		namespace : ['snap','observer'],
		parent: ['snap','observer','Map'],
		construct : function( model ){
			var 
				dis = this;

			this['snap.observer.Map'].__construct.call( this, model );

			this.removals = [];

			// Need to inject so we can observe removals
			model.pop = function(){
				var t = Array.prototype.pop.call( this );

				if ( t.$markRemoval === undefined ){
					t.$markRemoval = dis.removals.length;
				}

				dis.removals.push( t );

				return t;
			};

			model.shift = function(){
				var t = Array.prototype.shift.call( this );

				if ( t.$markRemoval === undefined ){
					t.$markRemoval = dis.removals.length;
				}

				dis.removals.push( t );

				return t;
			};

			model.splice = function(){
				var 
					i,
					c,
					t = Array.prototype.splice.apply(this, arguments);

				for( i = 0, c = t.length; i < c; i++ ){
					if ( t[i].$markRemoval === undefined ){
						t[i].$markRemoval = dis.removals.length + i;
					}
				}

				dis.removals = dis.removals.concat( t );

				return t;
			};
		},
		properties : {
			remove : function( obj ){
				var index = this.find( obj );
				
				if ( index != -1 ){
					return this.model.splice( index, 1 )[0];
				}
			},
			find : function( obj, fromIndex ){
				var 
					i, 
					j,
					model = this.model;

				if ( model.indexOf ){
					return model.indexOf( obj, fromIndex );
				}else{
					if (fromIndex === null) {
						fromIndex = 0;
					} else if (fromIndex < 0) {
						fromIndex = Math.max(0, model.length + fromIndex);
					}

					for ( i = fromIndex, j = model.length; i < j; i++ ) {
						if ( model[i] === obj )
							return i;
					}

					return -1;
				}
			},
			_clean : function(){
				var
					i,
					val,
					key,
					list,
					model = this.model,
					changes = {},
					cleaned = this.cleaned,
					removals,
					moves = {};

				for( key in model ) if ( model.hasOwnProperty(key) && key[0] != '_' ){
					val = model[key];
					
					if ( typeof(val) == 'function' ){
						continue;
					} else {
						i = parseInt( key, 10 );

						if ( isNaN(i) ){
							if ( val != cleaned[key] ){
								changes[ key ] = true;
								cleaned[ key ] = val;
							}
						} else {
							// TODO : do i really want to do this?
							if ( !val._ ){
								new snap.observer.Map( val );
							}

							if ( val.$remove ){
								// allow for a model to force its own removal
								this.model.splice( i, 1 );
							}else if ( val._.index === undefined ){
								// new row added
								moves[ key ] = val;
							}else if ( val._.index != i ){
								moves[ key ] = val;
								if ( val.$markRemoval !== undefined ){
									this.removals[ val.$markRemoval ] = undefined;
									delete val.$markRemoval;
								}
							}
							
							val._.index = i;
						}
					}
				}

				changes.removals = this.removals;
				changes.moves = moves;

				this.removals = [];

				return changes;
			},
			_needNotify : function( changes ){
				var key;

				for( key in changes ) if ( changes.hasOwnProperty(key) ){
					if ( key == 'removals' ){
						if ( changes.removals.length ){
							return true;
						}
					}else if ( key == 'moves' ){
						if ( !$.isEmptyObject(changes.moves) ){
							return true;
						}
					}else{
						return true;
					}
				}

				return false;
			},
			_onBind : function( func ){
				// TODO : maybe change the list to play nice with the binding setting
				this.run( func, {binding:true, moves:this.model} );
			},
			run : function( func, changes ){
				func.call( this, changes );
			},
		}
	});
}( jQuery, this ));
