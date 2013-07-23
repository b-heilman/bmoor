;(function( global, undefined ){
	var snapid = 0;

	bMoor.constructor.define({
		name : 'Map',
		namespace : ['bmoor','model'],
		construct : function( obj, cleanser, cleanseInterval ){
			this._ = {
				snapid : snapid++,
				cleaned : {},
				listeners : [],
				interval : null,
				cleanse : ( cleanser 
					? { cleanser : cleanser, timeout : (cleanseInterval ? cleanseInterval : 5), interval : null }
					: null
				)
			};
			
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
			_simplify : function(){
				var simple = {};

				// TODO : what about models inside of models?
				for( var key in this ) if ( this.hasOwnProperty(key) && key[0] != '_' ){
					val = this[ key ];

					if ( typeof(val) == 'function' ){
						val = this[ key ]();
					}

					simple[ key ] = val;
				}

				return simple
			},
			_clean : function(){
				var
					val,
					change = false,
					cleaned = this._.cleaned;
				
				if ( this._.cleanse ){
					this._.cleanse.cleanser( this );
				}
			
				for( var key in this ) if ( this.hasOwnProperty(key) && key[0] != '_' ){
					val = this[key];

					if ( typeof(val) == 'function' ){
						continue;
					}else{
						if ( val != cleaned[key] ){
							change = true;
							cleaned[key] = val;
						}
					}
				}

				return change;
			},
			_start : function(){
				var 
					dis = this,
					val;
				
				if ( !this._.interval ){
					this._clean();
					
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
				if ( this._clean() ){
					this._notify();
				}
			},
			// TODO : this is unneccisary
			_call : function( func ){
				func.call( this );

				return this;
			},
			_bind : function( func, noFlush ){
				this._.listeners.push( func );
				
				// if we are running, then we should make a call back
				if ( this._.interval && !noFlush ){
					func.call( this );
				}
				
				return this;
			},
			_notify : function(){
				for( var i = 0, list = this._.listeners; i < list.length; i++ ){
					// this._old will be the last cleaned and parsed data for the model
					list[i].call( this );
				}
				
				return this;
			}
		}
	});
}( this ));