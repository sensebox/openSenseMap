FROM busybox:1

COPY ./dist /usr/src/osem/dist
COPY run.sh /usr/local/bin/run.sh

CMD ["run.sh"]
