![openSenseMap](https://raw.githubusercontent.com/sensebox/resources/master/images/openSenseMap_github.png)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repository contains the code of the openSenseMap frontend running at [https://opensensemap.org](https://opensensemap.org). To get more information about openSenseMap and senseBox visit the before mentioned links or have a look at this [video](https://www.youtube.com/watch?v=I8ZeT6hzjKQ) or read the [openSenseMap](https://docs.sensebox.de/category/opensensemap/) chapter in our documentation. openSenseMap is part of the [senseBox] project.

Originally, this frontend has been built as part of the bachelor thesis of [@mpfeil](https://github.com/mpfeil) at the ifgi (Institute for Geoinformatics, WWU Münster) and is currently maintained by [@mpfeil](https://github.com/mpfeil).

The easiest way to get up and running with your own copy is clicking the Deploy to Netlify button below. It will clone the repository into your own account, and deploy the site to Netlify. It is going to ask for `Maptiles url` and `API endpoint`. Please use the default values listed under [configuration](#Configuration) or use your own.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sensebox/openSenseMap)

## Configuration
You can configure the API endpoint and/or map tiles using the following environmental variables:

| ENV | Default value |
| --------- | ----------------- |
| OPENSENSEMAP_API_URL     | https://api.testing.opensensemap.org |
| OPENSENSEMAP_CMS_URL     | <YOUR_DIRECTUS_CMS_URL> |
| OPENSENSEMAP_STYLE_URL |  <YOUR_MAPBOX_STYLE_URL> |
| OPENSENSEMAP_ACCESS_TOKEN | <YOUR_MAPBOX_ACCESS_TOKEN> |

You can set them in your `terminal` or create a file called `.env` and set the values.


## Development
- Have [Node.js] v10, [grunt]() and [bower]() installed
- Check out a branch for your feature (`git checkout my-aweseome-feature`)
- Run `npm install` and `npx bower install`
- Run frontend in development mode (`npx grunt serve`)
- Commit your changes to your branch and push it to your fork
- Create a pull request against the `master` branch

See also: [CONTRIBUTING](.github/CONTRIBUTING.md)

## Related projects

### Services
- [openSenseMap Backend](https://github.com/sensebox/openSenseMap-API)
- [openSenseMap translations](https://github.com/sensebox/openSenseMap-i18n)

### Deployment
- [OSeM-compose](https://github.com/sensebox/OSeM-compose)
- [openSenseMap-infrastructure](https://github.com/sensebox/openSenseMap-infrastructure)

## Technologies

* [AngularJS]

## Organization

### Branches
- master (runs on testing server)
  - Is used for production container build tags

## Docker

### openSenseMap including openSenseMap-API

For installing openSenseMap and openSenseMap-API with Docker check out our [oSeM-compose](https://github.com/sensebox/OSeM-compose) repository.

### openSenseMap

To build just openSenseMap you can run:
```docker build -t osem .```

Following ```build-args``` are availble:

| Build Arg | Default value |
| --------- | ----------------- |
| OPENSENSEMAP_API_URL     | https://api.opensensemap.org |
| OPENSENSEMAP_CMS_URL     | <YOUR_DIRECTUS_CMS_URL> |
| OPENSENSEMAP_STYLE_URL |  <YOUR_MAPBOX_STYLE_URL> |
| OPENSENSEMAP_ACCESS_TOKE | <YOUR_MAPBOX_ACCESS_TOKEN> |


## License

[MIT](LICENSE) - Matthias Pfeil 2015 - now

[AngularJS]:https://angularjs.org/
[Node.js]:http://nodejs.org/
[openSenseMap]:https://opensensemap.org/
[senseBox]:https://sensebox.de/
