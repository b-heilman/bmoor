bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 5, 'bmoor.build.ModSingleton', 
		['-singleton', '-name', '-mount',function( singleton, name, mount ){
			var obj = this;

			if ( singleton ){
				// TODO : Do I want to do this better?
				if ( !bMoor.isArray(singleton) ){
					singleton = [];
				}

				singleton.$arguments = true;
				obj.$instance = mount[ '$'+name[0].toLowerCase() + name.substr(1) ] = new obj( singleton );
			}
		}]
	);
}]);