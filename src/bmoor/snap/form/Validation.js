;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Validation',
	namespace : ['bmoor','snap','form'],
	construct : function(){
		var value;

		value = this._getAttribute( 'min' );
		if ( value ){
			this.minVal = parseInt( value );
		}

		value = this._getAttribute( 'max' );
		if ( value ){
			this.maxVal = parseInt( value );
		}

		value = this._getAttribute( 'match' );
		if ( value ){
			this.regEx = new RegExp( value );
		}

		value = this._getAttribute( 'delay' );
		if ( value ){
			this.validationDelay = value;
		}else{
			this.validationDelay = 0;
		}
	},
	properties : {
		_onChange : function(){
			var
				dis = this,
				wrapped = this._wrapped;

			if ( this.validationTimeout ){
				clearTimeout( this.validationTimeout );
			}

			this.validationTimeout = setTimeout(function(){
				dis.validationTimeout = null;
				wrapped.call( dis );
			}, this.validationDelay);
		},
		_isValid : function( value ){
			var 
				number,
				valid = true;

			if ( this._wrapped(value) ){
				number = parseInt( value );

				if ( this.maxVal && number > this.maxVal ){
					valid = false;
				}

				if ( this.minVal && number < this.minVal ){
					valid = false;
				}

				if ( this.regEx && !this.regEx.test(''+value) ){
					valid = false;
				}

				if ( valid ){
					this.$.removeClass( 'state-error' );
					this.$.addClass( 'state-valid' );
				}else{
					this.$.addClass( 'state-error' );
					this.$.removeClass( 'state-valid' );
				}

				return valid;
			}else return false;
		},
	}
});

}( jQuery, this ));