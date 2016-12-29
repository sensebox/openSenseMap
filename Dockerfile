FROM digitallyseamless/nodejs-bower-grunt:4

# Setup build folder
RUN mkdir -p /usr/src/osem
WORKDIR /usr/src/osem

COPY package.json /usr/src/osem/
RUN npm install
COPY bower.json .bowerrc* /usr/src/osem/
RUN bower install
COPY . /usr/src/osem/
RUN grunt build

COPY ./run.sh /

CMD ["./run.sh"]
