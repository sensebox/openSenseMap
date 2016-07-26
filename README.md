OpenSenseMap
============

[![Join the chat at https://gitter.im/sensebox/openSenseMap](https://badges.gitter.im/sensebox/openSenseMap.svg)](https://gitter.im/sensebox/openSenseMap?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## DEPRECATION NOTICE
Please be aware that active development of this branch will be stopped on 1st of August 2016. Afterwards, it will be renamed.

## Installation

Go to the cloned repository and run

```
npm install
bower install
```

Now you are good to go and start up the server

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
