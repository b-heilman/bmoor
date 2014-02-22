(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent', 
		function( id, namespace, name, mount, parent){
			var t,
				Parent,
				className,
				dis = this;

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

			this.prototype.__class = id;
			this.prototype.__namespace = namespace;
			this.prototype.__name = name;
			this.prototype.__mount = mount;
		}]);
	});

}());
