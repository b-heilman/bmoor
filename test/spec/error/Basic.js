describe('Testing bmoor.error.Basic', function(){
	var Basic = bMoor.get( 'bmoor.error.Basic' ),
		t = new Basic( 'this is a message' );

	it('Should pass through the message', function(){
		expect( t.error ).toBe( 'this is a message' );
	});
});