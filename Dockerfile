FROM digitallyseamless/nodejs-bower-grunt:5

# Setup build folder
RUN mkdir -p /usr/src/osem
WORKDIR /usr/src/osem

ARG OPENSENSEMAP_API_URL
ARG OPENSENSEMAP_MAPTILES_URL
ARG OPBEAT_ORGID
ARG OPBEAT_APPID

ENV OPENSENSEMAP_API_URL ${OPENSENSEMAP_API_URL:-https://api.opensensemap.org}
ENV OPENSENSEMAP_MAPTILES_URL ${OPENSENSEMAP_MAPTILES_URL:-http://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png}
ENV OPBEAT_ORGID ${OPBEAT_ORGID:-}
ENV OPBEAT_APPID ${OPBEAT_APPID:-}

COPY package.json /usr/src/osem/
RUN npm install
COPY bower.json .bowerrc* /usr/src/osem/
RUN bower install
COPY . /usr/src/osem/
RUN grunt build

CMD ["./run.sh"]
