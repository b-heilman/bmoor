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
					dis.apply( response.data );
					dis.success();
				},
				function resourceFailure(){ 
					dis.failure();
				}
			);
		},
		properties : {
			apply : function( content ){},
			success : function(){
				this.status = 200;
				this.resolve();
			},
			failure : function(){
				this.status = 404;
				this.resolve();
			},
			resolve : function(){
				if ( this.status === 200 ){
					this.$defer.resolve();
				}else{
					this.$defer.reject();
				}
			}
		}
	});

}());