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
 * @author Kevan Dunsmore
 */
require('jsclass');
JS.require('JS.Class');
var $synthesize = require('synthesis').synthesize;
var callbacks = require('callback-utils');
var util = require('util');
var events = require('events');

var NagiosCheckResponse = require('./nagios_check_response');
var NagiosCheckResponseCodes = require('./nagios_check_response_codes');

/**
 * Class that controls and responds to VirtuOz custom Nagios checks.
 * @author Kevan Dunsmore
 * @created 08/12/12
 */
var NagiosController = new JS.Class(
    events.EventEmitter,
    {
        events: {
            performCheck: "performCheck"
        },


        initialize: function ()
        {
            this.setHostApplicationName("HostApplication");
            this.on(this.events.performCheck, this.__selfCheck);
        },


        /**
         * Check function.  Bind to an express route.
         * @param req
         * @param response
         */
        check: function (req, response)
        {
            var self = this;

            self.emit(self.events.performCheck,
                callbacks.createCountedCallback(
                    self.listeners(self.events.performCheck).length,
                    onCheckComplete));

            function onCheckComplete(err, callbackResponses)
            {
                var responses = [];

                // If we got an error, create a response object from it and continue.
                if (err)
                {
                    responses.push(new NagiosCheckResponse(NagiosCheckResponseCodes.ERROR, self.getHostApplicationName(), err.message));
                }

                // If we have responses from any callback, pull the non-error values back and put them on the responses
                // array.
                if (callbackResponses)
                {
                    // We have some responses.  Let's see what they are.
                    callbackResponses.forEach(function (singleCallbackResponse)
                    {
                        // Skip the first value in the array - it's the error object.  We don't need that because it's
                        // already been collated and dealt with above.
                        for (var i = 1; i < singleCallbackResponse.length; i++)
                        {
                            // If a single response is an array, we pull the nagios responses from that array.  That
                            // lets a single callback give us multiple responses.  Otherwise, we just push the Nagios
                            // response on the responses array.
                            if (singleCallbackResponse[i] instanceof Array)
                            {
                                singleCallbackResponse[i].forEach(function (resp)
                                {
                                    responses.push(resp);
                                });
                            }
                            else
                            {
                                responses.push(singleCallbackResponse[i]);
                            }
                        }
                    });
                }

                var masterResponse;
                if (responses.length === 1)
                {
                    // We have a single response.  We'll use that.
                    masterResponse = responses[0];
                }
                else
                {
                    // We care about bad things more than the good things, so we sort our responses array into order
                    // of decreasing severity.
                    responses.sort(function (response1, response2)
                    {
                        return response2.getCode() - response1.getCode();
                    });

                    // Now we pick the first response to be the master response.  We know that, by merit of its code,
                    // it's the worst thing that happened today.
                    masterResponse = new NagiosCheckResponse(responses[0].getCode(), responses[0].getSubSystemName(), responses[0].getDescription());
                    masterResponse.setChildResponses(responses);
                }

                response.send(200, util.format("%d, %s: %s JSON:%s",
                    masterResponse.getCode(),
                    masterResponse.getSubSystemName(),
                    masterResponse.getDescription(),
                    JSON.stringify(masterResponse)));
            }
        },


        __selfCheck: function (next)
        {
            next(undefined, new NagiosCheckResponse(NagiosCheckResponseCodes.OK, "NagiosController", "0 OK, 0:1"));
        }
    });

$synthesize(NagiosController, 'hostApplicationName');

module.exports = NagiosController;