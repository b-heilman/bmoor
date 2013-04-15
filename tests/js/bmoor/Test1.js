bMoor.constructor.define({
	name : 'Test1',
	namespace : 'bmoor',
	construct : function(){
	},
	statics : {
		message : 'Test 1 is active'
	},
	publics : {
		hello : function(){
			console.log( this.__static.message );
		}
	}
});