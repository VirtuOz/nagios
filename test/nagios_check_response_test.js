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
var NagiosCheckResponse = require('../index').NagiosCheckResponse;


describe('NagiosCheckResponse', function ()
{
    describe('instantiation', function ()
    {
        it('should have correct default values', function (done)
        {
            var response = new NagiosCheckResponse();
            assert.isUndefined(response.getCode(), "code");
            assert.isUndefined(response.getSubSystemName(), "sub system name");
            assert.isUndefined(response.getDescription(), "description");
            assert.equal(response.getChildResponses().length, 0, "child responses array length");

            done();
        });

        it('should use values supplied upon construction', function (done)
        {
            var response = new NagiosCheckResponse(12);
            assert.equal(response.getCode(), 12, "code");
            assert.isUndefined(response.getSubSystemName(), "sub system name");
            assert.isUndefined(response.getDescription(), "description");
            assert.equal(response.getChildResponses().length, 0, "child responses array length");

            response = new NagiosCheckResponse(15, "giblets");
            assert.equal(response.getCode(), 15, "code");
            assert.equal(response.getSubSystemName(), "giblets", "sub system name");
            assert.isUndefined(response.getDescription(), "description");
            assert.equal(response.getChildResponses().length, 0, "child responses array length");

            done();
        });
    });
});
