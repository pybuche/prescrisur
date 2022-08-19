FROM python:3.5.2 as base

MAINTAINER Courtel Eliot <eliot.courtel@wanadoo.fr>
WORKDIR /home/app

FROM base as prescrisur

COPY ./requirements.txt ./
RUN python3 -m pip install --upgrade pip
RUN python3 -m pip install --upgrade -r requirements.txt

ENTRYPOINT python3 ./api/server.py;
