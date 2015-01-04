describe('Testing bmoor.error.Basic', function(){
	'use strict';
	
	var Basic,
		t; 

	beforeEach(bMoor.test.injector(['bmoor.error.Basic',function( B ){
		Basic = B;
		t = new Basic( 'this is a message' );
	}]));

	it('Should pass through the message', function(){
		expect( t.error ).toBe( 'this is a message' );
	});
});