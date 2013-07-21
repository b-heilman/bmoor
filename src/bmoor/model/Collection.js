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
				old       : this.slice(0)
			}; 
			
			this._.old._ = this._; // circular reference, but needed
			
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

				this._interval = null;
				
				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				
				if ( !this._.interval ){
					dis._run();

					this._.interval = setInterval(function(){
						dis._run();
					}, 50);
				}
				
				return this;
			},
			_run: function(){
				var
					moves = {},
					removals = this._.old,
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
				
				this._.old = this.slice(0);
				
				if ( dirty ){
					this._notify( { additions : additions, removals : removals, moves : moves } );
				}
			},
			_bind : function( func, noFlush ){
				this._.listeners.push( func );
				
				if ( this._.interval && !noFlush ){
					func.call( this._.old, { additions : this._.old } );
				}
			},
			_notify : function( changes ){
				for( var i = 0, list = this._.listeners; i < list.length; i++ ){
					list[i].call( this._.old, changes );
				}
				
				return this;
			}
		}
	});
}( this ));