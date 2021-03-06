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
/*global define*/

define(
    [],
    function () {
        "use strict";

        /**
         * The mct-control will dynamically include the control
         * for a form element based on a symbolic key. Individual
         * controls are defined under the extension category
         * `controls`; this allows plug-ins to introduce new form
         * control types while still making use of the form
         * generator to ensure an overall consistent form style.
         */
        function MCTControl(controls) {
            var controlMap = {};

            // Prepopulate controlMap for easy look up by key
            controls.forEach(function (control) {
                var path = [
                    control.bundle.path,
                    control.bundle.resources,
                    control.templateUrl
                ].join("/");
                controlMap[control.key] = path;
            });

            function link(scope, element, attrs, ngModelController) {
                scope.$watch("key", function (key) {
                    // Pass the template URL to ng-include via scope.
                    scope.inclusion = controlMap[key];
                });
                scope.ngModelController = ngModelController;
            }

            return {
                // Only show at the element level
                restrict: "E",

                // Use ng-include as a template; "inclusion" will be the real
                // template path
                template: '<ng-include src="inclusion"></ng-include>',

                // ngOptions is terminal, so we need to be higher priority
                priority: 1000,

                // Get the ngModelController, so that controls can set validity
                require: '?ngModel',

                // Link function
                link: link,

                // Pass through Angular's normal input field attributes
                scope: {
                    // Used to choose which form control to use
                    key: "=",

                    // The state of the form value itself
                    ngModel: "=",

                    // Enabled/disabled state
                    ngDisabled: "=",

                    // Whether or not input is required
                    ngRequired: "=",

                    // Pattern (for input fields)
                    ngPattern: "=",

                    // Set of choices (if any)
                    options: "=",

                    // Structure (subtree of Form Structure)
                    structure: "=",

                    // Name, as in "<input name="...
                    field: "="
                }
            };
        }

        return MCTControl;
    }
);