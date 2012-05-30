default: jar
	# Preparing the chrome.manifest for deployment.
	sed -i 's/ chrome\// jar:chrome\/yarip.jar!\//g' chrome.manifest

	# Creating the XPI installer-module.
	zip -r yarip-`grep em:version install.rdf | sed 's/[^0-9.]//g'`.xpi . -i \
./chrome.manifest ./COPYING ./install.rdf ./chrome/yarip.jar ./components/* \
./defaults/preferences/* ./modules/* -x Makefile

	# Reverting the chrome.manifest for development.
	sed -i 's/ jar:chrome\/yarip.jar!\// chrome\//g' chrome.manifest

jar:
	$(MAKE) -C chrome

clean:
	$(MAKE) -C chrome clean
	rm -f yarip-*.xpi
