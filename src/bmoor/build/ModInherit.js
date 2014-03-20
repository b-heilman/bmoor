(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent', 
		function( id, namespace, name, mount, parent){
			var t,
				className,
				dis = this;

			if ( parent ){
				return bMoor.inject([parent, function(Parent){
					className = Parent.prototype.__class;
					
					t = function(){ 
						this.constructor = dis; // once called, define
					};
					t.prototype = Parent.prototype;
					dis.prototype = new t();

					dis.prototype[ className ] = Parent.prototype;

					dis.prototype.__class = id;
					dis.prototype.__namespace = namespace;
					dis.prototype.__name = name;
					dis.prototype.__mount = mount;
				}]);
			}else{
				this.prototype.__class = id;
				this.prototype.__namespace = namespace;
				this.prototype.__name = name;
				this.prototype.__mount = mount;
			}
		}]);
	});

}());
