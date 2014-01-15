(function( bMoor, compiler ){

compiler.addModule( 90, 'bmoor.build.Inherit', ['parent', function( Parent ){
	Parent = bMoor.find(Parent);

	if ( Parent ){
		if ( Parent.$construct !== undefined ){
			Parent.$construct = false;
			this.prototype = new Parent();
			Parent.$construct = true;
		}else{
			this.prototype = new Parent();
		}
		
		this.prototype.constructor = this;
		this.prototype[ Parent.prototype.__class ] = Parent.prototype;
	}
}]);

}( bMoor, bMoor.compiler ));
