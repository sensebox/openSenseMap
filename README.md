openSenseMap
============
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Installation

### Docker

#### openSenseMap including openSenseMap-API

For installing openSenseMap and openSenseMap-API with Docker check out our [oSeM-compose](https://github.com/sensebox/OSeM-compose) repository.

#### openSenseMap

To build just openSenseMap you can run:
```docker build -t osem .```

Following ```build-args``` are availble:

| Build Arg | Default value |
| --------- | ----------------- |
| OPENSENSEMAP_API_URL     | https://api.opensensemap.org |
| OPENSENSEMAP_MAPTILES_URL | http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png |

### Local installation

Clone this repository
``` git clone git@github.com:sensebox/openSenseMap.git ```

Go to the cloned repository and install all dependencies by running

```
npm install
bower install
```

Now you are good to go and start up the server in development mode by running:

```
grunt serve
```

If you want to change the API endpoint and/or the map tiles you can do so in the Gruntfile.
Therefore you can change the `replace:devapi` and/or `replace:devmaps` tasks.

## Contributing
Contributions are welcome, see [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License
- Code: MIT License

See [LICENSE](https://github.com/sensebox/opensensemap/blob/master/LICENSE) file.
