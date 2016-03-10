function fail(msg){
	throw{
		msg: msg
	};
}

function assert(condition, msg){
	if(!condition){
		fail(msg);
	}
}

function assertEqual(expression, value, msg){
	if(expression != value){
		expression = (""+expression).replace(/[\r\n]+/g, "\\n");
		value = (""+value).replace(/\r?\n/g, "\\n");
		fail("expected '" + value + "' but got '" + expression + "' - " + msg);
	}
}