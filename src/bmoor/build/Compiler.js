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
				this.definitions = {};
				this.root = bMoor.namespace.root;
			},
			instance;

		Compiler.prototype.clone = function(){
			var t = new Compiler();
			t.preProcess = bMoor.object.extend( [], this.preProcess );
			t.postProcess = bMoor.object.extend( [], this.postProcess );
			t.clean = this.clean;

			t.definitions = bMoor.object.extend( {}, this.definitions );
			t.root = bMoor.object.override( {}, this.root );

			return t;
		};
		
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
			var dis = this,
				namespace,
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
			
			this.definitions[ name ] = definition;

			quark = bMoor.makeQuark( namespace, this.root );
			
			quark.$setDefinition(function(){
				return dis.build( definition ).then(function( result ){
					if ( result.prototype ){
						result.prototype._name = name;
					}else{
						result._name = name;
					}

					return result;
				});
			});

			return quark;
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

		Compiler.prototype.remake = function( name ){
			var i, c,
				def = this.definitions[ name ],
				requirements;

			if ( def ){
				requirements = bMoor.inject.getInjections( def );

				for( i = 0, c = requirements.length; i < c; i++ ){
					this.remake( requirements[i] );
				}

				this.make( name, def );
			}
		};

		Compiler.prototype.override = function( overrides ){
			var root = this.root,
				definitions = this.definitions;

			bMoor.iterate( overrides, function( setTo, getFrom ){
				if ( bMoor.isString(getFrom) ){
					getFrom = bMoor.get( getFrom, root );
					delete definitions[ getFrom ];
				}

				if ( bMoor.isQuark(getFrom) ){
					getFrom.$getDefinition().then(function( def ){
						bMoor.set( setTo, def, root );
					});
				}else{
					bMoor.set( setTo, getFrom, root );
				}

				// I think this works
				delete definitions[ setTo ];
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
				definition = this.definitions[name];

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
					quark.$set( v );
				});
			}else{
				quark.$set( value );
			}

			return quark;
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
			injector : function( injection, overrides ){
				return function(){
					var clone = instance.clone();

					if ( overrides ){
						clone.override( overrides );
						bMoor.iterate( bMoor.inject.getInjections(injection), function( name ){
							clone.remake( name );
						});
					}

					bMoor.inject( injection, clone.root );
				};
			},
			make : function( definition ){
				var t;

				instance.clone().build( definition ).then(function( built ){
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
		
		eCompiler.$set( instance );
	}
]);