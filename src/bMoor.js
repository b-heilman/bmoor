

(function( $, global, undefined ){
	"use strict";
	
	var
		environmentSettings = {
			runWindow : 300,       // 0 implies to run everything immediately
			runPause  : 30,        // how long to pause between intervals to prevent the window from locking up
			jsRoot    : ''
		};
	
	function time(){
		return ( new Date() ).getTime();
	}
	
	function error( str ){
		if ( console && console.log ){
			console.log( str );
		}
	}
	
	// Defines 
	var Bouncer = {
		stacks      : {},
		readyStacks : {},
		locks       : {},
		pauseAfter  : {},
		onEmpty     : {},
		fullEmpty   : null
	};
	
	(function(){
		// set up some private static variables
		var
			stacks = [],
			pauseAfter = null,
			activeStack = null;
		
		// set up some private functions
		function resetTime(){
			pauseAfter = time() + environmentSettings.runWindow;
		}
		
		function releaseLock( stack ){
			// this means you were the first lock to return, so adjust the next pause position
			if ( this.locks[stack] == pauseAfter ){
				resetTime();
			}
			
			delete this.locks[stack];
			this.run( stack );
		}
		
		Bouncer.add = function( stack, op, front ){
			// action, arguments, target, delay
			if ( !this.stacks[stack] ){
				stacks++;
				this.stacks[stack] = [];
			}
			
			this.stacks[(front ? 'unshift' : 'push')]({
				action    : ( typeof(op) == 'function' ? op : op.action ),
				arguments : ( op.arguments ? op.arguments : [] ),
				target    : ( op.target ? op.target : (typeof(op) == 'function' ? op : op.action) ),
				delay     : ( op.delay ? op.delay : false )
			});
		};
		
		Bouncer.onEmpty = function( stack, func, args ){
			if ( stack ){
				if ( this.stacks[stack] && this.stacks[stack].length > 0 ){
					this.onEmpty[stack] = function(){
						func( args );
					};
				}else{
					func( args );
				}
			}else{
				if ( stacks.length > 0 ){
					this.fullEmpty = function(){
						func( args );
					};
				}else{
					func( args );
				}
			}
		};
		
		// run a stack if it is not already locked
		Bouncer.run = function(){
			var
				dis = this,
				stack;
		
			if ( activeStack == null ){
				if ( stacks.length == 0 ){
					return;
				}else{
					activeStack = stacks.shift();
				}
			}
			
			stack = activeStack;
			
			if ( this.stacks[stack] && this.stacks[stack].length && this.locks[stack] == undefined ){
				if ( environmentSettings.runWindow == 0 ){
					// if no run window, just run everything as it comes in
					var
						op = this.stacks[stack].shift();
					
					op.action.apply( op.target, op.arguments );
					releaseLock.call( dis, stack );
				}else{
					var
						op = this.stacks[stack].shift();
					
					if ( pauseAfter == null ){
						resetTime();
					}
					
					this.pauseAfter[stack] = pauseAfter;
					this.locks[stack] = true;
					
					op.target.runNext = function(){
						op.target.runNext = function(){}; // no double taps
						// TODO : I could do something that if runNext never gets called I force it, but maybe for v2
						if ( time() > dis.pauseAfter[stack] ){
							setTimeout( function(){
								releaseLock.call( dis, stack );
							}, environmentSettings.runPause );
						}else{
							releaseLock.call( dis, stack );
						}
					};
					
					op.action.apply( op.target, op.arguments );
					
					if ( !op.delay ){
						op.target.runNext();
					}
				}
			}else if ( !this.stacks[stack] || this.stacks[stack].length == 0 ){
				// handle when a stack runs out
				delete this.stacks[stack];
				
				if ( this.onEmpty[stack] ){
					this.onEmpty[stack]();
					delete this.onEmpty[stack];
				}
				
				if ( stacks.length == 0 ){
					if ( this.fullEmpty ){
						this.fullEmpty();
						delete this.fullEmpty;
					}
					
					activeStack = null;
				}else{
					activeStack = stacks.shift();
				}
			}
		};
	}());
	
	var Namespace = {
		// TODO I would love to be able to cache the last search
		parse : function( space ){
			if ( typeof(space) == 'string' ){
				return space.split('.'); // turn strings into an array
			}else return space.slice(0);
		},
		get : function( space ){
			var 
				curSpace = global;
			
			if ( space ){
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
			}else return null;
		},
		exists : function( space ){
			var 
				curSpace = global;
			
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
		}
	};
	
	var FileLoader = {};
	(function(){
		// A multi level hash that allows for different libraries to be located in different locations
		var
			libRoots = {};
			
		FileLoader.reset = function(){
			libRoots = {
				'.' : { 
					fullName : false 
				},
				'/' : environmentSettings.jsRoot
			};
		};
		
		FileLoader.setRoot = function( path ){
			libRoots['/'] = path;
		};
		
		/** 
		 * set the location of a library
		 * 
		 * @var {array,string} className The class to set up a path to
		 * @var {string} path The URL path to the library's base
		 */
		FileLoader.setLibrary = function( className, path, settings, catchAll ){
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
		
		FileLoader.delLibrary = function( className ){
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
		FileLoader.getLibrary = function( className ){
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
		
		FileLoader.loadSpace = function( namespace, group, callback, args, target ){
			function fireCallback(){
				if ( target == undefined ){
					target = {};
				}
			
				if ( args == undefined ){
					args = [];
				}
			
				callback.apply( target, args );
			}
			
			function waitForIt(){
				var 
					t = Namespace.get( namespace );
				
				if ( t instanceof PlaceHolder ){
					setTimeout( waitForIt, 50 );
				}else if ( callback ){
					fireCallback();
				}
			}
			
			var 
				space;
			
			namespace = Namespace.parse( namespace );
			
			if ( typeof(group) == 'function' ){
				target = args;
				args = callback;
				callback = group;
				group = namespace;
			}
			
			space = Namespace.exists(namespace);
			
			if ( !space ){
				var
					info = this.getLibrary( group ),
					path = info.root + ( info.path.length ? '/'+info.path.join('/') : '' ) 
						+ '/' + ( info.settings.fullName ? group.join('.') : info.name ),
					success = function( script, textStatus ){
						if ( Namespace.exists(namespace) ){
							waitForIt();
						}else{
							error( 'loaded file : '+script+"\n but no class : "+namespace.join('.') );
						}
					};
						
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
			}else if ( space instanceof PlaceHolder ){
				waitForIt();
			}else{
				fireCallback();
			}
		};
		
		FileLoader.require = function( requirements, callback, scope ){
			var
				reqCount = 1,
				references = null,
				classes = null,
				aliases = null;
			
			function cb(){
				reqCount--;
				
				if ( reqCount == 0 ){
					var
						aliasi = [];
					// now all requirements are loaded
					
					reqCount--; // locks any double calls, requests to -1
					
					for( var i = 0, req = aliases, len = req ? req.length : 0; i < len; i++ ){
						aliasi.push( Namespace.get(req[i]) );
					}
					
					callback.apply( scope, aliasi );
				}
			}
			
			if ( requirements.length ){
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
	FileLoader.reset();
	
	function PlaceHolder(){}
	
	function Constructor(){}
	(function(){
		var 
			initializing = false;
			
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
		 *   publics     : the public interface for the class
		 *   statics     : variables to be shared between class instances
		 *   onReady     : function to call when DOM is ready, instance passed in
		 *   onDefine    : function to call when class has been defined
		 * }
		 */
		Constructor.prototype.define = function( settings ){
			var
				dis = this,
				requests = settings.require,
				ns = ( settings.namespace ? Namespace.parse(settings.namespace) : [] ),
				namespace = ( settings.namespace ? Namespace.get(ns) : global ),
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
				requests.push( settings.parent );
			}
			
			if ( settings.aliases ){
				for( var namespace in settings.aliases ){ requests.push( namespace ); }
			}
			
			function def(){
				var
					parent = Namespace.get( settings.parent );
					
				if ( parent && parent.prototype.__defining ){
					setTimeout( def, 10 );
				}else{
					define.call( dis, settings, obj );
					
					if ( settings.onDefine ){
						settings.onDefine( obj );
					}
					
					if ( settings.onReady ){
						$(document).ready(function(){
							settings.onReady( obj );
						});
					}
					
					delete obj.prototype.__defining;
				}
			};
			
			FileLoader.require( requests, def, [], this);
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
			}
			
			obj.prototype.__construct = settings.construct ? settings.construct : function(){};
			obj.prototype.__defining = true;
			
			namespace[ settings.name ] = obj;
			
			ns.push( settings.name );
			obj.prototype._name = ns.join('.');
			
			// define any aliases
			if ( settings.aliases ){
				this.alias( obj, settings.aliases );
			}
			
			// right now, i am making it static on the prototype level, so __parent.__static might be neccisary
			this.statics( obj, settings.statics );
			
			if ( settings.publics ){
				this.publics( obj, settings.publics );
			}
		};
		
		Constructor.prototype.publics = function( child, publics ){
			for( var name in publics ){
				child.prototype[name] = publics[name];
			}
		};
		
		Constructor.prototype.statics = function( child, statics ){
			if ( child.prototype.__static ){
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
			child.prototype.__parent = parent.prototype;
			initializing = false;
		};
	}());
	
	global.bMoor = {
		require     : function(){
			FileLoader.require.apply( FileLoader, arguments );
		},
		settings    : environmentSettings,
		loader      : FileLoader,
		constructor : new Constructor()
	};
	
}( jQuery, this ));
