bMoor.define('bmoor.core.CollectionObserver', 
[function(){
	return {
		parent : 'bmoor.core.MapObserver',
		construct : function( collection ){
			this['bmoor.core.MapObserver']._construct.call( this, collection );

			// I want to add code to grab elements that are removed
			this.removals = [];
			this.watches = [];
			this.changes = {
				moves : [],
				removals : []
			};
			this._wrapCollection( collection )
		},
		properties : {
			_wrapCollection : function( collection ){
				var dis = this;
				
				collection.pop = function(){
					var t = Array.prototype.pop.call( this );

					if ( t.$markRemoval === undefined ){
						t.$markRemoval = dis.removals.length;
					}

					dis.removals.push( t );

					return t;
				};

				collection.shift = function(){
					var t = Array.prototype.shift.call( this );

					if ( t.$markRemoval === undefined ){
						t.$markRemoval = dis.removals.length;
					}

					dis.removals.push( t );

					return t;
				};

				collection.splice = function(){
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
			watchChanges : function( func ){
				this.watches.push( func );
			},
			check : function(){
				var i, c,
					dis = this;
				
				if ( !this.checking ){
					this['bmoor.core.MapObserver'].check.call( this );
					
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

				for( key in model ) {
					if ( model.hasOwnProperty(key) && key[0] !== '_' ){
						val = model[key];
						
						if ( typeof(val) == 'function' ){
							continue;
						} else {
							i = parseInt( key, 10 );

							if ( !isNaN(i) ){
								// TODO : do i really want to do this?
								if ( !val._co ){
									val._co = {};
								}

								if ( val.$remove ){
									// allow for a model to force its own removal
									this.model.splice( i, 1 );
								}else if ( val._co.index === undefined ){
									// new row added
									moves[ key ] = val;
								}else if ( val._co.index != i ){
									moves[ key ] = val;
									if ( val.$markRemoval !== undefined ){
										this.removals[ val.$markRemoval ] = undefined;
										delete val.$markRemoval;
									}
								}
								
								val._co.index = i;
							}
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

				for( key in changes ) {
					if ( changes.hasOwnProperty(key) ){
						if ( key == 'removals' ){
							if ( changes.removals.length ){
								return true;
							}
						}else if ( key == 'moves' ){
							if ( !bMoor.isEmpty(changes.moves) ){
								return true;
							}
						}else{
							return true;
						}
					}
				}

				return false;
			}
		}
	};
}]);

