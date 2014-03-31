bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( 4, 'bmoor.build.ModPlugin', 
		['-plugins', function( plugins ){
			var obj = this.$instance || this;

			bMoor.iterate( plugins, function( func, plugin ){
				if ( bMoor.isString(func) ){
					func = obj[ func ];
				}

				bMoor.plugin( plugin, function(){ 
					return func.apply( obj, arguments ); 
				});
			});
		}]
	);
}]);
