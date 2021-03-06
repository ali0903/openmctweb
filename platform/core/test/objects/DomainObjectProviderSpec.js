/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global define,Promise,describe,it,expect,beforeEach,waitsFor,jasmine*/

/**
 * DomainObjectProviderSpec. Created by vwoeltje on 11/6/14.
 */
define(
    ["../../src/objects/DomainObjectProvider"],
    function (DomainObjectProvider) {
        "use strict";

        describe("The domain object provider", function () {
            var mockModelService,
                mockCapabilityService,
                mockQ,
                provider;

            function mockPromise(value) {
                return (value && value.then) ? value : {
                    then: function (callback) {
                        return mockPromise(callback(value));
                    },
                    // Provide a synchronous way to get a value out
                    // of this phony promise.
                    testValue: value
                };
            }

            function mockAll(mockPromises) {
                return mockPromise(mockPromises.map(function (p) {
                    return mockPromise(p).testValue;
                }));
            }

            beforeEach(function () {
                mockModelService = jasmine.createSpyObj(
                    "modelService",
                    [ "getModels" ]
                );
                mockCapabilityService = jasmine.createSpyObj(
                    "capabilityService",
                    [ "getCapabilities" ]
                );
                mockQ = {
                    when: mockPromise,
                    all: mockAll
                };
                provider = new DomainObjectProvider(
                    mockModelService,
                    mockCapabilityService,
                    mockQ
                );
            });

            it("requests models from the model service", function () {
                var ids = [ "a", "b", "c" ];
                mockModelService.getModels.andReturn(mockPromise({}));
                provider.getObjects(ids);
                expect(mockModelService.getModels).toHaveBeenCalledWith(ids);
            });


            it("instantiates objects with provided models", function () {
                var ids = [ "a", "b", "c"],
                    model = { someKey: "some value"},
                    result;
                mockModelService.getModels.andReturn(mockPromise({ a: model }));
                result = provider.getObjects(ids).testValue;
                expect(result.a.getId()).toEqual("a");
                expect(result.a.getModel()).toEqual(model);
            });

        });
    }
);