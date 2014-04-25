bMoor.make( 'bmoor.comm.Require', 
	['bmoor.comm.Script','bmoor.defer.Group', function( Script, Group ){

		return {
			construct : function CommRequire(){},
			properties : {
				forceSync : false, 
				translate : function( arr, root ){
					var r,
						key,
						requirement,
						group = new Group();

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
				},
				inject : function( arr, root, context ){
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

					return this.translate.call( this, arr, root ).then(function( args ){
						return bMoor.request( args ).then(function(){
							return func.apply( context, args );
						});
					});
				},
				get : function( requirement, async, alias ){
					var quark,
						req;

					req = bMoor.exists( requirement );

					if ( req === undefined ){
						quark = bMoor.ensure( requirement );

						( new Script( 
							alias || bMoor.ns.locate(requirement)+'.js', 
							this.forceSync ? false : async 
						) ).promise.then(function(){
							quark.$ready( bMoor.exists(requirement) );
						});

						return quark.$promise;
					}else if ( bMoor.isQuark(req) ){
						return req.$promise;
					}else{
						return bMoor.dwrap( req );
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
			plugins : [{
				instance : [],
				funcs : {
					'require' : function( require, alias ){
						var el;

						this.forceSync = true;
						el = this.get( require, alias );
						this.forceSync = false;

						return el;
					},
					'require.translate' : function( arr, root ){
						return this.translate( arr, root );
					},
					'require.inject' : function( arr, root, context ){
						return this.inject( arr, root, context );
					}
				}
			}]
		};
	}]
);
