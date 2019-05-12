
const Observable = require('./Observable.js');

describe('Observable', function(){
	describe('::_next', function(){
		describe('::flush', function(){
			it('should work', function(){
				const ob = new Observable();

				let hasRun = false;

				ob.on('next', function(value1, value2){
					expect(value1).toBe(123);
					expect(value2).toBe(456);

					hasRun = true;
				});

				ob.next(123, 456);

				ob._next.flush();

				expect(hasRun).toBe(true);
			});

			it('should work with a blank next call', function(){
				const ob = new Observable();

				let hasRun = false;

				ob.on('next', function(){
					hasRun = null;
				});

				try{
					ob.next();

					// ob._next.flush();
				}catch(ex){
					hasRun = true
				}	

				expect(hasRun).toBe(true);
			});

			it('should bomb if no next first called', function(){
				const ob = new Observable();

				let hasRun = false;

				ob.on('next', function(){
					hasRun = null;
				});

				try{
					ob._next.flush();
				}catch(ex){
					hasRun = true
				}

				expect(hasRun).toBe(true);
			});
		});
	});

	describe('::subscribe', function(){
		it('should call passed in methods', function(){
			const ob = new Observable();

			let next = null;
			let error = null;
			let complete = null;

			ob.subscribe(
				function(){
					next = true;
				},
				function(){
					error = true;
				},
				function(){
					complete = true;
				}
			);

			expect(next).toBe(null);
			expect(error).toBe(null);
			expect(complete).toBe(null);

			ob.trigger('next');

			expect(next).toBe(true);
			expect(error).toBe(null);
			expect(complete).toBe(null);

			next = false;

			ob.trigger('error');

			expect(next).toBe(false);
			expect(error).toBe(true);
			expect(complete).toBe(null);

			error = false;

			ob.trigger('complete');

			expect(next).toBe(false);
			expect(error).toBe(false);
			expect(complete).toBe(true);
		});

		it('should fire next right away if hot', function(done){
			let val = null;
			const ob = new Observable();

			ob.next(123);

			ob.subscribe(function(v){
				val = v;
			});

			ob.on('next', function(){
				expect(val).toBe(123);

				done();
			});
		});

		it('should call the first method in a stack', function(done){
			const ob = new Observable();

			ob.next(123);

			let firstCall = null;
			let secondCall = null;

			ob.subscribe([
				function(var1){
					firstCall = var1;
				},
				function(var2){
					secondCall = var2;
				}
			]);

			ob.on('next', function(){
				expect(firstCall).toBe(123);
				expect(secondCall).toBe(null);

				done();
			});
		});
	});

	describe('::promise', function(){
		it('should not resolve until hot', function(done){
			const ob = new Observable();

			const prom = ob.promise();

			let promised = null;

			prom.then(val => {
				promised = val;
			});

			setTimeout(function(){
				expect(promised).toBe(null);

				ob.next(123);
			}, 100);

			setTimeout(function(){
				expect(promised).toBe(123);

				done();
			}, 200);
		});

		it('should resolve if hot', function(done){
			const ob = new Observable();

			ob.next(123);

			const prom = ob.promise();

			let promised = null;

			prom.then(val => {
				promised = val;
			});

			setTimeout(function(){
				expect(promised).toBe(123);

				done();
			}, 100);
		});
	});
});
