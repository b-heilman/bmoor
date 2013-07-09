;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'List',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	node : {
		className : 'snap-list'
	},
	properties: {
		_element : function( element ){
			this.__Node._element.call( this, element );
			this.childTag = this._getAttribute( 'child', this.childTag );
			this.childClass = this._getAttribute( 'childClass', this.childClass );
			this.mountPoint = null;
		},
		_template : function(){
			var 
				mount = this._getAttribute('mount'),
				mountPoint;

			if ( mount == 'this' ){
				mountPoint = this.element.getElementsByTagName('mount')[0];
				if ( mountPoint ){
					this.mountPoint = mountPoint.previousSibling;
				}
				mountPoint.parentNode.removeChild( mountPoint );
			}

			this.__Node._template.call( this );
		},
		_makeContent : function(){
			if ( this.data ){
				for( var i = 0, c = this.data.length; i < c; i++ ){
					this.append( this.data[i] );
				}
			}
		},
		_makeChild : function( data, tag, attributes, asString ){
			if ( asString ){
				var attrs = '';
					
				for( var attr in attributes ){
					attrs += attr+'="'+attributes[attr]+'" ';
				}
					
				if ( this.prepared ){
					return '<'+tag+' class="'+this.childClass+'" '+attrs+'>'
						+ bMoor.module.Templator.run( this.prepared, data )
						+ '</'+tag+'>';
				}else return '<'+tag+' class="'+this.childClass+'" '+attrs+'>'+ '</'+tag+'>';
			}else{
				if ( this.prepared ){
					var 
						template = bMoor.module.Templator.run( this.prepared, data ),
						element = document.createElement( tag );
						
					element.innerHTML = template;
					element.className = this.childClass;
					
					for( var attr in attributes ){
						element.setAttribute( attr, attributes[attr] );
					}
					
					bmoor.lib.Bootstrap.setContext( element, data );
					
					return element;
				}else{
					return document.createElement( tag );
				}
			}
		},
		append : function( data ){
			var el = this._makeChild(data,this.childTag);

			if ( this.mountPoint ){
				if ( this.mountPoint.nextSibling ){
					this.mountPoint.parentNode.insertBefore( el, this.mountPoint.nextSibling );
				}else{
					this.mountPoint.parentNode.appendChild( el );
				}

				this.mountPoint = el;
			}else{
				this.$.append( el );
				this.mountPoint = el;
			}
			
			return el;
		},
		prepend : function( data ){
			var el = this._makeChild(data,this.childTag);

			if ( this.mountPoint ){
				this.mountPoint.parentNode.insertBefore( el, this.mountPoint );
				this.mountPoint = el;
			}else{
				this.$.prepend( el );
				this.mountPoint = el;
			}
			
			return el;
		},
		childTag : 'li',
		childClass : 'snap-li'
	}
});

}( jQuery, this ));