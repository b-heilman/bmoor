;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Form',
	namespace : ['bmoor','node'],
	require: [
		['bmoor','node','form','Text'],
		['bmoor','node','form','Checked'],
		['bmoor','node','form','Button'],
		['bmoor','node','form','Select']
	],
	parent : ['bmoor','node','Basic'],
	node : {
		className : 'node-form'
	},
	properties : {
		_finalize : function(){
			var 
				dis = this,
				element = this.element,
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
					input = new bmoor.node.form.Button( field );
				}else if ( el.nodeName == 'SELECT' ){
					input = new bmoor.node.form.Select( field );
				}else{
					if ( el.type == 'checkbox' || el.type == 'radio' ){
						input = new bmoor.node.form.Checked( field );
					}else if (el.type == 'button' ){
						input = new bmoor.node.form.Button( field );
					}else{
						input = new bmoor.node.form.Text( field );
					}
				}
			}
		}
	}
});

}( jQuery, this ));