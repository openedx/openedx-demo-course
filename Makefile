.PHONY: clean dist help import unpack

REPO_NAME=openedx-demo-course

COURSE=demo-course
COURSE_TAR=dist/$(COURSE).tar.gz
LIBRARY=demo-content-library
LIBRARY_TAR=dist/$(LIBRARY).tar.gz

TUTOR:=tutor
TUTOR_CONTEXT:=local
LIBRARY_IMPORT_USER:=admin

help: ## Display this help message.
	@echo "Please use \`make <target>' where <target> is one of"
	@grep '^[a-zA-Z]' $(MAKEFILE_LIST) | sort | awk -F ':.*?## ' 'NF==2 {printf "\033[36m  %-25s\033[0m %s\n", $$1, $$2}'

clean: ## Delete all generated course and library exports.
	rm -f $(COURSE_TAR) $(LIBRARY_TAR)

dist: ## Create/overwrite exports in ./dist/ folder for course and libary.
	cd $(COURSE) && tar czfv ../$(COURSE_TAR) ./course/
	cd $(LIBRARY) && tar czfv ../$(LIBRARY_TAR) ./library/

unpack: ## Unpack course and library exports from ./dist/ folder into source OLX.
	[ -f $(COURSE_TAR) ] && (cd $(COURSE) && tar xzfv ../$(COURSE_TAR)) || echo "No course to unpack."
	[ -f $(LIBRARY_TAR) ] && (cd $(LIBRARY) && tar xzfv ../$(LIBRARY_TAR)) || echo "No content library to unpack."

import: dist ## Import course and libraries into a locally-running Tutor instance. Requires an admin user.
	$(TUTOR) mounts add cms,cms-worker:.:/openedx/data/$(REPO_NAME)
	yes | \
		$(TUTOR) $(TUTOR_CONTEXT) run $(MOUNT_REPO) cms \
		./manage.py cms import_content_library /openedx/data/$(REPO_NAME)/$(LIBRARY_TAR) $(LIBRARY_IMPORT_USER)
	$(TUTOR) $(TUTOR_CONTEXT) run $(MOUNT_REPO) cms \
		./manage.py cms import /openedx/data $(REPO_NAME)/$(COURSE)/course
	$(TUTOR) $(TUTOR_CONTEXT) run cms \
		./manage.py cms reindex_course --all --setup
