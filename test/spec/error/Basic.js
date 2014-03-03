describe('Testing bmoor.error.Basic', function(){
	var t = new bmoor.error.Basic('this is a message');

	it('Should pass through the message', function(){
		expect( t.error ).toBe( 'this is a message' );
	});
});