;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'JQote',
	namespace : ['bmoor','templating'],
	require: {
		references : { 'jQuery.fn.jqote' : ['jquery','jqote2'] }
	},
	construct: function(){},
	properties: {
		run : function( template, data ){
			return $.jqote( $.jqotec(template), data );
		}
	}
});

}( jQuery, this ));