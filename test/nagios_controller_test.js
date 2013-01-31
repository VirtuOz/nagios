/*
 * Copyright 2012-2013 VirtuOz Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Tests the NagiosCheckResponse class.
 *
 * @author Kevan Dunsmore
 * @created 2012/12/08
 */
var assert = require('chai').assert;

var nagios = require('../index');
var NagiosController = nagios.NagiosController;
var NagiosCheckResponse = nagios.NagiosCheckResponse;
var NagiosCheckResponseCodes = nagios.NagiosCheckResponseCodes;


describe('NagiosController', function ()
{
    var controller;
    var response;
    var responseContent;

    beforeEach(function (done)
    {
        controller = new NagiosController();

        assert.equal(controller.getHostApplicationName(), "HostApplication");

        // This will simulate our express response object.  It just puts the response in a string for the test to
        // compare to an expected value.
        response = {};
        response.send = function (code, text)
        {
            responseContent = code + " - " + text;
        };

        // Change the host application name to make sure the controller uses the updated value.
        controller.setHostApplicationName("NagiosControllerTest");

        done();
    });

    describe('check', function ()
    {
        it('should work out of the box with default values', function (done)
        {
            controller.check(undefined, response);

            assert.equal(responseContent, '200 - 0, NagiosController: 0 OK, 0:1 JSON:{"code":0,"subSystemName":"NagiosController","description":"0 OK, 0:1","childResponses":[]}');

            done();
        });

        it('should work with listeners all reporting OK', function (done)
        {
            controller.on(controller.events.performCheck, function (next)
            {
                // Return a simple OK result.
                next(undefined, new NagiosCheckResponse(NagiosCheckResponseCodes.OK, "Subsystem1", "OK"));
            });

            controller.on(controller.events.performCheck, function (next)
            {
                // Return a simple OK result.
                next(undefined, new NagiosCheckResponse(NagiosCheckResponseCodes.OK, "Subsystem2", "OK"));
            });

            controller.on(controller.events.performCheck, function (next)
            {
                // Return multiple result codes in an array.
                next(undefined,
                    [
                        new NagiosCheckResponse(NagiosCheckResponseCodes.OK, "Subsystem3", "OK 1"),
                        new NagiosCheckResponse(NagiosCheckResponseCodes.OK, "Subsystem3", "OK 2")
                    ]);
            });

            controller.check(undefined, response);

            assert.equal(responseContent,
                '200 - 0, NagiosController: 0 OK, 0:1 JSON:{"code":0,"subSystemName":"NagiosController","description":"0 OK, 0:1","childResponses":[' +
                    '{"code":0,"subSystemName":"NagiosController","description":"0 OK, 0:1","childResponses":[]},' +
                    '{"code":0,"subSystemName":"Subsystem1","description":"OK","childResponses":[]},' +
                    '{"code":0,"subSystemName":"Subsystem2","description":"OK","childResponses":[]},' +
                    '{"code":0,"subSystemName":"Subsystem3","description":"OK 1","childResponses":[]},' +
                    '{"code":0,"subSystemName":"Subsystem3","description":"OK 2","childResponses":[]}]}');

            done();
        });

        it('should show the most severe error code', function (done)
        {
            controller.on(controller.events.performCheck, function (next)
            {
                next(undefined, new NagiosCheckResponse(NagiosCheckResponseCodes.OK, "Subsystem1", "Second OK"));
            });

            controller.on(controller.events.performCheck, function (next)
            {
                next(undefined, new NagiosCheckResponse(NagiosCheckResponseCodes.WARNING, "Subsystem2", "First warning"));
            });

            controller.on(controller.events.performCheck, function (next)
            {
                next(undefined, new NagiosCheckResponse(NagiosCheckResponseCodes.ERROR, "Subsystem3", "Second error"));
            });

            controller.on(controller.events.performCheck, function (next)
            {
                next(undefined,
                    [
                        new NagiosCheckResponse(NagiosCheckResponseCodes.OK, "Subsystem4", "Third OK"),
                        new NagiosCheckResponse(NagiosCheckResponseCodes.WARNING, "Subsystem4", "Second warning"),
                        new NagiosCheckResponse(NagiosCheckResponseCodes.ERROR, "Subsystem4", "Third error")
                    ]);
            });

            controller.on(controller.events.performCheck, function (next)
            {
                next(new Error("First error"));
            });

            controller.check(undefined, response);

            console.log(responseContent);
            assert.equal(responseContent,
                '200 - 2, NagiosControllerTest: First error ' +
                    'JSON:{"code":2,"subSystemName":"NagiosControllerTest","description":"First error","childResponses":[' +
                    '{"code":2,"subSystemName":"NagiosControllerTest","description":"First error","childResponses":[]},' +
                    '{"code":2,"subSystemName":"Subsystem3","description":"Second error","childResponses":[]},' +
                    '{"code":2,"subSystemName":"Subsystem4","description":"Third error","childResponses":[]},' +
                    '{"code":1,"subSystemName":"Subsystem2","description":"First warning","childResponses":[]},' +
                    '{"code":1,"subSystemName":"Subsystem4","description":"Second warning","childResponses":[]},' +
                    '{"code":0,"subSystemName":"NagiosController","description":"0 OK, 0:1","childResponses":[]},' +
                    '{"code":0,"subSystemName":"Subsystem1","description":"Second OK","childResponses":[]},' +
                    '{"code":0,"subSystemName":"Subsystem4","description":"Third OK","childResponses":[]}]}');

            done();
        });
    });
});
