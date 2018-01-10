# transom-server-functions
Using plugin you can create and deploy your own functions to the API server. The functions can be used for your own end-points, or they can be used as 'actions' from the transom-mongoose plugin, for instance before or after a record update, implementing custom business rules.

[![Build Status](https://travis-ci.org/transomjs/transom-server-functions.svg?branch=master)](https://travis-ci.org/transomjs/transom-server-functions)


## Installation

```bash
$ npm install --save @transomjs/transom-server-functions
```
## Usage
When creating and configuring your TransomJS server, you'll need to include the transom-server-functions as follows:

```javascript
//require the plugin alongside transomjs
var Transom = require('@transomjs/transom-core');
var transomServerFx = require('@transomjs/transom-server-functions');

const transom = new Transom();


// Register the plugin.
transom.configure(transomServerFx);

//load my api definitions
var myApi = require('./myApi');

// Initialize them all plugins using my api definitions.
var server = transom.initialize(myApi);

```

### Api Definitions for the plugin
The server functions may be used as end-points in your api, or as action triggers when interacting with database records.

#### Server Functions as end points

You need to inlude a 'functions' object in your api definition as a child of ```definition```:
```javascript
...,
"functions": {
    "mySpecialFunction":{
        "methods": ["POST","GET","DELETE","PUT"],
        "function": function(server, req, res, next) {
            //do stuff
            next();
            },
        "acl": {
            "groups": ["marketing", "sales"] 
        }
    },...more functions

```
The corresponding end point is:
```<baseurl>\fx\mySpecialFunction ``` it may be called with the request methods that are included in the the methods array.

If the security plugin is available on the server, then the acl property is used to restrict access to the end-point. The caller will need to be authenticated and be member of at least one of the groups in the array.

#### The end-point function definition
The end point server function becomes a route handler
in the node server. The function call is very similar to that of a generic route handler, and it must behave the same way.
Rather than just getting the request, response and next arguments, the end-point function is also gets a reference to the transomJS server as the first argument.


```javascript
@param server TransomJS server instance
@param req Request object
@param res Response object
@param next Next function which must be called on completion, optionally with an error object as argument.
function (server, req, res, next) {
    //do stuff
    console.log('You can see this in your console...');
    next();
};
```
