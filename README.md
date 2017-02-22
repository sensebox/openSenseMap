openSenseMap
============

## Installation

### Docker
For installing openSenseMap and openSenseMap-API with Docker check out our [oSeM-compose](https://github.com/sensebox/OSeM-compose) repository.

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

Code license: MIT License
