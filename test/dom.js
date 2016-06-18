describe('bmoor.dom', function(){
	var el;

	beforeEach(function(){
		document.body.innerHTML = '<div><span id="hello"></span></div>';
		el = document.getElementById('hello');
	});

	it('should allow adding classes', function(){
		bmoor.dom.addClass( el, 'test' );

		expect( el.className ).toBe( ' test' );
	});

	it('should allow removing classes', function(){
		el.className = 'test';

		bmoor.dom.removeClass( el, 'test' );

		expect( el.className ).toBe( '' );
	});

	it('should allow a dom element to be "brought forward"', function(){
		el.parentNode.appendChild( document.createElement('span') );

		el.className = 'test';

		bmoor.dom.bringForward( el );

		expect( el.previousSibling ).toBeDefined();
		expect( el.nextSibling ).toBe( null );
	});

	it('should allow a dom element to fire synthetic events', function(){
		var fired1,
			fired2;

		el.addEventListener('click', function (e) {
			fired1 = true;
		});

		el.onClick = function(){
			fired2 = true;
		};
		
		bmoor.dom.triggerEvent( el, 'click' );

		expect( fired1 ).toBe( true );
		expect( fired2 ).toBeUndefined(); // TODO : figure out why?
	});
});