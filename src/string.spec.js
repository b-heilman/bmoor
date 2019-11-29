
const {expect} = require('chai');

describe('bmoor.string', function() {

	const bmoor = require('./index.js');

	it('should operate trim correctly, default is white space', function(){
		var s = '  test    \n',
			t = bmoor.string.trim( s );

		expect( t ).to.equal( 'test' );
	});

	it('should operate trim correctly, using "a"', function(){
		var s = 'aatasteaaaa',
			t = bmoor.string.trim( s, 'a' );

		expect( t ).to.equal( 'taste' );
	});

	it('should operate ltrim correctly, default is white space', function(){
		var s = '  test    \n',
			t = bmoor.string.ltrim( s );

		expect( t ).to.equal( 'test    \n' );
	});

	it('should operate rtrim correctly, default is white space', function(){
		var s = '  test    \n',
			t = bmoor.string.rtrim( s );

		expect( t ).to.equal( '  test' );
	});

	/*
	it('should externalize the filters', function(){
		expect( bmoor.string.getFormatter.filters ).to.to.exist;
	});

	it('should be able to parse commands', function(){
		var commands = bmoor.string.getCommands('eins:zwei :3| drei:foo:bar');

		expect( commands.length ).to.equal( 2 );
		expect( commands[0].method ).to.equal( 'eins' );
		expect( commands[0].args ).to.deep.equal( ['zwei','3'] );
		expect( commands[1].method ).to.equal( 'drei' );
		expect( commands[1].args ).to.deep.equal( ['foo','bar'] );
	});

	it('should allow for adding filters', function(){
		var called = false,
			formatter;

		bmoor.string.getFormatter.filters.test1 = function( arg ){
			called = true;
			expect( arg ).to.equal( 'arg' );

			return function( input ){
				expect( input ).to.equal( 12 );
				return input+'w';
			}
		};
		bmoor.string.getFormatter.filters.test2 = function(){
			return function( input ){
				expect( input ).to.equal( '12w' );
				return 'final';
			}
		};

		formatter = bmoor.string.getFormatter('- {{value|test1:arg|test2}} -');

		expect( formatter.$vars ).to.deep.equal( ['value'] );
		expect( called ).to.equal( true );
		expect( formatter({value:12}) ).to.equal('- final -');
	});

	it('should stack multiple vars', function(){
		var formatter = bmoor.string.getFormatter('- {{value}} - {{foo.bar}} -');

		expect( formatter.$vars ).to.deep.equal( ['foo.bar','value'] );
		expect( formatter({value:12,foo:{bar:10}}) ).to.equal('- 12 - 10 -');
	});

	it('should allow for the building of formatted statements', function(){
		var formatter = bmoor.string.getFormatter('Hi {{name}} you owe {{cost|precision : 2|currency }}');

		expect( formatter({name:'Brian',cost:12.344123}) )
			.to.equal('Hi Brian you owe $12.34');
	});

	it('should allow for the building of formatted statements - round up', function(){
		var formatter = bmoor.string.getFormatter('Hi {{name}} you owe {{cost|precision : 2|currency }}');

		expect( formatter({name:'Brian',cost:12.345123}) )
			.to.equal('Hi Brian you owe $12.35');
	});

	it('should allow for the building of formatted statements - round up', function(){
		var formatter = bmoor.string.getFormatter('Hi {{name}} you owe {{cost|precision : 2|currency }}');

		expect( formatter({name:'Brian',cost:12.3}) )
			.to.equal('Hi Brian you owe $12.30');
	});

	it('should allow for url encoding', function(){
		var formatter = bmoor.string.getFormatter('/{{category|url}}/{{id|url}}');

		expect( formatter({category:'users&friends+lovedones',id:12.3}) )
			.to.equal('/users%26friends%2Blovedones/12.3');
	});

	it('should ignore invalid filters', function(){
		var formatter = bmoor.string.getFormatter('/{{category|junk}}/{{id|woot}}');

		expect( formatter({category:'users&friends',id:12.3}) )
			.to.equal('/users&friends/12.3');
	});
	*/
});