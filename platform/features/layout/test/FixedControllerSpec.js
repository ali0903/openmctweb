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
/*global define,describe,it,expect,beforeEach,jasmine,xit*/

define(
    ["../src/FixedController"],
    function (FixedController) {
        "use strict";

        describe("The Fixed Position controller", function () {
            var mockScope,
                mockQ,
                mockDialogService,
                mockSubscriber,
                mockFormatter,
                mockDomainObject,
                mockSubscription,
                testGrid,
                testModel,
                testValues,
                testConfiguration,
                controller;

            // Utility function; find a watch for a given expression
            function findWatch(expr) {
                var watch;
                mockScope.$watch.calls.forEach(function (call) {
                    if (call.args[0] === expr) {
                        watch = call.args[1];
                    }
                });
                return watch;
            }

            // As above, but for $on calls
            function findOn(expr) {
                var on;
                mockScope.$on.calls.forEach(function (call) {
                    if (call.args[0] === expr) {
                        on = call.args[1];
                    }
                });
                return on;
            }

            function makeMockDomainObject(id) {
                var mockObject = jasmine.createSpyObj(
                    'domainObject-' + id,
                    [ 'getId', 'getModel' ]
                );
                mockObject.getId.andReturn(id);
                mockObject.getModel.andReturn({ name: "Point " + id});
                return mockObject;
            }

            beforeEach(function () {
                mockScope = jasmine.createSpyObj(
                    '$scope',
                    [ "$on", "$watch", "commit" ]
                );
                mockSubscriber = jasmine.createSpyObj(
                    'telemetrySubscriber',
                    [ 'subscribe' ]
                );
                mockQ = jasmine.createSpyObj('$q', ['when']);
                mockDialogService = jasmine.createSpyObj(
                    'dialogService',
                    ['getUserInput']
                );
                mockFormatter = jasmine.createSpyObj(
                    'telemetryFormatter',
                    [ 'formatDomainValue', 'formatRangeValue' ]
                );
                mockDomainObject = jasmine.createSpyObj(
                    'domainObject',
                    [ 'getId', 'getModel', 'getCapability' ]
                );
                mockSubscription = jasmine.createSpyObj(
                    'subscription',
                    [ 'unsubscribe', 'getTelemetryObjects', 'getRangeValue' ]
                );

                testGrid = [ 123, 456 ];
                testModel = {
                    composition: ['a', 'b', 'c'],
                    layoutGrid: testGrid
                };
                testValues = { a: 10, b: 42, c: 31.42 };
                testConfiguration = { elements: [
                    { type: "fixed.telemetry", id: 'a', x: 1, y: 1 },
                    { type: "fixed.telemetry", id: 'b', x: 1, y: 1 },
                    { type: "fixed.telemetry", id: 'c', x: 1, y: 1 }
                ]};

                mockSubscriber.subscribe.andReturn(mockSubscription);
                mockSubscription.getTelemetryObjects.andReturn(
                    testModel.composition.map(makeMockDomainObject)
                );
                mockSubscription.getRangeValue.andCallFake(function (o) {
                    return testValues[o.getId()];
                });
                mockFormatter.formatRangeValue.andCallFake(function (v) {
                    return "Formatted " + v;
                });
                mockScope.model = testModel;
                mockScope.configuration = testConfiguration;
                mockScope.selection = jasmine.createSpyObj(
                    'selection',
                    [ 'select', 'get', 'selected', 'deselect', 'proxy' ]
                );

                controller = new FixedController(
                    mockScope,
                    mockQ,
                    mockDialogService,
                    mockSubscriber,
                    mockFormatter
                );
            });

            it("provides styles for cells", function () {
                expect(controller.getCellStyles())
                    .toEqual(jasmine.any(Array));
            });

            it("subscribes when a domain object is available", function () {
                mockScope.domainObject = mockDomainObject;
                findWatch("domainObject")(mockDomainObject);
                expect(mockSubscriber.subscribe).toHaveBeenCalledWith(
                    mockDomainObject,
                    jasmine.any(Function)
                );
            });

            it("releases subscriptions when domain objects change", function () {
                mockScope.domainObject = mockDomainObject;

                // First pass - should simply should subscribe
                findWatch("domainObject")(mockDomainObject);
                expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
                expect(mockSubscriber.subscribe.calls.length).toEqual(1);

                // Object changes - should unsubscribe then resubscribe
                findWatch("domainObject")(mockDomainObject);
                expect(mockSubscription.unsubscribe).toHaveBeenCalled();
                expect(mockSubscriber.subscribe.calls.length).toEqual(2);
            });

            it("exposes visible elements based on configuration", function () {
                var elements;

                mockScope.model = testModel;
                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);

                elements = controller.getElements();
                expect(elements.length).toEqual(3);
                expect(elements[0].id).toEqual('a');
                expect(elements[1].id).toEqual('b');
                expect(elements[2].id).toEqual('c');
            });

            it("allows elements to be selected", function () {
                var elements;

                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);

                elements = controller.getElements();
                controller.select(elements[1]);
                expect(mockScope.selection.select)
                    .toHaveBeenCalledWith(elements[1]);
            });

            it("allows selection retrieval", function () {
                // selected with no arguments should give the current
                // selection
                var elements;

                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);

                elements = controller.getElements();
                controller.select(elements[1]);
                mockScope.selection.get.andReturn(elements[1]);
                expect(controller.selected()).toEqual(elements[1]);
            });

            it("allows selections to be cleared", function () {
                var elements;

                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);

                elements = controller.getElements();
                controller.select(elements[1]);
                controller.clearSelection();
                expect(controller.selected(elements[1])).toBeFalsy();
            });

            it("retains selections during refresh", function () {
                // Get elements; remove one of them; trigger refresh.
                // Same element (at least by index) should still be selected.
                var elements;

                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);

                elements = controller.getElements();
                controller.select(elements[1]);

                // Verify precondition
                expect(mockScope.selection.select.calls.length).toEqual(1);

                // Mimic selection behavior
                mockScope.selection.get.andReturn(elements[1]);

                elements[2].remove();
                testModel.modified = 2;
                findWatch("model.modified")(testModel.modified);

                elements = controller.getElements();
                // Verify removal, as test assumes this
                expect(elements.length).toEqual(2);

                expect(mockScope.selection.select.calls.length).toEqual(2);
            });

            it("provides values for telemetry elements", function () {
                var elements;
                // Initialize
                mockScope.domainObject = mockDomainObject;
                mockScope.model = testModel;
                findWatch("domainObject")(mockDomainObject);
                findWatch("model.modified")(1);
                findWatch("model.composition")(mockScope.model.composition);

                // Invoke the subscription callback
                mockSubscriber.subscribe.mostRecentCall.args[1]();

                // Get elements that controller is now exposing
                elements = controller.getElements();

                // Formatted values should be available
                expect(elements[0].value).toEqual("Formatted 10");
                expect(elements[1].value).toEqual("Formatted 42");
                expect(elements[2].value).toEqual("Formatted 31.42");
            });

            it("adds grid cells to fill boundaries", function () {
                var s1 = {
                        width: testGrid[0] * 8,
                        height: testGrid[1] * 4
                    },
                    s2 = {
                        width: testGrid[0] * 10,
                        height: testGrid[1] * 6
                    };

                mockScope.model = testModel;
                findWatch("model.composition")(mockScope.model.composition);

                // Set first bounds
                controller.setBounds(s1);
                expect(controller.getCellStyles().length).toEqual(32); // 8 * 4
                // Set new bounds
                controller.setBounds(s2);
                expect(controller.getCellStyles().length).toEqual(60); // 10 * 6
            });

            it("listens for drop events", function () {
                // Layout should position panels according to
                // where the user dropped them, so it needs to
                // listen for drop events.
                expect(mockScope.$on).toHaveBeenCalledWith(
                    'mctDrop',
                    jasmine.any(Function)
                );

                // Verify precondition
                expect(testConfiguration.elements.length).toEqual(3);

                // Notify that a drop occurred
                testModel.composition.push('d');
                findOn('mctDrop')(
                    {},
                    'd',
                    { x: 300, y: 100 }
                );

                // Should have added an element
                expect(testConfiguration.elements.length).toEqual(4);

                // Should have triggered commit (provided by
                // EditRepresenter) with some message.
                expect(mockScope.commit)
                    .toHaveBeenCalledWith(jasmine.any(String));
            });

            it("unsubscribes when destroyed", function () {
                // Make an object available
                findWatch('domainObject')(mockDomainObject);
                // Also verify precondition
                expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
                // Destroy the scope
                findOn('$destroy')();
                // Should have unsubscribed
                expect(mockSubscription.unsubscribe).toHaveBeenCalled();
            });

            it("exposes its grid size", function () {
                // Template needs to be able to pass this into line
                // elements to size SVGs appropriately
                expect(controller.getGridSize()).toEqual(testGrid);
            });

            it("exposes a view-level selection proxy", function () {
                expect(mockScope.selection.proxy).toHaveBeenCalledWith(
                    jasmine.any(Object)
                );
            });

            it("exposes drag handles", function () {
                var handles;

                // Select something so that drag handles are expected
                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);
                controller.select(controller.getElements()[1]);

                // Should have a non-empty array of handles
                handles = controller.handles();
                expect(handles).toEqual(jasmine.any(Array));
                expect(handles.length).not.toEqual(0);

                // And they should have start/continue/end drag methods
                handles.forEach(function (handle) {
                    expect(handle.startDrag).toEqual(jasmine.any(Function));
                    expect(handle.continueDrag).toEqual(jasmine.any(Function));
                    expect(handle.endDrag).toEqual(jasmine.any(Function));
                });
            });

            it("exposes a move handle", function () {
                var handle;

                // Select something so that drag handles are expected
                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);
                controller.select(controller.getElements()[1]);

                // Should have a move handle
                handle = controller.moveHandle();

                // And it should have start/continue/end drag methods
                expect(handle.startDrag).toEqual(jasmine.any(Function));
                expect(handle.continueDrag).toEqual(jasmine.any(Function));
                expect(handle.endDrag).toEqual(jasmine.any(Function));
            });

            it("updates selection style during drag", function () {
                var oldStyle;

                // Select something so that drag handles are expected
                testModel.modified = 1;
                findWatch("model.modified")(testModel.modified);
                controller.select(controller.getElements()[1]);
                mockScope.selection.get.andReturn(controller.getElements()[1]);

                // Get style
                oldStyle = controller.selected().style;

                // Start a drag gesture
                controller.moveHandle().startDrag();

                // Haven't moved yet; style shouldn't have updated yet
                expect(controller.selected().style).toEqual(oldStyle);

                // Drag a little
                controller.moveHandle().continueDrag([ 1000, 100 ]);

                // Style should have been updated
                expect(controller.selected().style).not.toEqual(oldStyle);
            });
        });
    }
);