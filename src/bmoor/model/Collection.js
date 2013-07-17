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
			this._listeners = [];
			this._interval = null;
			
			if ( obj ){
				for( var i = 0, c = obj.length; i < c; i++ ){
					this.push( obj[i] );
				}
			}
			
			this._old = this.slice(0);

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
				clearInterval( this._interval );

				this._interval = null;
				
				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				
				if ( !this._interval ){
					dis._run();

					this._interval = setInterval(function(){
						dis._run();
					}, 50);
				}
				
				return this;
			},
			_run: function(){
				var
					moves = {},
					removals = this._old,
					dirty = ( this.length != removals.length ),
					additions = {};
				
				for( var i = this.length - 1; i >= 0; i-- ){
					var t = this[i];
					
					if ( t._remove ){
						// allow for a model to force its own removal
						this.splice( i, 1 );
						dirty = true;

						continue;
					}else if ( t._index == undefined ){
						if ( !t._bind ){ // this isn't a model, make it one
							// I assume it should be a map
							t = new bmoor.model.Map( t );
						}

						this[i] = additions[ i ] = t;
						removals.splice( i, 1 );
						dirty = true;
					}else if ( t._index != i ){
						moves[ i ] = t;
						removals.splice( i, 1 );
						dirty = true;
					}else if ( i == t._index ){
						removals.splice( i, 1 );
					}else{
						dirty = true;
					}
					
					t._index = i;
				}
				
				this._old = this.slice(0);
				
				if ( dirty ){
					this._notify( { additions : additions, removals : removals, moves : moves } );
				}
			},
			_bind : function( func, noFlush ){
				this._listeners.push( func );
				
				if ( this._interval && !noFlush ){
					func.call( this._old, { additions : this._old } );
				}
			},
			_notify : function( changes ){
				for( var i = 0, list = this._listeners; i < list.length; i++ ){
					list[i].call( this._old, changes );
				}
				
				return this;
			}
		}
	});
}( this ));