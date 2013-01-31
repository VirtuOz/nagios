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

/**
 * Class that represents a response to a Nagios check.
 * @author Kevan Dunsmore
 * @created 08/12/12
 */
var NagiosCheckResponse = new JS.Class(
    {
        initialize: function (code, subSystemName, description)
        {
            if (code !== undefined && code !== null)
            {
                this.setCode(code);
            }

            if (subSystemName)
            {
                this.setSubSystemName(subSystemName);
            }

            if (description)
            {
                this.setDescription(description);
            }

            this.setChildResponses([]);
        }
    });

$synthesize(NagiosCheckResponse, 'code');
$synthesize(NagiosCheckResponse, 'subSystemName');
$synthesize(NagiosCheckResponse, 'description');
$synthesize(NagiosCheckResponse, 'childResponses');

module.exports = NagiosCheckResponse;
