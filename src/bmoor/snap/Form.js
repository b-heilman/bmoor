;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Form',
	namespace : ['bmoor','snap'],
	require: [
		['bmoor','form','Text'],
		['bmoor','form','Checked'],
		['bmoor','form','Button'],
		['bmoor','form','Select']
	],
	parent : ['bmoor','snap','Node'],
	properties : {
		_element : function( element ){
			var 
				dis = this,
				fields = [],
				elements;
			
			this.__Node._element.call( this, element );
			
			elements = this.element.elements;
			
			for ( var name in elements ) if ( elements.hasOwnProperty(name) ){
				var 
					el,
					$input,
					field = element.elements[ name ];
				
				if ( field instanceof NodeList 
					|| (field instanceof HTMLElement && name == field.name) ){
					
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
						input = new bmoor.form.Button( field );
					}else if ( el.nodeName == 'SELECT' ){
						input = new bmoor.form.Select( field );
					}else{
						if ( el.type == 'checkbox' || el.type == 'radio' ){
							input = new bmoor.form.Checked( field );
						}else if (el.type == 'button' ){
							input = new bmoor.form.Button( field );
						}else{
							input = new bmoor.form.Text( field );
						}
					}
					
					dis['$'+name] = input;
					
					(function(name, input){
						input.alter(function(){
							if ( dis.data ){
								dis.data[ name ] = input.val();
							}
						});
					}( name, input ));
				}
			}
			
			this.fields = fields;
		},
		_mapUpdate : function( map ){
			for( var i = 0, c = this.fields.length; i < c; i++ ){
				var field = this.fields[ i ];
				this[ '$'+field ].val( map[field] );
			}
		}
	}
});

}( jQuery, this ));