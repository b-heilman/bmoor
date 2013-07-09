bMoor.constructor.define({
	name : 'Test2',
	namespace : 'bmoor',
	parent : 'bmoor.Test1',
	statics : {
		message : 'Test 2 is active'
	},
	properties : {
		hello : function(){
			console.log( this.__static.message );
		}
	}
});