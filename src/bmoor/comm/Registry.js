(function( bMoor, undefined ){
	"use strict";

	bMoor.define({
		'name' : 'bmoor.comm.Registry',
		singleton: true,
		construct : function(){
			var scripts,
				scriptTag, // will be this script
				match;

			if ( !bMoor.root ){
				scripts = document.getElementsByTagName( 'script' );
				scriptTag = scripts[ scripts.length - 1 ]; // will be this script

				if ( scriptTag.hasAttribute('root') ){
					bMoor.root = scriptTag.getAttribute('root');
				}else{
					match = scriptTag.getAttribute('src').match(/^(.*)\/b[Mm]oor(\.min)?\.js/);

					if ( match ){
						bMoor.root = match[ 1 ];
					}else{
						match = scriptTag.getAttribute('src').match(/^(.*)\/(js|src|scripts)/);

						if ( match ){
							bMoor.root = match[0];
						}else{
							bMoor.root = '';
						}
					}
				}
			}

			this.reset( bMoor.root );
		},
		plugins : {
			'ns.locate' : function( ns ){
				return this.locate( ns );
			},
			'ns.register' : function( className, path, settings, catchAll ){
				return this.set( className, path, settings, catchAll );
			}
		},
		properties : {
			// A multi level hash that allows for different libraries 
			// to be located in different locations
			libRoots : {},
			parseResource : function( root ){
				var resourceMatch = root.match(/^(.*)\/(js|src)/);
				
				if ( resourceMatch ){
					return resourceMatch[1];
				} else /* if( root.match(/^[js|src]/) ){
					return null;
				}else */{
					return null;
				}
			},
			reset : function( path ){
				this.libRoots = {};
				this.setRoot( path );
			},
			setRoot : function( path ){
				this.libRoots['.'] = { 
					fullName : false 
				};
				this.libRoots['/'] = path;
				this.libRoots['>'] = this.parseResource( path );
				this.libRoots.jquery = {
					'/' : path + '/jquery',
					'.' : {
						fullName : true
					}
				};
			},
			/** 
			 * set the location of a library
			 * 
			 * @var {array,string} className The class to set up a path to
			 * @var {string} path The URL path to the library's base
			 */
			set : function( className, path, settings, catchAll ){
				var
					lib = this.libRoots,
					classPath = bMoor.parseNS( className );
				
				if ( !settings ){
					settings = {};
				}
				
				while( classPath.length ){
					var
						dir = classPath.shift();
					
					if ( lib[ dir ] === undefined ){
						lib[ dir ] = {};
					}
					lib = lib[ dir ];
				}
				
				lib['/'] = path;
				lib['.'] = settings;
				lib['*'] = catchAll === true; // type caste
				lib['>'] = this.parseResource( path );
			},
			del : function( className ){
				var
					lib = this.libRoots,
					prevLib = null,
					prevDir = null,
					classPath = bMoor.parseNS( className );
				
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
			},
			/**
			 * 
			 * @param className
			 * @returns
			 */
			get : function( className, namespace ){
				var
					lib = this.libRoots,
					masterLib = this.libRoots, 
					classPath = bMoor.parseNS( className ),
					name = namespace ? null : classPath.pop(),
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
				
				return { 
					root : masterLib['/'], 
					path : ( masterLib['*'] ? [] : masterPath ),         
					name : name, 
					settings : masterLib['.'], 
					resource : masterLib['>']
				};
			},
			locate : function( reference ){
				var info = this.get( reference );

				return info.root + ( info.path.length ? '/'+info.path.join('/') : '' ) + '/' + 
					( info.settings.fullName ? reference : info.name );
			}
		}
	});

}( bMoor ));