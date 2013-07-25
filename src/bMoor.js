;(function( $, global, undefined ){
	"use strict";

	var
		scripts = document.getElementsByTagName( 'script' ),
		scriptTag = scripts[ scripts.length - 1 ],
		modules = {},
		environmentSettings = {
			templator : ['bmoor','templating','JQote'],
			templatorTag : '#',
			jsRoot : scriptTag.hasAttribute('root')
				? scriptTag.getAttribute('root')
				: scriptTag.getAttribute('src').match(/^(.*)\/bMoor.js/)[1]
		};
	
	/**
	*	Extending some base object, to make life easier
	**/
	if( !String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace( /^\s+|\s+$/g, '' );
		};
	}

	function error( str ){
		if ( console && console.log ){
			console.log( str );
			console.trace();
		}
	}
	
	var Namespace = {
		// TODO I would love to be able to cache the last search
		parse : function( space ){
			if ( typeof(space) == 'string' ){
				return space.split('.'); // turn strings into an array
			}else if ( space.length ){
				return space.slice(0);
			}else if ( space ){
				return space;
			}else{
				return [];
			}
		},
		/*
			This will create an object in place if it doesn't exist
		*/
		get : function( space ){
			var curSpace = global;
			
			if ( !space ){
				return null;
			}else if ( typeof(space) == 'string' || space.length ){
				space = this.parse( space );
				
				for( var i = 0; i < space.length; i++ ){
					var
						nextSpace = space[i];
						
					if ( !curSpace[nextSpace] ){
						curSpace[nextSpace] = {};
					}
					
					curSpace = curSpace[nextSpace];
				}
				
				return curSpace;
			}else return space;
		},
		/*
			returns back the space or null
		*/
		exists : function( space ){
			var curSpace = global;
			
			if ( !space ){
				return null;
			}else if ( typeof(space) == 'string' || space.length ){
				space = this.parse( space );
				
				for( var i = 0; i < space.length; i++ ){
					var
						nextSpace = space[i];
						
					if ( !curSpace[nextSpace] ){
						return null;
					}
					
					curSpace = curSpace[nextSpace];
				}
				
				return curSpace;
			}else return space;
		}
	};
	
	var ClassLoader = {
		requests : 0,
		onReady  : []
	};
	(function(){
		var 
			loading = {},
			libRoots = {}; // A multi level hash that allows for different libraries 
			               // to be located in different locations
		
		ClassLoader.reset = function(){
			libRoots = {
				'.' : { 
					fullName : false 
				},
				'/' : environmentSettings.jsRoot,
				'jquery' : {
					'/' : environmentSettings.jsRoot + '/jquery',
					'.' : {
						fullName : true
					}
				}
			};
		};
		
		ClassLoader.reset();

		ClassLoader.setRoot = function( path ){
			libRoots['/'] = path;
		};
		
		/** 
		 * set the location of a library
		 * 
		 * @var {array,string} className The class to set up a path to
		 * @var {string} path The URL path to the library's base
		 */
		ClassLoader.setLibrary = function( className, path, settings, catchAll ){
			var
				lib = libRoots,
				classPath = Namespace.parse( className );
			
			if ( !settings ){
				settings = {};
			}
			
			while( classPath.length ){
				var
					dir = classPath.shift();
				
				if ( lib[ dir ] == undefined ){
					lib[ dir ] = {};
				}
				lib = lib[ dir ];
			}
			
			lib['/'] = path;
			lib['.'] = settings;
			lib['*'] = catchAll == true; // type caste
		};
		
		ClassLoader.delLibrary = function( className ){
			var
				lib = libRoots,
				prevLib = null,
				prevDir = null,
				classPath = Namespace.parse( className );
			
			while( classPath.length && lib ){
				var
					dir = classPath.shift();
				
				if ( lib[dir] ){
					prevLib = lib;
					prevDir = dir;
					
					lib = lib[ prevDir ];
				}else{
					lib = null;
				}
			}
			
			if ( lib ){
				delete prevLib[ prevDir ];
			}
		};
		
		/**
		 * 
		 * @param className
		 * @returns
		 */
		ClassLoader.getLibrary = function( className ){
			var
				lib = libRoots,
				masterLib = libRoots, 
				classPath = Namespace.parse( className ),
				name = classPath.pop(),
				masterPath = classPath.slice(0);
			
			while( classPath.length ){
				var
					dir = classPath[0];
				
				if ( lib[dir] ){
					lib = lib[ classPath.shift() ];
					
					if ( lib['/'] ){
						masterLib = lib;
						masterPath = classPath.slice(0);
					}
				}else{
					break;
				}
			}
			
			return masterLib['*'] 
				? { root : masterLib['/'], path : [],         name : name, settings : masterLib['.'] } 
				: { root : masterLib['/'], path : masterPath, name : name, settings : masterLib['.'] };
		};
		
		/**
		 * @param namespace The namespace to be loading
		 * @param reference [Optional] A reference to build the request url, defaults to the namespace
		 * @param callback  Call back for once loaded
		 * @param args      Arguments to pass to the callback
		 * @param target    Context to call against
		 */
		ClassLoader.loadSpace = function( namespace, reference, callback, args, target ){
			var 
				space;

			function fireCallback(){
				if ( target == undefined ){
					target = {};
				}
			
				if ( args == undefined ){
					args = [];
				}
				
				callback.apply( target, args );
			}
			
			function waitForIt( timeout ){
				var t = Namespace.exists( namespace );
				
				if ( !t || t instanceof PlaceHolder || (t.prototype && t.prototype.__defining) ){
					setTimeout( waitForIt, 10 );
				}else if ( callback ){
					clearTimeout( timeout );
					fireCallback();
				}else{
					clearTimeout( timeout );
				}
			}
			
			namespace = Namespace.parse( namespace );
			
			if ( typeof(reference) == 'function' ){
				target = args;
				args = callback;
				callback = reference;
				reference = namespace;
			}else if ( !reference ){
				reference = namespace;
			}
			
			space = Namespace.exists(namespace);
			
			if ( !space ){
				var
					timeout,
					info = this.getLibrary( reference ),
					path = info.root + ( info.path.length ? '/'+info.path.join('/') : '' ) 
						+ '/' + ( info.settings.fullName ? reference.join('.') : info.name ),
					success = function( script, textStatus ){
						var 
							timeout,
							calls = loading[path],
							i, 
							c;

						// I will give you 5 seconds to wait, more than that... you got issues
						timeout = setTimeout(function(){
							if ( !Namespace.exists(namespace) ){
								error( 'loaded file : '+script+"\n but no class : "+namespace.join('.') );
							}
						}, 5000);

						for( i = 0, c = calls.length; i < c; i++ ){
							calls[i]( timeout );
						}

						loading[path] = true;
					};
				
				// loading is a class global
				if ( !loading[path] ){
					loading[path] = [ waitForIt ];

					$.getScript( path+'.js' )
						.done( success )
						.fail( function( jqxhr, settings, exception ){
							if ( exception == 'Not Found' ){
								$.getScript( path+'.min.js' )
									.done( success )
									.fail( function( jqxhr, settings, exception ){
										error( 'failed to load file : '+path+"\nError : "+exception );
									});
							}else{
								error( 'failed to load file : '+path+"\nError : "+exception );
							}
						});
				}else if ( typeof(loading[path]) == 'boolean' ){
					waitForIt(); // shouldn't ever happen, but you never know
				}else{
					loading[path].push( waitForIt );
				}

				
			}else if ( space instanceof PlaceHolder ){
				waitForIt();
			}else{
				fireCallback();
			}
		};
		
		ClassLoader.ready = function( callback ){
			if ( this.requests == 0 ){
				callback();
			}else{
				this.onReady.push( callback );
			}
		};

		ClassLoader.require = function( requirements, callback, scope ){
			var
				dis = this,
				reqCount = 1,
				references = null,
				classes = null,
				aliases = null;
			
			function cb(){
				var t;

				reqCount--;
				
				if ( reqCount == 0 ){
					var
						aliasi = [],
						i,
						c;

					dis.requests--;

					// now all requirements are loaded
					reqCount--; // locks any double calls, requests to -1
					
					for( var i = 0, req = aliases, c = req ? req.length : 0; i < c; i++ ){
						aliasi.push( Namespace.get(req[i]) );
					}
					
					callback.apply( scope, aliasi );
					
					if ( dis.requests == 0 ){
						while( dis.onReady.length ){
							t = dis.onReady.shift();
							t();
						}

						dis.onReady = [];
					}
				}
			}
			
			if ( requirements.substring ){
				classes = aliases = [ requirements ];
				references = {};
			}else if ( requirements.length ){
				classes = aliases = requirements;
				references = {};
			}else{
				references = ( requirements.references ? requirements.references : {} );
				classes = ( requirements.classes ? requirements.classes : [] );
				aliases = ( requirements.aliases ? requirements.aliases : [] );
			}
			
			if ( !scope ){
				scope = {};
			}
			
			this.requests++;

			// build up the request stack
			for( var i = 0, req = classes, len = req ? req.length : 0; i < len; i++ ){
				var
					namespace = Namespace.parse( req[i] );
				
				// if namespace does not exist, load it
				reqCount++;
				this.loadSpace( namespace, cb );
			}
			
			// build up the request stack
			for( var reference in references ){
				var
					namespace = Namespace.parse( reference );
				
				reqCount++;
				this.loadSpace( namespace, references[reference], cb );
			}
			
			cb();
		};
	}());
	
	// Used to help in the creation of classes below, just used as named stub
	function PlaceHolder(){}
	
	function Constructor(){}
	(function(){
		var 
			onLoaded = [],
			initializing = false,
			loading = 0;
		
		/**
		 * 
		 * @param settings 
		 * {
		 *   name        : the name of the class
		 *   namespace   : the namespace to put the class into
		 *   require     : classes to make sure are loaded before class is defined
		 *   parent      : the parent to extend the prototype of, added to require
		 *   aliases     : the local renaming of classes prototypes for faster access
		 *   construct   : the constructor for the class, called automatically
		 *   properties  : the public interface for the class
		 *   statics     : variables to be shared between class instances
		 *   onReady     : ( definition ) function to call when DOM is ready, instance passed in
		 *   onDefine    : ( definition, namespace, name ) function to call when class has been defined
		 * }
		 */
		Constructor.prototype.define = function( settings ){
			loading++;
			
			var
				dis = this,
				requests = settings.require,
				namespace = ( settings.namespace 
					? Namespace.get(settings.namespace ? Namespace.parse(settings.namespace) : []) 
					: global 
				),
				obj = function(){
					if ( !initializing ){
						this.__construct.apply( this, arguments );
					}
				}; 
			
			if ( !settings.name ){
				throw 'Need name for class';
			}
				
			namespace[ settings.name ] = new PlaceHolder();
			
			if ( !requests ){
				requests = [];
			}
			
			if ( settings.parent ){
				if ( requests.length != undefined ){
					requests.push( settings.parent );
				}else{
					if ( requests.classes ){
						requests.classes.push( settings.parent );
					}else{
						requests.classes = [ settings.parent ];
					}
				}
			}
			
			if ( settings.aliases ){
				var r;
				
				if ( requests.length != undefined ){
					requests = {
						classes : requests, // I can't think of when this isn't true?
						aliases : settings.aliases
					};
				}else{
					requests.aliases = settings.aliases;
				}
			}
			
			function def(){
				var
					parent = Namespace.get( settings.parent );
				
				if ( parent && parent.prototype.__defining ){
					setTimeout( def, 10 );
				}else{
					
					define.call( dis, settings, obj );
					if ( settings.onDefine ){
						settings.onDefine.apply( obj.prototype, [settings, namespace, settings.name, obj] );
					}

					if ( settings.onReady ){
						$(document).ready(function(){
							// make sure all requests have been completed as well
							ClassLoader.ready( function(){
								settings.onReady( namespace[settings.name] );
							});
						});
					}
					
					delete obj.prototype.__defining;

					loading--;
					if ( loading == 0 ){
						while( onLoaded.length ){
							var cb = onLoaded.pop();
							cb( $, global );
						}
					}
				}
			};
			
			ClassLoader.require( requests, def, [], this);
		};

		Constructor.prototype.singleton = function( settings ){
			var old = settings.onDefine ? settings.onDefine : function(){};
			
			settings.onDefine = function( settings, namespace, name, definition ){
				var 
					def = new definition,
					module;

				namespace[ name ] = def;
				old.apply( def, [settings, namespace, name, definition] );
				
				if ( settings.module ){
					module = settings.module;
					module = module.charAt(0).toUpperCase() + module.slice(1).toLowerCase();
					modules[ module ] = def;
				}
			};
			
			this.define( settings );
		};
		
		// decorators will reserve _wrapped
		function override( key, el, override ){
			var 
				type = typeof(override),
				old = el[key];
			
			if (  type == 'function' ){
				el[key] = function(){
					var 
						backup = this._wrapped,
						rtn;

					this._wrapped = old;

					rtn = override.apply( this, arguments );

					this._wrapped = backup;

					return rtn;
				};
			}else if ( type == 'string' ){
				// for now, I am just going to append the strings with a white space between...
				el[key] += ' ' + override;
			}
		};
		
		Constructor.prototype.decorator = function( settings ){
			var 
				old,
				construct;

			if ( !settings.properties ){
				settings.properties = {};
			}
			
			old = settings.properties._decorate;
			construct = settings.properties.__construct;

			delete settings.properties._decorate;
			delete settings.properties.__construct;

			settings.properties._decorate = function( el ){
				var key;
				
				if ( construct ){
					// TODO : if it is already created, it should be run against it...  how to tell?
					override( '__construct', el, construct );
				}

				for( key in this ){
					if ( key === '__construct' ){
						// __construct will get nuked during the define process, so cache it here in case of override
						continue;
					}else if ( key === '_decorator' ){
						// throw this out, we are automatically defining it and always called later if defined in settings
						continue;
					}else if ( el[key] ){
						// the default override is post
						override( key, el, this[key] );
					}else{
						el[key] = this[key];
					}
				}

				if ( old ){
					old.call( el );
				} 

				return el;
			};
			
			this.singleton( settings );
		};
		
		Constructor.prototype.mutate = function( settings, singleton ){
			var 
				i,
				decorators,
				old = settings.onDefine ? settings.onDefine : function(){};
			
			if ( settings.decorators ){
				decorators = typeof(settings.decorators) == 'string' ? decorators.split(',') : settings.decorators;
				
				if ( !settings.require ){
					settings.require = {};
				}
			
				if ( !settings.require.classes ){
					settings.require.classes = [];
				}	

				for( i = 0; i < decorators.length; i++ ){
					settings.require.classes.push( decorators[i] );
				}
					
				settings.onDefine = function( settings, namespace, name, definition ){
					// it can either be a class (define) or an instance (singleton)
					old.apply( this, [settings, namespace, name, definition] );
					
					for( i = 0; i < decorators.length; i++ ){
						Namespace.get( decorators[i] )._decorate( this );
					}
				};
			}
			
			if ( singleton ){
				this.singleton( settings );
			}else{
				this.define( settings );
			}
		};
		
		// passing in obj as later I might configure it to allow you to run this against an already defined class
		function define( settings, obj ){
			var
				parent = ( settings.parent ? Namespace.get(settings.parent) : null ),
				ns = ( settings.namespace ? Namespace.parse(settings.namespace) : [] ),
				namespace = ( settings.namespace ? Namespace.get(ns) : global );
			
			
			// inheret from the parent
			if ( parent ){
				this.extend( obj, parent );
				
				if ( parent.prototype.__onDefine ){
					if ( settings.onDefine ){
						var old = settings.onDefine;
						
						settings.onDefine = function( settings, namespace, name, definition ){
							parent.prototype.__onDefine.call( this, settings, namespace, name, definition );
							old.call( this, settings, namespace, name, definition );
						};
					}else{
						settings.onDefine = parent.prototype.__onDefine;
					}
				}
			}
			
			obj.prototype.__construct = settings.construct 
				? settings.construct // if you have it, use your constructor
				: parent 
					? parent.prototype.__construct // if not, use the parent
					: function(){}; // well you need one no matter what
					
			obj.prototype.__defining = true;
			
			namespace[ settings.name ] = obj;
			
			ns.push( settings.name );
			
			obj.prototype.__class = ns.join('.');
			obj.prototype.__name = ns.pop();
			
			if ( settings.onDefine ){
				obj.prototype.__onDefine = settings.onDefine;
			}
			
			// define any aliases
			if ( settings.aliases ){
				this.alias( obj, settings.aliases );
			}
			
			// right now, i am making it static on the prototype level, so __parent.__static might be neccisary
			this.statics( obj, settings.statics );
			
			if ( settings.properties ){
				this.properties( obj, settings.properties );
			}
		};
		
		Constructor.prototype.properties = function( child, properties ){
			for( var name in properties ){
				child.prototype[name] = properties[name];
			}
		};
		
		Constructor.prototype.statics = function( child, statics ){
			if ( child.prototype.__static ){
				child.prototype.__static = {};
				$.extend( child.prototype.__static, statics );
			}else if ( statics ){
				child.prototype.__static = statics;
			}else{
				child.prototype.__static = {};
			}
		};
		
		Constructor.prototype.alias = function( child, aliases ){
			for( var namespace in aliases ){
				var
					alias = aliases[namespace];
				
				child.prototype['__'+alias] = Namespace.get(namespace).prototype;
			}
		};
		
		// used to extend a child instance using the parent's prototype
		Constructor.prototype.extend = function( child, parent ){
			initializing = true;
			
			child.prototype = new parent();
			child.prototype.constructor = child;
			// right now, I think this will suffice
			child.prototype['__'+parent.prototype.__name] = parent.prototype;
			initializing = false;
		};
		
		Constructor.prototype.loaded = function( cb ){
			if ( loading ){
				onLoaded.push( cb );
			}else{
				cb( $, global );
			}
		};
	}());
	
	global.bMoor = {
		module      : modules,
		require     : function(){ ClassLoader.require.apply( ClassLoader, arguments ); },
		get         : function( space ){ return Namespace.exists( space ); },
		settings    : environmentSettings,
		autoload    : ClassLoader,
		constructor : new Constructor()
	};
	
}( jQuery, this ));
