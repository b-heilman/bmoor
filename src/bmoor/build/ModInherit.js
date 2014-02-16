(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', ['parent', function( parent ){
			var dis = this,
				t,
				Parent,
				className;

			if ( parent ){
				Parent = bMoor.ensure( parent );
				className = Parent.prototype.__class;
				
				t = function(){ 
					this.constructor = dis; // once called, define
				};
				t.prototype = Parent.prototype;
				this.prototype = new t();

				this.prototype[ className ] = Parent.prototype;
			}
		}]);
	});

}());
