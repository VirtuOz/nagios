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

var libDir = process.env.TEST_COV_DIR ? process.env.TEST_COV_DIR : './lib';
module.exports.NagiosController = require(libDir + '/nagios_controller');
module.exports.NagiosCheckResponse = require(libDir + '/nagios_check_response');
module.exports.NagiosCheckResponseCodes = require(libDir + '/nagios_check_response_codes');
