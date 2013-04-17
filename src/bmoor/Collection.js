;(function( global, undefined ){
	// TODO : allow traits, so I can pull in functionality from Model.js
	bMoor.constructor.define({
		name : 'Collection',
		parent : 'Array',
		namespace : ['bmoor'],
		construct : function( obj ){
			this._old;
			this._listeners = [];
			this._interval = null;
			
			if ( obj ){
				for( var i = 0, c = obj.length; i < c; i++ ){
					this.push( obj[i] );
				}
			}
			
			this._old = this.length;
		},
		publics : {
			_stop : function(){
				clearInterval( this._interval );
				this._interval = null;
				
				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				if ( !this._interval ){
					this._interval = setInterval(function(){
						if ( dis._old != dis.length ){
							dis._old = dis.length;
							dis._notify();
						}
					}, 50);
				}
				
				return this;
			},
			_bind : function( target ){
				if ( target.collectionUpdate ){
					this._listeners.push( target );
					target.collectionUpdate();
					
					return this;
				}else throw 'to call _bind, object must have collectionUpdate() as attribute';
			},
			_notify : function(){
				for( var i = 0, list = this._listeners; i < list.length; i++ ){
					list[i].collectionUpdate();
				}
				
				return this;
			}
		}
	});
}( this ));