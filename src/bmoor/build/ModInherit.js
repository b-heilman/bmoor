bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent', 
		function( id, namespace, name, mount, parent){
			var dis = this,
				t;

			if ( parent ){
				t = function(){ 
					this.constructor = dis; // once called, define
				};
				t.prototype = parent.prototype;
				this.prototype = new t();
			}
				
			this.prototype.__class = id;
			this.prototype.__namespace = namespace;
			this.prototype.__name = name;
			this.prototype.__mount = mount;
		}]
	);
}]);
