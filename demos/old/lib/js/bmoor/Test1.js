bMoor.constructor.define({
	name : 'Test1',
	namespace : 'bmoor',
	statics : {
		message : 'Test 1 is active'
	},
	properties : {
		hello : function(){
			console.log( this.__static.message );
		}
	}
});