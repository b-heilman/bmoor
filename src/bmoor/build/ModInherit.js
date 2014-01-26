(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', ['parent', function( parent ){
			var className;

			if ( parent ){
				Parent = bMoor.ensure( parent );
				className = Parent.prototype.__class;

				if ( Parent.$construct !== undefined ){
					Parent.$construct = false;
					this.prototype = new Parent();
					Parent.$construct = true;
				}else{
					this.prototype = new Parent();
				}
				
				this.prototype.constructor = this;
				this.prototype[ className ] = Parent.prototype;
			}
		}]);
	});

}());
