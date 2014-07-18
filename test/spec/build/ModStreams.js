describe('bmoor.comm.Stream', function(){
	var Mock,
		settings = bMoor.get('bmoor.build.ModStreams').settings,
		Http = bMoor.get('bmock.comm.Http');

	settings.http = Http;

	describe( 'permit allow multiple streams to be configured at once', function(){
		var instance;

		bMoor.make( 'Test', {
			parent : Mock,
			streams : {
				'callTest' : {
					url : 'test/test.htm'
				},
				'anotherTest' : {
					url : 'test/test2.htm'
				},
				'cachedTest' : {
					url : 'test/cached.htm',
					cached : true 
				},
				'responseTest' : {
					url : 'test/response.htm',
					response : {
						test : '10-4'
					}
				}
			}
		}, {}).then(function( o ){
			instance = new o();
		});

		it ( 'should define service endpoints', function(){
			expect( instance.callTest ).toBeDefined();
		});

		it ( 'should allow for a url to be requested and passed back data', function(){
			Http.expect( 'test/test.htm', 200, {
				foo : 'bar'
			});

			instance.callTest().then(function( data ){
				expect( data.foo ).toBe( 'bar' );
			});
		});
		
		it ( 'should not cache a url by default', function(){
			Http.expect( 'test/test2.htm', 200, {
				eins : 'zwei'
			});

			Http.expect( 'test/test2.htm', 200, {
				hello : 'world'
			});

			instance.anotherTest().then(function( data ){
				expect( data.eins ).toBe( 'zwei' );
			});

			instance.anotherTest().then(function( data ){
				expect( data.hello ).toBe( 'world' );
			});

			expect( Http.hasMetExpectations() ).toBe( true );
			expect( Http.hasNoOutstandingRequests() ).toBe( true );
		});

		it ( 'should allow requests to be cached', function(){
			Http.expect( 'test/cached.htm', 200, {
				foo : 'bar'
			});

			instance.cachedTest().then(function( data ){
				expect( data.foo ).toBe( 'bar' );
			});

			instance.cachedTest().then(function( data ){
				expect( data.foo ).toBe( 'bar' );
			});

			expect( Http.hasMetExpectations() ).toBe( true );
			expect( Http.hasNoOutstandingRequests() ).toBe( true );
		});

		it ( 'should allow responses to be injected', function(){
			instance.responseTest().then(function( data ){
				expect( data.test ).toBe( '10-4' );
			});

			expect( Http.hasMetExpectations() ).toBe( true );
			expect( Http.hasNoOutstandingRequests() ).toBe( true );
		});
	});
});