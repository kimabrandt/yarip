default:
	zip -r yarip-`grep em:version install.rdf | sed 's/[^0-9.]//g'`.xpi . -i \
./chrome.manifest ./COPYING ./install.rdf \
./chrome/content/* \
./chrome/content/binding/* \
./chrome/locale/en-US/* \
./chrome/skin/* ./chrome/skin/unix/* \
./components/* \
./defaults/preferences/* \
./modules/*

clean:
	rm -f yarip-*.xpi
