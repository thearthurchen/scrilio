var uu 			= require("underscore")
  , async 		= require('async')
  , http        = require("http")


var indexfn = function(request, response) {
    //Check useragent to see if they"re on mobile to redirect 
    var ua = request.headers["user-agent"];
	var uaType = {};
	//Find the location of client to potential load balance
	var ip = request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress
	         || request.headers["x-forwarded-for"];
	console.log(ip);
	if (/mobile/i.test(ua))
        uaType.Mobile = true;
	if (uaType.Mobile) {
	    response.json({status: "OK"});
    } else {
        response.json({status: "OK"});
	}
};

var define_routes = function(dict) {
    var toroute = function(item) {
	return uu.object(uu.zip(["path", "fn"], [item[0], item[1]]));
    };
    return uu.map(uu.pairs(dict), toroute);
};

var ROUTES = define_routes({
    "/": indexfn,
});

var ROUTES_POST = define_routes({
});

module.exports = {"ROUTES" : ROUTES};
