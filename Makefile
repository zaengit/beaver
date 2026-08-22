.DEFAULT_GOAL := help

.PHONY: help install build test pack check clean status commit update

help:
	@printf '%s\n' \
	  'beaver commands:' \
	  '  make install          Install package dependencies' \
	  '  make build            Build distribution files in dist/' \
	  '  make test             Run the package test suite' \
	  '  make pack             Create the npm tarball' \
	  '  make check            Run tests, build, and inspect both tarballs' \
	  '  make clean            Remove generated distribution files and tarballs' \
	  '  make status           Show Git working-tree status' \
	  "  make commit MSG='type: summary'  Commit all changes" \
	  '  make update           Commit all changes as update and push main'

install:
	npm install

build:
	npm run build

test:
	@if [ -f ../../vitest.config.ts ]; then npm --prefix ../.. test; else npx vitest run; fi
	npm --prefix create-beaver test

pack: build
	npm pack

check: test build
	npm pack --dry-run
	npm --prefix create-beaver pack --dry-run --ignore-scripts

clean:
	rm -rf dist *.tgz

status:
	git status --short

commit:
	@test -n "$(MSG)" || (echo "Usage: make commit MSG='type: summary'" >&2; exit 2)
	git add -A
	git commit -m "$(MSG)"

update:
	git add .
	git diff --cached --quiet || git commit -m "update"
	git push -u origin main
