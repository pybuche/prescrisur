FROM python:2.7.12 as base

MAINTAINER Courtel Eliot <eliot.courtel@wanadoo.fr>
WORKDIR /home/app

FROM base as prescrisur

COPY ./requirements.txt ./
RUN python -m pip install --upgrade pip
RUN python -m pip install --upgrade -r requirements.txt

ENTRYPOINT python ./api/server.py;
