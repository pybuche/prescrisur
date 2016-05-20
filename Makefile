.PHONY: install test build

deps:
	(pip install -r requirements.txt && npm install && bower install)

build:
	(gulp build && rm -rf front/ && mv dist/ front/)

install: deps build

test:
	honcho run py.test -v -n 2 --cov=api test

run:
	honcho start


update-spec:
	python -c 'from api.update import SpecialityUpdater; SpecialityUpdater().execute()'

update-subst:
	python -c 'from api.update import SubstanceUpdater; SubstanceUpdater().execute()'

update: update-spec update-subst

mongo-setup:
	mongo localhost:27017/Prescrisur mongo-setup.js