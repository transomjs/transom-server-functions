# transom-server-functions
Using plugin you can create and deploy your own functions to the API server. The functions can be used for your own end-points, or they can be used as 'actions' from the transom-mongoose plugin, for instance before or after a record update, implementing custom business rules.

[![Build Status](https://travis-ci.org/transomjs/transom-server-functions.svg?branch=master)](https://travis-ci.org/transomjs/transom-server-functions)


## Installation

```bash
$ npm install --save @transomjs/transom-server-functions
```
### Initilization
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

You need to inlude a 'functions' object in your api definition:
```javascript
...,
"functions": {
    "functionname":{
        "methods": ["POST","GET","DELETE","PUT],
        "function": Function,
        "acl": {
            "groups": ["groupcode1", "groupcode2"] 
        }
    },...more functions

```
The corresponding end point is:
```<baseurl>\fx\functionname ``` it may be called with the request methods that are included in the the methods array.

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
#### The database action function definiton
The action needs to be configured in the ```db``` section of the api definition. More info [here](https://github.com/transomjs/transom-mongoose/blob/master/README.md)

There are two types of action functions, the ```before``` action and the ```after``` action. The before is typically used to apply business rules and potentially trigger an error in case of validation errors. 

It looks like this:
```javascript
@param server TransomJS instance
@param next The next function that needs to be called when processing is complete. It may be called with an error argument in which case the record will not be stored in the database, and the api call responds with an error.
function (server, next){
    //note that the record instance is not passed in. It is referenced using `this`
    //server is the transonJS instance. 
    //next needs

    if (this.fieldValue == 'bad'){
        next('bad data');
    } else {
        next();
    }
}
``` 

The ```after``` action does not get to alter the response to the request. It is used for additional processing on the server, for instance creating an asynchronous communication, or perform additional processing.

```javascript
@param server TransomJS server instance
@param item The record that was stored in the database.
@param next function which must be called on completion of processing, optionally with an error object as argument, in which case the api request will return an error, however the database action will not be rolled back.
function (server, item, next) {
}
```
