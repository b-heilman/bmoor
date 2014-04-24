(function(){
	
	bMoor.make( 'bmoor.comm.Connector', {
		properties : {
			request : function( type, options ){
				return ( new bmoor.comm[type](options) ).promise;
			},
			http : function( options ){
				return this.request( 'Http', options );
			},
			get : function( options, data ){
				if ( bMoor.isString(options) ){
					options = { url : options };
				}

				if ( data ){
					options.data = data;
				}

				options.method = 'GET';

				return this.http( options );
			},
			post : function( options, data ){
				if ( bMoor.isString(options) ){
					options = { url : options };
				}

				if ( data ){
					options.data = data;
				}

				options.method = 'POST';

				return this.http( options );
			},
			script : function( src ){
				if ( bMoor.isObject(src) ){
					src = src.url || src.src;
				}

				return this.request( 'Script', src );
			},
			style : function( src ){
				if ( bMoor.isObject(src) ){
					src = src.url || src.src;
				}

				return this.request( 'Style', src );
			},
			image : function( src ){
				var $d = new bmoor.defer.Basic(),
					img = new Image();
				
				if ( src[0] == '#' ){
					src = $( src )[0].src;
				}
				
				// TODO : what about failure?
				img.onload = function(){
					$d.resolve({
						data : img,
						valid : true,
						status : 200,
						headers : undefined
					});
				};
				img.src = src;

				return $d.promise;
			}
		}
	});

}());

/*
parseTemplate : function( template ){
			var rtn = null;

			switch( typeof(template) ){
				case 'string' :
					rtn = template.replace( /\s*<!\[CDATA\[\s*|\s*\]\]>\s*|[\r\n\t]/g, '' );
					break;
					
				case 'function' :
					rtn = ( template.isTemplate ) ? template :
						template.toString().split(/\n/).slice(1, -1).join('\n'); 
					break;
					
				default :
					break;
			}

			return rtn;
		},
*/