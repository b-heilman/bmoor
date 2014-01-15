(function( bMoor, compiler ){

	function def( obj, properties ){
		var name;

		for( name in properties ){
			obj.prototype[name] = properties[name];
		}
	}

	compiler.addModule( 10, ['properties', function( properties ){
		var dis = this;

		if ( bMoor.isArray(properties) ){
			/**
				allows you to define ['Class1','Class2', function(Class1, Class2){
					return {
						getClass1(){
							return new Class1();
						}
					}
				}];
			**/
			return bMoor.inject( properties, true ).then(function( props ){
				def( dis, props );
			});
		}else{
			def( this, properties );
		}
	}]);

}( bMoor, bMoor.compiler ));
