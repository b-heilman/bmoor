(function( undefined ){
	"use strict";

	bMoor.make( 'bmoor.comm.Resource', {
		construct : function CommResource( src, async ){
			var dis = this;

			this.$defer = new bmoor.defer.Basic();
			this.promise = this.$defer.promise;

			(new bmoor.comm.Http({
				'method' : 'GET',
				'url' : src,
				'async' : async
			})).promise.then( 
				function resourceSuccess( response, status ){
					try{
						dis.status = 200;
						dis.success( dis.apply(response) );
					}catch( ex ){
						dis.status = 17003;
						dis.failure( ex );
					}
				},
				function resourceFailure( response, status, headers ){
					dis.status = status;
					dis.failure( response );
				}
			);
		},
		properties : {
			apply : function( content ){
				return content;
			},
			success : function( data ){
				this.status = this.status || 200;
				this.resolve( data );
			},
			failure : function( data ){
				this.status = this.status || 19129;
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