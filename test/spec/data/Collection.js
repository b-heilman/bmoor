describe('Testing bmoor.data.Collection', function(){
	var t,
		result,
		g = {},
		Collection = bMoor.get( 'bmoor.data.Collection' );

	bMoor.make('test.Collection', [function(){
		return {
			parent : Collection,
			construct : function TestCollection( content ){
				return Collection.call( this, content );
			},
			properties : {
				hello : function( io ){
					result = io;
				},
				$inflate : function( io ){
					io.push( io[0] + io[1] );
					return io;
				}
			}
		};
	}], g);

	beforeEach(function(){
		t = new g.test.Collection([
			1,
			2
		]);
	});

	it('should be an object', function(){
		expect( bMoor.isArray(t) ).toBe( true );
	});

	it('should run the constructor', function(){
		expect( t[2] ).toBe( 3 );
	});

	it('should copy over attributes', function(){
		expect( t[0] ).toBe( 1 );
	});

	it('should have default properties', function(){
		expect( t.$toJson ).toBeDefined();
	});

	it('should call properties', function(){
		t.hello( 'woot' );
		expect( result ).toBe( 'woot' );
	});
});