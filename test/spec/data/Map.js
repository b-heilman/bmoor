describe('Testing bmoor.data.Map', function(){
	var t,
		result,
		g = {},
		Map = bMoor.get('bmoor.data.Map');

	bMoor.make('test.Map', [function(){
		return {
			parent : Map,
			construct : function TestMap( content ){
				Map.call( this, content );
			},
			properties : {
				hello : function( io ){
					result = io;
				},
				$inflate : function( io ){
					io.woot = 'wootwoot';
					io.name = io.firstName + ' ' + io.lastName;

					return io;
				}
			}
		};
	}], g);

	beforeEach(function(){
		t = new g.test.Map({
			firstName : 'John',
			lastName : 'Doey',
			eins : 1,
			zwei : 2,
			drei : 3
		});
	});

	it('should be an object', function(){
		expect( bMoor.isObject(t) ).toBe( true );
	});

	it('should run the constructor', function(){
		expect( t.name ).toBe( 'John Doey' );
	});

	it('should copy over attributes', function(){
		expect( t.firstName ).toBe( 'John' );
	});

	it('should have default properties', function(){
		expect( t.$toJson ).toBeDefined();
	});

	it('should call properties', function(){
		t.hello( 'woot' );
		expect( result ).toBe( 'woot' );
	});
});