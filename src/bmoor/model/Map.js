;(function( global, undefined ){
	bMoor.constructor.define({
		name : 'Map',
		namespace : ['bmoor','model'],
		construct : function( obj, cleanser, cleanseInterval ){
			this._old = {};
			this._listeners = [];
			this._interval = null;
			this._cleanse = cleanser 
				? { cleanser : cleanser, timeout : (cleanseInterval ? cleanseInterval : 5), interval : null }
				: null;
			
			if ( obj ){
				for( var key in obj ) if ( obj.hasOwnProperty(key) ){
					this.key = obj[key];
				}
			}
		},
		properties : {
			_stop : function(){
				this._notify(); // one last update, make sure all is flushed
				
				if ( this._cleanse ){
					clearInterval( this._cleanse.interval );
					this._cleanse.interval = null;
				}
				
				clearInterval( this._interval );
				this._interval = null;
				
				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				if ( !this._interval ){
					for( var key in this ) if ( this.hasOwnProperty(key) ){
						this._old[key] = this[key];
					}
				
					if ( this._cleanse ){
						this._cleanse.interval = setInterval( function(){
							dis._cleanse.cleanser( dis );
						}, this._cleanse.timeout );
					}
					
					this._interval = setInterval(function(){ dis._flush(); }, 50);
				}
				
				return this;
			},
			_flush : function(){
				var
					notify = false,
					old = this._old;
				
				if ( this._cleanse ){
					this._cleanse.cleanser( this );
				}
			
				for( var key in this ) if ( this.hasOwnProperty(key) && key[0] != '_' ){
					if ( this[key] != old[key] ){
						notify = true;
						old[key] = this[key];
					}
				}
				
				if ( notify ){
					this._notify();
				}
			},
			_bind : function( target ){
				if ( typeof(target) == 'function' ){
					target = { modelUpdate : target }; // convert
				}
				
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