describe('bmoor.build.ModSingleton', function(){

	function Const(){
		this.foo = 'bar';
	}

	function Const2(){
		this.hello = 'world';
	}

	var table = bMoor.test.make({
			singleton: true,
			construct: Const,
			properties: {
				uid : 'id'
			}
		}),
		Temp = bMoor.test.make({
			construct: Const2,
			properties: {
				uid : 'id2'
			}
		}),
		temp = bMoor.test.make({
			singleton: true,
			parent: Temp
		});

	it('should work with a simple constructor', function(){
		expect( table instanceof Const ).toBe( true );
		expect( table.uid ).toBe( 'id' );
		expect( table.foo ).toBe( 'bar' );
	});

	it('should work after inheritance', function(){
		expect( temp instanceof Const2 ).toBe( true );
		expect( temp.uid ).toBe( 'id2' );
		expect( temp.hello ).toBe( 'world' );
	});
});