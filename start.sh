#!/bin/bash

error() {
	echo Build error!
	exit 1
}

docker build -t viewer-node viewer-node/ \
&& docker build -t hoster-angular hoster-angular/ \
|| error

docker-compose down
docker-compose up -d
