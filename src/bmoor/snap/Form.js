;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Form',
	namespace : ['bmoor','snap'],
	require: [
		['bmoor','snap','form','Text'],
		['bmoor','snap','form','Checked'],
		['bmoor','snap','form','Button'],
		['bmoor','snap','form','Select']
	],
	parent : ['bmoor','snap','Node'],
	node : {
		className : 'snap-form'
	},
	properties : {
		_wrapElement : function( element ){
			var 
				dis = this,
				names = {},
				fields = [];
			

			elements = element.elements;
			for( var i = 0, c = elements.length; i < c; i++ ){
				names[ elements[i].name ] = true;
			}
			
			for ( var name in names ) {
				var 
					el,
					input,
					field = elements[ name ];
				
				if ( name[name.length - 1] == ']' ){
					name = name.substring( 0, name.length - 2 );
				}
				
				fields.push( name );
				
				if ( field instanceof NodeList ){
					el = field[0];
				}else{
					el = field;
				}
				
				if ( el.nodeName == 'BUTTON' ){
					input = new bmoor.snap.form.Button( field );
				}else if ( el.nodeName == 'SELECT' ){
					input = new bmoor.snap.form.Select( field );
				}else{
					if ( el.type == 'checkbox' || el.type == 'radio' ){
						input = new bmoor.snap.form.Checked( field );
					}else if (el.type == 'button' ){
						input = new bmoor.snap.form.Button( field );
					}else{
						input = new bmoor.snap.form.Text( field );
					}
				}
			}
		}
	}
});

}( jQuery, this ));