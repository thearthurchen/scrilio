var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , async   = require('async')
  , twilio = require('twilio')
  , routes  = require('./routes');

var twilioClient = new twilio.RestClient('ACe6c487b892d29cc9f99f639f1f487315', 'd7adf8cb5bcc27a963ed69089d294d29');
  
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.urlencoded());	

for(var ii in routes.ROUTES) {
    app.get(routes.ROUTES[ii].path, routes.ROUTES[ii].fn);
}

var server = http.createServer(app);
var DB_REFRESH_INTERVAL_SECONDS = 60; //want to check every 5 minutes? every minute?

// Begin listening for HTTP requests to Express app
server.listen(app.get('port'), function() {
	console.log("Listening on " + app.get('port'));
});
// Start a simple daemon to backup database and probably clear out disconnected sockets?
setInterval(function() {
	var start = 0;
	var found = 0;
	var newregex = /soldout_msg_26649665_None/;
	var data = "";
	http.get("http://www.eventbrite.com/e/hackathon-at-techcrunch-disrupt-sf-2014-tickets-12058143231", function(res) {
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on("end", function() {
		  result = data.match(newregex);
			if (result != null) {
				console.log("STILL SOLD OUT");
				console.log(result[0]);
			} else {
				console.log('STATUS CHANGED NOTIFYING PEOPLE');
				twilioClient.sms.messages.create({
					to:'+14083862554',
					from:'+14085164217',
					body:'STATUS CHANGED'
				}, function(error, message) {
					// The HTTP request to Twilio will run asynchronously. This callback
					// function will be called when a response is received from Twilio
					// The "error" variable will contain error information, if any.
					// If the request was successful, this value will be "falsy"
					if (!error) {
						// The second argument to the callback will contain the information
						// sent back by Twilio for the request. In this case, it is the
						// information about the text messsage you just sent:
						console.log('Success! The SID for this SMS message is:');
						console.log(message.sid);
				 
						console.log('Message sent on:');
						console.log(message.dateCreated);
					} else {
						console.log('Oops! There was an error.');
					}
				});
			}
		});
	  }).on("error", function() {
		console.log(null);
	  });
//keep on refreshing every 5 minutes to find non updated stuff?
//global.db.heartbleed.purgeBeats sms? we need to have sockets..or have angular do work
}, DB_REFRESH_INTERVAL_SECONDS*1000);
