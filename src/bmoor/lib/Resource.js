;(function( $, global, undefined ){

var
	templates = {},
	loadedScripts = {};

bMoor.constructor.singleton({
	name : 'Resource',
	namespace : ['bmoor','lib'],
	module : 'Resource',
	onReady : function(){
		var scripts = document.getElementsByTagName('script');
		
		for( var i = 0, c = scripts.length; i < c; i++ ){
			var script = scripts[i];
			
			if ( script.id ){
				if ( script.src ){
					bMoor.module.Resource.__static.loadedScripts[ script.src ] = script.id;
				}
				
				if ( script.getAttribute('type') == "text/html" ){
					bMoor.module.Resource.setTemplate( script.id, script.innerHTML );
				}
			}
		}
	},
	statics : {
		templates : {},
		loadedScripts : {}
	},
	construct : function(){
		$.jqotetag( bMoor.settings.templatorTag );
	},
	properties : {
		loadScript : function( src, cb ){
			$.ajax({ url : src, dataType : 'script', success : cb });
		},
		loadStyle : function( src, cb ){
			var
				css,
				style,
				sheet,
				interval = null;
			
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
				templates = this.__static.templates;
			
			if ( cb == undefined && typeof(src) != 'string' ){
				cb = src;
				src = null;
			}
			
			if ( id[0] == '#' ){
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
				}else if ( node = document.getElementById(id) ){
					this.setTemplate( id, node.innerHTML );
				}else if ( src == null ){
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
			var templates = this.__static.templates;

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