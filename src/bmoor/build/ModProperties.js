(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		function def( obj, properties ){
			var name;

			for( name in properties ){
				obj.prototype[name] = properties[name];
			}
		}

		Compiler.$instance.addModule( 10, 'bmoor.build.ModPropertoes', ['properties', function( properties ){
			var dis = this;

			if ( bMoor.isArray(properties) ){
				return bMoor.inject( properties, true ).then(function( props ){
					def( dis, props );
				});
			}else{
				def( this, properties );
			}
		}]);
	});

}());
