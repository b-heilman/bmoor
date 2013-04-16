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
		},
		publics : {
			_stop : function(){
				clearInterval( this._interval );
			},
			_start : function(){
				var 
					dis = this;
				
				this._interval = setInterval(function(){
					var
						notify = false,
						old = dis._old;
					
					for( var key in dis ) if ( dis.hasOwnProperty(key) && key[0] != '_' ){
						if ( dis[key] != old[key] ){
							notify = true;
							old[key] = dis[key];
						}
					}
					
					if ( notify ){
						dis._notify();
					}
				}, 50);
			},
			_bind : function( target ){
				if ( target.notify ){
					this._listeners.push( target );
					target.notify( this._getModel() );
					
					return this;
				}else throw 'to call _bind, object must have notify() as attribute';
			},
			_notify : function(){
				for( var i = 0, list = this._listeners, model = this._getModel(); i < list.length; i++ ){
					list[i].notify( model );
				}
			},
			_getModel : function(){
				var
					obj = {};
				
				for( var key in this ) if ( this.hasOwnProperty(key) && key[0] != '_' ){
					obj[key] = this[key];
				}
				
				return obj;
			}
		}
	});
}( this ));