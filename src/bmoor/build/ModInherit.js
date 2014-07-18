bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent', 
		function( id, namespace, name, mount, parent){
			var dis = this,
				proto,
				T;

			if ( parent ){
				if ( bMoor.isFunction(parent) ){
					// we assume this a constructor function
					proto = parent.prototype;
				}else{
					// we want to inherit directly from this object
					proto = parent;
				}

				T = function(){ 
					this.constructor = dis; // once called, define
				};
				T.prototype = proto;
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