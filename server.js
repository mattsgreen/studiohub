var http = require('http');
var express = require("express");
var RED = require("node-red");
//Setup Express 
var app = express();
app.use("/",express.static("client"));
app.get('/', function(req, res) {
  res.redirect('/api/vis/main');
});
app.get('/vis/:name', function(req, res) {
  res.redirect('/api/vis/' + req.params.name);
});
// Create a server
var server = http.createServer(app);
// Create the settings object - see default settings.js file for other options
var settings = {
    httpAdminRoot:"/admin",
    httpNodeRoot: "/api",
    flowFile: "studiohub.json",
    userDir: "node-red/",
    functionGlobalContext: { } // enables global context
};
// Initialise the runtime with a server and settings
RED.init(server,settings);
// Serve the editor UI from /red
app.use(settings.httpAdminRoot,RED.httpAdmin);
// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot,RED.httpNode);
server.listen(process.env.PORT || 82);
// Start the runtime
RED.start();