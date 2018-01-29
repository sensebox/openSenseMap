# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.0"></a>
# 1.0.0 (2018-01-26)


### Bug Fixes

* **authentication:** Refresh auth token also if route doesn't match /users/me ([c518fdd](https://github.com/sensebox/openSenseMap/commit/c518fdd))
* **i18n:** Remove indonesian language ([813e6dc](https://github.com/sensebox/openSenseMap/commit/813e6dc))
* **sidebar:** accidentally deleted invalidateSize call on activate ([4bf8fcb](https://github.com/sensebox/openSenseMap/commit/4bf8fcb))
* **sidebar:** fix minimize and maximize behavior ([50c9b1c](https://github.com/sensebox/openSenseMap/commit/50c9b1c))
* **sidebar:** validate size of box name if sidebar is minimized ([aee118d](https://github.com/sensebox/openSenseMap/commit/aee118d))
* **sidebar.details:** show chart data for boxes with no data in the last 24h ([0b03d67](https://github.com/sensebox/openSenseMap/commit/0b03d67)), closes [#234](https://github.com/sensebox/openSenseMap/issues/234)


### Code Refactoring

* **i18n:** Moved translations to own npm module ([daffd7f](https://github.com/sensebox/openSenseMap/commit/daffd7f))


### Features

* **core:** new module app.core ([9012f7a](https://github.com/sensebox/openSenseMap/commit/9012f7a))
* **leaflet:** add getLayers method ([91006d9](https://github.com/sensebox/openSenseMap/commit/91006d9))
* **legend:** switch clustering on and off ([704d853](https://github.com/sensebox/openSenseMap/commit/704d853)), closes [#242](https://github.com/sensebox/openSenseMap/issues/242)
* **sidebar:** animate sidebar minimization ([8021790](https://github.com/sensebox/openSenseMap/commit/8021790))
* **toggle:** new toggle button ([c9c7947](https://github.com/sensebox/openSenseMap/commit/c9c7947))


### BREAKING CHANGES

* **i18n:** Translations can be found in repository sensebox/opensensemap-i18n
