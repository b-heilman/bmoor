(function( undefined ){

	bMoor.define( 'bmoor.comm.Require', {
		singleton : true,
		properties : {
			forceSync : false,
			one : function( requirement, async, alias ){
				var req;

				req = bMoor.exists(requirement);

				if ( !req ){
					req = new bmoor.comm.Script( 
						alias || bMoor.ns.locate(requirement)+'.js', 
						this.forceSync ? false : async 
					);

					if ( async === false ){
						return bMoor.exists( requirement );
					}else{
						return req.$defer.promise.then(function(){
							var t = bMoor.exists( requirement );
							
							if ( t.$defer ){
								return t.$defer.promise;
							}else{
								return t;
							}
						});
					}
				}else{
					if ( async === false ){
						return req;
					}else{
						if ( req.$defer ) {
							return req.$defer.promise;
						}else{
							return bMoor.dwrap( req );
						}
					}
				}
			},
			hash : function( aliases ){
				var key,
					group = bmoor.defer.Group();

				for( key in aliases ){
					group.add( this.one(key,true,aliases[key]) );
				}

				group.run();
			},
			list : function( requirements ){
				var i, c,
					group = bmoor.defer.Group();

				for( i = 0, c = requirements.length; i < c; i++ ){
					group.add( this.one(requirements[i]) );
				}
			}
		},
		plugins : {
			'require' : function( require, alias ){
				var el;

				this.forceSync = true;
				el = this.one( require, false, alias );
				this.forceSync = false;

				return el;
			}
		}
	});

}());
