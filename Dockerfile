FROM digitallyseamless/nodejs-bower-grunt AS build
COPY package.json package-lock.json bower.json .bowerrc /data/
RUN npm install && bower install
COPY . /data
RUN grunt build


FROM busybox:1

COPY --from=build /data/dist /usr/src/osem/dist
COPY run.sh /usr/local/bin/run.sh

CMD ["run.sh"]
