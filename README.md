openSenseMap
============

## Installation

### Docker
For installing openSenseMap and openSenseMap-API with Docker check out our [oSeM-compose](https://github.com/sensebox/OSeM-compose) repository.

Clone this repository
``` git clone git@github.com:sensebox/openSenseMap.git ```

Go to the cloned repository and install all dependencies by running

```
npm install
bower install
```

### Local installation

Replace the following variables with your configuration:
- ```OPENSENSEMAP_API_URL``` in [opensenseboxapi.js](https://github.com/sensebox/openSenseMap/blob/master/app/scripts/services/opensenseboxapi.js#L13)
- ```OPENSENSEMAP_MAPTILES_URL``` in [map.js line 13](https://github.com/sensebox/openSenseMap/blob/master/app/scripts/controllers/map.js#L13), [map.js line 73](https://github.com/sensebox/openSenseMap/blob/master/app/scripts/controllers/map.js#L73) and [register.js](https://github.com/sensebox/openSenseMap/blob/master/app/scripts/controllers/register.js#L202)


For ```OPENSENSEMAP_API_URL``` use your own API Url (e.g. ```localhost:8000```) or our live API.

For ```OPENSENSEMAP_MAPTILES_URL``` you can use standard OpenStreetMap tiles e.g. ```http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png```.



Now you are good to go and start up the server in development mode by running:

```
grunt serve
```

Alternatively, you can use a webserver like nginx and point the web root to the /app folder:

```
server {
        root /var/www/OpenSenseMap/app;
        index index.html;
        location / {
                try_files $uri $uri/ /index.html;
        }

}
```

Code license: MIT License
