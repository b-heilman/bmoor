bMoor.constructor.define({
	name : 'Test3',
	namespace : ['bmoor','test'],
	statics : {
		message : 'Test 3 is active'
	},
	properties : {
		hello : function(){
			console.log( this.__static.message );
		}
	}
});