.PHONY: install test build

install:
	pip install -r requirements.txt

deps:
	(pip install -r requirements.txt && npm install && bower install)

build:
	(gulp templates && honcho run gulp build && rm -rf front/ && mv dist/ front/)

install-build: clean-build deps build

test:
	honcho run py.test -v -n 2 --cov=api test

run:
	honcho start

clean-build:
	rm -rf build debian/prescrisur

update-spec:
	honcho run python -c 'from api.update import SpecialityUpdater; SpecialityUpdater().execute()'

update-subst:
	honcho run python -c 'from api.update import SubstanceUpdater; SubstanceUpdater().execute()'

update: update-spec update-subst

mongo-setup:
	mongo localhost:27017/Prescrisur mongo-setup.js