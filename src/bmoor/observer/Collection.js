;(function( global, undefined ){
	// TODO : allow traits, so I can pull in functionality from Model.js
	bMoor.constructor.mutate({
		name : 'Collection',
		namespace : ['bmoor','observer'],
		parent: ['bmoor','observer','Map'],
		construct : function( model ){
			var 
				dis = this,
				old = {};

			this.__Map.__construct.call( this, model );

			this.removals = [];

			// TODO : is this the best way to do this?
			model.remove = function( obj ){
				var index = this.find( obj );
				
				if ( index != -1 ){
					this.splice( index, 1 );
				}
			};

			model.find = function( obj, fromIndex ){
				if ( this.indexOf ){
					return this.indexOf( obj, fromIndex );
				}else{
					if (fromIndex == null) {
						fromIndex = 0;
					} else if (fromIndex < 0) {
						fromIndex = Math.max(0, this.length + fromIndex);
					}

					for (var i = fromIndex, j = this.length; i < j; i++) {
						if (this[i] === obj)
							return i;
					}

					return -1;
				}
			};

			// keeping the removals for the next clean cycle
			model.pop = function(){
				dis.removals.push( Array.prototype.pop.call(this) );
			};

			model.shift = function(){
				dis.removals.push( Array.prototype.shift.call(this) );
			};

			model.splice = function(){
				dis.removals = dis.removals.concat( Array.prototype.splice.apply(this, arguments) );
			};
		},
		properties : {
			_clean : function(){
				var
					i,
					list,
					model = this.model,
					moves = {},
					changes = {},
					cleaned = this.cleaned,
					removals,
					additions = [];

				for( var key in model ) if ( model.hasOwnProperty(key) && key[0] != '_' ){
					var val = model[key];
					
					if ( typeof(val) == 'function' ){
						continue;
					} else {
						i = parseInt( key );

						if ( isNaN(i) ){
							if ( val != cleaned[key] ){
								changes[ key ] = true;
								cleaned[ key ] = val;
							}
						} else {
							// TODO : do i really want to do this?
							if ( !val._ ){
								new bmoor.observer.Map( val );
							}

							if ( val.$remove ){
								// allow for a model to force its own removal
								this.model.splice( i, 1 );
							}else if ( val._.index == undefined ){
								// new row added
								additions.push( val );
							}else if ( val._.index != i ){
								// indexed by where it was, moved to where it is
								moves[ val._.index ] = val;
							}
							
							val._.index = i;
						}
					}
				}

				removals = this.removals ;
				this.removals = [];

				changes.additions = additions;
				changes.removals = removals;
				changes.moves = moves;

				return changes;
			},
			_needNotify : function( changes ){
				var key;

				for( key in changes ) if ( changes.hasOwnProperty(key) ){
					if ( key == 'additions' ){
						if ( changes.additions.length ){
							return true;
						}
					}else if ( key == 'removals' ){
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
				this.run( func, {binding:true, additions:this.model} );
			},
			run : function( func, changes ){
				func.call( this, changes );
			},
		}
	});
}( this ));