;(function( global, undefined ){
	var snapid = 0;

	bMoor.constructor.define({
		name : 'Map',
		namespace : ['bmoor','model'],
		construct : function( obj ){
			this._ = {
				snapid : snapid++,
				cleaned : {},
				listeners : [],
				cleanses : [],
				interval : null
			};
			
			if ( obj ){
				for( var key in obj ) if ( obj.hasOwnProperty(key) ){
					this[key] = obj[key];
				}
			}

			this._start();
		},
		properties : {
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
					list,
					i,
					c,
					val,
					change = false,
					cleaned = this._.cleaned;
				
				for( i = 0, list = this._.cleanses, c = list.length; i < c; i++ ){ list[i].call( this ); }
			
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
					
					dis._flush( {start:true} );

					this._.interval = setInterval(function(){ dis._flush( {} ); }, 50);
				}
				
				return this;
			},
			_stop : function(){
				if ( this._.cleanse ){
					clearInterval( this._.cleanse.interval );
					this._.cleanse.interval = null;
				}
				
				clearInterval( this._.interval );
				this._.interval = null;
				
				this._flush( {stop:true} );

				return this;
			},
			_flush : function( settings ){
				if ( this._clean() ){
					this._notify( settings );
				}
			},
			// TODO : this is unneccisary
			_call : function( func ){
				func.call( this );

				return this;
			},
			_bind : function( func, noFlush ){
				if ( typeof(func) == 'function' ){
					this._.listeners.push( func );
				}else if ( func ) {
					if ( func.update ){ 
						func = func.update; 
						this._.listeners.push( func.update ); 
					}
					if ( func.cleanse ){ this._.cleanses.push( func.cleanse ); }
				}
				
				// if we are running, then we should make a call back
				if ( func && this._.interval && !noFlush ){
					func.call( this, {binding:true} );
				}
				
				return this;
			},
			_notify : function( settings ){
				var
					list,
					i,
					c;

				for( i = 0, list = this._.listeners, c = list.length; i < c; i++ ){ list[i].call( this, settings ); }
				
				return this;
			}
		}
	});
}( this ));