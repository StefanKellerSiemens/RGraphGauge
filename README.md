# Mendix Widget Boilerplate

See [AppStoreWidgetBoilerplate](https://github.com/mendix/AppStoreWidgetBoilerplate/) for an example


# Build

The widget is build automatically in the pipeline. Go to https://code.siemens.com/mindsphere-mainline/starterservices/mendix/widgets/pipelines and download the artefact from the build.
Do not use locally build widgets on the

* **web-components-ui-test**
* **fmlight-ui-test**

as this will break the tests.

When updating the version of the widgets to a new version - you also have to update the
Environment Variable **WIDGET_VERSION** on the **web-components-ui-test** here:

https://code.siemens.com/mindsphere-mainline/starterservices/mendix/webcomponents-ui-test/-/settings/ci_cd



# Build Widgets locally

To build your widgets on your local pc use the npm "build" script.