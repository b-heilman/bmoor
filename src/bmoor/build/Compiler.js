bMoor.inject(
	['bmoor.defer.Basic','@global', 
	function( Defer, global ){
		var Compiler = bMoor.ensure('bmoor.build.Compiler'),
			definitions = {},
			defer = Compiler.$.defer,
			instance;

		function make( obj, name, definition ){
			var i, c,
				id = name.name,
				namespace = name.namespace,
				dis = this,
				stillDoing = true,
				$d = new Defer(),
				promise = $d.promise,
				maker;

			if ( bMoor.isObject(definition) ){
				// defines a class
				definition.id = id;
				definition.name = namespace.pop();
				definition.mount = bMoor.get( namespace );
				definition.namespace = namespace;
				
				if ( !this.clean ){
					this.stack.sort(function( a, b ){
						return b.rank - a.rank;
					});
					this.clean = true;
				}

				$d.resolve();

				bMoor.loop( this.stack, function( maker ){
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
			}else if ( bMoor.isFunction(definition) ){
				// defines a function
				bMoor.set( namespace, definition );
				
				return bMoor.dwrap( definition );
			}else{
				throw 'Constructor has no idea how to handle as definition of ' + definition;
			}
		}

		Compiler.prototype._construct = function(){
			this.stack = [];
			this.clean = true;
		};

		Compiler.prototype.addModule = function( rank, namePath, injection ){
			this.clean = false;

			if ( arguments.length < 3 ){
				injection = namePath;
			}else{
				bMoor.install( namePath, injection[injection.length-1] );
			}

			this.stack.push({
				rank : parseInt(rank,10),
				module : injection
			});
		};

		Compiler.prototype.make = function( name, definition ){
			var namespace,
				dis = this,
				obj;

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

			obj = bMoor.ensure( namespace );

			definitions[ name ] = definition;

			if ( bMoor.isInjectable(definition) ){
				if ( bMoor.require ){
					bMoor.require.inject( definition ).then(function( def ){
						make.call( dis, obj, {name:name,namespace:namespace}, def ).then(function( defined ){
							obj.$.$ready( defined );
						});
					});
				}else{
					bMoor.inject( definition ).then(function( def ){
						make.call( dis, obj, {name:name,namespace:namespace}, def ).then(function( defined ){
							obj.$.$ready( defined );
						});
					});
				}
			}else{
				make.call( this, obj, {name:name,namespace:namespace}, definition ).then(function( defined ){
					obj.$.$ready( defined );
				});
			}

			return obj.$.promise;
		};

		Compiler.prototype.generate = function( name, mocks ){
			var dis = this,
				obj = bMoor.makeQuark();

			return bMoor.inject( definitions[name], mocks ).then(function( def ){
				return make.call( dis, obj, {name:'mock',namespace:['mock']}, def );
			});
		};

		instance = new Compiler();

		Compiler.$instance = instance;
		bMoor.set( 'bmoor.build.$compiler', instance );

		bMoor.plugin( 'define', function( name, definition ){
			return instance.make( name, definition );
		});
		
		bMoor.plugin( 'mock', function( name, mocks ){
			return instance.generate( name, bMoor.map(mocks) );
		});

		Compiler.$.$ready( Compiler );
	}
]);
