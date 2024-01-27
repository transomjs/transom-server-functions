"use strict";
// const expect = require('chai').expect;
const sinon = require('sinon');
const ServerFxHandler = require('../lib/serverFxHandler');

describe('ServerFxHandler', function () {
    let expect;

    before(function () {
        // Stub out a mock nodemailer
        // sinon.stub(nodemailer, 'createTransport').callsFake(function (opts) {
        //     // whatever you would like innerLib.toCrazyCrap to do under test
        //     function Transport() {
        //         this.sendMail = function (opts, cb) {
        //             if (cb) {
        //                 return cb(opts.error, opts.response);
        //             }
        //         };
        //         this.close = sinon.spy();
        //     };
        //     return new Transport();
        // });
        
        // Use a dynamic import for the chai ES module!
        return import("chai").then((chai) => (expect = chai.expect));
    });

    afterEach(function () {
        // restore original functionality
        // nodemailer.createTransport.restore();
    });
    
    it('can create a new ServerFxHandler', function () {
        const dummyServer = {};
        const dummyOptions = {};
        const serverFxHandler = new ServerFxHandler(dummyServer, dummyOptions);

        expect(serverFxHandler).to.be.an.instanceof(Object);
    });



});