bMoor.define( 'bmoor.core.Trait', {
	onMake : function(){
		var inst = this,
			t = new inst();
		
		inst.$wrap = function Trait( obj ){
			var key;
			for( key in t ){
				if ( !obj[key] ){
					obj[key] = t[key];
				}
			}
		};
	}
});
