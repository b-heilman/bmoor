bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	'use strict';

	Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent', 
		function( id, namespace, name, mount, parent){
			var dis = this,
				T;

			if ( parent ){
				T = function(){ 
					this.constructor = dis; // once called, define
				};
				T.prototype = parent.prototype;
				this.prototype = new T();
			}
			
			this.prototype.$static = dis;	
			this.prototype.__class = id;
			this.prototype.__namespace = namespace;
			this.prototype.__name = name;
			this.prototype.__mount = mount;
		}]
	);
}]);