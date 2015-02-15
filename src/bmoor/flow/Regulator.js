bMoor.make('bmoor.flow.Regulator', 
	[ 'bmoor.flow.Timeout',
	function( Timeout ){
		'use strict';
		
		return {
			construct : function( timeout ){
				var dis = this;

				this.cb = null;
				this.timeout = timeout || 30;
				this.timeoutId = null;
				this.onTimeout = function(){
					dis.timeoutId = null;
					dis.cb();
				};
			},
			properties : {
				wrap : function( ctx, cb, readjust ){
					var dis = this;

					if ( !bMoor.isFunction(cb) ){
						readjust = cb;
						cb = ctx;
						ctx = false;
					}

					if ( ctx ){
						return function(){
							dis.setContextual( ctx, cb, readjust );
						};
					}else{
						return function( cb ){
							dis.set( cb, readjust );
						};
					}
				},
				setup : function( readjust, contextual ){
					var dis = this;

					if ( contextual ){
						return function( ctx, cb ){
							dis.setContextual( ctx, cb, readjust );
						};
					}else{
						return function( cb ){
							dis.set( cb, readjust );
						};
					}
				},
				set : function( cb, readjust ){
					this.registerCall( readjust );

					this.cb = cb;
				},
				setContextual : function( ctx, cb, readjust ){
					this.registerCall( readjust );

					this.cb = function(){ cb.call(ctx); };
				},
				registerCall : function( readjust ){
					if ( readjust ){
						Timeout.clear( this.timeoutId );

						this.timeoutId = Timeout.set(this.onTimeout, this.timeout);
					}else if ( !this.timeoutId ){
						this.timeoutId = Timeout.set(this.onTimeout, this.timeout);
					}
				}
			}
		};
	}]
);