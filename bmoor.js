

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
		
		Bouncer.setStackOrder = function( stack ){
			stacks = stack;
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
			
			space = this.parse( space );
			
			for( var i = 0; i < space.length; i++ ){
				var
					nextSpace = space[i];
					
				if ( !curSpace[nextSpace] ){
					curSpace[nextSpace] = {};
				}
				
				curSpace = curSpace[nextSpace];
			}
			
			return currSpace;
		},
		exists : function( space ){
			var 
				curSpace = global;
			
			space = this.parse( space );
			
			for( var i = 0; i < space.length; i++ ){
				var
					nextSpace = space[i];
					
				if ( !curSpace[nextSpace] ){
					return false;
				}
				
				curSpace = curSpace[nextSpace];
			}
			
			return true;
		}
	};
	
	var FileLoader = {};
	(function(){
		// A multi level hash that allows for different libraries to be located in different locations
		var
			libRoots = {};
			
		FileLoader.resetLibrary = function(){
			libRoots = {
				'/' : environmentSettings.jsRoot
			};
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
		
		FileLoader.getLibrary = function( className ){
			var
				lib = libRoots,
				masterLib = libRoots,
				classPath = Namespace.parse( className ),
				masterPath = classPath.slice(0);
			
			while( classPath.length ){
				var
					dir = classPath[0];
				
				if ( lib[dir] ){
					lib = lib[ classPath.shift() ];
					
					if ( lib['/'] ){
						masterLib = lib;
						masterPath = classPath.slice(0);
						console.log( masterPath );
					}
				}else{
					break;
				}
			}
			
			console.log( masterLib, masterPath );
			return masterLib['*'] 
				? { root : masterLib['/'], path : [],         settings : masterLib['.'] } 
				: { root : masterLib['/'], path : masterPath, settings : masterLib['.'] };
		};
		
		FileLoader.loadClass = function( className, callback, args, target ){
			var
				classPath = Namespace.parse( className );

			if ( !Namespace.exists(classPath) ){
				var
					info = this.getLibrary( classPath ),
					success = function( script, textStatus ){
						if ( Namespace.exists(classPath) ){
							if ( callback ){
								if ( target == undefined ){
									target = {};
								}
								
								if ( args == undefined ){
									args = [];
								}
								
								callback.apply( target, args );
							}
						}else{
							error( 'loaded file : '+script+"\n but no class : "+classPath.join('.') );
						}
					},
					path = info.root + ( info.path.length ? '/'+info.path.join('/') : '' );

				console.log( info, path );
				
				$.getScript( path+'.js' )
					.done( success )
					.fail( function(){
						$.getScript( path+'.min.js' )
							.done( success )
							.fail( function( jqxhr, settings, exception ){
								error( 'failed to load file : '+path+"\nError : "+exception );
							});
					});
			}
		};
	}());
	FileLoader.resetLibrary();
	
	global.bMoor = {
		fileloader : FileLoader
	};
	
}( jQuery, this ));
