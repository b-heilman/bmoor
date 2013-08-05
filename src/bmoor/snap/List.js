;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'List',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	require : [
		['bmoor','observer','Collection']
	],
	node : {
		className : 'snap-list'
	},
	properties: {
		_element : function( element ){
			this.__Node._element.call( this, element );
			
			this.isTable = ( this.element.tagName == 'TABLE' );
			
			this.mountPoint = null;
			this.origin = null;
		},
		_template : function(){
			var mount = this._getAttribute('mount');

			if ( mount ){
				this.mountPoint = this.$.find('[mount]')[0];
			}

			this.__Node._template.call( this );
		},
		_make : function( data, alterations ){
			var
				i,
				c,
				additions,
				removals,
				changes,
				rows,
				row;
			
			if ( this.observer instanceof bmoor.observer.Collection ){
				removals = alterations.removals;
				if ( removals ){
					for( var i in removals ){
						row = removals[ i ];
						
						if ( typeof(row) == 'object' ){
							// this means it was removed, otherwise it would be a number
							rows = row._.rows; // reference the row element

							for( i = 0, c = rows.length; i < c; i++ ){
								row = rows[i];
								
								if ( this.mountPoint == row ){
									this.mountPoint =  row.previousSibling;
								}

								if ( row.parentNode ){
									row.parentNode.removeChild( row );
								}
							}
						}
					}
				}

				additions = alterations.additions;
				if ( additions ){
					for( i = 0, c = additions.length; i < c; i++ ){
						// TODO : put them in the right place
						this.append( additions[i] );
					}
				}
			}else{
				// otherwise I assume this is an array, and I just completely rewrite it every time
				this.$.empty();
				for( i = 0, c = data.length; i < c; i++ ){
					// TODO : put them in the right place
					this.append( data[i] );
				}
			}
		},
		_makeChildren : function( model ){
			var 
				template = bMoor.module.Templator.run( this.prepared, model ),
				element = document.createElement( this.isTable ? 'table' : 'div' );
					
				element.innerHTML = template;
					
			return element;
		},
		add : function( data ){
			this.model.push( data );
		},
		append : function( model ){
			var 
				node,
				next,
				observer = model._;
				el = this._makeChildren( model );

			if ( this.isTable ){
				el = el.getElementsByTagName( 'tbody' )[0];
			}

			observer.rows = [];

			element = el.firstChild;
			while( element ){
				next = element.nextSibling;

				this._append( element );
				this._pushObserver( element, observer );

				if ( model._ ){
					observer.rows.push( element );
				}

				this._controlElement( element );
				
				element = next;
			}

			return el;
		},
		_needUpdate : function( alterations ){
			return alterations.binding || !this.test || alterations[this.test];
		},
		_append : function( element ){
			if ( element.nodeType != 3 ){
				if ( this.mountPoint && this.mountPoint.parentNode ){
					if ( this.mountPoint.nextSibling ){
						this.mountPoint.parentNode.insertBefore( element, this.mountPoint.nextSibling );
					}else{
						this.mountPoint.parentNode.appendChild( element );
					}

					this.mountPoint = element;
				}else{
					this.$.append( element );
					this.mountPoint = element;
				}
			}
		}
	}
});

}( jQuery, this ));