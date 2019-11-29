
const {expect} = require('chai');

describe('bmoor.eventing.Broadcast', function(){
	var obj,
		triggered;

	const {Broadcast} = require('./Broadcast.js');

	beforeEach(function(){
		obj = new Broadcast();
		triggered = false;

		obj.on('boom', function( args ){
			triggered = args;
		});
	});

	it('should work as a mixin', function(){
		expect(obj.on).to.exist;
	});

	describe('::trigger', function(){
		it('should properly trigger', function( done ){
			obj.trigger( 'boom', 'doop' );
			
			setTimeout(function(){
				expect( triggered ).to.equal('doop');
				done();
			},0);
		});

		it('should return back a promise that returns when all complete', function(done){
			obj.on('test', function(){
				return new Promise((resolve) => {
					setTimeout(resolve, 10);
				});
			});

			obj.on('test', function(){
				return new Promise((resolve) => {
					setTimeout(resolve, 30);
				});
			});

			let returned = false;

			obj.trigger('test')
			.then(function(){
				returned = true;
			});

			setTimeout(function(){
				expect(returned).to.equal(false);
			}, 20);

			setTimeout(function(){
				expect(returned).to.equal(true);

				done();
			}, 40);
		});

		it('should work with an array for orders of called', function(){
			let called = 0;
			let firstCall = null;
			let secondCall = null;

			obj.on('test', [
				function(var1){
					firstCall = var1;
				},
				function(var2){
					secondCall = var2;
				}
			]);

			obj.on('test', function(){
				called++;
			});

			obj.trigger('test', 'var-1');
			obj.trigger('test', 'var-2');
			obj.trigger('test', 'var-3');

			expect(firstCall).to.equal('var-1');
			expect(secondCall).to.equal('var-2');
			expect(called).to.equal(3);
		});
	});

	it('should pass in arguments', function( done ){
		var t = {};

		obj.trigger( 'boom', t );

		setTimeout(function(){
			expect( triggered ).to.equal( t );
			done();
		},0);
	});

	it('should pass in arguments', function( done ){
		obj.trigger( 'foo', null );

		setTimeout(function(){
			expect( triggered ).to.equal( false );
			done();
		});
	});

	it('should pass multiple arguments', function( done ){
		var eins,
			zwei;

		obj.on('foo', function( arg1, arg2 ){
			eins = arg1;
			zwei = arg2;
		});

		obj.on('foo', function(){
			expect( eins ).to.equal( 'hello' );
			expect( zwei ).to.equal( 'world' );

			done();
		});

		obj.trigger( 'foo', 'hello', 'world' );
	});

	it('should handle recursive events', function( done ){
		var step1 = false,
			step2 = false,
			stable = false;

		obj.on('step-1', function(){
			step1 = true;

			expect( step2 ).to.equal( false );
			expect( stable ).to.equal( false );

			obj.trigger('step-2');
		});

		obj.on('step-2', function(){
			step2 = true;

			expect( stable ).to.equal( false );
		});

		obj.on('step-2', function(){
			stable = true;
			expect( step1 ).to.equal( true );
			expect( step2 ).to.equal( true );

			done();
		});

		obj.trigger('step-1');
	});

	it('should clear event when a once is applied', function( done ){
		var value;

		obj.once('test-1', function( v ){
			value = v;
		});

		obj.on('test-1', function( v ){
			if (v !== 2){
				obj.trigger('test-1', v+1);
			} else {
				obj.trigger('test-2', v+1);
			}
		});

		obj.on('test-2', function( v ){
			expect( value ).to.equal( 0 );
			expect( v ).to.equal( 3 );

			done();
		});

		obj.trigger('test-1', 0);
	});
});
