;(function( global, undefined ){
	var uuid = 0;

	bMoor.constructor.define({
		name : 'Map',
		namespace : ['bmoor','model'],
		construct : function( obj, cleanser, cleanseInterval ){
			this._ = {
				old : {},
				uuid : uuid++,
				listeners : [],
				interval : null,
				cleanse : ( cleanser 
					? { cleanser : cleanser, timeout : (cleanseInterval ? cleanseInterval : 5), interval : null }
					: null
				)
			};
			
			this._.old._ = this._; // circular reference, but needed

			if ( obj ){
				for( var key in obj ) if ( obj.hasOwnProperty(key) ){
					this[key] = obj[key];
				}
			}
			
			this._start();
		},
		properties : {
			_stop : function(){
				if ( this._.cleanse ){
					clearInterval( this._.cleanse.interval );
					this._.cleanse.interval = null;
				}
				
				clearInterval( this._.interval );
				this._.interval = null;
				
				return this;
			},
			_start : function(){
				var 
					dis = this;
				
				if ( !this._.interval ){
					for( var key in this ) if ( this.hasOwnProperty(key) && key[0] != '_' ){
						this._.old[key] = this[key];
					}
					
					if ( this._.cleanse ){
						this._.cleanse.interval = setInterval( function(){
							dis._.cleanse.cleanser( dis );
						}, this._.cleanse.timeout );
					}
					
					this._.interval = setInterval(function(){ dis._flush(); }, 50);
				}
				
				return this;
			},
			_flush : function(){
				var
					notify = false,
					old = this._.old;
				
				if ( this._.cleanse ){
					this._.cleanse.cleanser( this );
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
			_call : function( func ){
				func.call( this._.old );

				return this;
			},
			_bind : function( func, noFlush ){
				this._.listeners.push( func );
				
				// if we are running, then we should make a call back
				if ( this._.interval && !noFlush ){
					func.call( this._.old );
				}
				
				return this;
			},
			_notify : function(){
				for( var i = 0, list = this._.listeners; i < list.length; i++ ){
					// this._old will be the last cleaned and parsed data for the model
					list[i].call( this._.old );
				}
				
				return this;
			}
		}
	});
}( this ));