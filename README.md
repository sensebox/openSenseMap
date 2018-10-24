![openSenseMap](https://raw.githubusercontent.com/sensebox/resources/master/images/openSenseMap_github.png)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repository contains the code of the openSenseMap frontend running at [https://opensensemap.org](https://opensensemap.org). To get more information about openSenseMap and senseBox visit the before mentioned links or have a look at this [video](https://www.youtube.com/watch?v=I8ZeT6hzjKQ) or read the [openSenseMap](https://osem.books.sensebox.de/) chapter in our [books](https://books.sensebox.de/). openSenseMap is part of the [senseBox] project.

Originally, this frontend has been built as part of the bachelor thesis of [@mpfeil](https://github.com/mpfeil) at the ifgi (Institute for Geoinformatics, WWU Münster) and is currently maintained by [@mpfeil](https://github.com/mpfeil).

The easiest way to get up and running with your own copy is clicking the `Deploy to Netlify` button below. It will clone the repository into your own account, and deploy the site to Netlify. It is going to use the default environmental variables specified under [configuration](#Configuration).

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sensebox/openSenseMap)

## Configuration
You can configure the API endpoint and/or map tiles using the following environmental variables:

| ENV | Default value |
| --------- | ----------------- |
| OPENSENSEMAP_API_URL     | https://api.testing.opensensemap.org |
| OPENSENSEMAP_MAPTILES_URL | http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png |

You can set them in your `terminal` or change the default values in the [Gruntfile](https://github.com/sensebox/openSenseMap/blob/development/Gruntfile.js#L24).


## Development
- Have [Node.js] v8, [grunt]() and [bower]() installed
- Check out `development` branch (`git checkout development`)
- Run `npm install` and `bower install`
- Create your own branch `git checkout -b my-awesome-branch`
- Run frontend in development mode (`grunt serve`)
- Commit your changes to your branch and push it to your fork
- Create a pull request against the `development` branch

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
- master (runs in production)
  - Is used for container build tags
- development (runs on testing server)
  - Bleeding edge and possibly unstable development version

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
| OPENSENSEMAP_MAPTILES_URL | http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png |


## License

[MIT](LICENSE) - Matthias Pfeil 2015 - now

[AngularJS]:https://angularjs.org/
[Node.js]:http://nodejs.org/
[openSenseMap]:https://opensensemap.org/
[senseBox]:https://sensebox.de/
