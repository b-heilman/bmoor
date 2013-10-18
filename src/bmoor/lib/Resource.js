;(function( global, undefined ){
	"use strict";

	var
		templates = {},
		loadedScripts = {};

	bMoor.constructor.singleton({
		name : 'Resource',
		namespace : ['bmoor','lib'],
		module : 'Resource',
		onReady : function( self ){
			var 
				templateId,
				scripts = document.getElementsByTagName('script');

			bMoor.setTemplate = function( id, template ){
				self.setTemplate( id, template );
			};

			// if there are already templates set, lets convert them over
			for( templateId in bMoor.templates ){
				self.setTemplate( templateId, bMoor.templates[templateId] );
			}

			for( var i = 0, c = scripts.length; i < c; i++ ){
				var script = scripts[i];
				
				if ( script.id ){
					if ( script.src ){
						self.__static.loadedScripts[ script.src ] = script.id;
					}
					
					if ( script.getAttribute('type') == "text/html" ){
						self.setTemplate( script.id, script.innerHTML );
					}
				}
			}
		},
		statics : {
			loadedScripts : {}
		},
		properties : {
			loadScriptSet : function( ){
				var 
					scripts = Array.prototype.slice.call( arguments, 0 ),
					callback = scripts.pop(),
					script = scripts.shift(),
					first = script,
					load = function(){
						$.getScript( script )
							.done( callback )
							.fail( function( jqxhr, settings, exception ){
								if ( scripts.length ){
									script = scripts.shift();
									load();
								}else{
									error( 'failed to load file : '+first+"\nError : "+exception );
								}
							});
					};

				load();
			},
			loadScript : function( request, callback, root ){
				var 
					dis = this,
					script;

				if ( typeof(request) == 'string' ){
					request = [ request ];
				}

				script = ( root || '' ) + request.shift();
				$.getScript( script )
					.done(function(){
						if ( request.length ){
							dis.loadScript( request, callback, root );
						}else{
							callback();
						}
					})
					.fail( function( jqxhr, settings, exception ){
						error( 'failed to load file : '+script+"\nError : "+exception );
					});
			},
			loadStyle : function( src, cb ){
				var
					css,
					style,
					sheet,
					interval = null;
				
				style = document.createElement( 'link' );
				style.setAttribute( 'href', src );
				style.setAttribute( 'rel', 'stylesheet' );
				style.setAttribute( 'type', 'text/css' );
				
				if ( style.sheet ){
					sheet = 'sheet';
					css = 'cssRules';
					
					interval = setInterval( function(){
						try{
							if ( style[sheet] && style[sheet][css] && style[sheet][css].length ){
								clearInterval( interval );
								cb();
							}
						}catch( ex ){ /* I feel dirty */ }
					},10 );
				}else{
					// IE specific
					$( style ).bind( 'load', cb );
				}
				
				$('head').append( style );
			},
			loadImage : function( src, cb ){
				var img = new Image();
				
				if ( src[0] == '#' ){
					src = $( src )[0].src;
				}
				
				img.onload = cb;
				img.src = src;
			},
			loadTemplate : function( id, src, cb ){
				var 
					node,
					dis = null,
					templates = bMoor.templates;
				
				if ( cb === undefined && typeof(src) != 'string' ){
					cb = src;
					src = null;
				}
				
				if ( id[0] === '#' ){
					// TODO : is this right?
					id = id.substring(1);
				}
				
				if ( !templates[id] ){
					if ( loadedScripts[src] ){
						// script already was loaded
						var sid = loadedScript[src];
						
						if ( templates[sid] ){
							templates[id] = templates[sid];
						}else{
							this.setTemplate( id, document.getElementById(sid).innerHTML );
						}
					}else if ( (node = document.getElementById(id)) !== null ){
						this.setTemplate( id, node.innerHTML );
					}else if ( src === null ){
						throw 'loadTemplate : '+id+' requested, and not found, while src is null';
					}else{
						dis = this;
						
						$.ajax( src, {
							// TODO
							success : function( res ){
								dis.setTemplate( res );
								
								cb( templates[id] );
							}
						});
					}
				}

				if ( dis === null ) {
					if ( cb ){
						cb( templates[id] );
					}else{
						return templates[id];
					}
				}
				
				return null;
			},
			parseTemplate : function( template ){
				var rtn = null;

				switch( typeof(template) ){
					case 'string' :
						rtn = template.replace( /\s*<!\[CDATA\[\s*|\s*\]\]>\s*|[\r\n\t]/g, '' );
						break;
						
					case 'function' :
						// assumes formatting like : 
						// function(){/*
						//   ... the template code ...
						// */}
						rtn = template.toString().split(/\n/).slice(1, -1).join('\n'); 
						break;
						
					default :
						break;
				}

				return rtn;
			},
			setTemplate : function( id, template ){
				bMoor.templates[ id ] = this.parseTemplate( template );
			}
		}
	}, true);

}( this ));