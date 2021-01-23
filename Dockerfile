FROM debian:bullseye-slim as compress

RUN apt-get update && apt-get install --no-install-recommends -y gzip brotli

COPY ./dist /dist

RUN find /dist \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \; \
  -exec brotli -k '{}' \;

FROM busybox:1

COPY --from=compress /dist /usr/src/osem/dist
COPY run.sh /usr/local/bin/run.sh

CMD ["run.sh"]
