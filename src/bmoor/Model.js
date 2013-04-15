;(function( global, undefined ){
	bMoor.constructor.define({
		name : 'Model',
		namespace : ['bmoor'],
		construct : function( obj ){
			this._old = {};
			this._listeners = [];
			this._interval;
			
			if ( obj ){
				for( var key in obj ) if ( obj.hasOwnProperty(key) ){
					this.key = obj[key];
					this._old[key] = obj[key];
				}
			}
			
			this._monitor();
		},
		publics : {
			_stop : function(){
				clearInterval( this._interval );
			},
			_monitor : function(){
				var 
					dis = this;
				
				this._interval = setInterval(function(){
					for( var key in this ) if ( obj.hasOwnProperty(key) && key[0] != '_' ){
						if ( dis[key] != dis._old[key] ){
							dis._notify();
							break;
						}
					}
				}, 50);
			},
			_bind : function( target ){
				this._listeners.push( target );
			},
			_notify : function(){
			}
		}
	});
}( this ));