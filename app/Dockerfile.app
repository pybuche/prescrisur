FROM python:2.7.12 as base

MAINTAINER Courtel Eliot <eliot.courtel@wanadoo.fr>
WORKDIR /home/app

FROM base as prescrisur

COPY ./requirements.txt ./
RUN python -m pip install --upgrade pip
RUN python -m pip install --upgrade -r requirements.txt

# Fix Certigna CA - copy cert from host (already validated)
COPY ./certigna-services-ca.crt /usr/local/share/ca-certificates/certigna-services-ca.crt
RUN cd /etc/ssl/certs \
    && hash=$(openssl x509 -in /usr/local/share/ca-certificates/certigna-services-ca.crt -noout -hash) \
    && ln -sf /usr/local/share/ca-certificates/certigna-services-ca.crt ${hash}.0 \
    && cat /usr/local/share/ca-certificates/certigna-services-ca.crt >> /etc/ssl/certs/ca-certificates.crt


RUN python -c "import certifi, os; bundle=certifi.where(); before=os.path.getsize(bundle); open(bundle, 'a').write(open('/usr/local/share/ca-certificates/certigna-services-ca.crt').read()); after=os.path.getsize(bundle); assert after>before, 'CERT NOT ADDED: '+str(before)+' '+str(after)"

ENTRYPOINT python ./api/server.py;
