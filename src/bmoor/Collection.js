;(function( global, undefined ){
	// TODO : allow traits, so I can pull in functionality from Model.js
	bMoor.constructor.define({
		name : 'Collection',
		parent : 'Array',
		namespace : ['bmoor'],
		require: [
			['bmoor','Model']
		],
		construct : function( obj ){
			this._listeners = [];
			this._interval = null;
			this._attributes = new bmoor.Model();
			
			if ( obj ){
				for( var i = 0, c = obj.length; i < c; i++ ){
					var t = obj[i];
					
					t.__bmoor = i;
					this.push( t );
				}
			}
			
			this._old = this.slice(0);
		},
		publics : {
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
				this._attributes._stop();
				
				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				this._attributes._start();
				
				if ( !this._interval ){
					this._interval = setInterval(function(){
						var
							dirty = false,
							additions = [],
							changes = dis._old;
						
						for( var i = dis.length - 1; i >= 0; i-- ){
							var t = dis[i];
							
							if ( t.__bmoor == undefined ){
								additions.push( i );
								dirty = true;
							}else if ( t.__bmoor != i ){
								changes[ t.__bmoor ] = i;
								dirty = true;
							}else if ( i == t.__bmoor ){
								changes.splice( i );
							}else{
								dirty = true;
							}
							
							t.__bmoor = i;
						}
						
						if ( dirty ){
							dis._notify( { additions : additions, changes : changes } );
						}
						
						dis._old = dis.slice(0);
					}, 50);
				}
				
				return this;
			},
			_bind : function( target ){
				if ( target.collectionUpdate ){
					this._listeners.push( target );
					target.collectionUpdate( null );
					
					return this;
				}else throw 'to call _bind, object must have collectionUpdate() as attribute';
			},
			_notify : function( changes ){
				for( var i = 0, list = this._listeners; i < list.length; i++ ){
					list[i].collectionUpdate( changes );
				}
				
				return this;
			}
		}
	});
}( this ));