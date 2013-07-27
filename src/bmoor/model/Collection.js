;(function( global, undefined ){
	// TODO : allow traits, so I can pull in functionality from Model.js
	bMoor.constructor.define({
		name : 'Collection',
		parent : 'Array',
		namespace : ['bmoor','model'],
		require: [
			['bmoor','model','Map']
		],
		construct : function( obj ){
			this._ = {
				// place to put variables that should be ignored
				listeners : [],
				interval  : null,
				cleaned   : this.slice(0)
			}; 
			
			if ( obj ){
				for( var i = 0, c = obj.length; i < c; i++ ){
					this.push( obj[i] );
				}
			}
			
			this._start();
		},
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
			_stop : function(){
				clearInterval( this._.interval );
				this._.interval = null;
				
				this._flush( {stop:true} );

				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				
				if ( !this._.interval ){
					dis._flush( {start:true} );

					this._.interval = setInterval(function(){
						dis._flush( {} );
					}, 50);
				}
				
				return this;
			},
			_flush : function( settings ){
				var
					moves = {},
					removals = this._.cleaned,
					dirty = ( this.length != removals.length ),
					additions = {};
				
				for( var i = this.length - 1; i >= 0; i-- ){
					var t = this[i];
					
					if ( !t._ ){
						this[i] = t = new bmoor.model.Map( t );
					}

					if ( t._.remove ){
						// allow for a model to force its own removal
						this.splice( i, 1 );
						dirty = true;

						continue;
					}else if ( t._.index == undefined ){
						additions[ i ] = t;
						removals.splice( i, 1 );
						dirty = true;
					}else if ( t._.index != i ){
						moves[ i ] = t;
						removals.splice( i, 1 );
						dirty = true;
					}else if ( i == t._.index ){
						removals.splice( i, 1 );
					}else{
						dirty = true;
					}
					
					t._.index = i;
				}
				
				this._.cleaned = this.slice(0);
				
				if ( dirty ){
					settings.additions = additions;
					settings.removals = removals;
					settings.moves = moves;

					this._notify( settings );
				}
			},
			_bind : function( func, noFlush ){
				if ( typeof(func) == 'function' ){
					this._.listeners.push( func );
				}else if ( func ) {
					if ( func.update ){ 
						func = func.update; 
						this._.listeners.push( func.update );
					}
					if ( func.cleanse ){ /* nothing here now */ }
				}
				
				if ( func && this._.interval && !noFlush ){
					func.call( this._.cleaned, {binding:true, additions:this._.cleaned} );
				}
			},
			_notify : function( changes ){
				for( var i = 0, list = this._.listeners; i < list.length; i++ ){
					list[i].call( this._.cleaned, changes );
				}
				
				return this;
			}
		}
	});
}( this ));