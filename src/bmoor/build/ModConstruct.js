(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 20, 'bmoor.build.ModConstruct', ['construct', 'id', function( construct, id ){
			if ( construct ){
				this.prototype._construct = construct;
			}
		}]);
	});

}());
