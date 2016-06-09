FROM digitallyseamless/nodejs-bower-grunt:4

# Setup build folder
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
COPY bower.json .bowerrc* /usr/src/app/
RUN bower install
COPY . /usr/src/app/
RUN grunt build

VOLUME /usr/src/app/dist

CMD ["/bin/true"]
