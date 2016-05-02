describe("Testing object setting/getting", function() {
	it('should have get working', function(){
		var t = {
				eins : 1,
				zwei: {
					drei: 3
				}
			};

		expect( bmoor.get(t,'eins') ).toBe(1);
		expect( bmoor.get(t,'zwei.drei') ).toBe(3);
	});

	it('should have makeGetter working', function(){
		var t = {
				eins : 1,
				zwei: {
					drei: 3
				}
			},
			f1 = bmoor.makeGetter('eins'),
			f2 = bmoor.makeGetter('zwei.drei');

		expect( f1(t) ).toBe(1);
		expect( f2(t) ).toBe(3);
	});

	it('should have set working', function(){
		var t = {};

		bmoor.set(t,'eins',1);
		bmoor.set(t,'zwei.drei',3);

		expect( t.eins ).toBe(1);
		expect( t.zwei.drei ).toBe(3);
	});

	it('should have makeSetter working', function(){
		var t = {},
			f1 = bmoor.makeSetter('eins'),
			f2 = bmoor.makeSetter('zwei.drei');

		f1(t,1);
		f2(t,3);

		expect( t.eins ).toBe(1);
		expect( t.zwei.drei ).toBe(3);
	});

	it('should have del working', function(){
		var t = {
				eins : 1,
				zwei: {
					drei: 3
				}
			};

		expect( bmoor.del(t,'eins') ).toBe(1);
		expect( bmoor.del(t,'zwei.drei') ).toBe(3);
		expect( t.eins ).toBeUndefined();
		expect( t.zwei ).toBeDefined();
		expect( t.zwei.drei ).toBeUndefined();
	});
});