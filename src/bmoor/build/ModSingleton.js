(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 5, 'bmoor.build.ModeSingleton', ['singleton', function( singleton ){
			var obj = this;

			if ( singleton ){
				if ( !bMoor.isArray(singleton) ){
					singleton = [];
				}

				singleton.$arguments = true;

				obj.$instance = new obj( singleton );
			}
		}]);
	});

}());