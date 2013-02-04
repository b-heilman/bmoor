bMoor.constructor.create({
	name : 'Test1',
	namespace : 'bmoor',
	statics : {
		message : 'Test 1 is active'
	},
	publics : {
		hello : function(){
			console.log( this.__statics.message );
		}
	}
});