;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Input',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','Node'],
	properties: {
		// gets called by the data bind
		lockValue : function(){},
		val : function( value ){},
		_isValid : function( value ){ 
			return null; 
		}, // pretty much 
		_setContent : function( content ){
			this.val( content );
		},
		_element : function( element ){
			this.__Node._element.call( this, element );

			this.root = this._findRoot();
		},
		_model : function(){
			var model = this.__Node._model.call( this );

			if ( !this.variable && this.element.name ){
				this.variable = this.element.name;
			}else if ( this.variable && !this.element.name ){
				this.element.setAttribute( 'name', this.variable );
			}

			return model;
		},
		_binding : function(){
			var dis = this;

			this.__Node._binding.call( this );
			
			this.lockValue();

			this._listen();
		},
		// TODO : make alter protected for the rest
		_listen : function(){
			var 
				dis = this,
				el = this.element;
			
			el.onchange = function(){ dis._onChange(); };
		},
		_onChange : function(){
			var 
				root = this.root.observer.model,
				value = this.val(),
				valid = this._isValid( value );
			
			this._pushChange();

			if ( value == this.lockedValue ){
				this.clearState();
			}else{
				if ( valid === false ){
					this.setState( false );
				}else{
					if ( valid === true ){
						this.setState( true );
					}
				}

				if ( root.$addChange ){
					root.$addChange( this );
				}
			}
		},
		_pushChange : function(){
			this.observer.model[ this.element.name ] = this.val();
		},
		setState : function( state ){
			var root = this.root.observer.model;
			
			if ( state ){
				if ( root.$removeError ){
					root.$removeError( this );
				}

				this.$.removeClass( 'state-error' );
				this.$.addClass( 'state-valid' );
			}else{
				if ( root.$addError ){
					root.$addError( this );
				}

				this.$.addClass( 'state-error' );
				this.$.removeClass( 'state-valid' );
			}
		},
		clearState : function(){
			this.$.removeClass( 'state-error' );
			this.$.removeClass( 'state-valid' );
		}
	}
});

}( jQuery, this ));