
/*
Copyright 2007-2012 Kim A. Brandt <kimabrandt@gmx.de>

This file is part of yarip.

Yarip is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

Yarip is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with yarip.  If not, see <http://www.gnu.org/licenses/>.
*/

const EXPORTED_SYMBOLS = [
        "URL_RE",
        "URI_SIMPLE_RE",
        "NO_SCHEME_RE",
        "DOMAIN_RE",
        "FIND_SLD_RE",
        "FIND_TLD_RE",
        "SIMPLE",
        "TLD",
        "PORT",
        "URI1_SCHEME_INDEX",
        "URI1_IP_INDEX",
        "URI1_REG_NAME_TLD_INDEX",
        "URI2_IP_INDEX",
        "URI2_REG_NAME_INDEX",
        "URI2_TLD_INDEX",
        "SIMPLE_DOT_INDEX",
        "DOMAIN_RE_INDEX",
        "DOMAIN_RE_IP_INDEX",
        "DOMAIN_RE_ULD_INDEX",
        "DOMAIN_RE_PORT_INDEX"
    ];

//var URI1_INDEX = 1;
var URI1_SCHEME_INDEX = 2;
//var URI1_OFFICIAL_SCHEME_INDEX = 3;
//var URI1_UNOFFICIAL_SCHEME_INDEX = 4;
//var URI1_HIER_PART_INDEX = 5;
var URI1_IP_INDEX = 6;
//var URI1_IPV4ADDRESS_INDEX = 7;
//var URI1_IP_LITERAL_INDEX = 8;
var URI1_REG_NAME_TLD_INDEX = 9;
//var URI1_PORT_INDEX = 10;
//var URI1_QUERY_FRAGMENT_INDEX = 11;
//var URI2_INDEX = 12;
//var URI2_AUTHORITY_INDEX = 13;
var URI2_IP_INDEX = 14;
//var URI2_IPV4ADDRESS_INDEX = 15;
//var URI2_IP_LITERAL_INDEX = 16;
var URI2_REG_NAME_INDEX = 17;
var URI2_TLD_INDEX = 18;
//var URI2_PORT_INDEX = 19;
//var URI2_PATH_INDEX = 20;
//var URI2_QUERY_FRAGMENT_INDEX = 21;

//var SIMPLE_INDEX = 22;
var SIMPLE_DOT_INDEX = 23;
//var SIMPLE_PORT_INDEX = 24;
//var SIMPLE_PATH_INDEX = 25;
//var SIMPLE_QUERY_FRAGMENT_INDEX = 26;

var DOMAIN_RE_INDEX = 1; // without port
var DOMAIN_RE_IP_INDEX = 2;
//var DOMAIN_RE_IPV4ADDRESS_INDEX = 3;
//var DOMAIN_RE_IP_LITERAL_INDEX = 4;
var DOMAIN_RE_ULD_INDEX = 5;
//var DOMAIN_RE_TLD_INDEX = 6;
//var DOMAIN_RE_SIMPLE_DOT_INDEX = 7;
var DOMAIN_RE_PORT_INDEX = 8;

