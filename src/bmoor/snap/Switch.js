;(function( $, global, undefined ){

var nodesCount = 0;

bMoor.constructor.define({
	name : 'Switch',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	properties : {
		_template : function(){
			var template;
			// Honestly, this is a bit hacky... but works for now
			if ( this.model ){
				template = this._unwrapVar( this.model, this._getAttribute('template') );

				if ( !template ){
					template = this._getAttribute('defaultTemplate');
				}
				
				if ( template ){
					this.prepared = bMoor.module.Templator.prepare( template );
				} else this.prepared = null;
			}else this.prepared = null;
		},
		_prep : function( data, alterations ){
			console.log( this.model, this.test, data );
			if ( this.variable ){
				data = data[this.variable];

				if ( typeof(data) == 'function' ){ data = this.scope[this.variable](); }
			}

			this._template(); // every time the model changed, switch the template

			this._make( data, alterations );
		}
	}
});

}( jQuery, this ));