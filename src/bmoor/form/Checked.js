;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Checked',
	namespace : ['bmoor','form'],
	construct: function( element ){
		this.map = {};
		this.multi = false;
		this.checked = [];
		this.element = element;
		
		if ( element.length ){
			var name = element[0].name;
				
			if ( element[0].type.toLowerCase() == 'checkbox'  && name[name.length-1] == ']' ){
				this.multi = true;
			}
			
			for( var i = 0; i < element.length; i++ ){
				var e = element[i];
				
				this.map[ e.value ] = e;
				if ( e.checked ){
					this.checked.push( e );
				}
			}
		}
	},
	properties: {
		val : function( value ){
			if ( value ){
				if ( this.element.length ){
					var checked = this.checked;
						
					this.checked = [];
					
					for( var i = 0; i < checked.length; i++ ){
						checked[ i ].checked = false;
					}
					
					if ( this.multi ){
						if ( value.length == undefined || typeof(value) == 'string' ){
							value = [ value ];
						}
						
						for( var i = 0; i < value.length; i++ ){
							var e = this.map[ value[i] ];
							if ( e ){
								this.checked.push( e );
								e.checked = true;
							}
						}
					}else{
						if ( value.length && typeof(value) != 'string' ){
							value = value.pop();
						}
						
						var e = this.map[ value ];
						if ( e ){
							this.checked.push( e );
							e.checked = true;
						}
					}
				}else{
					if ( element.value == value ){
						element.checked = true;
					}else{
						element.checked = false;
					}
				}
			}else{
				if ( this.element.length ){
					if ( this.multi ){
						var rtn = [];
						
						for( var i = 0, c = this.element.length; i < c; i++ ){
							var el = this.element[i];
							if ( el.checked ){
								rtn.push( el.value );
							}
						}
						
						return rtn;
					}else{
						for( var i = this.element.length - 1; i >= 0; i-- ){
							var el = this.element[i];
							if ( el.checked ){
								return el.value;
							}
						}
						
						return null;
					}
				}else{
					if ( this.element.checked ){
						return this.element.value;
					}else{
						return null;
					}
				}
			}
		},
		alter : function( cb ){
			var dis = this;
			
			if ( this.element.length ){
				for( var i = 0, c = this.element.length; i < c; i++ ){
					// TODO : can I limit this to one call for radio?
					this.element[i].onchange = function(){
						cb( dis.val() );
					};
				}
			}else{
				this.element.onchange = function(){
					cb( dis.val() );
				};
			}
		}
	}
});

}( jQuery, this ));