# Open MCT Web

Open MCT Web is a web-based platform for mission operations user interface
software.

## Bundles

A bundle is a group of software components (including source code, declared
as AMD modules, as well as resources such as images and HTML templates)
that are intended to be added or removed as a single unit. A plug-in for
Open MCT Web will be expressed as a bundle; platform components are also
expressed as bundles.

A bundle is also just a directory which contains a file `bundle.json`,
which declares its contents.

The file `bundles.json` (note the plural), at the top level of the
repository, is a JSON file containing an array of all bundles (expressed as
directory names) to include in a running instance of Open MCT Web. Adding or
removing paths from this list will add or remove bundles from the running
application.

### Bundle Contents

A bundle directory will contain:

* `bundle.json`, the declaration of the bundles contents.
* A source code directory, named `src` by convention. This contains all
  JavaScript sources exposed by the bundle. These are declared as
  AMD modules.
* A directory for other resources, named `res` by convention. This
  contains all HTML templates, CSS files, images, and so forth to be
  used within a given bundle.
* A library directory, named `lib` by convention. This contains all
  external libraries used and/or exposed by the bundle.
* A test directory, named `test` by convention. This contains all unit
  tests declared for the bundle, as well as a `suite.json` that acts
  as a listing of these dependencies. See the section on unit testing
  below.

Following these bundle conventions is required, at present, to ensure
that Open MCT Web (and its build and tests) execute correctly.

## Tests

The repository for Open MCT Web includes a test suite that can be run
directly from the web browser, `test.html`. This page will:

* Load `bundles.json` to determine which bundles are in the application.
* Load `test/suite.json` to determine which source files are to be tested.
  This should contain an array of strings, where each is the name of an
  AMD module in the bundle's source directory. For each source file:
  * Code coverage instrumentation will be added, via Blanket.
  * The associated test file will be loaded, via RequireJS. These will
    be located in the bundle's test folder; the test runner will presume
    these follow a naming convention where each module to be tested has a
    corresponding test module with the suffix `Spec` in that folder.
* Jasmine will then be invoked to run all tests defined in the loaded
  test modules. Code coverage reporting will be displayed at the bottom
  of the test page.

At present, the test runner presumes that bundle conventions are followed
as above; that is, sources are contained in `src`, and tests are contained
in `test`. Additionally, individual test files must use the `Spec` suffix
as described above.

An example of this is expressed in `platform/framework`, which follows
bundle conventions.

## Build

Open MCT Web includes a Maven command line build. Although Open MCT Web
can be run as-is using the repository contents (that is, by viewing
`index.html` in a web browser), and its tests can be run in-place
similarly (that is, by viewing `test.html` in a browser), the command
line build allows machine-driven verification and packaging.

This build will:

* Check all sources (excluding those in directories named `lib`) with
  JSLint for code style compliance. The build will fail if any sources
  do not satisfy JSLint.
* Run unit tests. This is done by running `test.html` in a PhantomJS
  browser-like environment. The build will fail if any tests fail.
* Package the application as a `war` (web archive) file. This is
  convenient for deployment on Tomcat or similar. This archive will
  include sources, resources, and libraries for bundles, as well
  as the top-level files used to initiate running of the application
  (`index.html` and `bundles.json`).

Run as `mvn clean install`.

# Glossary

Certain terms are used throughout Open MCT Web with consistent meanings
or conventions. Any deviations from the below are issues and should be
addressed (either by updating this glossary or changing code to reflect
correct usage.) Other developer documentation, particularly in-line
documentation, may presume an understanding of these terms.

* _bundle_: A bundle is a removable, reusable grouping of software elements.
  The application is composed of bundles. Plug-ins are bundles. For more
  information, refer to framework documentation (under `platform/framework`.)
* _capability_: An object which exposes dynamic behavior or non-persistent
  state associated with a domain object.
* _composition_: In the context of a domain object, this refers to the set of
  other domain objects that compose or are contained by that object. A domain
  object's composition is the set of domain objects that should appear
  immediately beneath it in a tree hierarchy. A domain object's composition is
  described in its model as an array of id's; its composition capability
  provides a means to retrieve the actual domain object instances associated
  with these identifiers asynchronously.
* _description_: When used as an object property, this refers to the human-readable
  description of a thing; usually a single sentence or short paragraph.
  (Most often used in the context of extensions, domain
  object models, or other similar application-specific objects.)
* _domain object_: A meaningful object to the user; a distinct thing in
  the work support by Open MCT Web. Anything that appears in the left-hand
  tree is a domain object.
* _extension_: An extension is a unit of functionality exposed to the
  platform in a declarative fashion by a bundle. For more
  information, refer to framework documentation (under `platform/framework`.)
* _id_: A string which uniquely identifies a domain object.
* _key_: When used as an object property, this refers to the machine-readable
  identifier for a specific thing in a set of things. (Most often used in the
  context of extensions or other similar application-specific object sets.)
* _model_: The persistent state associated with a domain object. A domain
  object's model is a JavaScript object which can be converted to JSON
  without losing information (that is, it contains no methods.)
* _name_: When used as an object property, this refers to the human-readable
  name for a thing. (Most often used in the context of extensions, domain
  object models, or other similar application-specific objects.)
* _navigation_: Refers to the current state of the application with respect
  to the user's expressed interest in a specific domain object; e.g. when
  a user clicks on a domain object in the tree, they are _navigating_ to
  it, and it is thereafter considered the _navigated_ object (until the
  user makes another such choice.)
* _space_: A name used to identify a persistence store. Interactions with
  persistence with generally involve a `space` parameter in some form, to
  distinguish multiple persistence stores from one another (for cases
  where there are multiple valid persistence locations available.)
