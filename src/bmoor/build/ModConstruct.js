(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 20, 'bmoor.build.ModConstruct', 
		['-construct', '-abstract', '-id', function( construct, abstract, id ){
			if ( abstract ){
				this.prototype._construct = function(){
					throw id+' is abstracted, either extend or use only static members';
				};
			}else if ( construct ){
				this.prototype._construct = construct;
			}
		}]);
	});

}());
