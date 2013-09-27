;(function( $, global, undefined ){

bMoor.constructor.singleton({
	name : 'Resource',
	namespace : ['bmoor','lib'],
	module : 'Resource',
	onReady : function( self ){
		var 
			i,
			j,
			c,
			co,
			minified,
			instance,
			templateId,
			links = document.getElementsByTagName('link'),
			scripts = document.getElementsByTagName('script');

		bMoor.setTemplate = function( id, template ){
			self.setTemplate( id, template );
		};

		// if there are already templates set, lets convert them over
		for( templateId in bMoor.templates ){
			self.setTemplate( templateId, bMoor.templates[templateId] );
		}

		for( i = 0, c = scripts.length; i < c; i++ ){
			instance = scripts[ i ];
			
			if ( instance.hasAttribute('snap-min') ){
				minified = instance.getAttribute('snap-min').split(';');
				for( j = 0, co = minified.length; j < co; j++ ){
					self.__static.loadedScripts[ minified[j] ] = instance;
				}
			}else if ( instance.src ){
				self.__static.loadedScripts[ instance.src ] = instance;
			}

			if ( instance.id ){
				if ( instance.type == "text/html" ){
					self.setTemplate( instance.id, instance.innerHTML );
				}
			}
		}

		for( i = 0, c = links.length; i < c; i++ ){
			instance = links[ i ];

			if ( instance.rel == 'stylesheet' ){
				if ( instance.hasAttribute('snap-min') ){
					minified = instance.getAttribute('snap-min').split(';');
					for( j = 0, co = minified.length; j < co; j++ ){
						self.__static.loadedStyles[ minified[j] ] = instance;
					}
				}else if ( instance.href ){
					self.__static.loadedStyles[ instance.href ] = instance;
				}
			}
		}
	},
	statics : {
		loadedScripts : {},
		loadedStyles : {}
	},
	properties : {
		settings : {
			version : null
		},
		loadScript : function( src, cb ){
			if ( this.settings.version ){
				if ( src.indexOf('?') == -1 ){
					src += '?v=' + this.settings.version;
				}else{
					src += '&v=' + this.settings.version;
				}
			}

			$.ajax({ url : src, dataType : 'script', success : cb });
		},
		loadStyle : function( src, cb ){
			var
				css,
				style,
				sheet,
				interval = null;
			
			if ( this.settings.version ){
				if ( path.indexOf('?') == -1 ){
					path += '?v=' + this.settings.version;
				}else{
					path += '&v=' + this.settings.version;
				}
			}

			style = document.createElement( 'link' );
			style.setAttribute( 'href', path );
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
			
			if ( cb == undefined && typeof(src) != 'string' ){
				cb = src;
				src = null;
			}
			
			if ( this.settings.version ){
				if ( src.indexOf('?') == -1 ){
					src += '?v=' + this.settings.version;
				}else{
					src += '&v=' + this.settings.version;
				}
			}

			if ( id[0] == '#' ){
				// TODO : is this right?
				id = id.substring(1);
			}
			
			if ( !templates[id] ){
				/*
				if ( loadedScripts[src] ){
					// script already was loaded
					var sid = loadedScript[src];
					
					if ( templates[sid] ){
						templates[id] = templates[sid];
					}else{
						this.setTemplate( id, document.getElementById(sid).innerHTML );
					}
				}else 
				*/
				if ( node = document.getElementById(id) ){
					this.setTemplate( id, node.innerHTML );
				}else if ( src == null ){
					throw 'loadTemplate : ('+id+') requested, and not found, while src is null';
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

			if ( dis == null ) {
				if ( cb ){
					cb( templates[id] );
				}else{
					return templates[id];
				}
			}
			
			return null;
		},
		setTemplate : function( id, template ){
			var templates = bMoor.templates;

			switch( typeof(template) ){
				case 'string' :
					templates[ id ] = template.replace( /\s*<!\[CDATA\[\s*|\s*\]\]>\s*|[\r\n\t]/g, '' );
					break;
					
				case 'function' :
					// assumes formatting like : 
					// function(){/*
					//   ... the template code ...
					// */}
					templates[ id ] = template.toString().split(/\n/).slice(1, -1).join('\n'); 
					break;
					
				default :
					break;
			}
		}
	}
}, true);

}( jQuery, this ));