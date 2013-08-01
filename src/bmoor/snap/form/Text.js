;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Text',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','Node'],
	properties: {
		// gets called by the data bind
		_setContent : function( content ){
			this.element.value = content;
		},
		_binding : function(){
			var dis = this;

			this.__Node._binding.call( this );
			
			this.lockValue();

			if ( this.scope && this.variable ){
				this._listen();
			}
		},
		// TODO : make alter protected for the rest
		_listen : function(){
			var 
				dis = this,
				el = this.element;
			
			el.onkeyup = function(){ dis._onChange(); };
			el.onchange = function(){ dis._onChange(); };
		},
		_onChange : function(){
			var 
				root = this.model._.root,
				value = this.val(),
				valid = this._isValid( value );

			this._onAlter( value );

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
		_isValid : function( value ){ 
			return null; 
		},
		_onAlter : function( value ){
			this.scope[ this.element.name ] = value;
		},
		lockValue : function(){
			var value = this.val();

			this.lockedValue = value;
			this.element.setAttribute( 'value', this.val() );
		},
		setState : function( state ){
			var root = this.model._.root;

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
		},
		val : function( value ){
			if ( arguments.length ){
				this._setContent( value );
			}else{
				return this.element.value;
			}
		},
		
	}
});

}( jQuery, this ));