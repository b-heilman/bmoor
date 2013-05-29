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
					this[key] = obj[key];
				}
			}
			
			this._start();
		},
		properties : {
			_stop : function(){
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
					for( var key in this ) if ( this.hasOwnProperty(key) && key[0] != '_' ){
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
			_bind : function( func ){
				this._listeners.push( func );
				
				// if we are running, then we should make a call back
				if ( this._interval ){
					func.call( this._old );
				}
				
				return this;
			},
			_notify : function(){
				for( var i = 0, list = this._listeners; i < list.length; i++ ){
					// this._old will be the last cleaned and parsed data for the model
					list[i].call( this._old );
				}
				
				return this;
			}
		}
	});
}( this ));