;(function( global, undefined ){
	bMoor.constructor.define({
		name : 'Model',
		namespace : ['bmoor'],
		construct : function( obj ){
			this._old = {};
			this._listeners = [];
			this._interval = null;
			
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
				this._interval = null;
				
				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				if ( !this._interval ){
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
				}
				
				return this;
			},
			_bind : function( target ){
				if ( target.modelUpdate ){
					this._listeners.push( target );
					target.modelUpdate();
					
					return this;
				}else throw 'to call _bind, object must have modelUpdate() as attribute';
			},
			_notify : function(){
				for( var i = 0, list = this._listeners; i < list.length; i++ ){
					list[i].modelUpdate();
				}
				
				return this;
			}
		}
	});
}( this ));