/**
Allows for the compilation of object from a definition structure

@class Compiler 
@namespace bmoor.build
@constructor
**/
bMoor.inject(
	['bmoor.defer.Basic', 'bmoor.build.Quark',
	function( Defer, Quark ){
		'use strict';

		var Compiler = function(){
				this.preProcess = [];
				this.postProcess = [];
				this.defines = {};
				this.clean = true;
				this.makes = {};
				this.root = bMoor.namespace.root;
			},
			instance;

		Compiler.prototype.clone = function(){
			var t = new Compiler();

			t.postProcess = bMoor.object.extend( [], this.postProcess );
			t.preProcess = bMoor.object.extend( [], this.preProcess );
			t.clean = this.clean;

			t.defines = {};
			bMoor.object.safe( this.defines, function( def, name ){
				t.defines[name] =  def.slice(0);
			});
			
			t.makes = {};
			bMoor.object.safe( this.makes, function( def, name ){
				t.makes[name] =  def.slice(0);
			});

			t.root = this.root.$clone();

			return t;
		};

		function Abstract(){}

		bMoor.plugin( 'isAbstract', function( obj ){
			return obj instanceof Abstract;
		});

		/**
		 * The internal construction engine for the system.  Generates the class and uses all modules.
		 **/
		function make( dis, definition ){
			var obj;

			// a hash has been passed in to be processed
			if ( bMoor.isObject(definition) ){
				if ( definition.abstract ){
					obj = function(){
						throw new Error(
							'You tried to instantiate an abstract class'
						);
					};

					obj.prototype = new Abstract();
				}else if ( definition.construct ){
					obj = definition.construct;
				}else{
					// throw namespace + 'needs a constructor, event if it just calls the parent it should be named'
					obj = function GenericConstruct(){
						if ( bMoor.isFunction(definition.parent) && !(definition.parent.prototype instanceof Abstract) ){

							return definition.parent.apply( this, arguments );
						}
					};
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

				// defines a class
				definition.$aliases = {
					'constructor' : obj
				};

				bMoor.loop( dis.preProcess, function( maker ){
					obj = bMoor.decode( maker.module, definition, obj, true ) || obj;
				});

				bMoor.loop( dis.postProcess, function( maker ){
					obj = bMoor.decode( maker.module, definition, obj, true ) || obj;
				});

				return obj;
			}else{
				throw new Error(
					'Constructor has no idea how to handle as definition of ' + definition
				);
			}
		}

		Compiler.prototype.newRoot = function(){
			this.root = bMoor.makeNav();
			return this.root;
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
		Compiler.prototype.make = function( name, definition, root ){
			var dis = this,
				injection,
				generator,
				quark;

			if ( !bMoor.isString(name) ){
				throw new Error(
					JSON.stringify(name) + ' > ' +
					JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string or an array'
				);
			}

			quark = Quark.create( name, root || this.root );

			if ( bMoor.isInjectable(definition) ){
				generator = definition[definition.length-1];
				if ( generator._$raw ){
					generator = generator._$raw;
				}
				injection = definition;
			}else{
				if ( bMoor.isFunction(definition) ){
					generator = definition;
				}else{
					generator = function(){
						return definition;
					};
				}
				injection = [generator];
			}
			
			injection[injection.length-1] = function(){
				return make( dis, generator.apply(null,arguments) );
			};
			injection[injection.length-1]._$raw = generator;

			this.makes[ name ] = injection;
			quark.$setInjection( injection );

			return quark;
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
		Compiler.prototype.define = function( name, definition, root ){
			var injection,
				quark;

			if ( !bMoor.isString(name) ){
				throw new Error(
					JSON.stringify(name) + ' > ' +
					JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string'
				);
			}

			quark = Quark.create( name, root || this.root );

			if ( bMoor.isInjectable(definition) ){
				injection = definition;
			}else{
				injection = [function(){
					return definition;
				}];
			}

			this.defines[ name ] = injection;
			quark.$setInjection( injection );

			return quark;
		};

		function redeclair( compiler, name, lock ){
			var i, c,
				opt,
				injection = compiler.makes[ name ],
				t;

			if ( injection ){
				opt = 'make';
			}else{
				injection = compiler.defines[name];

				if ( !injection ){
					throw new Error( 'could not redeclair: '+name+'\nmakes('+
						Object.keys(compiler.makes)+')\ndefines('+
						Object.keys(compiler.defines)+')'
					);
				}
				opt = 'define';
			}
			
			t = bMoor.get( name, compiler.root );
			if ( t.$$lock !== lock ){
				for( i = 0, c = injection.length-1; i < c; i++ ){
					/**
					with mocks there was a bug that the mock would loop on its own primary it was mocking
					**/
					if ( injection[i] !== name ){
						redeclair( compiler, injection[i], lock );
					}
				}

				bMoor.del( name, compiler.root );
				compiler[opt]( name, injection, compiler.root );
				bMoor.get( name, compiler.root ).$$lock = lock;
			}
		}

		function override( compiler, overrides, lock ){
			var root = compiler.root;

			// { getFrom -> setTo }
			bMoor.iterate( overrides, function( setTo, getFrom ){
				var from = bMoor.get( getFrom, root );

				if ( from instanceof Quark ){
					from = from.$instantiate();
				}

				from.$$lock = lock;
				bMoor.set( setTo, from, root );
			});
		}

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
			return this.make( 
				'',
				this.makes[name],
				bMoor.object.extend( {}, this.root, mocks )
			);
		};

		instance = new Compiler();
		instance.$constructor = Compiler; // because it is a singleton

		bMoor.set( 'bmoor.build.Compiler', instance );

		bMoor.plugin( 'make', function( namespace, definition ){
			return instance.make( namespace, definition );
		});

		bMoor.plugin( 'define', function( namespace, value ){
			return instance.define( namespace, value );
		});

		var injectionLock = 1;
		bMoor.plugin( 'test', {
			clone: function(){
				return instance.clone();
			},
			debug : function( path ){
				console.log( 'clone', path, bMoor.exists(path,instance.clone().root) );
				console.log( 'primary', path, bMoor.exists(path,instance.root) );
			},
			injector : function( injection, overrides ){
				return function(){
					var clone = instance.clone(),
						lock = injectionLock++;

					if ( overrides ){
						override( clone, overrides, lock );
						bMoor.iterate( bMoor.inject.getInjections(injection), function( name ){
							redeclair( clone, name, lock );
						});
					}

					bMoor.inject( injection, clone.root );
				};
			},
			make : function( definition ){
				return instance.make( '', definition ).$instantiate();
			},
			mock : function( namespace, mock ){
				var t;

				instance.mock( namespace, bMoor.object.explode(mock) ).then(function( built ){
					t = built;
				});

				return t;
			}
		});
	}
]);