// http://www.iana.org/assignments/uri-schemes.html
var OFFICIAL_SCHEME = "(aaa|aaas|acap|afs|cap|cid|crid|data|dav|dict|dns|dtn|dvb|fax|file|ftp|geo|go|gopher|h323|http|https|iax|icap|icon|im|imap|info|ipn|ipp|iris|iris\\.beep|iris\\.lwz|iris\\.xpc|iris\\.xpcs|jms|ldap|mailto|mid|modem|msrp|msrps|mtqp|mupdate|news|nfs|nntp|oid|opaquelocktoken|pack|pop|pres|rsync|rtsp|service|shttp|sieve|sip|sips|sms|snmp|soap\\.beep|soap\\.beeps|tag|tel|telnet|tftp|thismessage|tip|tn3270|tv|urn|vemmi|view-source|ws|wss|xmlrpc\\.beep|xmlrpc\\.beeps|xmpp|z39\\.50r|z39\\.50s)";
// http://en.wikipedia.org/wiki/URI_scheme#Unofficial_but_common_URI_schemes , http://www.w3.org/wiki/UriSchemes
var UNOFFICIAL_SCHEME = "(about|addbook|adiumxtra|afp|aim|applescript|apt|aw|bcp|bitcoin|bk|bolo|btspp|callto|castanet|cdv|chrome|chttp|coap|content|cvs|daytime|device|doi|ed2k|eid|enp|facetime|feed|finger|fish|freenet|gg|git|gizmoproject|gsiftp|gsm-sms|gtalk|h324|hdl|hnews|httpsy|iioploc|ilu|IOR|irc|irc6|ircs|itms|jar|javascript|jdbc|keyparc|klik|kn|lastfm|ldaps|lifn|livescript|lrq|magnet|mailbox|man|maps|md5|message|mms|mocha|moz-abmdbdirectory|moz-icon|msnim|mumble|mvn|myim|notes|nsfw|oai|palm|paparazzi|pcast|phone|php|pop3|printer|psyc|pyimp|rdar|res|resource|rmi|rtmp|rvp|rwhois|rx|sdp|secondlife|sftp|sgn|skype|smb|snews|soap\\.udp|soldat|spotify|ssh|steam|SubEthaEdit|svn|svn\\+ssh|t120|tann|tcp|teamspeak|telephone|things|txmt|uddi|unreal|ut2004|uuid|ventrilo|videotex|wcap|webcal|whodp|whois|whois\\+\\+|wpn|wtai|wyciwyg|wysiwyg|xeerkat|xfire|xri|ymsgr)";
var SCHEME = "(" + OFFICIAL_SCHEME + "|" + UNOFFICIAL_SCHEME + "):";
var IP_LITERAL = "(\\[(?:(?:(?:[a-f\\d]{1,4}:){6}(?:[a-f\\d]{1,4}:[a-f\\d]{1,4})|(?:(?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])))|(?:::(?:[a-f\\d]{1,4}:){5}(?:[a-f\\d]{1,4}:[a-f\\d]{1,4})|(?:(?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])))|(?:(?:[a-f\\d]{1,4})?::(?:[a-f\\d]{1,4}:){4}(?:[a-f\\d]{1,4}:[a-f\\d]{1,4})|(?:(?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])))|(?:(?:(?:[a-f\\d]{1,4}:)?[a-f\\d]{1,4})?::(?:[a-f\\d]{1,4}:){3}(?:[a-f\\d]{1,4}:[a-f\\d]{1,4})|(?:(?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])))|(?:(?:(?:(?:[a-f\\d]{1,4}:){1,2})?[a-f\\d]{1,4})?::(?:[a-f\\d]{1,4}:){2}(?:[a-f\\d]{1,4}:[a-f\\d]{1,4})|(?:(?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])))|(?:(?:(?:(?:[a-f\\d]{1,4}:){1,3})?[a-f\\d]{1,4})?::(?:[a-f\\d]{1,4}:[a-f\\d]{1,4})|(?:(?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])))|(?:(?:(?:(?:[a-f\\d]{1,4}:){1,4})?[a-f\\d]{1,4})?::(?:[a-f\\d]{1,4}:[a-f\\d]{1,4})|(?:(?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])))|(?:(?:(?:(?:[a-f\\d]{1,4}:){1,5})?[a-f\\d]{1,4})?::[a-f\\d]{1,4})|(?:(?:(?:(?:[a-f\\d]{1,4}:){1,6})?[a-f\\d]{1,4})?::))\\])";
var IPV4ADDRESS = "((?:(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[1-9]?\\d|1\\d{2}|2[0-4]\\d|25[0-5]))";
var IP = "(" + IPV4ADDRESS + "|" + IP_LITERAL + ")";
var AUTHORITY = "([a-z\\d](?:[\\w-.~!$&*+,=:]|%[a-f\\d]{2})*@)?";
//var REG_NAME = "((?:[a-z\\d](?:[\\w-~!$&*+,=@]|%[a-f\\d]{2})*\\.)+)";
var REG_NAME = "((?:[a-z\\d](?:[\\w-~!$&*+,=@]|%[a-f\\d]{2})*\\.)+?)";
var SIMPLE = "([a-z\\d](?:[\\w-~!$&'()*+,;=]|%[a-f\\d]{2})*)";
//var SIMPLE_DOT = "([a-z\\d](?:[\\w-.~!$&'()*+,;=]|%[a-f\\d]{2})*)";
var SIMPLE_DOT = "([a-z\\d](?:[\\w-.~!$&'()*+,;=]|%[a-f\\d]{2})*?)";
//var ULD = "([a-z\\d](?:[\\w-.~!$&'()*+,;=]|%[a-f\\d]{2})*\\.)";
var ULD = "([a-z\\d](?:[\\w-.~!$&'()*+,;=]|%[a-f\\d]{2})*?\\.)";
var SLD = "(" + SIMPLE + "\\.)";
// checked: ar, biz, br, cn, com, de, eu, info, it, jp, net, nl, om, org, pl, ru, tr, uk
// http://data.iana.org/TLD/tlds-alpha-by-domain.txt , http://publicsuffix.org/list/
var TLD = "(" +
    "(?:(?:(?:com|edu|gov|mil|net|org)\\.)?ac)" +
    "|(?:(?:(?:nom)\\.)?ad)" +
    "|(?:(?:(?:accident-investigation|accident-prevention|aerobatic|aeroclub|aerodrome|agents|air-surveillance|air-traffic-control|aircraft|airline|airport|airtraffic|ambulance|amusement|association|author|ballooning|broker|caa|cargo|catering|certification|championship|charter|civilaviation|club|conference|consultant|consulting|control|council|crew|design|dgca|educator|emergency|engine|engineer|entertainment|equipment|exchange|express|federation|flight|freight|fuel|gliding|government|groundhandling|group|hanggliding|homebuilt|insurance|journal|journalist|leasing|logistics|magazine|maintenance|marketplace|media|microlight|modelling|navigation|parachuting|paragliding|passenger-association|pilot|press|production|recreation|repbody|res|research|rotorcraft|safety|scientist|services|show|skydiving|software|student|taxi|trader|trading|trainer|union|workinggroup|works)\\.)?aero)" +
    "|(?:(?:(?:ac|co|gov|mil|net|org|sch)\\.)?ae)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?af)" +
    "|(?:(?:(?:co|com|net|nom|org)\\.)?ag)" +
    "|(?:(?:(?:com|net|off|org)\\.)?ai)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?al)" +
    "|(?:(?:(?:com|edu|net|org)\\.)?an)" +
    "|(?:(?:(?:co|ed|gv|it|og|pb)\\.)?ao)" +
    "|(?:(?:(?:e164|in-addr|ip6|iris|uri|urn)\\.)?arpa)" +
    "|(?:(?:(?:com|edu|gob|gov|int|mil|net|org|tur)\\.)?ar)" +
    "|(?:(?:(?:gov)\\.)?as)" +
    "|(?:(?:(?:ac|biz|co|gv|info|or|priv)\\.)?at)" +
    "|(?:(?:(?:(?:(?:act|nsw|nt|qld|sa|tas|vic|wa)\\.)?edu|(?:(?:act|nt|qld|sa|tas|vic|wa)\\.)?gov|act|asn|com|conf|id|info|net|nsw|nt|org|oz|qld|sa|tas|vic|wa)\\.)?au)" +
    "|(?:(?:(?:com)\\.)?aw)" +
    "|(?:(?:(?:biz|com|edu|gov|info|int|mil|name|net|org|pp|pro)\\.)?az)" +
    "|(?:(?:(?:co|com|edu|gov|mil|net|org|rs|unbi|unsa)\\.)?ba)" +
    "|(?:(?:(?:biz|com|edu|gov|info|net|org|store)\\.)?bb)" +
    "|(?:(?:(?:ac)\\.)?be)" +
    "|(?:(?:(?:gov)\\.)?bf)" +
    "|(?:(?:[0-9a-z]\\.)?bg)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bh)" +
    "|(?:(?:(?:dyndns|for-better|for-more|for-some|for-the|selfip|webhop)\\.)?biz)" +
    "|(?:(?:(?:co|com|edu|or|org)\\.)?bi)" +
    "|(?:(?:(?:asso|barreau|gouv)\\.)?bj)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bm)" +
    "|(?:(?:(?:com|edu|gob|gov|int|mil|net|org|tv)\\.)?bo)" +
    "|(?:(?:(?:adm|adv|agr|am|arq|art|ato|b|bio|blog|bmd|can|cim|cng|cnt|com|coop|ecn|edu|emp|eng|esp|etc|eti|far|flog|fm|fnd|fot|fst|g12|ggf|gov|imb|ind|inf|jor|jus|leg|lel|mat|med|mil|mus|net|nom|not|ntr|odo|org|ppg|pro|psc|psi|qsl|radio|rec|slg|srv|taxi|teo|tmp|trd|tur|tv|vet|vlog|wiki|zlg)\\.)?br)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bs)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bt)" +
    "|(?:(?:(?:co|org)\\.)?bw)" +
    "|(?:(?:(?:com|gov|mil|of)\\.)?by)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bz)" +
    "|(?:(?:(?:ab|bc|co|gc|mb|nb|nf|nl|ns|nt|nu|on|pe|qc|sk|yk)\\.)?ca)" +
    "|(?:(?:(?:ftpaccess|game-server|myphotos|scrapping)\\.)?cc)" +
    "|(?:(?:(?:gov)\\.)?cd)" +
    "|(?:(?:(?:ac|asso|aroport-bya|co|com|ed|edu|go|gouv|int|md|net|or|org|presse)\\.)?ci)" +
    "|(?:(?:(?:co|gob|gov|mil)\\.)?cl)" +
    "|(?:(?:(?:gov)\\.)?cm)" +
    "|(?:(?:(?:ac|ah|bj|com|cq|edu|fj|gd|gov|gs|gx|gz|ha|hb|he|hi|hk|hl|hn|jl|js|jx|ln|mil|mo|net|nm|nx|org|qh|sc|sd|sh|sn|sx|tj|tw|xj|xz|yn|zj)\\.)?cn)" +
    "|(?:(?:(?:appspot|ar|blogdns|br|cechire|cn|de|dnsalias|dnsdojo|doesntexist|dontexist|doomdns|dyn-o-saur|dynalias|dyndns-at-home|dyndns-at-work|dyndns-blog|dyndns-free|dyndns-home|dyndns-ip|dyndns-mail|dyndns-office|dyndns-pics|dyndns-remote|dyndns-server|dyndns-web|dyndns-wiki|dyndns-work|est-a-la-maison|est-a-la-masion|est-le-patron|est-mon-blogueur|eu|from-ak|from-al|from-ar|from-ca|from-ct|from-dc|from-de|from-fl|from-ga|from-hi|from-ia|from-id|from-il|from-in|from-ks|from-ky|from-ma|from-md|from-mi|from-mn|from-mo|from-ms|from-mt|from-nc|from-nd|from-ne|from-nh|from-nj|from-nm|from-nv|from-oh|from-ok|from-or|from-pa|from-pr|from-ri|from-sc|from-sd|from-tn|from-tx|from-ut|from-va|from-vt|from-wa|from-wi|from-wv|from-wy|gb|getmyip|gotdns|hobby-site|homelinux|homeunix|hu|iamallama|is-a-anarchist|is-a-blogger|is-a-bookkeeper|is-a-bulls-fan|is-a-caterer|is-a-chef|is-a-conservative|is-a-cpa|is-a-cubicle-slave|is-a-democrat|is-a-designer|is-a-doctor|is-a-financialadvisor|is-a-geek|is-a-green|is-a-guru|is-a-hard-worker|is-a-hunter|is-a-landscaper|is-a-lawyer|is-a-liberal|is-a-libertarian|is-a-llama|is-a-musician|is-a-nascarfan|is-a-nurse|is-a-painter|is-a-personaltrainer|is-a-photographer|is-a-player|is-a-republican|is-a-rockstar|is-a-socialist|is-a-student|is-a-teacher|is-a-techie|is-a-therapist|is-an-accountant|is-an-actor|is-an-actress|is-an-anarchist|is-an-artist|is-an-engineer|is-an-entertainer|is-certified|is-gone|is-into-anime|is-into-cars|is-into-cartoons|is-into-games|is-leet|is-not-certified|is-slick|is-uberleet|is-with-theband|isa-geek|isa-hockeynut|issmarterthanyou|jpn|kr|likes-pie|likescandy|neat-url|no|operaunite|qc|ru|sa|saves-the-whales|se|selfip|sells-for-less|sells-for-u|servebbs|simple-url|space-to-rent|teaches-yoga|uk|us|uy|writesthisblog|za)\\.)?com)" +
    "|(?:(?:(?:arts|com|edu|firm|gov|info|int|mil|net|nom|org|rec|web)\\.)?co)" +
    "|(?:(?:(?:ac|co|ed|fi|go|or|sa)\\.)?cr)" +
    "|(?:(?:(?:com|edu|gov|inf|net|org)\\.)?cu)" +
    "|(?:(?:(?:ath|gov)\\.)?cx)" +
    "|(?:(?:(?:com|fuettertdasnetz|isteingeek|istmein|lebtimnetz|leitungsen|traeumtgerade)\\.)?de)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?dm)" +
    "|(?:(?:(?:art|com|edu|gob|gov|mil|net|org|sld|web)\\.)?do)" +
    "|(?:(?:(?:art|asso|com|edu|gov|net|org|pol)\\.)?dz)" +
    "|(?:(?:(?:com|edu|fin|gob|gov|info|k12|med|mil|net|org|pro)\\.)?ec)" +
    "|(?:(?:(?:aip|com|edu|fie|gov|lib|med|org|pri|riik)\\.)?ee)" +
    "|(?:(?:(?:com|edu|eun|gov|mil|name|net|org|sci)\\.)?eg)" +
    "|(?:(?:(?:com|edu|gob|nom|org)\\.)?es)" +
    "|(?:(?:(?:aland|iki)\\.)?fi)" +
    "|(?:(?:(?:aeroport|assedic|asso|avocat|avoues|cci|chambagri|chirurgiens-dentistes|com|experts-comptables|geometre-expert|gouv|greta|huissier-justice|medecin|nom|notaires|pharmacien|port|prd|presse|tm|veterinaire)\\.)?fr)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org|pvt)\\.)?ge)" +
    "|(?:(?:(?:co|gov|net|org|sch)\\.)?gg)" +
    "|(?:(?:(?:com|edu|gov|mil|org)\\.)?gh)" +
    "|(?:(?:(?:com|edu|gov|ltd|mod|org)\\.)?gi)" +
    "|(?:(?:(?:ac|com|edu|gov|net|org)\\.)?gn)" +
    "|(?:(?:(?:asso|com|edu|mobi|net|org)\\.)?gp)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?gr)" +
    "|(?:(?:(?:co|com|net)\\.)?gy)" +
    "|(?:(?:(?:com|edu|gov|idv|net|org|ciqpn|gmqw5a|55qx5d|mxtq1m|lcvr32d|wcvs22d|gmq050i|uc0atv|uc0ay4a|od0alg|zf0avx|mk0axi|tn0ag|od0aq3b|io0a7i)\\.)?hk)" +
    "|(?:(?:(?:com|edu|gob|mil|net|org)\\.)?hn)" +
    "|(?:(?:(?:com|from|iz|name)\\.)?hr)" +
    "|(?:(?:(?:adult|art|asso|com|coop|edu|firm|gouv|info|med|net|org|perso|pol|pro|rel|shop)\\.)?ht)" +
    "|(?:(?:(?:2000|agrar|bolt|casino|city|co|erotica|erotika|film|forum|games|hotel|info|ingatlan|jogasz|konyvelo|lakas|media|news|org|priv|reklam|sex|shop|sport|suli|szex|tm|tozsde|utazas|video)\\.)?hu)" +
    "|(?:(?:(?:ac|co|go|mil|net|or|sch|web)\\.)?id)" +
    "|(?:(?:(?:gov)\\.)?ie)" +
    "|(?:(?:(?:ac|co|gov|idf|k12|muni|net|org)\\.)?il)" +
    "|(?:(?:(?:ac|co|gov|ltd\\.co|net|nic|org|plc\\.co)\\.)?im)" +
    "|(?:(?:(?:barrel-of-knowledge|barrell-of-knowledge|dyndns|for-our|groks-the|groks-this|here-for-more|knowsitall|selfip|webhop)\\.)?info)" +
    "|(?:(?:(?:eu)\\.)?int)" +
    "|(?:(?:(?:ac|co|edu|firm|gen|gov|ind|mil|net|nic|org|res)\\.)?in)" +
    "|(?:(?:(?:com)\\.)?io)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?iq)" +
    "|(?:(?:(?:ac|co|gov|id|net|org|sch|mgba3a4fra|mgba3a4f16a)\\.)?ir)" +
    "|(?:(?:(?:com|edu|gov|int|net|org)\\.)?is)" +
    "|(?:(?:(?:ag|agrigento|al|alessandria|alto-adige|altoadige|an|ancona|andria-barletta-trani|andria-trani-barletta|andriabarlettatrani|andriatranibarletta|ao|aosta|aoste|ap|aq|aquila|ar|arezzo|ascoli-piceno|ascolipiceno|asti|at|av|avellino|ba|balsan|bari|barlettaandriatrani|barletta-andria-trani|barletta-trani-andria|barlettatraniandria|belluno|benevento|bergamo|bg|bi|biella|bl|bn|bo|bologna|bolzano|bozen|br|brescia|brindisi|bs|bt|bz|ca|cagliari|caltanissetta|campidano-medio|campidanomedio|campobasso|carbonia-iglesias|carboniaiglesias|carrara-massa|carraramassa|caserta|catania|catanzaro|cb|ce|cesena-forli|cesenaforli|ch|chieti|ci|cl|cn|co|como|cosenza|cr|cremona|crotone|cs|ct|cuneo|cz|dell-ogliastra|dellogliastra|edu|en|enna|fc|fe|fermo|ferrara|fg|fi|firenze|florence|fm|foggia|forli-cesena|forlicesena|fr|frosinone|ge|genoa|genova|go|gorizia|gov|gr|grosseto|iglesias-carbonia|iglesiascarbonia|im|imperia|is|isernia|kr|la-spezia|laquila|laspezia|latina|lc|le|lecce|lecco|li|livorno|lo|lodi|lt|lu|lucca|macerata|mantova|massa-carrara|massacarrara|matera|mb|mc|me|medio-campidano|mediocampidano|messina|mi|milan|milano|mn|mo|modena|monza|monza-brianza|monza-e-della-brianza|monzabrianza|monzaebrianza|monzaedellabrianza|ms|mt|na|naples|napoli|no|novara|nu|nuoro|og|ogliastra|olbia-tempio|olbiatempio|or|oristano|ot|pa|padova|padua|palermo|parma|pavia|pc|pd|pe|perugia|pesaro-urbino|pesarourbino|pescara|pg|pi|piacenza|pisa|pistoia|pn|po|pordenone|potenza|pr|prato|pt|pu|pv|pz|ra|ragusa|ravenna|rc|re|reggio-calabria|reggio-emilia|reggiocalabria|reggioemilia|rg|ri|rieti|rimini|rm|rn|ro|roma|rome|rovigo|sa|salerno|sassari|savona|si|siena|siracusa|so|sondrio|sp|sr|ss|suedtirol|sv|ta|taranto|te|tempio-olbia|tempioolbia|teramo|terni|tn|to|torino|tp|tr|trani-andria-barletta|trani-barletta-andria|traniandriabarletta|tranibarlettaandria|trapani|trentino|trento|treviso|trieste|ts|turin|tv|ud|udine|urbino-pesaro|urbinopesaro|va|varese|vb|vc|ve|venezia|venice|verbania|vercelli|verona|vi|vibo-valentia|vibovalentia|vicenza|viterbo|vr|vs|vt|vv)\\.)?it)" +
    "|(?:(?:(?:co|gov|net|org|sch)\\.)?je)" +
    "|(?:(?:(?:com|edu|gov|mil|name|net|org|sch)\\.)?jo)" +
    "|(?:(?:(?:ac|ad|aichi|akita|aomori|chiba|co|ed|ehime|fukui|fukuoka|fukushima|geo|gifu|go|gr|gunma|hiroshima|hokkaido|hyogo|ibaraki|ishikawa|iwate|kagawa|kagoshima|kanagawa|kawasaki|kitakyushu|kobe|kochi|kumamoto|kyoto|lg|mie|miyagi|miyazaki|nagano|nagasaki|nagoya|nara|ne|niigata|oita|okayama|okinawa|or|osaka|saga|saitama|sapporo|sendai|shiga|shimane|shizuoka|tochigi|tokushima|tokyo|tottori|toyama|wakayama|yamagata|yamaguchi|yamanashi|yokohama)\\.)?jp)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?kg)" +
    "|(?:(?:(?:biz|com|edu|gov|info|net|org)\\.)?ki)" +
    "|(?:(?:(?:ass|asso|com|coop|edu|gouv|gov|medecin|mil|nom|notaires|org|pharmaciens|prd|presse|tm|veterinaire)\\.)?km)" +
    "|(?:(?:(?:edu|gov|net|org)\\.)?kn)" +
    "|(?:(?:(?:com|edu|gov|org|rep|tra)\\.)?kp)" +
    "|(?:(?:(?:ac|busan|chungbuk|chungnam|co|daegu|daejeon|es|gangwon|go|gwangju|gyeongbuk|gyeonggi|gyeongnam|hs|incheon|jeju|jeonbuk|jeonnam|kg|mil|ms|ne|or|pe|re|sc|seoul|ulsan)\\.)?kr)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?ky)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?kz)" +
    "|(?:(?:(?:c|com|edu|gov|info|int|net|org|per)\\.)?la)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?lb)" +
    "|(?:(?:(?:co|com|edu|gov|net|org)\\.)?lc)" +
    "|(?:(?:(?:assn|com|edu|gov|grp|hotel|int|ltd|net|ngo|org|sch|soc|web)\\.)?lk)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?lr)" +
    "|(?:(?:(?:co|org)\\.)?ls)" +
    "|(?:(?:(?:gov)\\.)?lt)" +
    "|(?:(?:(?:asn|com|conf|edu|gov|id|mil|net|org)\\.)?lv)" +
    "|(?:(?:(?:com|edu|gov|id|med|net|org|plc|sch)\\.)?ly)" +
    "|(?:(?:(?:ac|co|gov|net|org|press)\\.)?ma)" +
    "|(?:(?:(?:asso|tm)\\.)?mc)" +
    "|(?:(?:(?:ac|co|edu|gov|its|net|org|priv)\\.)?me)" +
    "|(?:(?:(?:com|edu|gov|mil|nom|org|prd|tm)\\.)?mg)" +
    "|(?:(?:(?:com|edu|gov|inf|name|net|org)\\.)?mk)" +
    "|(?:(?:(?:com|edu|gouv|gov|net|org|presse)\\.)?ml)" +
    "|(?:(?:(?:edu|gov|org)\\.)?mn)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?mo)" +
    "|(?:(?:(?:gov)\\.)?mr)" +
    "|(?:(?:(?:academy|agriculture|air|airguard|alabama|alaska|amber|ambulance|american|americana|americanantiques|americanart|amsterdam|and|annefrank|anthro|anthropology|antiques|aquarium|arboretum|archaeological|archaeology|architecture|art|artanddesign|artcenter|artdeco|arteducation|artgallery|arts|artsandcrafts|asmatart|assassination|assisi|association|astronomy|atlanta|austin|australia|automotive|aviation|axis|badajoz|baghdad|bahn|bale|baltimore|barcelona|baseball|basel|baths|bauern|beauxarts|beeldengeluid|bellevue|bergbau|berkeley|berlin|bern|bible|bilbao|bill|birdart|birthplace|bonn|boston|botanical|botanicalgarden|botanicgarden|botany|brandywinevalley|brasil|bristol|british|britishcolumbia|broadcast|brunel|brussel|brussels|bruxelles|building|burghof|bus|bushey|cadaques|california|cambridge|can|canada|capebreton|carrier|cartoonart|casadelamoneda|castle|castres|celtic|center|chattanooga|cheltenham|chesapeakebay|chicago|children|childrens|childrensgarden|chiropractic|chocolate|christiansburg|cincinnati|cinema|circus|civilisation|civilization|civilwar|clinton|clock|coal|coastaldefence|cody|coldwar|collection|colonialwilliamsburg|coloradoplateau|columbia|columbus|communication|communications|community|computer|computerhistory|comunicaes-v6a2o|contemporary|contemporaryart|convent|copenhagen|corporation|correios-e-telecomunicaes-ghc29a|corvette|costume|countryestate|county|crafts|cranbrook|creation|cultural|culturalcenter|culture|cyber|cymru|dali|dallas|database|ddr|decorativearts|delaware|delmenhorst|denmark|depot|design|detroit|dinosaur|discovery|dolls|donostia|durham|eastafrica|eastcoast|education|educational|egyptian|eisenbahn|elburg|elvendrell|embroidery|encyclopedic|england|entomology|environment|environmentalconservation|epilepsy|essex|estate|ethnology|exeter|exhibition|family|farm|farmequipment|farmers|farmstead|field|figueres|filatelia|film|fineart|finearts|finland|flanders|florida|force|fortmissoula|fortworth|foundation|francaise|frankfurt|franziskaner|freemasonry|freiburg|fribourg|frog|fundacio|furniture|gallery|garden|gateway|geelvinck|gemological|geology|georgia|giessen|glas|glass|gorge|grandrapids|graz|guernsey|halloffame|hamburg|handson|harvestcelebration|hawaii|health|heimatunduhren|hellas|helsinki|hembygdsforbund|heritage|histoire|historical|historicalsociety|historichouses|historisch|historisches|history|historyofscience|horology|house|humanities|illustration|imageandsound|indian|indiana|indianapolis|indianmarket|intelligence|interactive|iraq|iron|isleofman|jamison|jefferson|jerusalem|jewelry|jewish|jewishart|jfk|journalism|judaica|judygarland|juedisches|juif|karate|karikatur|kids|koebenhavn|koeln|kunst|kunstsammlung|kunstunddesign|labor|labour|lajolla|lancashire|landes|lans|larsson|lewismiller|lincoln|linz|living|livinghistory|localhistory|london|losangeles|louvre|loyalist|lucerne|luxembourg|luzern|lns-qla|mad|madrid|mallorca|manchester|mansion|mansions|manx|marburg|maritime|maritimo|maryland|marylhurst|media|medical|medizinhistorisches|meeres|memorial|mesaverde|michigan|midatlantic|military|mill|miners|mining|minnesota|missile|missoula|modern|moma|money|monmouth|monticello|montreal|moscow|motorcycle|muenchen|muenster|mulhouse|muncie|museet|museumcenter|museumvereniging|music|national|nationalfirearms|nationalheritage|nativeamerican|naturalhistory|naturalhistorymuseum|naturalsciences|nature|naturhistorisches|natuurwetenschappen|naumburg|naval|nebraska|neues|newhampshire|newjersey|newmexico|newport|newspaper|newyork|niepce|norfolk|north|nrw|nuernberg|nuremberg|nyc|nyny|oceanographic|oceanographique|omaha|online|ontario|openair|oregon|oregontrail|otago|oxford|pacific|paderborn|palace|paleo|palmsprings|panama|paris|pasadena|pharmacy|philadelphia|philadelphiaarea|philately|phoenix|photography|pilots|pittsburgh|planetarium|plantation|plants|plaza|portal|portland|portlligat|posts-and-telecommunications|preservation|presidio|press|project|public|pubol|quebec|railroad|railway|research|resistance|riodejaneiro|rochester|rockart|roma|russia|saintlouis|salem|salvadordali|salzburg|sandiego|sanfrancisco|santabarbara|santacruz|santafe|saskatchewan|satx|savannahga|schlesisches|schoenbrunn|schokoladen|school|schweiz|science|science-fiction|scienceandhistory|scienceandindustry|sciencecenter|sciencecenters|sciencehistory|sciences|sciencesnaturelles|scotland|seaport|settlement|settlers|shell|sherbrooke|sibenik|silk|ski|skole|society|sologne|soundandvision|southcarolina|southwest|space|spy|square|stadt|stalbans|starnberg|state|stateofdelaware|station|steam|steiermark|stjohn|stockholm|stpetersburg|stuttgart|suisse|surgeonshall|surrey|svizzera|sweden|sydney|tank|tcm|technology|telekommunikation|television|texas|textile|theater|time|timekeeping|topology|torino|touch|town|transport|tree|trolley|trust|trustee|uhren|ulm|undersea|university|usa|usantiques|usarts|uscountryestate|usculture|usdecorativearts|usgarden|ushistory|ushuaia|uslivinghistory|utah|uvic|valley|vantaa|versailles|viking|village|virginia|virtual|virtuel|vlaanderen|volkenkunde|wales|wallonie|war|washingtondc|watch-and-clock|watchandclock|western|westfalen|whaling|wildlife|williamsburg|windmill|workshop|york|yorkshire|yosemite|youth|zoological|zoology|h1aegh|9dbhblg6di)\\.)?museum)" +
    "|(?:(?:(?:ac|co|com|gov|net|or|org)\\.)?mu)" +
    "|(?:(?:(?:aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro)\\.)?mv)" +
    "|(?:(?:(?:ac|biz|co|com|coop|edu|gov|int|museum|net|org)\\.)?mw)" +
    "|(?:(?:(?:com|edu|gob|net|org)\\.)?mx)" +
    "|(?:(?:(?:com|edu|gov|mil|name|net|org)\\.)?my)" +
    "|(?:(?:(?:forgot\\.her|forgot\\.his)\\.)?name)" +
    "|(?:(?:(?:ca|cc|co|com|dr|in|info|mobi|mx|name|or|org|pro|school|tv|us|ws)\\.)?na)" +
    "|(?:(?:(?:asso)\\.)?nc)" +
    "|(?:(?:(?:at-band-camp|blogdns|broke-it|buyshouses|dnsalias|dnsdojo|does-it|dontexist|dynalias|dynathome|endofinternet|from-az|from-co|from-la|from-ny|gb|gets-it|ham-radio-op|homeftp|homeip|homelinux|homeunix|in-the-band|is-a-chef|is-a-geek|isa-geek|jp|kicks-ass|office-on-the|podzone|scrapper-site|se|selfip|sells-it|servebbs|serveftp|thruhere|uk|webhop|za)\\.)?net)" +
    "|(?:(?:(?:arts|com|firm|info|net|other|per|rec|store|web)\\.)?nf)" +
    "|(?:(?:(?:ac|com|edu|gov|net|org)\\.)?ng)" +
    "|(?:(?:(?:bv|co)\\.)?nl)" +
    "|(?:(?:(?:aa|aarborte|aejrie|afjord|agdenes|ah|aknoluokta|akrehamn|al|alaheadju|alesund|algard|alstahaug|alta|alvdal|amli|amot|andasuolo|andebu|andoy|andy-ira|ardal|aremark|arendal|arna|aseral|asker|askim|askoy|askvoll|asky-ira|asnes|audnedaln|aukra|aure|aurland|aurskog-holand|aurskog-hland-jnb|austevoll|austrheim|averoy|avery-yua|badaddja|bahcavuotna|bahccavuotna|baidar|bajddar|balat|balestrand|ballangen|balsfjord|bamble|bardu|barum|batsfjord|bearalvahki|bearalvhki-y4a|beardu|beiarn|berg|bergen|berlevag|berlevg-jxa|bievat|bievt-0qa|bindal|birkenes|bjarkoy|bjarky-fya|bjerkreim|bjugn|bo\\.nordland|bo\\.telemark|bodo|bod-2na|bokn|bomlo|bremanger|bronnoy|bronnoysund|brumunddal|bryne|brnny-wuac|brnnysund-m8ac|bu|budejju|bygland|bykle|bhcavuotna-s4a|bhccavuotna-k7a|bidr-5nac|bjddar-pta|blt-elab|bdddj-mrabd|btsfjord-9za|brum-voa|b\\.nordland-0cb|b\\.telemark-0cb|bmlo-gra|cahcesuolo|co|davvenjarga|davvenjrga-y4a|davvesiida|deatnu|dep|dielddanuorri|divtasvuodna|divttasvuotna|donna|dovre|drammen|drangedal|drobak|drbak-wua|dyroy|dyry-ira|dnna-gra|egersund|eid|eidfjord|eidsberg|eidskog|eidsvoll|eigersund|elverum|enebakk|engerdal|etne|etnedal|evenassi|evenes|eveni-0qa01ga|evje-og-hornnes|farsund|fauske|fedje|fet|fetsund|fhs|finnoy|finny-yua|fitjar|fjaler|fjell|fla|flakstad|flatanger|flekkefjord|flesberg|flora|floro|flor-jra|fl-zia|fm|folkebibl|folldal|forde|forsand|fosnes|frana|fredrikstad|frei|frogn|froland|frosta|froya|frna-woa|frya-hra|fuoisku|fuossko|fusa|fylkesbibl|fyresdal|frde-gra|gaivuotna|galsa|gamvik|gangaviika|gaular|gausdal|giehtavuoatna|gildeskal|gildeskl-g0a|giske|gjemnes|gjerdrum|gjerstad|gjesdal|gjovik|gjvik-wua|gloppen|gol|gran|grane|granvin|gratangen|grimstad|grong|grue|gs\\.aa|gs\\.ah|gs\\.bu|gs\\.fm|gs\\.hl|gs\\.hm|gs\\.jan-mayen|gs\\.mr|gs\\.nl|gs\\.nt|gs\\.of|gs\\.ol|gs\\.oslo|gs\\.rl|gs\\.sf|gs\\.st|gs\\.svalbard|gs\\.tm|gs\\.tr|gs\\.va|gs\\.vf|gulen|guovdageaidnu|givuotna-8ya|gls-elac|ggaviika-8ya47h|ha|habmer|hadsel|hagebostad|halden|halsa|hamar|hamaroy|hammarfeasta|hammerfest|hapmir|haram|hareid|harstad|hasvik|hattfjelldal|haugesund|hemne|hemnes|hemsedal|herad|heroy\\.more-og-romsdal|heroy\\.nordland|hery\\.mre-og-romsdal-x7bd|hery\\.nordland-dnb|hitra|hjartdal|hjelmeland|hl|hm|hobol|hobl-ira|hof|hokksund|hol|hole|holmestrand|holtalen|holtlen-hxa|honefoss|hornindal|horten|hoyanger|hoylandet|hurdal|hurum|hvaler|hyllestad|hbmer-xqa|hmmrfeasta-s4ac|hpmir-xqa|h-2fa|hgebostad-g3a|hnefoss-q1a|hyanger-q1a|hylandet-54a|ibestad|idrett|inderoy|indery-fya|iveland|ivgu|jan-mayen|jessheim|jevnaker|jolster|jondal|jorpeland|jlster-bya|jrpeland-54a|kafjord|karasjohka|karasjok|karlsoy|karmoy|karmy-yua|kautokeino|kirkenes|klabu|klepp|klbu-woa|kommune|kongsberg|kongsvinger|kopervik|kraanghke|kragero|krager-gya|kristiansand|kristiansund|krodsherad|krokstadelva|kranghke-b0a|krdsherad-m8a|kvafjord|kvalsund|kvam|kvanangen|kvinesdal|kvinnherad|kviteseid|kvitsoy|kvitsy-fya|kvfjord-nxa|kvnangen-k0a|krjohka-hwab49j|kfjord-iua|laakesvuemie|lahppi|langevag|langevg-jxa|lardal|larvik|lavagis|lavangen|leangaviika|leagaviika-52b|lebesby|leikanger|leirfjord|leirvik|leka|leksvik|lenvik|lerdal|lesja|levanger|lier|lierne|lillehammer|lillesand|lindas|lindesnes|linds-pra|loabat|loabt-0qa|lodingen|lom|loppa|lorenskog|loten|lund|lunner|luroy|lury-ira|luster|lyngdal|lyngen|lhppi-xqa|lrdal-sra|ldingen-q1a|lrenskog-54a|lten-gra|malatvuopmi|malselv|malvik|mandal|marker|marnardal|masfjorden|masoy|matta-varjjat|meland|meldal|melhus|meloy|mely-ira|meraker|merker-kua|midsund|midtre-gauldal|mil|mjondalen|mjndalen-64a|mo-i-rana|moareke|modalen|modum|molde|mosjoen|mosjen-eya|moskenes|moss|mosvik|moreke-jua|mr|muosat|muost-0qa|museum|mlatvuopmi-s4a|mtta-vrjjat-k7af|mlselv-iua|msy-ula0h|naamesjevuemie|namdalseid|namsos|namsskogan|nannestad|naroy|narviika|narvik|naustdal|navuotna|nedre-eiker|nes\\.akershus|nes\\.buskerud|nesna|nesodden|nesoddtangen|nesseby|nesset|nissedal|nittedal|nl|nord-aurdal|nord-fron|nord-odal|norddal|nordkapp|nordre-land|nordreisa|nore-og-uvdal|notodden|notteroy|nt|nvuotna-hwa|nmesjevuemie-tcba|nry-yla5g|nttery-byae|odda|of|oksnes|ol|omasvuotna|oppdal|oppegard|oppegrd-ixa|orkanger|orkdal|orland|orskog|orsta|os\\.hedmark|os\\.hordaland|osen|oslo|osoyro|osteroy|ostery-fya|ostre-toten|osyro-wua|overhalla|ovre-eiker|oyer|oygarden|oystre-slidre|porsanger|porsangu|porsgrunn|porsgu-sta26f|priv|rade|radoy|rady-ira|rahkkeravju|raholt|raisa|rakkestad|ralingen|rana|randaberg|rauma|rendalen|rennebu|rennesoy|rennesy-v1a|rindal|ringebu|ringerike|ringsaker|risor|rissa|risr-ira|rl|roan|rodoy|rollag|romsa|romskog|roros|rost|royken|royrvik|ruovat|rygge|rhkkervju-01af|risa-5na|rde-ula|rholt-mra|rlingen-mxa|rdy-0nab|rmskog-bya|rros-gra|rst-0na|ryken-vua|ryrvik-bya|salangen|salat|saltdal|samnanger|sande\\.more-og-romsdal|sande\\.mre-og-romsdal-hcc|sande\\.vestfold|sandefjord|sandnes|sandnessjoen|sandnessjen-ogb|sandoy|sandy-yua|sarpsborg|sauda|sauherad|sel|selbu|selje|seljord|sf|siellak|sigdal|siljan|sirdal|skanit|skanland|skaun|skedsmo|skedsmokorset|ski|skien|skierva|skierv-uta|skiptvet|skjak|skjervoy|skjervy-v1a|skjk-soa|skodje|sknit-yqa|sknland-fxa|slattum|smola|smla-hra|snaase|snasa|snillfjord|snoasa|snase-nra|snsa-roa|sogndal|sogne|sokndal|sola|solund|somna|sondre-land|songdalen|sor-aurdal|sor-fron|sor-odal|sor-varanger|sorfold|sorreisa|sortland|sorum|spjelkavik|spydeberg|st|stange|stat|stathelle|stavanger|stavern|steigen|steinkjer|stjordal|stjordalshalsen|stjrdal-s1a|stjrdalshalsen-sqb|stokke|stor-elvdal|stord|stordal|storfjord|strand|stranda|stryn|sula|suldal|sund|sunndal|surnadal|svalbard|sveio|svelvik|sykkylven|slat-5na|slt-elab|sgne-gra|smna-gra|sndre-land-0cb|sr-aurdal-l8a|sr-fron-q1a|sr-odal-q1a|sr-varanger-ggb|srfold-bya|srreisa-q1a|srum-gra|tana|tananger|time|tingvoll|tinn|tjeldsund|tjome|tjme-hra|tm|tokke|tolga|tonsberg|torsken|tr|trana|tranby|tranoy|trany-yua|troandin|trogstad|tromsa|tromso|troms-zua|trondheim|trysil|trna-woa|trgstad-r1a|tvedestrand|tydal|tynset|tysfjord|tysnes|tysvar|tysvr-vra|tnsberg-q1a|ullensaker|ullensvang|ulvik|unjarga|unjrga-rta|utsira|va|vaapste|vadso|vads-jra|vaga|vagan|vagsoy|vaksdal|valer\\.hedmark|valer\\.ostfold|valle|vang|vanylven|vardo|vard-jra|varggat|varoy|vefsn|vega|vegarshei|vegrshei-c0a|vennesla|verdal|verran|vestby|vestnes|vestre-slidre|vestre-toten|vestvagoy|vestvgy-ixa6o|vevelstad|vf|vgs|vik|vikna|vindafjord|voagat|volda|voss|vossevangen|vrggt-xqad|vgan-qoa|vgsy-qoa0j|vg-yiab|vler\\.hedmark-tcb|vler\\.stfold-x8a5w|vry-yla5g|koluokta-7ya57h|laheadju-7ya|lt-liac|fjord-lra|krehamn-dxa|l-1fa|lesund-hua|lgrd-poac|mli-tla|mot-tla|rdal-poa|s-1fa|seral-lra|snes-poa|ksnes-uua|rland-uua|rskog-uua|rsta-fra|stre-toten-zcb|vre-eiker-k8a|yer-zna|ygarden-p1a|ystre-slidre-ujb|hcesuolo-7ya35b)\\.)?no)" +
    "|(?:(?:(?:biz|com|edu|gov|info|net|org)\\.)?nr)" +
    "|(?:(?:(?:merseine|mine|shacknet)\\.)?nu)" +
    "|(?:(?:(?:ac|biz|com|co|edu|gov|med|mil|museum|net|org|pro|sch)\\.)?om)" +
    "|(?:(?:(?:ae|blogdns|blogsite|boldlygoingnowhere|dnsalias|dnsdojo|doesntexist|dontexist|doomdns|dvrdns|dynalias|dyndns|endofinternet|endoftheinternet|from-me|game-host|go\\.dyndns|gotdns|hobby-site|home\\.dyndns|homedns|homeftp|homelinux|homeunix|is-a-bruinsfan|is-a-candidate|is-a-celticsfan|is-a-chef|is-a-geek|is-a-knight|is-a-linux-user|is-a-patsfan|is-a-soxfan|is-found|is-lost|is-saved|is-very-bad|is-very-evil|is-very-good|is-very-nice|is-very-sweet|isa-geek|kicks-ass|misconfused|podzone|readmyblog|selfip|sellsyourhome|servebbs|serveftp|servegame|stuff-4-sale|webhop|za)\\.)?org)" +
    "|(?:(?:(?:abo|ac|com|edu|gob|ing|med|net|nom|org|sld)\\.)?pa)" +
    "|(?:(?:(?:com|edu|gob|mil|net|nom|org)\\.)?pe)" +
    "|(?:(?:(?:com|edu|org)\\.)?pf)" +
    "|(?:(?:(?:com|edu|gov|i|mil|net|ngo|org)\\.)?ph)" +
    "|(?:(?:(?:biz|com|edu|fam|gob|gok|gon|gop|gos|gov|info|net|org|web)\\.)?pk)" +
    "|(?:(?:(?:6bone|agro|aid|art|atm|augustow|auto|babia-gora|bedzin|beskidy|bialowieza|bialystok|bielawa|bieszczady|biz|boleslawiec|bydgoszcz|bytom|cieszyn|co|com|czeladz|czest|dlugoleka|edu|elblag|elk|gda|gdansk|gdynia|gliwice|glogow|gmina|gniezno|gorlice|gov|grajewo|gsm|ilawa|info|irc|jaworzno|jelenia-gora|jgora|kalisz|karpacz|kartuzy|kaszuby|katowice|kazimierz-dolny|kepno|ketrzyn|klodzko|kobierzyce|kolobrzeg|konin|konskowola|krakow|kutno|lapy|lebork|legnica|lezajsk|limanowa|lomza|lowicz|lubin|lukow|mail|malbork|malopolska|mazowsze|mazury|mbone|med|media|miasta|mielec|mielno|mil|mragowo|naklo|net|ngo|nieruchomosci|nom|nowaruda|nysa|olawa|olecko|olkusz|olsztyn|opoczno|opole|org|ostroda|ostroleka|ostrowiec|ostrowwlkp|pa\\.gov|pc|pila|pisz|podhale|podlasie|po\\.gov|polkowice|pomorskie|pomorze|powiat|poznan|priv|prochowice|pruszkow|przeworsk|pulawy|radom|rawa-maz|realestate|rel|rybnik|rzeszow|sanok|sejny|sex|shop|siedlce|sklep|skoczow|slask|slupsk|so\\.gov|sopot|sos|sosnowiec|sr\\.gov|stalowa-wola|starachowice|stargard|starostwo\\.gov|suwalki|swidnica|swiebodzin|swinoujscie|szczecin|szczytno|szkola|targi|tarnobrzeg|tgory|tm|tourism|travel|turek|turystyka|tychy|ug\\.gov|um\\.gov|upow\\.gov|usenet|ustka|uw\\.gov|walbrzych|warmia|warszawa|waw|wegrow|wielun|wlocl|wloclawek|wodzislaw|wolomin|wroc|wroclaw|zachpomor|zagan|zakopane|zarow|zgora|zgorzelec)\\.)?pl)" +
    "|(?:(?:(?:co|edu|gov|net|org)\\.)?pn)" +
    "|(?:(?:(?:aca|bar|cpa|eng|jur|law|med)\\.)?pro)" +
    "|(?:(?:(?:ac|biz|com|edu|est|gov|info|isla|name|net|org|pro|prof)\\.)?pr)" +
    "|(?:(?:(?:com|edu|gov|net|org|plo|sec)\\.)?ps)" +
    "|(?:(?:(?:com|edu|gov|int|net|nome|org|publ)\\.)?pt)" +
    "|(?:(?:(?:belau|co|ed|go|ne|or)\\.)?pw)" +
    "|(?:(?:(?:com|edu|gov|mil|name|net|org|sch)\\.)?qa)" +
    "|(?:(?:(?:asso|com|nom)\\.)?re)" +
    "|(?:(?:(?:arts|com|firm|info|nom|nt|org|rec|store|tm|www)\\.)?ro)" +
    "|(?:(?:(?:ac|co|edu|gov|in|org)\\.)?rs)" +
    "|(?:(?:(?:ac|adygeya|altai|amur|amursk|arkhangelsk|astrakhan|baikal|bashkiria|belgorod|bir|bryansk|buryatia|cap|cbg|chel|chelyabinsk|chita|chukotka|chuvashia|cmw|com|dagestan|dudinka|e-burg|edu|fareast|gov|grozny|int|irkutsk|ivanovo|izhevsk|jamal|jar|joshkar-ola|kalmykia|kaluga|kamchatka|karelia|kazan|kchr|kemerovo|khabarovsk|khakassia|khv|kirov|kms|koenig|komi|kostroma|kranoyarsk|krasnoyarsk|kuban|k-uralsk|kurgan|kursk|kustanai|kuzbass|lipetsk|magadan|magnitka|mari|mari-el|marine|mil|mordovia|mosreg|msk|murmansk|mytis|nakhodka|nalchik|net|nkz|nnov|norilsk|nov|novosibirsk|nsk|omsk|orenburg|org|oryol|oskol|palana|penza|perm|pp|pskov|ptz|pyatigorsk|rnd|rubtsovsk|ryazan|sakhalin|samara|saratov|simbirsk|smolensk|snz|spb|stavropol|stv|surgut|syzran|tambov|tatarstan|test|tlt|tom|tomsk|tsaritsyn|tsk|tula|tuva|tver|tyumen|udm|udmurtia|ulan-ude|vdonsk|vladikavkaz|vladimir|vladivostok|volgograd|vologda|voronezh|vrn|vyatka|yakutia|yamal|yaroslavl|yekaterinburg|yuzhno-sakhalinsk|zgrad)\\.)?ru)" +
    "|(?:(?:(?:ac|co|com|edu|gouv|gov|int|mil|net)\\.)?rw)" +
    "|(?:(?:(?:com|edu|gov|med|net|org|pub|sch)\\.)?sa)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?sb)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?sc)" +
    "|(?:(?:(?:com|edu|gov|info|med|net|org|tv)\\.)?sd)" +
    "|(?:(?:(?:[a-ik-pr-uw-z]|ac|bd|brand|fh|fhsk|fhv|komforb|kommunalforbund|komvux|lanbib|naturbruksgymn|org|parti|pp|press|sshn|tm)\\.)?se)" +
    "|(?:(?:(?:com|edu|gov|net|org|per)\\.)?sg)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?sl)" +
    "|(?:(?:(?:art|com|edu|gouv|org|perso|univ)\\.)?sn)" +
    "|(?:(?:(?:com|net|org)\\.)?so)" +
    "|(?:(?:(?:co|com|consulado|edu|embaixada|gov|mil|net|org|principe|saotome|store)\\.)?st)" +
    "|(?:(?:(?:gov)\\.)?sx)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?sy)" +
    "|(?:(?:(?:ac|co|org)\\.)?sz)" +
    "|(?:(?:(?:ac|co|go|in|mi|net|or)\\.)?th)" +
    "|(?:(?:(?:ac|biz|co|com|edu|go|gov|int|mil|name|net|nic|org|test|web)\\.)?tj)" +
    "|(?:(?:(?:gov)\\.)?tl)" +
    "|(?:(?:(?:co|com|edu|gov|mil|net|nom|org)\\.)?tm)" +
    "|(?:(?:(?:agrinet|com|defense|edunet|ens|fin|gov|ind|info|intl|mincom|nat|net|org|perso|rnrt|rns|rnu|tourism|turen)\\.)?tn)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?to)" +
    "|(?:(?:(?:av|bbs|bel|biz|com|dr|edu|gen|gov(?:\\.nc)?|info|k12|mil|name|net|org|pol|tel|tsk|tv|web)\\.)?tr)" +
    "|(?:(?:(?:aero|biz|co|com|coop|edu|gov|info|int|jobs|mobi|museum|name|net|org|pro|travel)\\.)?tt)" +
    "|(?:(?:(?:better-than|dyndns|on-the-web|worse-than)\\.)?tv)" +
    "|(?:(?:(?:club|com|ebiz|edu|game|gov|idv|mil|net|org|czrw28b|uc0atv|zf0ao64a)\\.)?tw)" +
    "|(?:(?:(?:ac|co|go|mil|ne|or|sc)\\.)?tz)" +
    "|(?:(?:(?:cherkassy|chernigov|chernovtsy|ck|cn|co|com|crimea|cv|dn|dnepropetrovsk|donetsk|dp|edu|gov|if|in|ivano-frankivsk|kh|kharkov|kherson|khmelnitskiy|kiev|kirovograd|km|kr|ks|kv|lg|lugansk|lutsk|lviv|mk|net|nikolaev|od|odessa|org|pl|poltava|pp|rovno|rv|sebastopol|sumy|te|ternopil|uzhgorod|vinnica|vn|zaporizhzhe|zhitomir|zp|zt)\\.)?ua)" +
    "|(?:(?:(?:ac|co|com|go|ne|or|org|sc)\\.)?ug)" +
    "|(?:(?:(?:ac|co|ltd|me|mil|net|org|plc|sch)\\.)?uk)" +
    "|(?:(?:(?:ak|al|ar|as|az|ca|cc\\.(?:ak|al|ar|as|az|ca|co|ct|dc|de|fl|ga|gu|hi|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|pr|ri|sc|sd|tn|tx|ut|va|vi|vt|wa|wi|wv|wy)|chtr\\.k12\\.ma|co|ct|dc|de|dni|fed|fl|ga|gu|hi|ia|id|il|in|is-by|isa|k12\\.(?:ak|al|ar|as|az|ca|co|ct|dc|de|fl|ga|gu|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|pr|ri|sc|sd|tn|tx|ut|va|vi|vt|wa|wi|wv|wy)|kids|ks|ky|la|land-4-sale|lib\\.(?:ak|al|ar|as|az|ca|co|ct|dc|de|fl|ga|gu|hi|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|pr|ri|sc|sd|tn|tx|ut|va|vi|vt|wa|wi|wv|wy)|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nsn|nv|ny|oh|ok|or|pa|paroch\\.k12\\.ma|pr|pvt\\.k12\\.ma|ri|sc|sd|stuff-4-sale|tn|tx|ut|va|vi|vt|wa|wi|wv|wy)\\.)?us)" +
    "|(?:(?:(?:co|com|net|org)\\.)?uz)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?vc)" +
    "|(?:(?:(?:co|com|k12|net|org)\\.)?vi)" +
    "|(?:(?:(?:ac|biz|com|edu|gov|health|info|int|name|net|org|pro)\\.)?vn)" +
    "|(?:(?:(?:com|dyndns|edu|gov|mypets|net|org)\\.)?ws)" +
    "|(?:am|aq|asia|ax|bd|bn|bv|cat|cf|cg|ch|coop|cv|cy|cz|dj|dk|edu|er|et|eu|fj|fk|fm|fo|ga|gb|gd|gf|gl|gm|gov|gq|gs|gu|gw|hm|jm|jobs|ke|kh|kw|li|local|lu|md|mh|mil|mm|mobi|mp|mq|ms|mt|mz|ne|ni|np|nz|pg|pm|py|sh|si|sj|sk|sm|sr|su|sv|tc|td|tel|tf|tg|tk|tp|travel|uy|va|ve|vg|vu|wf|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--3e0b707e|xn--45brj9c|xn--54b7fta0cc|xn--80akhbyknj4f|xn--90a3ac|xn--9t4b11yi5a|xn--clchc0ea0b2g2a9gcd|xn--deba0ad|xn--fiqs8s|xn--fiqz9s|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--g6w251d|xn--gecrj9c|xn--h2brj9c|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--j1amh|xn--j6w193g|xn--jxalpdlp|xn--kgbechtv|xn--kprw13d|xn--kpry57d|xn--lgbbat1ad8j|xn--mgb2ddes|xn--mgb9awbf|xn--mgba3a4f16a|xn--mgba3a4f16a.ir|xn--mgba3a4fra|xn--mgba3a4fra.ir|xn--mgbaam7a8h|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4a87g|xn--mgberp4a5d4ar|xn--mgbqly7c0a67fbc|xn--mgbqly7cvafr|xn--mgbtf8fl|xn--nnx388a|xn--node|xn--o3cw4h|xn--ogbpf8fl|xn--p1ai|xn--pgbs0dh|xn--s9brj9c|xn--wgbh1c|xn--wgbl6a|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--yfro4i67o|xn--yfro4i67o Singapore|xn--ygbi2ammx|xn--zckzah|xxx|ye|yt|za|zm|zw)" +
    ")";
