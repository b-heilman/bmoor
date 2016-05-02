bMoor.make( 'bmoor.defer.Stack', [
	'bmoor.defer.Basic',
	function( Defer ){
		'use strict';
		
		return {
			construct : function(){
				this.active = null;
				this.defer = new Defer();
				this.promise = this.defer.promise;
			},
			properties : {
				run : function(){
					var dis = this;

					this.active.then(
						function( v ){
							dis.defer.resolve( v );
						},
						function( v ){
							dis.defer.reject( v );
						}
					);
				},
				add : function( func, args, ctx ){
					var dis = this;

					if ( this.active ){
						this.active = this.active.then(
							function(){
								return func.apply( ctx, args );
							},
							function( v ){
								dis.defer.reject( v );
							}
						);
					}else{
						this.active = bMoor.dwrap( func.apply(ctx,args) );
					}

					return this;
				}
			}
		};
	}]
);