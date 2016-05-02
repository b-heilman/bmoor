describe('bmoor.build.ModSingleton', function(){

	function Const(){
		this.foo = 'bar';
		hasCalled = true;
	}

	var hasCalled,
		Temp = bMoor.test.make({
			construct: Const,
			properties: {
				uid : 'id'
			}
		}),
		Temp2 = bMoor.test.make({
			parent: Temp,
			properties: {
				uid : 'id2'
			}
		});

	beforeEach(function(){
		hasCalled = false;
	});

	it('should work with a simple constructor', function(){
		var t = new Temp();

		expect( hasCalled ).toBe( true );
		expect( t.uid ).toBe( 'id' );
		expect( t.foo ).toBe( 'bar' );
	});

	it('should work after inheritance', function(){
		var t = new Temp2();

		expect( hasCalled ).toBe( true );
		expect( t.uid ).toBe( 'id2' );
		expect( t.foo ).toBe( 'bar' );
	});
});