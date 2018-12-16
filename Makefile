
.PHONY: test deploy

test:
	python -m SimpleHTTPServer

deploy:
	./deploy.sh

