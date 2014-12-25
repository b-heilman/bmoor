/**
Allows for the compilation of object from a definition structure

@class Compiler 
@namespace bmoor.build
@constructor
**/
bMoor.inject(
	['bmoor.defer.Basic',
	function( Defer ){
		'use strict';

		var eCompiler = bMoor.makeQuark('bmoor.build.Compiler'),
			Compiler = function(){
				this.preProcess = [];
				this.postProcess = [];
				this.clean = true;

				this.root = bMoor.namespace.root;
			},
			definitions = {},
			instance;

		/**
		 * The internal construction engine for the system.  Generates the class and uses all modules.
		 **/
		function make( dis, definition ){
			var obj,
				$d = new Defer(),
				promise = $d.promise;

			// a hash has been passed in to be processed
			if ( bMoor.isObject(definition) ){
				if ( definition.abstract ){
					obj = function Abstract(){
						throw new Error(
							'You tried to instantiate an abstract class'
						);
					};
				}else if ( definition.construct ){
					obj = definition.construct;
				}else{
					// throw namespace + 'needs a constructor, event if it just calls the parent it should be named'
					obj = function GenericConstruct(){};
					obj.$generic = true;
				}

				if ( !dis.clean ){
					dis.preProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					dis.postProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					
					dis.clean = true;
				}

				bMoor.loop( dis.preProcess, function( maker ){
					promise = promise.then(function( target ){
						return bMoor.inject( maker.module, definition, target ).then(function( t ){
							return t ? t : target;
						});
					});
				});

				bMoor.loop( dis.postProcess, function( maker ){
					promise = promise.then(function( target ){
						return bMoor.inject( maker.module, definition, target ).then(function( t ){
							return t ? t : target;
						});
					});
				});

				// defines a class
				definition.$aliases = {
					'this' : obj,
					whenDefined : promise
				};
				
				$d.resolve( obj );

				return promise;
			}else{
				throw new Error(
					'Constructor has no idea how to handle as definition of ' + definition
				);
			}
		}

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
				bMoor.set( namePath, injection[injection.length-1], this.root );
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
		Compiler.prototype.make = function( name, definition ){
			var namespace,
				onReady,
				quark;

			if ( bMoor.isString(name) ){
				namespace = bMoor.parseNS( name );
			}else if ( bMoor.isArray(name) ){
				namespace = name;
				name = name.join('.');
			}else{
				throw new Error(
					JSON.stringify(name) + ' > ' +
					JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string or an array'
				);
			}
			
			definitions[ name ] = definition;

			quark = bMoor.makeQuark( namespace, this.root );
			onReady = quark.$ready;

			delete quark.$ready; // prevent accidental injection

			return this.build( definition ).then(function( result ){
				if ( result.prototype ){
					result.prototype.$name = name;
				}else{
					result.$name = name;
				}

				onReady( result );
			});
		};

		Compiler.prototype.setRoot = function( r ){
			this.root = r;
		};

		Compiler.prototype.build = function( definition ){
			var dis = this;

			if ( !bMoor.isInjectable(definition) ){
				(function(){
					var d = definition;
					definition = [function(){
						return d;
					}];
				}());
			}

			return bMoor.inject( definition, this.root ).then(function( def ){
				return make( dis, def );
			});
		};

		Compiler.prototype.remake = function(){
			var dis = this;

			this.root = bMoor.namespace.root;

			bMoor.iterate( definitions, function( definition, name ){
				dis.make( name, definition );
			});
		};

		/**
		 * Create a mock of a previously defined object
		 *
		 * @this {bmoor.build.Compiler}
		 * @access mock
		 *
		 * @param {string} name The name of the definition to create a mock of
		 * @param {object} mocks Hash containing the mocks to user to override in the build
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the mock object
		 */
		Compiler.prototype.mock = function( name, mocks ){
			var dis = this,
				r = bMoor.object.extend( {}, this.root, mocks ),
				definition = definitions[name];

			if ( !bMoor.isInjectable(definition) ){
				// TODO : bMoor.makeInjectable
				(function(){
					var d = definition;
					definition = [function(){
						return d;
					}];
				}());
			}

			return bMoor.inject( definition, r ).then(function( def ){
				return make( dis, def );
			});
		};

		/**
		 * Set a value on the namespace, first placing a quark in its place
		 *
		 * @this {bmoor.build.Compiler}
		 * @access define
		 *
		 * @param {string} name The name of the value
		 * @param {object} value The value to define in the namespace
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the mock object
		 */
		Compiler.prototype.define = function( name, value ){
			var quark = bMoor.makeQuark( name, this.root );
			
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
		instance.$constructor = Compiler; // because it is a singleton

		bMoor.plugin( 'make', function( namespace, definition ){
			return instance.make( namespace, definition );
		});

		bMoor.plugin( 'define', function( namespace, value ){
			return instance.define( namespace, value );
		});

		bMoor.plugin( 'test', {
			remake : function(){
				instance.remake();
			},
			make : function( definition ){
				var t;

				instance.build( definition ).then(function( built ){
					t = built;
				});

				return t;
			},
			mock : function( namespace, mock ){
				var t;

				instance.mock( namespace, bMoor.object.explode(mock) ).then(function( built ){
					t = built;
				});

				return t;
			}
		});
		
		eCompiler.$ready( instance );
	}
]);