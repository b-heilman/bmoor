bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	'use strict';

	Compiler.$instance.addModule( -2, 'bmoor.build.ModPlugin', 
		['-plugins', function( plugins ){
			var obj = this;

			if ( plugins ){
				bMoor.loop( plugins, function( request ){
					var o;

					if ( !request.instance ){
						o = obj;
					}else if ( bMoor.isString(request.instance) ){
						o = obj[ '$' + request.instance ]; // link to singletons
					}else{
						o = bMoor.instantiate( obj, request.instance );
					} 

					bMoor.iterate( request.funcs, function( func, plugin ){
						if ( bMoor.isString(func) ){
							func = obj[ func ];
						}

						bMoor.plugin( plugin, function(){ 
							return func.apply( o, arguments ); 
						});
					});
				});
			}
		}]
	);
}]);