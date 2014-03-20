bMoor.define( 'bmoor.comm.Require', function(){

	function translate( arr, root ){
		var r,
			key,
			requirement,
			group = new bmoor.defer.Group();

		for( key in arr ){
			requirement = arr[ key ];

			if ( requirement.charAt(0) === '>' ){
				requirement = requirement.substr( 1 ).split( '>' );

				arr[ key ] = '-'+requirement[0];

				group.add(this.get(
					requirement[0],
					true,
					requirement[1]
				));
			}
		}

		group.run();

		return group.promise.then(function(){
			return bMoor.translate( arr );
		});
	}

	function inject( arr, root, context ){
		var i, c,
			func,
			res;

		if ( bMoor.isFunction(arr) ){
			func = arr;
			arr = [];
		}else if ( bMoor.isArray(arr) ){
			arr = arr.slice( 0 );
			func = arr.pop();
		}else{
			throw 'inject needs arr to be either Array or Function';
		}

		return translate.call( this, arr, root ).then(function( args ){
			return bMoor.request( args ).then(function(){
				return func.apply( context, args );
			});
		});
	}

	return {
		singleton : true,
		properties : {
			forceSync : false,
			get : function( requirement, async, alias ){
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
						return req.$.promise.then(function(){
							var t = bMoor.exists( requirement );
							
							if ( t.$.defer ){
								return t.$.promise;
							}else{
								return t;
							}
						});
					}
				}else{
					if ( async === false ){
						return req;
					}else{
						if ( req.$.defer ) {
							return req.$.promise;
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
					group.add( this.get(key,true,aliases[key]) );
				}

				group.run();
			},
			list : function( requirements ){
				var i, c,
					group = bmoor.defer.Group();

				for( i = 0, c = requirements.length; i < c; i++ ){
					group.add( this.get(requirements[i]) );
				}

				group.run();
			}
		},
		plugins : {
			'require' : function( require, alias ){
				var el;

				this.forceSync = true;
				el = this.get( require, false, alias );
				this.forceSync = false;

				return el;
			},
			'require.translate' : translate,
			'require.inject' : inject
		}
	};
});
