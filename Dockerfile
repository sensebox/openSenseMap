FROM node:4-slim

# Install Bower & Grunt
RUN npm install -g bower grunt-cli  \
  && echo '{ "allow_root": true }' > /root/.bowerrc

# Setup build folder
RUN mkdir -p /usr/src/osem
WORKDIR /usr/src/osem

ARG OPENSENSEMAP_API_URL
ARG OPENSENSEMAP_MAPTILES_URL

ENV OPENSENSEMAP_API_URL ${OPENSENSEMAP_API_URL:-https://api.opensensemap.org}
ENV OPENSENSEMAP_MAPTILES_URL ${OPENSENSEMAP_MAPTILES_URL:-http://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png}

COPY package.json /usr/src/osem/
RUN yarn install --no-lockfile
COPY bower.json .bowerrc* /usr/src/osem/
RUN apt-get update && apt-get install -y git --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && bower install \
  && apt-get purge -y --auto-remove git curl wget ca-certificates
COPY . /usr/src/osem/
RUN grunt build \
  && cp -rf /usr/src/osem/dist /osem-dist \
  && cp -rf /usr/src/osem/run.sh /run.sh \
  && rm -rf /usr/src/osem /usr/local/lib/node_modules

CMD ["/run.sh"]
