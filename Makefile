.DEFAULT_GOAL := help

NEXT_VERSION := $(shell node -e 'const parts = require("./package.json").version.split("."); if (parts.length !== 3 || parts.some((part) => part === "" || Number.isNaN(Number(part)))) process.exit(1); console.log(parts[0] + "." + parts[1] + "." + (Number(parts[2]) + 1))')
VERSION ?= $(NEXT_VERSION)
RELEASE_VERSION = $(patsubst v%,%,$(VERSION))
TAG ?= v$(RELEASE_VERSION)

.PHONY: help install build test pack check clean status commit update sync-version verify-version verify-tag release release-push

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
	  '  make sync-version [VERSION=0.1.15]  Sync both package versions' \
	  '  make release [VERSION=0.1.15]       Sync, check, commit, and tag' \
	  '  make release-push [VERSION=0.1.15]  Release and push main and tag' \
	  "  make commit MSG='type: summary'  Commit all changes" \
	  '  make update           Commit all changes as update and push main'

install:
	npm install

build:
	npm run build

test:
	@if [ -f ../../vitest.config.ts ]; then npm --prefix ../.. test; else npx vitest run; fi

pack: build
	npm pack

check: test build
	npm pack --dry-run

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

sync-version:
	@test -n "$(RELEASE_VERSION)" || (echo "Usage: make sync-version VERSION=0.1.15" >&2; exit 2)
	node scripts/sync-version.mjs "$(RELEASE_VERSION)"

verify-version:
	@test -n "$(RELEASE_VERSION)" || (echo "Usage: make verify-version VERSION=0.1.15" >&2; exit 2)
	node scripts/sync-version.mjs --check "$(RELEASE_VERSION)"

verify-tag:
	@test -n "$(TAG)" && test "$(TAG)" != "v" || (echo "Usage: make verify-tag TAG=v0.1.15" >&2; exit 2)
	@version="$${TAG#v}"; node scripts/sync-version.mjs --check "$$version"

release:
	@test -n "$(RELEASE_VERSION)" || (echo "Usage: make release VERSION=0.1.15" >&2; exit 2)
	@test -z "$$(git status --short)" || (echo "Working tree must be clean before release" >&2; exit 2)
	@test -z "$$(git tag --list "$(TAG)")" || (echo "Tag $(TAG) already exists" >&2; exit 2)
	$(MAKE) sync-version VERSION="$(RELEASE_VERSION)"
	$(MAKE) verify-version VERSION="$(RELEASE_VERSION)"
	$(MAKE) check
	git add package.json
	git add -f dist/ui.js
	git commit -m "chore(release): bump Beaver version"
	git tag -a "$(TAG)" -m "Release $(TAG)"

release-push: release
	git push origin main --follow-tags
