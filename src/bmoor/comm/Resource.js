(function( undefined ){
	"use strict";

	bMoor.define({
		name : 'bmoor.comm.Resource',
		construct : function( src, async ){
			var dis = this;

			this.$defer = new bmoor.defer.Basic();

			(new bmoor.comm.Http({
				'method' : 'GET',
				'url' : src,
				'async' : async
			})).$defer.promise.then( 
				function resourceSuccess( response ){
					try{
						dis.success( dis.apply(response) );
					}catch( ex ){
						dis.failure( ex );
					}
				},
				function resourceFailure(){
					dis.failure();
				}
			);
		},
		properties : {
			apply : function( content ){
				return content;
			},
			success : function( data ){
				this.status = 200;
				this.resolve( data );
			},
			failure : function( data ){
				this.status = 404;
				this.resolve( data );
			},
			resolve : function( data ){
				if ( this.status === 200 ){
					this.$defer.resolve({
						data : data,
						status : this.status,
						headers : undefined
					});
				}else{
					this.$defer.reject({
						data : data,
						status : this.status,
						headers : undefined
					});
				}
			}
		}
	});

}());