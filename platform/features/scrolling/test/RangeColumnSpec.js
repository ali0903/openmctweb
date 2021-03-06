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
/*global define,describe,it,expect,beforeEach,waitsFor,jasmine*/

/**
 * MergeModelsSpec. Created by vwoeltje on 11/6/14.
 */
define(
    ["../src/RangeColumn"],
    function (RangeColumn) {
        "use strict";

        var TEST_RANGE_VALUE = "some formatted range value";

        describe("A range column", function () {
            var mockDataSet,
                testMetadata,
                mockFormatter,
                column;

            beforeEach(function () {
                mockDataSet = jasmine.createSpyObj(
                    "data",
                    [ "getRangeValue" ]
                );
                mockFormatter = jasmine.createSpyObj(
                    "formatter",
                    [ "formatDomainValue", "formatRangeValue" ]
                );
                testMetadata = {
                    key: "testKey",
                    name: "Test Name"
                };
                mockFormatter.formatRangeValue.andReturn(TEST_RANGE_VALUE);

                column = new RangeColumn(testMetadata, mockFormatter);
            });

            it("reports a column header from range metadata", function () {
                expect(column.getTitle()).toEqual("Test Name");
            });

            it("looks up data from a data set", function () {
                column.getValue(undefined, mockDataSet, 42);
                expect(mockDataSet.getRangeValue)
                    .toHaveBeenCalledWith(42, "testKey");
            });

            it("formats range values as time", function () {
                mockDataSet.getRangeValue.andReturn(123.45678);
                expect(column.getValue(undefined, mockDataSet, 42))
                    .toEqual(TEST_RANGE_VALUE);

                // Make sure that service interactions were as expected
                expect(mockFormatter.formatRangeValue)
                    .toHaveBeenCalledWith(123.45678);
                expect(mockFormatter.formatDomainValue)
                    .not.toHaveBeenCalled();
            });
        });
    }
);