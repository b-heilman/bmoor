/**
Allows for the compilation of object from a definition structure

@class Compiler 
@namespace bmoor.build
@constructor
**/
bMoor.inject(
	['bmoor.defer.Basic','@global', 
	function( Defer, global ){
		'use strict';

		var eCompiler = bMoor.makeQuark('bmoor.build.Compiler'),
			Compiler = function(){
				this.preProcess = [];
				this.postProcess = [];
				this.clean = true;
			},
			definitions = {},
			instance;

		/**
		 * The internal construction engine for the system.  Generates the class and uses all modules.
		 **/
		Compiler.make = function( name, quark, definition ){
			var obj,
				id = name.name,
				namespace = name.namespace,
				$d = new Defer(),
				promise = $d.promise;

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
		};

		/**
		 * Add a module to the build process
		 *
		 * @this {bmoor.build.Compiler}
		 * @access addModule
		 *
		 * @param {number} rank The time in the build stage to run the module, negative numbers are after build
		 * @param {string} namePath Optional ability to install the module
		 * @param {array} injection The injectable element to be used as a module for building
		 */
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

		/**
		 * Add a module to the build process
		 *
		 * @this {bmoor.build.Compiler}
		 * @access make
		 *
		 * @param {number} rank The time in the build stage to run the module, negative numbers are after build
		 * @param {string} namePath Optional ability to install the module
		 * @param {array} injection The injectable element to be used as a module for building
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the defined object
		 */
		Compiler.prototype.make = function( name, definition, root ){
			var dis = this,
				postProcess = function( def ){
					Compiler.make.call( dis, {name:name,namespace:namespace}, quark, def ).then(function( defined ){
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

			if ( bMoor.isString(name) ){
				namespace = bMoor.parseNS( name );
			}else if ( bMoor.isArray(name) ){
				namespace = name;
				name = name.join('.');
			}else{
				throw JSON.stringify(name) + ' > ' + JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string or an array';
			}

			quark = bMoor.makeQuark( namespace, root );

			// if this is a simple definition, pass in 
			if ( !bMoor.isInjectable(definition) ){
				(function(){
					var d = definition;
					definition = [function(){
						return d;
					}];
				}());
			}

			definitions[ name ] = definition;

			if ( bMoor.require ){
				bMoor.require.inject( definition, root ).then( postProcess );
			}else{
				bMoor.inject( definition, root ).then( postProcess );
			}

			return quark.$promise;
		};

		/**
		 * Create a mock of a previously defined object
		 *
		 * @this {bmoor.build.Compiler}
		 * @access mock
		 *
		 * @param {string} name The name of the definition to create a mock of
		 * @param {object} mocks Hash containing the mocks to user to override in the build
		 * @param {object} root The optional namespace to user, defaults to global
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the mock object
		 */
		Compiler.prototype.mock = function( name, mocks, root ){
			var dis = this,
				defer = new Defer(),
				quark = {
					$promise : defer.promise
				};

			if ( !root ){
				root = global;
			}
			
			return bMoor.inject( definitions[name], bMoor.object.extend({},root,mocks) )
				.then(function( def ){
					return Compiler.make.call( dis, {name:'mock',namespace:['mock']}, quark, def ).then(function( defined ){
						var $d = new Defer(),
							promise = $d.promise;
						
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

		/**
		 * Set a value on the namespace, first placing a quark in its place
		 *
		 * @this {bmoor.build.Compiler}
		 * @access define
		 *
		 * @param {string} name The name of the value
		 * @param {object} root The optional namespace to user, defaults to global
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the mock object
		 */
		Compiler.prototype.define = function( name, value, root ){
			var quark = bMoor.makeQuark( name, root );
			
			if ( bMoor.isInjectable(value) ){
				bMoor.inject( value ).then( function( v ){
					quark.$ready( v );
				});
			}else{
				quark.$ready( value );
			}

			return quark.$promise;
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