describe("bmoor.promise", function() {
	var promise = bmoor.promise;

	describe('::stack', function(){
		it("should run correctly", function( done ){
			var calls = 0,
				stack = [];

			function add(){
				stack.push(function(){
					calls++;

					return Promise.resolve();
				});
			}

			while( stack.length < 10 ){
				add();
			}

			promise.stack(stack).then(function(){
				expect( calls ).toBe( 10 ); // all the methods called
				expect( stack.length ).toBe( 10 ); // don't be destructive

				done();
			}, function( ex ){
				console.log( ex.message );
				console.log( ex );
			});
		});

		it("should run correctly, with staggered times", function( done ){
			var calls = 0,
				stack = [];

			function add(){
				stack.push(function(){
					calls++;

					return new Promise(function( resolve ){
						setTimeout( resolve, Math.random()*100 );
					});
				});
			}

			while( stack.length < 10 ){
				add();
			}

			promise.stack(stack).then(function(){
				expect( calls ).toBe( 10 ); // all the methods called
				expect( stack.length ).toBe( 10 ); // don't be destructive

				done();
			}, function( ex ){
				console.log( ex.message );
				console.log( ex );
			});
		});

		it("should report back errors", function( done ){
			var calls = 0,
				stack = [];

			function add(){
				let fail = stack.length % 2 === 0;

				stack.push(function(){
					calls++;

					return new Promise(function( resolve, reject ){
						setTimeout( fail?reject:resolve, Math.random()*100 );
					});
				});
			}

			while( stack.length < 100 ){
				add();
			}

			let lastInfo,
				updateCalled = false;

			promise.stack(stack,{
				limit: 10,
				min: 30,
				max: 300,
				update: function( info ){
					lastInfo = info;

					expect( info.active ).toBeDefined();
					expect( info.remaining ).toBeDefined();
				}
			}).then(function(){
				console.log( 'should not be called' );
			}, function( errs ){
				expect( calls ).toBe( 100 ); // all the methods called
				expect( stack.length ).toBe( 100 ); // don't be destructive
				expect( errs.length ).toBe( 50 );

				setTimeout(function(){
					expect( lastInfo.active ).toBe( 0 );
					expect( lastInfo.remaining ).toBe( 0 );
					done();
				}, 301);
			});
		});
	});
});