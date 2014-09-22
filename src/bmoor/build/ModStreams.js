bMoor.inject(['bmoor.build.Compiler', '-bmoor.comm.Http', 'bmoor.defer.Basic', 'bmoor.flow.Interval',
	function( compiler, httpConnect, Defer, Interval ){
		'use strict';

		var maker,
			cache = {},
			deferred = {};

		function makeServiceCall( target, options ){
			var request;

			function loadFunc( type ){
				return options[ type ] || maker.settings[ type ];
			}

			if ( bMoor.isString(options) ){
				options = {
					url : options
				};
			}

			request = function(){
				var cancel,
					args = arguments,
					http = loadFunc( 'http' ),
					url,
					context = options.context || target,	
					preload,
					decode = loadFunc( 'decode' ),
					validation = loadFunc( 'validation' ),
					success = loadFunc( 'success' ),
					failure = loadFunc( 'failure' ),
					always = loadFunc( 'always' );

				function handleResponse( r ){
					var t = r.then(
						function( content ){
							// we hava successful transmition
							/*
							I make the assumption that the httpConnector will return back an object that has,
							at the very least, code and data attributes
							*/
							var res = decode ? decode( content ) : content,
								data = res.data,
								code = res.code;

							if ( always ){
								always.call( context );
							}

							if ( (validation && !validation(code, data)) ){
								Array.prototype.unshift.call( args, res );
								return failure.apply( context, args );
							}else{
								if ( success ){
									Array.prototype.unshift.call( args, data );
									return success.apply( context, args );
								}else{
									return data;
								}
							}
						},
						function ( res ){
							// something went boom
							if ( always ){
								always.call( context );
							}

							Array.prototype.unshift.call( args, res );
							return failure.apply( context, args );
						}
					);

					if ( options.cached ){
						cache[ url ] = t;
					}

					return t;
				}

				// prep, decode any options
				if ( options.massage ){
					Array.prototype.push.call( args, options.massage.apply(context,args) );
				}

				url = ( typeof(options.url) === 'function' ? options.url.apply(context, args) : options.url );
				
				if ( options.preload ){
					if ( typeof(options.preload) === 'function' ){
						preload = options.preload();
					}else{
						preload = options.preload; // assumed to already be a promise
					}
				}else{
					preload = bMoor.dwrap( undefined );
				}

				return preload.then(
					function(){
						var t,
							f,
							ff;

						if ( options.response ) {
							f = function(){
								var req;

								if ( typeof(options.response) === 'function' ){
									req = options.response.apply( context, args );
								}else{
									req = options.response;
								}

								if ( req.then ){
									return handleResponse( req.then(function( v ){
										return {
											data : v,
											code : 200
										};
									}) );
								}else{
									return handleResponse( bMoor.dwrap({
										data : req,
										code : 200
									}) );
								}
							};
						}else{
							if ( options.cached && cache[url] ){
								return cache[ url ];
							}else if ( deferred[url] ){
								return deferred[ url ];
							}else{
								f = function(){
									return handleResponse(
										http(bMoor.object.extend(
											{
												'method' : options.method || 'GET',
												'data' : args[ args.length - 1 ],
												'url' : url,
												'headers' : bMoor.object.extend(
													{ 'Content-Type' : 'application/json' },
													maker.settings.headers,
													options.headers
												)
											},
											options.comm || {}
										))
									);
								};
							}
						}

						if ( options.interval !== undefined && !deferred[url] ){
                            ff = function(){
                                request.lastRun = ( new Date() ).getTime();
                                return f();
                            };

                            request.setInterval = function( i ){
                                var time = ( new Date() ).getTime();

                                // I want to protect against
                                if ( !request.lastRun || time - i < request.lastRun ||
                                    (request.lastInterval && request.lastInterval > i) ){
                                    t = ff();
                                }else if ( url && options.cached ){
                                    // TODO : really?
                                    t = cache[ url ];
                                }else{
                                    // this has to be something simulated, so...
                                    t = request.lastResponse;
                                }

                                request.lastInterval = i;

                                if ( cancel ){
                                    Interval.clear( cancel );
                                }

                                cancel = Interval.set(function(){
                                    deferred[ url ] = ff();
                                }, i);
                            };

                            request.stopRefresh = function(){
                                Interval.clear( cancel );
                                if ( options.onStopRefresh ){
                                    options.onStopRefresh.call( context );
                                }
                            };

                            if ( options.interval ){
                                request.setInterval( options.interval ); // will implicitely call t = f()
                            }else{
                                t = ff(); // make sure it gets called
                            }
                        }else{
                            t = f();
                        }

						if ( url ){
							deferred[ url ] = t;

							t.then(
								function(){
									deferred[ url ] = null;
								},
								function(){
									deferred[ url ] = null;
								}
							);
						}

						request.lastResponse = t;

                        return t;
					},
					function(){
						Array.prototype.unshift.call( args, {
							code : 0,
							message : 'Preload Error'
						});
						return options.failure.apply( context, args );
					}
				);
			};

			return request;
		}

		maker = function( streams ){
			var obj = this;
			
			bMoor.iterate( streams, function( stream, name ){
				obj.prototype[name] = makeServiceCall( obj, stream );
			});
		};

		maker.clearCache = function( url ){
			delete cache[ url ];
		};

		maker.settings = {
			http : httpConnect,
			defer : Defer,
			validation : function ( code, data ){
				return (!code || code === 200) && data;
			},
			failure : function( message ){
				console.log( message );
			}
		};

		compiler.addModule( 9, 'bmoor.build.ModStreams', ['-streams', maker] );
	}]
);