var PORT = "(?::(\\d+))?";
var HIER_PART = "((?:(?:\\/\\/)?(?:(?:(?:[\\w-.~!$&'()*+,;=:]|%[a-f\\d]{2})*@)?(?:" + IP + "|((?:[\\w-.~!$&'()*+,;=]|%[a-f\\d]{2})*))" + PORT + "))(?:[\\w-.~!$&'()*+,;=:@/]|%[a-f\\d]{2})*)";
var PATH = "([;/](?:[\\w-.~!$&'()*+,;=:@/]|%[a-f\\d]{2})*)?";
var QUERY_FRAGMENT = "((?:[&?](?:[\\w-.~!$&'()*+,;=:@/?]|%[a-f\\d]{2})*)?(?:#(?:[\\w-.~!$&'()*+,;=:@/?]|%[a-f\\d]{2})*)?)";

try { // with complex tld
    var URI1 = "(" + SCHEME + HIER_PART + QUERY_FRAGMENT + ")";
    var URI2 = "(" + AUTHORITY + "(?:" + IP + "|(?:" + REG_NAME + "\\b" + TLD + "))" + PORT + PATH + QUERY_FRAGMENT + ")";

    var URL_RE = new RegExp("^" + URI1 + "$", "i");
    var URI_SIMPLE_RE = new RegExp("^(?:" + URI1 + "|" + URI2 + "|(" + SIMPLE_DOT + PORT + PATH + QUERY_FRAGMENT + "))$", "i");
    var NO_SCHEME_RE = new RegExp("^" + URI2 + "$", "i");
    var DOMAIN_RE = new RegExp("^(" + IP + "|(?:" + ULD + "\\b" + TLD + ")|" + SIMPLE_DOT + ")" + PORT + "$", "i");
    var FIND_SLD_RE = new RegExp("\\b(?:" + IP + "|(?:" + SLD + "\\b" + TLD + ")|" + SIMPLE + ")" + PORT + "$", "i");
    var FIND_TLD_RE = new RegExp("\\b" + TLD + "$", "i");
} catch (e) { // with simple tld
    TLD = "(" +
        "(?:(?:(?:com|edu|gob|gov|int|mil|net|org|tur)\\.)?ar)" +
        "|(?:(?:(?:adm|adv|agr|am|arq|art|ato|b|bio|blog|bmd|can|cim|cng|cnt|com|coop|ecn|edu|emp|eng|esp|etc|eti|far|flog|fm|fnd|fot|fst|g12|ggf|gov|imb|ind|inf|jor|jus|leg|lel|mat|med|mil|mus|net|nom|not|ntr|odo|org|ppg|pro|psc|psi|qsl|radio|rec|slg|srv|taxi|teo|tmp|trd|tur|tv|vet|vlog|wiki|zlg)\\.)?br)" +
        "|(?:(?:(?:ac|ah|bj|com|cq|edu|fj|gd|gov|gs|gx|gz|ha|hb|he|hi|hk|hl|hn|jl|js|jx|ln|mil|mo|net|nm|nx|org|qh|sc|sd|sh|sn|sx|tj|tw|xj|xz|yn|zj)\\.)?cn)" +
        "|(?:(?:(?:ac|ad|aichi|akita|aomori|chiba|co|ed|ehime|fukui|fukuoka|fukushima|geo|gifu|go|gr|gunma|hiroshima|hokkaido|hyogo|ibaraki|ishikawa|iwate|kagawa|kagoshima|kanagawa|kawasaki|kitakyushu|kobe|kochi|kumamoto|kyoto|lg|mie|miyagi|miyazaki|nagano|nagasaki|nagoya|nara|ne|niigata|oita|okayama|okinawa|or|osaka|saga|saitama|sapporo|sendai|shiga|shimane|shizuoka|tochigi|tokushima|tokyo|tottori|toyama|wakayama|yamagata|yamaguchi|yamanashi|yokohama)\\.)?jp)" +
        "|(?:(?:(?:6bone|agro|aid|art|atm|augustow|auto|babia-gora|bedzin|beskidy|bialowieza|bialystok|bielawa|bieszczady|biz|boleslawiec|bydgoszcz|bytom|cieszyn|co|com|czeladz|czest|dlugoleka|edu|elblag|elk|gda|gdansk|gdynia|gliwice|glogow|gmina|gniezno|gorlice|gov|grajewo|gsm|ilawa|info|irc|jaworzno|jelenia-gora|jgora|kalisz|karpacz|kartuzy|kaszuby|katowice|kazimierz-dolny|kepno|ketrzyn|klodzko|kobierzyce|kolobrzeg|konin|konskowola|krakow|kutno|lapy|lebork|legnica|lezajsk|limanowa|lomza|lowicz|lubin|lukow|mail|malbork|malopolska|mazowsze|mazury|mbone|med|media|miasta|mielec|mielno|mil|mragowo|naklo|net|ngo|nieruchomosci|nom|nowaruda|nysa|olawa|olecko|olkusz|olsztyn|opoczno|opole|org|ostroda|ostroleka|ostrowiec|ostrowwlkp|pa\\.gov|pc|pila|pisz|podhale|podlasie|po\\.gov|polkowice|pomorskie|pomorze|powiat|poznan|priv|prochowice|pruszkow|przeworsk|pulawy|radom|rawa-maz|realestate|rel|rybnik|rzeszow|sanok|sejny|sex|shop|siedlce|sklep|skoczow|slask|slupsk|so\\.gov|sopot|sos|sosnowiec|sr\\.gov|stalowa-wola|starachowice|stargard|starostwo\\.gov|suwalki|swidnica|swiebodzin|swinoujscie|szczecin|szczytno|szkola|targi|tarnobrzeg|tgory|tm|tourism|travel|turek|turystyka|tychy|ug\\.gov|um\\.gov|upow\\.gov|usenet|ustka|uw\\.gov|walbrzych|warmia|warszawa|waw|wegrow|wielun|wlocl|wloclawek|wodzislaw|wolomin|wroc|wroclaw|zachpomor|zagan|zakopane|zarow|zgora|zgorzelec)\\.)?pl)" +
        "|(?:(?:(?:ac|adygeya|altai|amur|amursk|arkhangelsk|astrakhan|baikal|bashkiria|belgorod|bir|bryansk|buryatia|cap|cbg|chel|chelyabinsk|chita|chukotka|chuvashia|cmw|com|dagestan|dudinka|e-burg|edu|fareast|gov|grozny|int|irkutsk|ivanovo|izhevsk|jamal|jar|joshkar-ola|kalmykia|kaluga|kamchatka|karelia|kazan|kchr|kemerovo|khabarovsk|khakassia|khv|kirov|kms|koenig|komi|kostroma|kranoyarsk|krasnoyarsk|kuban|k-uralsk|kurgan|kursk|kustanai|kuzbass|lipetsk|magadan|magnitka|mari|mari-el|marine|mil|mordovia|mosreg|msk|murmansk|mytis|nakhodka|nalchik|net|nkz|nnov|norilsk|nov|novosibirsk|nsk|omsk|orenburg|org|oryol|oskol|palana|penza|perm|pp|pskov|ptz|pyatigorsk|rnd|rubtsovsk|ryazan|sakhalin|samara|saratov|simbirsk|smolensk|snz|spb|stavropol|stv|surgut|syzran|tambov|tatarstan|test|tlt|tom|tomsk|tsaritsyn|tsk|tula|tuva|tver|tyumen|udm|udmurtia|ulan-ude|vdonsk|vladikavkaz|vladimir|vladivostok|volgograd|vologda|voronezh|vrn|vyatka|yakutia|yamal|yaroslavl|yekaterinburg|yuzhno-sakhalinsk|zgrad)\\.)?ru)" +
        "|(?:(?:(?:ac|co|ltd|me|mil|net|org|plc|sch)\\.)?uk)" +
        "|(?:ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|arpa|as|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|biz|bj|bm|bn|bo|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|co|com|coop|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|info|int|io|iq|ir|is|it|je|jm|jo|jobs|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|local|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mo|mobi|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|name|nc|ne|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pm|pn|pr|pro|ps|pt|pw|py|qa|re|ro|rs|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|travel|tt|tv|tw|tz|ua|ug|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--3e0b707e|xn--45brj9c|xn--54b7fta0cc|xn--80akhbyknj4f|xn--90a3ac|xn--9t4b11yi5a|xn--clchc0ea0b2g2a9gcd|xn--deba0ad|xn--fiqs8s|xn--fiqz9s|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--g6w251d|xn--gecrj9c|xn--h2brj9c|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--j1amh|xn--j6w193g|xn--jxalpdlp|xn--kgbechtv|xn--kprw13d|xn--kpry57d|xn--lgbbat1ad8j|xn--mgb2ddes|xn--mgb9awbf|xn--mgba3a4f16a|xn--mgba3a4f16a.ir|xn--mgba3a4fra|xn--mgba3a4fra.ir|xn--mgbaam7a8h|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4a87g|xn--mgberp4a5d4ar|xn--mgbqly7c0a67fbc|xn--mgbqly7cvafr|xn--mgbtf8fl|xn--nnx388a|xn--node|xn--o3cw4h|xn--ogbpf8fl|xn--p1ai|xn--pgbs0dh|xn--s9brj9c|xn--wgbh1c|xn--wgbl6a|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--yfro4i67o|xn--yfro4i67o Singapore|xn--ygbi2ammx|xn--zckzah|xxx|ye|yt|za|zm|zw)" +
        ")";
    var URI1 = "(" + SCHEME + HIER_PART + QUERY_FRAGMENT + ")";
    var URI2 = "(" + AUTHORITY + "(?:" + IP + "|(?:" + REG_NAME + "\\b" + TLD + "))" + PORT + PATH + QUERY_FRAGMENT + ")";

    var URL_RE = new RegExp("^" + URI1 + "$", "i");
//    var URI_SIMPLE_RE = new RegExp("^(?:" + URI1 + "|" + URI2 + "|(?:" + SIMPLE_DOT + PORT + PATH + QUERY_FRAGMENT + "))$", "i");
    var URI_SIMPLE_RE = new RegExp("^(?:" + URI1 + "|" + URI2 + "|(" + SIMPLE_DOT + PORT + PATH + QUERY_FRAGMENT + "))$", "i");
    var NO_SCHEME_RE = new RegExp("^" + URI2 + "$", "i");
    var DOMAIN_RE = new RegExp("^(" + IP + "|(?:" + ULD + "\\b" + TLD + ")|" + SIMPLE_DOT + ")" + PORT + "$", "i");
    var FIND_SLD_RE = new RegExp("\\b(?:" + IP + "|(?:" + SLD + "\\b" + TLD + ")|" + SIMPLE + ")" + PORT + "$", "i");
    var FIND_TLD_RE = new RegExp("\\b" + TLD + "$", "i");
}
