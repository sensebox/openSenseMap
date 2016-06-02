OpenSenseMap
============

## DEPRECATION NOTICE
Sooner or later the implementation in this repository will be replaced. Please do not fork!

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
