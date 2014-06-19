bMoor.inject(
	['bmoor.defer.Basic','@global', 
	function( Defer, global ){
		var eCompiler = bMoor.makeQuark('bmoor.build.Compiler'),
			Compiler = function(){
				this.preProcess = [];
				this.postProcess = [];
				this.clean = true;
			},
			definitions = {},
			instance;

		function make( name, quark, definition ){
			var i, c,
				obj,
				id = name.name,
				namespace = name.namespace,
				dis = this,
				stillDoing = true,
				$d = new Defer(),
				promise = $d.promise,
				maker;

			// a hash has been passed in to be processed
			if ( bMoor.isObject(definition) ){
				if ( definition.abstract ){
					obj = function Abstract(){
						throw namespace + ' is abstracted, either extend or use only static members';
					};
				}else if ( definition.construct ){
					obj = definition.construct;
				}else{
					// throw namespace + 'needs a constructor, event if it just calls the parent it should be named'
					obj = function GenericConstruct(){};
				}

				// defines a class
				definition.id = id;
				definition.name = namespace.pop();
				definition.mount = bMoor.get( namespace );
				definition.namespace = namespace;
				definition.whenDefined = quark.$promise;
				
				if ( !this.clean ){
					this.preProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					this.postProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					
					this.clean = true;
				}

				$d.resolve();

				bMoor.loop( this.preProcess, function( maker ){
					promise = promise.then(function(){
						return bMoor.inject( maker.module, definition, obj ); 
					});
				});

				return promise.then(function(){
					// TODO : I really want to rethink this
					if ( obj.$onMake ){
						obj.$onMake( definition );
					}

					return obj;
				});
			}else{
				throw 'Constructor has no idea how to handle as definition of ' + definition;
			}
		}

		Compiler.prototype.addModule = function( rank, namePath, injection ){
			rank = parseInt( rank, 10 );

			this.clean = false;

			if ( arguments.length < 3 ){
				injection = namePath;
			}else{
				bMoor.install( namePath, injection[injection.length-1] );
			}

			if ( rank >= 0 ){
				this.preProcess.push({
					rank : rank,
					module : injection
				});
			}else{
				this.postProcess.push({
					rank : rank,
					module : injection
				});
			}
		};

		Compiler.prototype.make = function( name, definition ){
			var dis = this,
				postProcess = function( def ){
					make.call( dis, {name:name,namespace:namespace}, quark, def ).then(function( defined ){
						var $d = new Defer(),
							promise = $d.promise;

						$d.resolve();

						bMoor.loop( dis.postProcess, function( maker ){
							promise = promise.then(function(){
								return bMoor.inject( maker.module, def, defined ); 
							});
						});
						
						return promise.then(function(){
							quark.$ready( defined );

							return defined;
						});
					});
				},
				namespace,
				quark;

			if ( arguments.length !== 2 ) {
				throw 'you need to define a name and a definition';
			}
			
			if ( bMoor.isString(name) ){
				namespace = bMoor.parseNS( name );
			}else if ( bMoor.isArray(name) ){
				namespace = name;
				name = name.join('.');
			}else{
				throw JSON.stringify(name) + ' > ' + JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string or an array';
			}

			quark = bMoor.makeQuark( namespace );

			definitions[ name ] = definition;

			if ( bMoor.isInjectable(definition) ){
				if ( bMoor.require ){
					bMoor.require.inject( definition ).then( postProcess );
				}else{
					bMoor.inject( definition ).then( postProcess );
				}
			}else{
				postProcess( definition );
			}

			return quark.$promise;
		};

		Compiler.prototype.mock = function( name, mocks ){
			var dis = this,
				defer = new Defer(),
				quark = {
					$promise : defer.promise
				};

			console.log( 'mocking', definitions[name], mocks );
			return bMoor.inject( definitions[name], mocks ).then(function( def ){
				console.log( 'making mock' );
				return make.call( dis, {name:'mock',namespace:['mock']}, quark, def ).then(function( defined ){
					var $d = new Defer(),
						promise = $d.promise;
					console.log( 'postProcess mock' );
					$d.resolve();

					bMoor.loop( dis.postProcess, function( maker ){
						promise = promise.then(function(){
							return bMoor.inject( maker.module, def, defined ); 
						});
					});

					return promise.then(function(){
						defer.resolve( quark );

						return defined;
					});
				});
			});
		};

		Compiler.prototype.define = function( namespace, value ){
			var quark = bMoor.makeQuark( namespace );
			
			if ( bMoor.isInjectable(value) ){
				bMoor.inject( value ).then( function( v ){
					quark.$ready( v );
				});
			}else{
				quark.$ready( value );
			}
		};

		instance = new Compiler();
		Compiler.$instance = instance;
		
		bMoor.install( 'bmoor.build.$compiler', instance );

		bMoor.plugin( 'make', function( namespace, definition ){
			return instance.make( namespace, definition );
		});
		
		bMoor.plugin( 'mock', function( namespace, mocks ){
			return instance.mock( namespace, bMoor.map(mocks) );
		});

		bMoor.plugin( 'define', function( namespace, value ){
			return instance.define( namespace, value );
		});

		eCompiler.$ready( Compiler );
	}
]);
