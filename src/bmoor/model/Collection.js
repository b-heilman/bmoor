;(function( global, undefined ){
	// TODO : allow traits, so I can pull in functionality from Model.js
	bMoor.constructor.mutate({
		name : 'Collection',
		parent : 'Array',
		namespace : ['bmoor','model'],
		decorators: [
			['bmoor','model','Mapped']
		],
		properties : {
			remove : function( obj ){
				var index = this.find( obj );
				
				if ( index != -1 ){
					this.splice( index, 1 );
				}
			},
			find : function( obj, fromIndex ){
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
			},
			pop : function(){
				this._.removals.push( this.__Array.pop.apply(this) );
			},
			shift : function(){
				this._.removals.push( this.__Array.shift.apply(this) );
			},
			splice : function( pos, length ){
				// keeping the removals for the next clean cycle
				this._.removals = this._.removals.concat( this.__Array.splice.apply(this, arguments) );
			}
		},
		noOverride : {
			_init : function( obj ){
				var 
					i, 
					c;

				this._.removals = [];
				
				for( i = 0, c = obj.length; i < c; i++ ){
					this.push( obj[i] );
				}
			},
			_clean : function(){
				var
					i,
					list,
					moves = {},
					changes = [],
					cleaned = this._.cleaned,
					removals,
					additions = [];

				for( i = 0, list = this._.cleanses, c = list.length; i < c; i++ ){ list[i].call( this ); }

				for( var key in this ) if ( this.hasOwnProperty(key) && key[0] != '_' ){
					var val = this[key];
					
					if ( typeof(val) == 'function' ){
						continue;
					} else {
						i = parseInt( key );

						if ( isNaN(i) ){
							if ( val != cleaned[key] ){
								changes.push( key );
								cleaned[key] = val;
							}
						} else {
							// part of the array
							if ( !val._ ){
								this[i] = val = new bmoor.model.Map( val );
							}

							if ( val._.remove ){
								// allow for a model to force its own removal
								this.splice( i, 1 );
							}else if ( val._.index == undefined ){
								// new row added
								additions.push( val );
								val._.root = this._.root; // direct all child models back up the chain
							}else if ( val._.index != i ){
								// indexed by where it was, moved to where it is
								moves[ val._.index ] = val;
							}
							
							val._.index = i;
						}
					}
				}

				removals = this._.removals ;
				this._.removals = [];

				changes.additions = additions;
				changes.removals = removals;
				changes.moves = moves;

				return changes;
			},
			_needNotify : function( changes ){
				return changes.length || changes.additions.length || changes.removals.length || changes.moves.length;
			},
			_onBind : function( func ){
				func.call( this, {binding:true, additions:this} );
			}
		}
	});
}( this ));