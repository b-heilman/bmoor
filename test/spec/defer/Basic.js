describe("bmoor.defer.Basic", function() {
	'use strict';
	
	var Basic;

	beforeEach(bMoor.test.injector(['bmoor.defer.Basic',function( B ){
		Basic = B;
	}]));

	it("Should allow for a proper default chain", function() {
		var arr = [],
			m = new Basic(function(){
				arr.push( 'some exception 1' );
			}),
			m2 = new Basic(function(){
				arr.push( 'some exception 2' );
			}),
			m3 = new Basic(function(){
				arr.push( 'some exception 3' );
			});

		m2.resolve('m2 - woot');
		m.promise
			.then(function(value){
				arr.push( value );
				return 'm1 - woot';
			})
			.then(function(value){
				arr.push( value );
				return m2.promise;
			})
			.then(function(value){
				arr.push( value );
				return m3.promise;
			})
			.then(function(value){
				arr.push( value );
				throw '--derp--';
			}).
			then(function(){
				arr.push( 'success' );
			},function(){
				arr.push( 'failure' );
			});

		m.resolve('hey');
		m3.resolve('m3 - woot');

		expect( arr ).toEqual([
			'hey',
			'm1 - woot',
			'm2 - woot',
			'm3 - woot',
			'failure',
			'some exception 1'
		]);
	});

	it('should allow for rejection inside the sucess statement', function(){
		var m = new Basic(),
			v,
			t;

		m.promise.then(function(){
			expect( this.reject ).toBeDefined();
			this.reject('woot');
		}).then(
			function( i ){
				v = i;
				t = true;
			},
			function( i ){
				v = i;
				t = false;
			}
		);

		m.resolve( true );

		expect( v ).toBe( 'woot' );
		expect( t ).toBe( false );
	});

	it('should cascade resolutions', function(){
		var m = new Basic(),
			v,
			t;

		m.promise
			.catch(function(){})
			.catch(function(){})
			.then(
				function( i ){
					v = i;
					t = true;
				},
				function( i ){
					v = i;
					t = false;
				}
			);

		m.resolve( 'woot' );

		expect( v ).toBe( 'woot' );
		expect( t ).toBe( true );
	});

	it('should cascade rejections', function(){
		var m = new Basic(),
			v,
			t;

		m.promise
			.then(function(){})
			.then(function(){})
			.then(
				function( i ){
					v = i;
					t = true;
				},
				function( i ){
					v = i;
					t = false;
				}
			);

		m.reject( 'woot' );

		expect( v ).toBe( 'woot' );
		expect( t ).toBe( false );
	});
});
