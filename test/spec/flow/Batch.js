describe( 'bmoor.flow.Batch', function(){
	var Timeout = bMoor.get('bmock.flow.Timeout'),
		Mock,
		timeout,
		mountUp;

	bMoor.mock( {}, 'bmoor.flow.Batch', {
		'bmoor.flow.Timeout' : Timeout
	}).then(function( o ){
		Mock = o;
	});

	beforeEach(function(){
		mountUp = new Mock();
	}); 

	if ( 'should be defined', function(){
		expect( mountUp ).toBeDefined();
	});

	it ( 'should  allow you to wrap existing functions', function(){
		var t = {
			f : function(){
				return 'hello';
			}
		};

		t.f = mountUp.wrap( t.f );

		t.f();

		expect( mountUp.content ).toBe( 'hello' );
	});

	it ( 'have multiple results stack up', function(){
		var t = {
			f : function( o ){
				return o;
			}
		};

		t.f = mountUp.wrap( t.f );

		t.f({
			eins : 1
		});

		t.f({
			zwei : 2
		});

		expect( mountUp.content ).toEqual({
			eins : 1,
			zwei : 2
		});
	});

	it ( 'should only fire watches every 30 ms after last call', function(){
		var content,
			t = {
			f : function( o ){
				return o;
			}
		};

		t.f = mountUp.wrap( t.f );

		t.f({
			eins : 1
		});

		mountUp.notice(function( val ){
			content = val;
		});

		Timeout.tick( 20 );
		expect( content ).toBeUndefined();

		t.f({
			zwei : 2
		});

		Timeout.tick( 20 );
		expect( content ).toBeUndefined();

		Timeout.tick( 30 );
		expect( content ).toEqual({
			eins : 1,
			zwei : 2
		});
	});
});