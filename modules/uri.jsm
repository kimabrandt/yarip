
/*
    Copyright 2007-2013 Kim A. Brandt <kimabrandt@gmx.de>

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
// checked: ar, au, biz, br, cn, com, de, eu, info, it, jp, net, nl, om, org, pl, ru, tr, uk
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
    "|(?:(?:(?:(?:(?:blogspot)\\.)?com|edu|gob|gov|int|mil|net|org|tur)\\.)?ar)" +
    "|(?:(?:gov\\.)?as)" +
    "|(?:(?:(?:ac|biz|(?:(?:blogspot)\\.)?co|gv|info|or|priv)\\.)?at)" +
    "|(?:(?:(?:act|asn|(?:(?:blogspot)\\.)?com|conf|csiro|(?:(?:act|nsw|nt|qld|sa|tas|vic|wa)\\.)?edu|(?:(?:act|qld|sa|tas|vic|wa)\\.)?gov|id|info|net|nsw|nt|org|oz|qld|sa|tas|vic|wa)\\.)?au)" +
    "|(?:(?:(?:com)\\.)?aw)" +
    "|(?:(?:(?:biz|com|edu|gov|info|int|mil|name|net|org|pp|pro)\\.)?az)" +
    "|(?:(?:(?:co|com|edu|gov|mil|net|org|rs|unbi|unsa)\\.)?ba)" +
    "|(?:(?:(?:biz|com|edu|gov|info|net|org|store)\\.)?bb)" +
    "|(?:(?:(?:ac|com|edu|gov|mil|net|org)\\.)?bd)" +
    "|(?:(?:ac\\.)?be)" +
    "|(?:(?:gov\\.)?bf)" +
    "|(?:(?:[0-9a-z]\\.)?bg)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bh)" +
    "|(?:(?:(?:dyndns|for-better|for-more|for-some|for-the|selfip|webhop)\\.)?biz)" +
    "|(?:(?:(?:co|com|edu|or|org)\\.)?bi)" +
    "|(?:(?:(?:asso|barreau|blogspot|gouv)\\.)?bj)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bm)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bn)" +
    "|(?:(?:(?:com|edu|gob|gov|int|mil|net|org|tv)\\.)?bo)" +
    "|(?:(?:(?:adm|adv|agr|am|arq|art|ato|b|bio|blog|bmd|cim|cng|cnt|(?:(?:blogspot)\\.)?com|coop|ecn|eco|edu|emp|eng|esp|etc|eti|far|flog|fm|fnd|fot|fst|g12|ggf|gov|imb|ind|inf|jor|jus|leg|lel|mat|med|mil|mp|mus|net|nom|not|ntr|odo|org|ppg|pro|psc|psi|qsl|radio|rec|slg|srv|taxi|teo|tmp|trd|tur|tv|vet|vlog|wiki|zlg)\\.)?br)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bs)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bt)" +
    "|(?:(?:(?:co|org)\\.)?bw)" +
    "|(?:(?:(?:com|gov|mil|of)\\.)?by)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?bz)" +
    "|(?:(?:(?:ab|bc|blogspot|co|gc|mb|nb|nf|nl|ns|nt|nu|on|pe|qc|sk|yk)\\.)?ca)" +
    "|(?:(?:(?:ftpaccess|game-server|myphotos|scrapping)\\.)?cc)" +
    "|(?:(?:gov\\.)?cd)" +
    "|(?:(?:blogspot\\.)?cf)" +
    "|(?:(?:blogspot\\.)?ch)" +
    "|(?:(?:(?:ac|asso|aroport-bya|co|com|ed|edu|go|gouv|int|md|net|or|org|presse)\\.)?ci)" +
    "|(?:(?:(?:biz|co|edu|gen|gov|info|net|org)\\.)?ck)" +
    "|(?:(?:(?:co|gob|gov|mil)\\.)?cl)" +
    "|(?:(?:gov\\.)?cm)" +
    "|(?:(?:(?:ac|ah|bj|com|cq|edu|fj|gd|gov|gs|gx|gz|ha|hb|he|hi|hk|hl|hn|jl|js|jx|ln|mil|mo|net|nm|nx|org|qh|sc|sd|sh|sn|sx|tj|tw|xj|xz|yn|zj)\\.)?cn)" +
    "|(?:(?:(?:(?:(?:(?:(?:ap-(?:northeast-1|southeast-[1-2])|eu-west-1|sa-east-1|us-west-[1-2]|us-gov-west-1)\\.)?compute|(?:z-[1-2]\\.)?compute-1|elb|s3(?:-(?:(?:website-)?(?:ap-(?:northeast-1|southeast-[1-2])|eu-west-1|sa-east-1|us-east-1|us-west-[1-2])|(?:(?:fips|website)-)?us-gov-west-1|website-us-east-1))?)\\.)?amazonaws|appspot|ar|betainabox|blogdns|blogspot|br|cechire|cloudcontrolapp|cloudcontrolled|cn|codespot|de|dnsalias|dnsdojo|doesntexist|dontexist|doomdns|dreamhosters|dyn-o-saur|dynalias|dyndns-at-home|dyndns-at-work|dyndns-blog|dyndns-free|dyndns-home|dyndns-ip|dyndns-mail|dyndns-office|dyndns-pics|dyndns-remote|dyndns-server|dyndns-web|dyndns-wiki|dyndns-work|elasticbeanstalk|est-a-la-maison|est-a-la-masion|est-le-patron|est-mon-blogueur|eu|from-ak|from-al|from-ar|from-ca|from-ct|from-dc|from-de|from-fl|from-ga|from-hi|from-ia|from-id|from-il|from-in|from-ks|from-ky|from-ma|from-md|from-mi|from-mn|from-mo|from-ms|from-mt|from-nc|from-nd|from-ne|from-nh|from-nj|from-nm|from-nv|from-oh|from-ok|from-or|from-pa|from-pr|from-ri|from-sc|from-sd|from-tn|from-tx|from-ut|from-va|from-vt|from-wa|from-wi|from-wv|from-wy|gb|getmyip|googleapis|googlecode|gotdns|heroku(?:app|ssl)|hobby-site|homelinux|homeunix|hu|iamallama|is-a-anarchist|is-a-blogger|is-a-bookkeeper|is-a-bulls-fan|is-a-caterer|is-a-chef|is-a-conservative|is-a-cpa|is-a-cubicle-slave|is-a-democrat|is-a-designer|is-a-doctor|is-a-financialadvisor|is-a-geek|is-a-green|is-a-guru|is-a-hard-worker|is-a-hunter|is-a-landscaper|is-a-lawyer|is-a-liberal|is-a-libertarian|is-a-llama|is-a-musician|is-a-nascarfan|is-a-nurse|is-a-painter|is-a-personaltrainer|is-a-photographer|is-a-player|is-a-republican|is-a-rockstar|is-a-socialist|is-a-student|is-a-teacher|is-a-techie|is-a-therapist|is-an-accountant|is-an-actor|is-an-actress|is-an-anarchist|is-an-artist|is-an-engineer|is-an-entertainer|is-certified|is-gone|is-into-anime|is-into-cars|is-into-cartoons|is-into-games|is-leet|is-not-certified|is-slick|is-uberleet|is-with-theband|isa-geek|isa-hockeynut|issmarterthanyou|jpn|kr|likes-pie|likescandy|neat-url|no|operaunite|qc|rhcloud|ro|ru|sa|saves-the-whales|se|selfip|sells-for-less|sells-for-u|servebbs|simple-url|space-to-rent|teaches-yoga|uk|us|uy|withgoogle|writesthisblog|za)\\.)?com)" +
    "|(?:(?:(?:arts|com|edu|firm|gov|info|int|mil|net|nom|org|rec|web)\\.)?co)" +
    "|(?:(?:(?:ac|co|ed|fi|go|or|sa)\\.)?cr)" +
    "|(?:(?:(?:com|edu|gov|inf|net|org)\\.)?cu)" +
    "|(?:(?:blogspot\\.)?cv)" +
    "|(?:(?:(?:com|edu|net|org)\\.)?cw)" +
    "|(?:(?:(?:ath|gov)\\.)?cx)" +
    "|(?:(?:(?:ac|biz|com|ekloges|gov|ltd|name|net|org|parliament|press|pro|tm)\\.)?cy)" +
    "|(?:(?:blogspot\\.)?cz)" +
    "|(?:(?:(?:blogspot|com|fuettertdasnetz|isteingeek|istmein|lebtimnetz|leitungsen|traeumtgerade)\\.)?de)" +
    "|(?:(?:blogspot\\.)?dk)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?dm)" +
    "|(?:(?:(?:art|com|edu|gob|gov|mil|net|org|sld|web)\\.)?do)" +
    "|(?:(?:(?:art|asso|com|edu|gov|net|org|pol)\\.)?dz)" +
    "|(?:(?:(?:com|edu|fin|gob|gov|info|k12|med|mil|net|org|pro)\\.)?ec)" +
    "|(?:(?:(?:aip|com|edu|fie|gov|lib|med|org|pri|riik)\\.)?ee)" +
    "|(?:(?:(?:com|edu|eun|gov|mil|name|net|org|sci)\\.)?eg)" +
    "|(?:(?:(?:(?:(?:blogspot)\\.)?com|edu|gob|nom|org)\\.)?es)" +
    "|(?:(?:(?:aland|blogspot|iki)\\.)?fi)" +
    "|(?:(?:(?:aeroport|assedic|asso|avocat|avoues|blogspot|cci|chambagri|chirurgiens-dentistes|com|experts-comptables|geometre-expert|gouv|greta|huissier-justice|medecin|nom|notaires|pharmacien|port|prd|presse|tm|veterinaire)\\.)?fr)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org|pvt)\\.)?ge)" +
    "|(?:(?:(?:co|net|org)\\.)?gg)" +
    "|(?:(?:(?:com|edu|gov|mil|org)\\.)?gh)" +
    "|(?:(?:(?:com|edu|gov|ltd|mod|org)\\.)?gi)" +
    "|(?:(?:(?:ac|com|edu|gov|net|org)\\.)?gn)" +
    "|(?:(?:(?:asso|com|edu|mobi|net|org)\\.)?gp)" +
    "|(?:(?:(?:blogspot|com|edu|gov|net|org)\\.)?gr)" +
    "|(?:(?:(?:com|edu|gob|ind|mil|net|org)\\.)?gt)" +
    "|(?:(?:(?:co|com|net)\\.)?gy)" +
    "|(?:(?:(?:blogspot|com|edu|gov|idv|net|org|ciqpn|gmqw5a|55qx5d|mxtq1m|lcvr32d|wcvs22d|gmq050i|uc0atv|uc0ay4a|od0alg|zf0avx|mk0axi|tn0ag|od0aq3b|io0a7i)\\.)?hk)" +
    "|(?:(?:(?:com|edu|gob|mil|net|org)\\.)?hn)" +
    "|(?:(?:(?:com|from|iz|name)\\.)?hr)" +
    "|(?:(?:(?:adult|art|asso|com|coop|edu|firm|gouv|info|med|net|org|perso|pol|pro|rel|shop)\\.)?ht)" +
    "|(?:(?:(?:2000|agrar|blogspot|bolt|casino|city|co|erotica|erotika|film|forum|games|hotel|info|ingatlan|jogasz|konyvelo|lakas|media|news|org|priv|reklam|sex|shop|sport|suli|szex|tm|tozsde|utazas|video)\\.)?hu)" +
    "|(?:(?:(?:ac|biz|co|desa|go|mil|my|net|or|sch|web)\\.)?id)" +
    "|(?:(?:(?:blogspot|gov)\\.)?ie)" +
    "|(?:(?:(?:ac|(?:(?:blogspot)\\.)?co|gov|idf|k12|muni|net|org)\\.)?il)" +
    "|(?:(?:(?:ac|co|com|ltd\\.co|net|org|plc\\.co|tt|tv)\\.)?im)" +
    "|(?:(?:(?:barrel-of-knowledge|barrell-of-knowledge|dyndns|for-our|groks-the|groks-this|here-for-more|knowsitall|selfip|webhop)\\.)?info)" +
    "|(?:(?:(?:eu)\\.)?int)" +
    "|(?:(?:(?:ac|blogspot|co|edu|firm|gen|gov|ind|mil|net|nic|org|res)\\.)?in)" +
    "|(?:(?:(?:com|github)\\.)?io)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?iq)" +
    "|(?:(?:(?:ac|co|gov|id|net|org|sch|mgba3a4fra|mgba3a4f16a)\\.)?ir)" +
    "|(?:(?:(?:com|cupcake|edu|gov|int|net|org)\\.)?is)" +
    "|(?:(?:(?:abr|abruzzo|ag|agrigento|al|alessandria|altoadige|alto-adige|an|ancona|andriabarlettatrani|andria-barletta-trani|andriatranibarletta|andria-trani-barletta|ao|aosta|aostavalley|aosta-valley|aoste|ap|aq|aquila|ar|arezzo|ascolipiceno|ascoli-piceno|asti|at|av|avellino|ba|balsan|bari|barlettaandriatrani|barletta-andria-trani|barlettatraniandria|barletta-trani-andria|bas|basilicata|belluno|benevento|bergamo|bg|bi|biella|bl|blogspot|bn|bo|bologna|bolzano|bozen|br|brescia|brindisi|bs|bt|bz|ca|cagliari|cal|calabria|caltanissetta|cam|campania|campidanomedio|campidano-medio|campobasso|carboniaiglesias|carbonia-iglesias|carraramassa|carrara-massa|caserta|catania|catanzaro|cb|ce|cesenaforli|cesena-forli|ch|chieti|ci|cl|cn|co|como|cosenza|cr|cremona|crotone|cs|ct|cuneo|cz|dellogliastra|dell-ogliastra|edu|emiliaromagna|emilia-romagna|emr|en|enna|fc|fe|fermo|ferrara|fg|fi|firenze|florence|fm|foggia|forlicesena|forli-cesena|fr|friulivegiulia|friuli-vegiulia|friuli-ve-giulia|friulive-giulia|friuliveneziagiulia|friuli-veneziagiulia|friuli-venezia-giulia|friulivenezia-giulia|friulivgiulia|friuli-vgiulia|friuli-v-giulia|friuliv-giulia|frosinone|fvg|ge|genoa|genova|go|gorizia|gov|gr|grosseto|iglesiascarbonia|iglesias-carbonia|im|imperia|is|isernia|kr|laquila|laspezia|la-spezia|latina|laz|lazio|lc|le|lecce|lecco|li|lig|liguria|livorno|lo|lodi|lom|lombardia|lombardy|lt|lu|lucania|lucca|macerata|mantova|mar|marche|massacarrara|massa-carrara|matera|mb|mc|me|mediocampidano|medio-campidano|messina|mi|milan|milano|mn|mo|modena|mol|molise|monza|monzabrianza|monza-brianza|monzaebrianza|monzaedellabrianza|monza-e-della-brianza|ms|mt|na|naples|napoli|no|novara|nu|nuoro|og|ogliastra|olbiatempio|olbia-tempio|or|oristano|ot|pa|padova|padua|palermo|parma|pavia|pc|pd|pe|perugia|pesarourbino|pesaro-urbino|pescara|pg|pi|piacenza|piedmont|piemonte|pisa|pistoia|pmn|pn|po|pordenone|potenza|pr|prato|pt|pu|pug|puglia|pv|pz|ra|ragusa|ravenna|rc|re|reggiocalabria|reggio-calabria|reggioemilia|reggio-emilia|rg|ri|rieti|rimini|rm|rn|ro|roma|rome|rovigo|sa|salerno|sar|sardegna|sardinia|sassari|savona|si|sic|sicilia|sicily|siena|siracusa|so|sondrio|sp|sr|ss|suedtirol|sv|ta|taa|taranto|te|tempioolbia|tempio-olbia|teramo|terni|tn|to|torino|tos|toscana|tp|tr|traniandriabarletta|trani-andria-barletta|tranibarlettaandria|trani-barletta-andria|trapani|trentino|trentinoaadige|trentino-aadige|trentino-a-adige|trentinoa-adige|trentinoaltoadige|trentino-altoadige|trentino-alto-adige|trentinoalto-adige|trentinostirol|trentino-stirol|trentino-s-tirol|trentinos-tirol|trentinosudtirol|trentino-sudtirol|trentino-sud-tirol|trentinosud-tirol|trentinosuedtirol|trentino-suedtirol|trentino-sued-tirol|trentinosued-tirol|trento|treviso|trieste|ts|turin|tuscany|tv|ud|udine|umb|umbria|urbinopesaro|urbino-pesaro|va|valdaosta|val-daosta|val-d-aosta|vald-aosta|valleaosta|valle-aosta|valledaosta|valle-daosta|valle-d-aosta|valled-aosta|valleeaoste|vallee-aoste|vao|varese|vb|vc|vda|ve|ven|veneto|venezia|venice|verbania|vercelli|verona|vi|vibovalentia|vibo-valentia|vicenza|viterbo|vr|vs|vt|vv)\\.)?it)" +
    "|(?:(?:(?:co|gov|net|org|sch)\\.)?je)" +
    "|(?:(?:(?:com|edu|gov|mil|name|net|org|sch)\\.)?jo)" +
    "|(?:(?:(?:ac|ad|(?:(?:aisai|ama|anjo|asuke|chiryu|chita|fuso|gamagori|handa|hazu|hekinan|higashiura|ichinomiya|inazawa|inuyama|isshiki|iwakura|kanie|kariya|kasugai|kira|kiyosu|komaki|konan|kota|mihama|miyoshi|nishio|nisshin|obu|oguchi|oharu|okazaki|owariasahi|seto|shikatsu|shinshiro|shitara|tahara|takahama|tobishima|toei|togo|tokai|tokoname|toyoake|toyohashi|toyokawa|toyone|toyota|tsushima|yatomi)\\.)?aichi|(?:(?:akita|daisen|fujisato|gojome|hachirogata|happou|higashinaruse|honjo|honjyo|ikawa|kamikoani|kamioka|katagami|kazuno|kitaakita|kosaka|kyowa|misato|mitane|moriyoshi|nikaho|noshiro|odate|oga|ogata|semboku|yokote|yurihonjo)\\.)?akita|(?:(?:aomori|gonohe|hachinohe|hashikami|hiranai|hirosaki|itayanagi|kuroishi|misawa|mutsu|nakadomari|noheji|oirase|owani|rokunohe|sannohe|shichinohe|shingo|takko|towada|tsugaru|tsuruta)\\.)?aomori|blogspot|(?:(?:abiko|asahi|chonan|chosei|choshi|chuo|funabashi|futtsu|hanamigawa|ichihara|ichikawa|ichinomiya|inzai|isumi|kamagaya|kamogawa|kashiwa|katori|katsuura|kimitsu|kisarazu|kozaki|kujukuri|kyonan|matsudo|midori|mihama|minamiboso|mobara|mutsuzawa|nagara|nagareyama|narashino|narita|noda|oamishirasato|omigawa|onjuku|otaki|sakae|sakura|shimofusa|shirako|shiroi|shisui|sodegaura|sosa|tako|tateyama|togane|tohnosho|tomisato|urayasu|yachimata|yachiyo|yokaichiba|yokoshibahikari|yotsukaido)\\.)?chiba|co|ed|(?:(?:ainan|honai|ikata|imabari|iyo|kamijima|kihoku|kumakogen|masaki|matsuno|matsuyama|namikata|niihama|ozu|saijo|seiyo|shikokuchuo|tobe|toon|uchiko|uwajima|yawatahama)\\.)?ehime|(?:(?:echizen|eiheiji|fukui|ikeda|katsuyama|mihama|minamiechizen|obama|ohi|ono|sabae|sakai|takahama|tsuruga|wakasa)\\.)?fukui|(?:(?:ashiya|buzen|chikugo|chikuho|chikujo|chikushino|chikuzen|chuo|dazaifu|fukuchi|hakata|higashi|hirokawa|hisayama|iizuka|inatsuki|kaho|kasuga|kasuya|kawara|keisen|koga|kurate|kurogi|kurume|minami|miyako|miyama|miyawaka|mizumaki|munakata|nakagawa|nakama|nishi|nogata|ogori|okagaki|okawa|oki|omuta|onga|onojo|oto|saigawa|sasaguri|shingu|shinyoshitomi|shonai|soeda|sue|tachiarai|tagawa|takata|toho|toyotsu|tsuiki|ukiha|umi|usui|yamada|yame|yanagawa|yukuhashi)\\.)?fukuoka|(?:(?:aizubange|aizumisato|aizuwakamatsu|asakawa|bandai|date|fukushima|furudono|futaba|hanawa|higashi|hirata|hirono|iitate|inawashiro|ishikawa|iwaki|izumizaki|kagamiishi|kaneyama|kawamata|kitakata|kitashiobara|koori|koriyama|kunimi|miharu|mishima|namie|nango|nishiaizu|nishigo|okuma|omotego|ono|otama|samegawa|shimogo|shirakawa|showa|soma|sukagawa|taishin|tamakawa|tanagura|tenei|yabuki|yamato|yamatsuri|yanaizu|yugawa)\\.)?fukushima|geo|(?:(?:anpachi|ena|gifu|ginan|godo|gujo|hashima|hichiso|hida|higashishirakawa|ibigawa|ikeda|kakamigahara|kani|kasahara|kasamatsu|kawaue|kitagata|mino|minokamo|mitake|mizunami|motosu|nakatsugawa|ogaki|sakahogi|seki|sekigahara|shirakawa|tajimi|takayama|tarui|toki|tomika|wanouchi|yamagata|yaotsu|yoro)\\.)?gifu|go|gr|(?:(?:annaka|chiyoda|fujioka|higashiagatsuma|isesaki|itakura|kanna|kanra|katashina|kawaba|kiryu|kusatsu|maebashi|meiwa|midori|minakami|naganohara|nakanojo|nanmoku|numata|oizumi|ora|ota|shibukawa|shimonita|shinto|showa|takasaki|takayama|tamamura|tatebayashi|tomioka|tsukiyono|tsumagoi|ueno|yoshioka)\\.)?gunma|(?:(?:asaminami|daiwa|etajima|fuchu|fukuyama|hatsukaichi|higashihiroshima|hongo|jinsekikogen|kaita|kui|kumano|kure|mihara|miyoshi|naka|onomichi|osakikamijima|otake|saka|sera|seranishi|shinichi|shobara|takehara)\\.)?hiroshima|(?:(?:abashiri|abira|aibetsu|akabira|akkeshi|asahikawa|ashibetsu|ashoro|assabu|atsuma|bibai|biei|bifuka|bihoro|biratori|chippubetsu|chitose|date|ebetsu|embetsu|eniwa|erimo|esan|esashi|fukagawa|fukushima|furano|furubira|haboro|hakodate|hamatonbetsu|hidaka|higashikagura|higashikawa|hiroo|hokuryu|hokuto|honbetsu|horokanai|horonobe|ikeda|imakane|ishikari|iwamizawa|iwanai|kamifurano|kamikawa|kamishihoro|kamisunagawa|kamoenai|kayabe|kembuchi|kikonai|kimobetsu|kitahiroshima|kitami|kiyosato|koshimizu|kunneppu|kuriyama|kuromatsunai|kushiro|kutchan|kyowa|mashike|matsumae|mikasa|minamifurano|mombetsu|moseushi|mukawa|muroran|naie|nakagawa|nakasatsunai|nakatombetsu|nanae|nanporo|nayoro|nemuro|niikappu|niki|nishiokoppe|noboribetsu|numata|obihiro|obira|oketo|okoppe|otaru|otobe|otofuke|otoineppu|oumu|ozora|pippu|rankoshi|rebun|rikubetsu|rishiri|rishirifuji|saroma|sarufutsu|shakotan|shari|shibecha|shibetsu|shikabe|shikaoi|shimamaki|shimizu|shimokawa|shinshinotsu|shintoku|shiranuka|shiraoi|shiriuchi|sobetsu|sunagawa|taiki|takasu|takikawa|takinoue|teshikaga|tobetsu|tohma|tomakomai|tomari|toya|toyako|toyotomi|toyoura|tsubetsu|tsukigata|urakawa|urausu|uryu|utashinai|wakkanai|wassamu|yakumo|yoichi)\\.)?hokkaido|(?:(?:aioi|akashi|ako|amagasaki|aogaki|asago|ashiya|awaji|fukusaki|goshiki|harima|himeji|ichikawa|inagawa|itami|kakogawa|kamigori|kamikawa|kasai|kasuga|kawanishi|miki|minamiawaji|nishinomiya|nishiwaki|ono|sanda|sannan|sasayama|sayo|shingu|shinonsen|shiso|sumoto|taishi|taka|takarazuka|takasago|takino|tamba|tatsuno|toyooka|yabu|yashiro|yoka|yokawa)\\.)?hyogo|(?:(?:ami|asahi|bando|chikusei|daigo|fujishiro|hitachi|hitachinaka|hitachiomiya|hitachiota|ibaraki|ina|inashiki|itako|iwama|joso|kamisu|kasama|kashima|kasumigaura|koga|miho|mito|moriya|naka|namegata|oarai|ogawa|omitama|ryugasaki|sakai|sakuragawa|shimodate|shimotsuma|shirosato|sowa|suifu|takahagi|tamatsukuri|tokai|tomobe|tone|toride|tsuchiura|tsukuba|uchihara|ushiku|yachiyo|yamagata|yawara|yuki)\\.)?ibaraki|(?:(?:anamizu|hakui|hakusan|kaga|kahoku|kanazawa|kawakita|komatsu|nakanoto|nanao|nomi|nonoichi|noto|shika|suzu|tsubata|tsurugi|uchinada|wajima)\\.)?ishikawa|(?:(?:fudai|fujisawa|hanamaki|hiraizumi|hirono|ichinohe|ichinoseki|iwaizumi|iwate|joboji|kamaishi|kanegasaki|karumai|kawai|kitakami|kuji|kunohe|kuzumaki|miyako|mizusawa|morioka|ninohe|noda|ofunato|oshu|otsuchi|rikuzentakata|shiwa|shizukuishi|sumita|tanohata|tono|yahaba|yamada)\\.)?iwate|(?:(?:ayagawa|higashikagawa|kanonji|kotohira|manno|marugame|mitoyo|naoshima|sanuki|tadotsu|takamatsu|tonosho|uchinomi|utazu|zentsuji)\\.)?kagawa|(?:(?:akune|amami|hioki|isa|isen|izumi|kagoshima|kanoya|kawanabe|kinko|kouyama|makurazaki|matsumoto|minamitane|nakatane|nishinoomote|satsumasendai|soo|tarumizu|yusui)\\.)?kagoshima|(?:(?:aikawa|atsugi|ayase|chigasaki|ebina|fujisawa|hadano|hakone|hiratsuka|isehara|kaisei|kamakura|kiyokawa|matsuda|minamiashigara|miura|nakai|ninomiya|odawara|oi|oiso|sagamihara|samukawa|tsukui|yamakita|yamato|yokosuka|yugawara|zama|zushi)\\.)?kanagawa|kawasaki|kitakyushu|kobe|(?:(?:aki|geisei|hidaka|higashitsuno|ino|kagami|kami|kitagawa|kochi|mihara|motoyama|muroto|nahari|nakamura|nankoku|nishitosa|niyodogawa|ochi|okawa|otoyo|otsuki|sakawa|sukumo|susaki|tosa|tosashimizu|toyo|tsuno|umaji|yasuda|yusuhara)\\.)?kochi|(?:(?:amakusa|arao|aso|choyo|gyokuto|hitoyoshi|kamiamakusa|kashima|kikuchi|kosa|kumamoto|mashiki|mifune|minamata|minamioguni|nagasu|nishihara|oguni|ozu|sumoto|takamori|uki|uto|yamaga|yamato|yatsushiro)\\.)?kumamoto|(?:(?:ayabe|fukuchiyama|higashiyama|ide|ine|joyo|kameoka|kamo|kita|kizu|kumiyama|kyotamba|kyotanabe|kyotango|maizuru|minami|minamiyamashiro|miyazu|muko|nagaokakyo|nakagyo|nantan|oyamazaki|sakyo|seika|tanabe|uji|ujitawara|wazuka|yamashina|yawata)\\.)?kyoto|lg|(?:(?:asahi|inabe|ise|kameyama|kawagoe|kiho|kisosaki|kiwa|komono|kumano|kuwana|matsusaka|meiwa|mihama|minamiise|misugi|miyama|nabari|shima|suzuka|tado|taiki|taki|tamaki|toba|tsu|udono|ureshino|watarai|yokkaichi)\\.)?mie|(?:(?:furukawa|higashimatsushima|ishinomaki|iwanuma|kakuda|kami|kawasaki|kesennuma|marumori|matsushima|minamisanriku|misato|murata|natori|ogawara|ohira|onagawa|osaki|rifu|semine|shibata|shichikashuku|shikama|shiogama|shiroishi|tagajo|taiwa|tome|tomiya|wakuya|watari|yamamoto|zao)\\.)?miyagi|(?:(?:aya|ebino|gokase|hyuga|kadogawa|kawaminami|kijo|kitagawa|kitakata|kitaura|kobayashi|kunitomi|kushima|mimata|miyakonojo|miyazaki|morotsuka|nichinan|nishimera|nobeoka|saito|shiiba|shintomi|takaharu|takanabe|takazaki|tsuno)\\.)?miyazaki|(?:(?:achi|agematsu|anan|aoki|asahi|azumino|chikuhoku|chikuma|chino|fujimi|hakuba|hara|hiraya|iida|iijima|iiyama|iizuna|ikeda|ikusaka|ina|karuizawa|kawakami|kiso|kisofukushima|kitaaiki|komagane|komoro|matsukawa|matsumoto|miasa|minamiaiki|minamimaki|minamiminowa|minowa|miyada|miyota|mochizuki|nagano|nagawa|nagiso|nakagawa|nakano|nozawaonsen|obuse|ogawa|okaya|omachi|omi|ookuwa|ooshika|otaki|otari|sakae|sakaki|saku|sakuho|shimosuwa|shinanomachi|shiojiri|suwa|suzaka|takagi|takamori|takayama|tateshina|tatsuno|togakushi|togura|tomi|ueda|wada|yamagata|yamanouchi|yasaka|yasuoka)\\.)?nagano|(?:(?:chijiwa|futsu|goto|hasami|hirado|iki|isahaya|kawatana|kuchinotsu|matsuura|nagasaki|obama|omura|oseto|saikai|sasebo|seihi|shimabara|shinkamigoto|togitsu|tsushima|unzen)\\.)?nagasaki|nagoya|(?:(?:ando|gose|heguri|higashiyoshino|ikaruga|ikoma|kamikitayama|kanmaki|kashiba|kashihara|katsuragi|kawai|kawakami|kawanishi|koryo|kurotaki|mitsue|miyake|nara|nosegawa|oji|ouda|oyodo|sakurai|sango|shimoichi|shimokitayama|shinjo|soni|takatori|tawaramoto|tenkawa|tenri|uda|yamatokoriyama|yamatotakada|yamazoe|yoshino)\\.)?nara|ne|(?:(?:aga|agano|gosen|itoigawa|izumozaki|joetsu|kamo|kariwa|kashiwazaki|minamiuonuma|mitsuke|muika|murakami|myoko|nagaoka|niigata|ojiya|omi|sado|sanjo|seiro|seirou|sekikawa|shibata|tagami|tainai|tochio|tokamachi|tsubame|tsunan|uonuma|yahiko|yoita|yuzawa)\\.)?niigata|(?:(?:beppu|bungoono|bungotakada|hasama|hiji|himeshima|hita|kamitsue|kokonoe|kuju|kunisaki|kusu|oita|saiki|taketa|tsukumi|usa|usuki|yufu)\\.)?oita|(?:(?:akaiwa|asakuchi|bizen|hayashima|ibara|kagamino|kasaoka|kibichuo|kumenan|kurashiki|maniwa|misaki|nagi|niimi|nishiawakura|okayama|satosho|setouchi|shinjo|shoo|soja|takahashi|tamano|tsuyama|wake|yakage)\\.)?okayama|(?:(?:aguni|ginowan|ginoza|gushikami|haebaru|higashi|hirara|iheya|ishigaki|ishikawa|itoman|izena|kadena|kin|kitadaito|kitanakagusuku|kumejima|kunigami|minamidaito|motobu|nago|naha|nakagusuku|nakijin|nanjo|nishihara|ogimi|okinawa|onna|shimoji|taketomi|tarama|tokashiki|tomigusuku|tonaki|urasoe|uruma|yaese|yomitan|yonabaru|yonaguni|zamami)\\.)?okinawa|or|(?:(?:abeno|chihayaakasaka|chuo|daito|fujiidera|habikino|hannan|higashiosaka|higashisumiyoshi|higashiyodogawa|hirakata|ibaraki|ikeda|izumi|izumiotsu|izumisano|kadoma|kaizuka|kanan|kashiwara|katano|kawachinagano|kishiwada|kita|kumatori|matsubara|minato|minoh|misaki|moriguchi|neyagawa|nishi|nose|osakasayama|sakai|sayama|sennan|settsu|shijonawate|shimamoto|suita|tadaoka|taishi|tajiri|takaishi|takatsuki|tondabayashi|toyonaka|toyono|yao)\\.)?osaka|(?:(?:ariake|arita|fukudomi|genkai|hamatama|hizen|imari|kamimine|kanzaki|karatsu|kashima|kitagata|kitahata|kiyama|kouhoku|kyuragi|nishiarita|ogi|omachi|ouchi|saga|shiroishi|taku|tara|tosu|yoshinogari)\\.)?saga|(?:(?:arakawa|asaka|chichibu|fujimi|fujimino|fukaya|hanno|hanyu|hasuda|hatogaya|hatoyama|hidaka|higashichichibu|higashimatsuyama|honjo|ina|iruma|iwatsuki|kamiizumi|kamikawa|kamisato|kasukabe|kawagoe|kawaguchi|kawajima|kazo|kitamoto|koshigaya|kounosu|kuki|kumagaya|matsubushi|minano|misato|miyashiro|miyoshi|moroyama|nagatoro|namegawa|niiza|ogano|ogawa|ogose|okegawa|omiya|otaki|ranzan|ryokami|saitama|sakado|satte|sayama|shiki|shiraoka|soka|sugito|toda|tokigawa|tokorozawa|tsurugashima|urawa|warabi|yashio|yokoze|yono|yorii|yoshida|yoshikawa|yoshimi)\\.)?saitama|sapporo|sendai|(?:(?:aisho|gamo|higashiomi|hikone|koka|konan|kosei|koto|kusatsu|maibara|moriyama|nagahama|nishiazai|notogawa|omihachiman|otsu|ritto|ryuoh|takashima|takatsuki|torahime|toyosato|yasu)\\.)?shiga|(?:(?:akagi|ama|gotsu|hamada|higashiizumo|hikawa|hikimi|izumo|kakinoki|masuda|matsue|misato|nishinoshima|ohda|okinoshima|okuizumo|shimane|tamayu|tsuwano|unnan|yakumo|yasugi|yatsuka)\\.)?shimane|(?:(?:arai|atami|fuji|fujieda|fujikawa|fujinomiya|fukuroi|gotemba|haibara|hamamatsu|higashiizu|ito|iwata|izu|izunokuni|kakegawa|kannami|kawanehon|kawazu|kikugawa|kosai|makinohara|matsuzaki|minamiizu|mishima|morimachi|nishiizu|numazu|omaezaki|shimada|shimizu|shimoda|shizuoka|susono|yaizu|yoshida)\\.)?shizuoka|(?:(?:ashikaga|bato|haga|ichikai|iwafune|kaminokawa|kanuma|karasuyama|kuroiso|mashiko|mibu|moka|motegi|nasu|nasushiobara|nikko|nishikata|nogi|ohira|ohtawara|oyama|sakura|sano|shimotsuke|shioya|takanezawa|tochigi|tsuga|ujiie|utsunomiya|yaita)\\.)?tochigi|(?:(?:aizumi|anan|ichiba|itano|kainan|komatsushima|matsushige|mima|minami|miyoshi|mugi|nakagawa|naruto|sanagochi|shishikui|tokushima|wajiki)\\.)?tokushima|(?:(?:adachi|akiruno|akishima|aogashima|arakawa|bunkyo|chiyoda|chofu|chuo|edogawa|fuchu|fussa|hachijo|hachioji|hamura|higashikurume|higashimurayama|higashiyamato|hino|hinode|hinohara|inagi|itabashi|katsushika|kita|kiyose|kodaira|koganei|kokubunji|komae|koto|kouzushima|kunitachi|machida|meguro|minato|mitaka|mizuho|musashimurayama|musashino|nakano|nerima|ogasawara|okutama|ome|oshima|ota|setagaya|shibuya|shinagawa|shinjuku|suginami|sumida|tachikawa|taito|tama|toshima)\\.)?tokyo|(?:(?:chizu|hino|kawahara|koge|kotoura|misasa|nanbu|nichinan|sakaiminato|tottori|wakasa|yazu|yonago)\\.)?tottori|(?:(?:asahi|fuchu|fukumitsu|funahashi|himi|imizu|inami|johana|kamiichi|kurobe|nakaniikawa|namerikawa|nanto|nyuzen|oyabe|taira|takaoka|tateyama|toga|tonami|toyama|unazuki|uozu|yamada)\\.)?toyama|(?:(?:arida|aridagawa|gobo|hashimoto|hidaka|hirogawa|inami|iwade|kainan|kamitonda|katsuragi|kimino|kinokawa|kitayama|koya|koza|kozagawa|kudoyama|kushimoto|mihama|misato|nachikatsuura|shingu|shirahama|taiji|tanabe|wakayama|yuasa|yura)\\.)?wakayama|(?:(?:asahi|funagata|higashine|iide|kahoku|kaminoyama|kaneyama|kawanishi|mamurogawa|mikawa|murayama|nagai|nakayama|nanyo|nishikawa|obanazawa|oe|oguni|ohkura|oishida|sagae|sakata|sakegawa|shinjo|shirataka|shonai|takahata|tendo|tozawa|tsuruoka|yamagata|yamanobe|yonezawa|yuza)\\.)?yamagata|(?:(?:abu|hagi|hikari|hofu|iwakuni|kudamatsu|mitou|nagato|oshima|shimonoseki|shunan|tabuse|tokuyama|toyota|ube|yuu)\\.)?yamaguchi|(?:(?:chuo|doshi|fuefuki|fujikawa|fujikawaguchiko|fujiyoshida|hayakawa|hokuto|ichikawamisato|kai|kofu|koshu|kosuge|minami-alps|minobu|nakamichi|nanbu|narusawa|nirasaki|nishikatsura|oshino|otsuki|showa|tabayama|tsuru|uenohara|yamanakako|yamanashi)\\.)?yamanashi|yokohama)\\.)?jp)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?kg)" +
    "|(?:(?:(?:biz|com|edu|gov|info|net|org)\\.)?ki)" +
    "|(?:(?:(?:ass|asso|com|coop|edu|gouv|gov|medecin|mil|nom|notaires|org|pharmaciens|prd|presse|tm|veterinaire)\\.)?km)" +
    "|(?:(?:(?:edu|gov|net|org)\\.)?kn)" +
    "|(?:(?:(?:com|edu|gov|org|rep|tra)\\.)?kp)" +
    "|(?:(?:(?:ac|blogspot|busan|chungbuk|chungnam|co|daegu|daejeon|es|gangwon|go|gwangju|gyeongbuk|gyeonggi|gyeongnam|hs|incheon|jeju|jeonbuk|jeonnam|kg|mil|ms|ne|or|pe|re|sc|seoul|ulsan)\\.)?kr)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?ky)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?kz)" +
    "|(?:(?:(?:c|com|edu|gov|info|int|net|org|per)\\.)?la)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?lb)" +
    "|(?:(?:(?:co|com|edu|gov|net|org)\\.)?lc)" +
    "|(?:(?:(?:assn|com|edu|gov|grp|hotel|int|ltd|net|ngo|org|sch|soc|web)\\.)?lk)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?lr)" +
    "|(?:(?:(?:co|org)\\.)?ls)" +
    "|(?:(?:gov\\.)?lt)" +
    "|(?:(?:(?:asn|com|conf|edu|gov|id|mil|net|org)\\.)?lv)" +
    "|(?:(?:(?:com|edu|gov|id|med|net|org|plc|sch)\\.)?ly)" +
    "|(?:(?:(?:ac|co|gov|net|org|press)\\.)?ma)" +
    "|(?:(?:(?:asso|tm)\\.)?mc)" +
    "|(?:(?:(?:ac|co|edu|gov|its|net|org|priv)\\.)?me)" +
    "|(?:(?:(?:com|edu|gov|mil|nom|org|prd|tm)\\.)?mg)" +
    "|(?:(?:(?:com|edu|gov|inf|name|net|org)\\.)?mk)" +
    "|(?:(?:(?:com|edu|gouv|gov|net|org|presse)\\.)?ml)" +
    "|(?:(?:(?:edu|gov|nyc|org)\\.)?mn)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?mo)" +
    "|(?:(?:(?:blogspot|gov)\\.)?mr)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?ms)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?mt)" +
    "|(?:(?:(?:academy|agriculture|air|airguard|alabama|alaska|amber|ambulance|american|americana|americanantiques|americanart|amsterdam|and|annefrank|anthro|anthropology|antiques|aquarium|arboretum|archaeological|archaeology|architecture|art|artanddesign|artcenter|artdeco|arteducation|artgallery|arts|artsandcrafts|asmatart|assassination|assisi|association|astronomy|atlanta|austin|australia|automotive|aviation|axis|badajoz|baghdad|bahn|bale|baltimore|barcelona|baseball|basel|baths|bauern|beauxarts|beeldengeluid|bellevue|bergbau|berkeley|berlin|bern|bible|bilbao|bill|birdart|birthplace|bonn|boston|botanical|botanicalgarden|botanicgarden|botany|brandywinevalley|brasil|bristol|british|britishcolumbia|broadcast|brunel|brussel|brussels|bruxelles|building|burghof|bus|bushey|cadaques|california|cambridge|can|canada|capebreton|carrier|cartoonart|casadelamoneda|castle|castres|celtic|center|chattanooga|cheltenham|chesapeakebay|chicago|children|childrens|childrensgarden|chiropractic|chocolate|christiansburg|cincinnati|cinema|circus|civilisation|civilization|civilwar|clinton|clock|coal|coastaldefence|cody|coldwar|collection|colonialwilliamsburg|coloradoplateau|columbia|columbus|communication|communications|community|computer|computerhistory|comunicaes-v6a2o|contemporary|contemporaryart|convent|copenhagen|corporation|correios-e-telecomunicaes-ghc29a|corvette|costume|countryestate|county|crafts|cranbrook|creation|cultural|culturalcenter|culture|cyber|cymru|dali|dallas|database|ddr|decorativearts|delaware|delmenhorst|denmark|depot|design|detroit|dinosaur|discovery|dolls|donostia|durham|eastafrica|eastcoast|education|educational|egyptian|eisenbahn|elburg|elvendrell|embroidery|encyclopedic|england|entomology|environment|environmentalconservation|epilepsy|essex|estate|ethnology|exeter|exhibition|family|farm|farmequipment|farmers|farmstead|field|figueres|filatelia|film|fineart|finearts|finland|flanders|florida|force|fortmissoula|fortworth|foundation|francaise|frankfurt|franziskaner|freemasonry|freiburg|fribourg|frog|fundacio|furniture|gallery|garden|gateway|geelvinck|gemological|geology|georgia|giessen|glas|glass|gorge|grandrapids|graz|guernsey|halloffame|hamburg|handson|harvestcelebration|hawaii|health|heimatunduhren|hellas|helsinki|hembygdsforbund|heritage|histoire|historical|historicalsociety|historichouses|historisch|historisches|history|historyofscience|horology|house|humanities|illustration|imageandsound|indian|indiana|indianapolis|indianmarket|intelligence|interactive|iraq|iron|isleofman|jamison|jefferson|jerusalem|jewelry|jewish|jewishart|jfk|journalism|judaica|judygarland|juedisches|juif|karate|karikatur|kids|koebenhavn|koeln|kunst|kunstsammlung|kunstunddesign|labor|labour|lajolla|lancashire|landes|lans|larsson|lewismiller|lincoln|linz|living|livinghistory|localhistory|london|losangeles|louvre|loyalist|lucerne|luxembourg|luzern|lns-qla|mad|madrid|mallorca|manchester|mansion|mansions|manx|marburg|maritime|maritimo|maryland|marylhurst|media|medical|medizinhistorisches|meeres|memorial|mesaverde|michigan|midatlantic|military|mill|miners|mining|minnesota|missile|missoula|modern|moma|money|monmouth|monticello|montreal|moscow|motorcycle|muenchen|muenster|mulhouse|muncie|museet|museumcenter|museumvereniging|music|national|nationalfirearms|nationalheritage|nativeamerican|naturalhistory|naturalhistorymuseum|naturalsciences|nature|naturhistorisches|natuurwetenschappen|naumburg|naval|nebraska|neues|newhampshire|newjersey|newmexico|newport|newspaper|newyork|niepce|norfolk|north|nrw|nuernberg|nuremberg|nyc|nyny|oceanographic|oceanographique|omaha|online|ontario|openair|oregon|oregontrail|otago|oxford|pacific|paderborn|palace|paleo|palmsprings|panama|paris|pasadena|pharmacy|philadelphia|philadelphiaarea|philately|phoenix|photography|pilots|pittsburgh|planetarium|plantation|plants|plaza|portal|portland|portlligat|posts-and-telecommunications|preservation|presidio|press|project|public|pubol|quebec|railroad|railway|research|resistance|riodejaneiro|rochester|rockart|roma|russia|saintlouis|salem|salvadordali|salzburg|sandiego|sanfrancisco|santabarbara|santacruz|santafe|saskatchewan|satx|savannahga|schlesisches|schoenbrunn|schokoladen|school|schweiz|science|science-fiction|scienceandhistory|scienceandindustry|sciencecenter|sciencecenters|sciencehistory|sciences|sciencesnaturelles|scotland|seaport|settlement|settlers|shell|sherbrooke|sibenik|silk|ski|skole|society|sologne|soundandvision|southcarolina|southwest|space|spy|square|stadt|stalbans|starnberg|state|stateofdelaware|station|steam|steiermark|stjohn|stockholm|stpetersburg|stuttgart|suisse|surgeonshall|surrey|svizzera|sweden|sydney|tank|tcm|technology|telekommunikation|television|texas|textile|theater|time|timekeeping|topology|torino|touch|town|transport|tree|trolley|trust|trustee|uhren|ulm|undersea|university|usa|usantiques|usarts|uscountryestate|usculture|usdecorativearts|usgarden|ushistory|ushuaia|uslivinghistory|utah|uvic|valley|vantaa|versailles|viking|village|virginia|virtual|virtuel|vlaanderen|volkenkunde|wales|wallonie|war|washingtondc|watch-and-clock|watchandclock|western|westfalen|whaling|wildlife|williamsburg|windmill|workshop|york|yorkshire|yosemite|youth|zoological|zoology|h1aegh|9dbhblg6di)\\.)?museum)" +
    "|(?:(?:(?:ac|co|com|gov|net|or|org)\\.)?mu)" +
    "|(?:(?:(?:aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro)\\.)?mv)" +
    "|(?:(?:(?:ac|biz|co|com|coop|edu|gov|int|museum|net|org)\\.)?mw)" +
    "|(?:(?:(?:blogspot|com|edu|gob|net|org)\\.)?mx)" +
    "|(?:(?:(?:com|edu|gov|mil|name|net|org)\\.)?my)" +
    "|(?:(?:(?:forgot\\.her|forgot\\.his)\\.)?name)" +
    "|(?:(?:(?:ca|cc|co|com|dr|in|info|mobi|mx|name|or|org|pro|school|tv|us|ws)\\.)?na)" +
    "|(?:(?:asso\\.)?nc)" +
    "|(?:(?:(?:at-band-camp|azure-mobile|azurewebsites|blogdns|broke-it|buyshouses|cloudapp|cloudfront|dnsalias|dnsdojo|does-it|dontexist|dynalias|dynathome|endofinternet|(?:(?:(?:(?:a|global)\\.)prod|(?:(?:a|b|global)\\.)ssl)\\.)fastly|from-az|from-co|from-la|from-ny|gb|gets-it|ham-radio-op|homeftp|homeip|homelinux|homeunix|hu|in-the-band|is-a-chef|is-a-geek|isa-geek|jp|kicks-ass|office-on-the|podzone|scrapper-site|se|selfip|sells-it|servebbs|serveftp|thruhere|uk|webhop|za)\\.)?net)" +
    "|(?:(?:(?:arts|com|firm|info|net|other|per|rec|store|web)\\.)?nf)" +
    "|(?:(?:(?:com|edu|gov|mil|mobi|name|net|org|sch)\\.)?ng)" +
    "|(?:(?:(?:blogspot|bv|co)\\.)?nl)" +
    "|(?:(?:(?:aa|aarborte|aejrie|afjord|agdenes|ah|aknoluokta|akrehamn|al|alaheadju|alesund|algard|alstahaug|alta|alvdal|amli|amot|andasuolo|andebu|andoy|andy-ira|ardal|aremark|arendal|arna|aseral|asker|askim|askoy|askvoll|asky-ira|asnes|audnedaln|aukra|aure|aurland|aurskog-holand|aurskog-hland-jnb|austevoll|austrheim|averoy|avery-yua|badaddja|bahcavuotna|bahccavuotna|baidar|bajddar|balat|balestrand|ballangen|balsfjord|bamble|bardu|barum|batsfjord|bearalvahki|bearalvhki-y4a|beardu|beiarn|berg|bergen|berlevag|berlevg-jxa|bievat|bievt-0qa|bindal|birkenes|bjarkoy|bjarky-fya|bjerkreim|bjugn|blogspot|bo\\.nordland|bo\\.telemark|bodo|bod-2na|bokn|bomlo|bremanger|bronnoy|bronnoysund|brumunddal|bryne|brnny-wuac|brnnysund-m8ac|bu|budejju|bygland|bykle|bhcavuotna-s4a|bhccavuotna-k7a|bidr-5nac|bjddar-pta|blt-elab|bdddj-mrabd|btsfjord-9za|brum-voa|b\\.nordland-0cb|b\\.telemark-0cb|bmlo-gra|cahcesuolo|co|davvenjarga|davvenjrga-y4a|davvesiida|deatnu|dep|dielddanuorri|divtasvuodna|divttasvuotna|donna|dovre|drammen|drangedal|drobak|drbak-wua|dyroy|dyry-ira|dnna-gra|egersund|eid|eidfjord|eidsberg|eidskog|eidsvoll|eigersund|elverum|enebakk|engerdal|etne|etnedal|evenassi|evenes|eveni-0qa01ga|evje-og-hornnes|farsund|fauske|fedje|fet|fetsund|fhs|finnoy|finny-yua|fitjar|fjaler|fjell|fla|flakstad|flatanger|flekkefjord|flesberg|flora|floro|flor-jra|fl-zia|fm|folkebibl|folldal|forde|forsand|fosnes|frana|fredrikstad|frei|frogn|froland|frosta|froya|frna-woa|frya-hra|fuoisku|fuossko|fusa|fylkesbibl|fyresdal|frde-gra|gaivuotna|galsa|gamvik|gangaviika|gaular|gausdal|giehtavuoatna|gildeskal|gildeskl-g0a|giske|gjemnes|gjerdrum|gjerstad|gjesdal|gjovik|gjvik-wua|gloppen|gol|gran|grane|granvin|gratangen|grimstad|grong|grue|gs\\.aa|gs\\.ah|gs\\.bu|gs\\.fm|gs\\.hl|gs\\.hm|gs\\.jan-mayen|gs\\.mr|gs\\.nl|gs\\.nt|gs\\.of|gs\\.ol|gs\\.oslo|gs\\.rl|gs\\.sf|gs\\.st|gs\\.svalbard|gs\\.tm|gs\\.tr|gs\\.va|gs\\.vf|gulen|guovdageaidnu|givuotna-8ya|gls-elac|ggaviika-8ya47h|ha|habmer|hadsel|hagebostad|halden|halsa|hamar|hamaroy|hammarfeasta|hammerfest|hapmir|haram|hareid|harstad|hasvik|hattfjelldal|haugesund|hemne|hemnes|hemsedal|herad|heroy\\.more-og-romsdal|heroy\\.nordland|hery\\.mre-og-romsdal-x7bd|hery\\.nordland-dnb|hitra|hjartdal|hjelmeland|hl|hm|hobol|hobl-ira|hof|hokksund|hol|hole|holmestrand|holtalen|holtlen-hxa|honefoss|hornindal|horten|hoyanger|hoylandet|hurdal|hurum|hvaler|hyllestad|hbmer-xqa|hmmrfeasta-s4ac|hpmir-xqa|h-2fa|hgebostad-g3a|hnefoss-q1a|hyanger-q1a|hylandet-54a|ibestad|idrett|inderoy|indery-fya|iveland|ivgu|jan-mayen|jessheim|jevnaker|jolster|jondal|jorpeland|jlster-bya|jrpeland-54a|kafjord|karasjohka|karasjok|karlsoy|karmoy|karmy-yua|kautokeino|kirkenes|klabu|klepp|klbu-woa|kommune|kongsberg|kongsvinger|kopervik|kraanghke|kragero|krager-gya|kristiansand|kristiansund|krodsherad|krokstadelva|kranghke-b0a|krdsherad-m8a|kvafjord|kvalsund|kvam|kvanangen|kvinesdal|kvinnherad|kviteseid|kvitsoy|kvitsy-fya|kvfjord-nxa|kvnangen-k0a|krjohka-hwab49j|kfjord-iua|laakesvuemie|lahppi|langevag|langevg-jxa|lardal|larvik|lavagis|lavangen|leangaviika|leagaviika-52b|lebesby|leikanger|leirfjord|leirvik|leka|leksvik|lenvik|lerdal|lesja|levanger|lier|lierne|lillehammer|lillesand|lindas|lindesnes|linds-pra|loabat|loabt-0qa|lodingen|lom|loppa|lorenskog|loten|lund|lunner|luroy|lury-ira|luster|lyngdal|lyngen|lhppi-xqa|lrdal-sra|ldingen-q1a|lrenskog-54a|lten-gra|malatvuopmi|malselv|malvik|mandal|marker|marnardal|masfjorden|masoy|matta-varjjat|meland|meldal|melhus|meloy|mely-ira|meraker|merker-kua|midsund|midtre-gauldal|mil|mjondalen|mjndalen-64a|mo-i-rana|moareke|modalen|modum|molde|mosjoen|mosjen-eya|moskenes|moss|mosvik|moreke-jua|mr|muosat|muost-0qa|museum|mlatvuopmi-s4a|mtta-vrjjat-k7af|mlselv-iua|msy-ula0h|naamesjevuemie|namdalseid|namsos|namsskogan|nannestad|naroy|narviika|narvik|naustdal|navuotna|nedre-eiker|nes\\.akershus|nes\\.buskerud|nesna|nesodden|nesoddtangen|nesseby|nesset|nissedal|nittedal|nl|nord-aurdal|nord-fron|nord-odal|norddal|nordkapp|nordre-land|nordreisa|nore-og-uvdal|notodden|notteroy|nt|nvuotna-hwa|nmesjevuemie-tcba|nry-yla5g|nttery-byae|odda|of|oksnes|ol|omasvuotna|oppdal|oppegard|oppegrd-ixa|orkanger|orkdal|orland|orskog|orsta|os\\.hedmark|os\\.hordaland|osen|oslo|osoyro|osteroy|ostery-fya|ostre-toten|osyro-wua|overhalla|ovre-eiker|oyer|oygarden|oystre-slidre|porsanger|porsangu|porsgrunn|porsgu-sta26f|priv|rade|radoy|rady-ira|rahkkeravju|raholt|raisa|rakkestad|ralingen|rana|randaberg|rauma|rendalen|rennebu|rennesoy|rennesy-v1a|rindal|ringebu|ringerike|ringsaker|risor|rissa|risr-ira|rl|roan|rodoy|rollag|romsa|romskog|roros|rost|royken|royrvik|ruovat|rygge|rhkkervju-01af|risa-5na|rde-ula|rholt-mra|rlingen-mxa|rdy-0nab|rmskog-bya|rros-gra|rst-0na|ryken-vua|ryrvik-bya|salangen|salat|saltdal|samnanger|sande\\.more-og-romsdal|sande\\.mre-og-romsdal-hcc|sande\\.vestfold|sandefjord|sandnes|sandnessjoen|sandnessjen-ogb|sandoy|sandy-yua|sarpsborg|sauda|sauherad|sel|selbu|selje|seljord|sf|siellak|sigdal|siljan|sirdal|skanit|skanland|skaun|skedsmo|skedsmokorset|ski|skien|skierva|skierv-uta|skiptvet|skjak|skjervoy|skjervy-v1a|skjk-soa|skodje|sknit-yqa|sknland-fxa|slattum|smola|smla-hra|snaase|snasa|snillfjord|snoasa|snase-nra|snsa-roa|sogndal|sogne|sokndal|sola|solund|somna|sondre-land|songdalen|sor-aurdal|sor-fron|sor-odal|sor-varanger|sorfold|sorreisa|sortland|sorum|spjelkavik|spydeberg|st|stange|stat|stathelle|stavanger|stavern|steigen|steinkjer|stjordal|stjordalshalsen|stjrdal-s1a|stjrdalshalsen-sqb|stokke|stor-elvdal|stord|stordal|storfjord|strand|stranda|stryn|sula|suldal|sund|sunndal|surnadal|svalbard|sveio|svelvik|sykkylven|slat-5na|slt-elab|sgne-gra|smna-gra|sndre-land-0cb|sr-aurdal-l8a|sr-fron-q1a|sr-odal-q1a|sr-varanger-ggb|srfold-bya|srreisa-q1a|srum-gra|tana|tananger|time|tingvoll|tinn|tjeldsund|tjome|tjme-hra|tm|tokke|tolga|tonsberg|torsken|tr|trana|tranby|tranoy|trany-yua|troandin|trogstad|tromsa|tromso|troms-zua|trondheim|trysil|trna-woa|trgstad-r1a|tvedestrand|tydal|tynset|tysfjord|tysnes|tysvar|tysvr-vra|tnsberg-q1a|ullensaker|ullensvang|ulvik|unjarga|unjrga-rta|utsira|va|vaapste|vadso|vads-jra|vaga|vagan|vagsoy|vaksdal|valer\\.hedmark|valer\\.ostfold|valle|vang|vanylven|vardo|vard-jra|varggat|varoy|vefsn|vega|vegarshei|vegrshei-c0a|vennesla|verdal|verran|vestby|vestnes|vestre-slidre|vestre-toten|vestvagoy|vestvgy-ixa6o|vevelstad|vf|vgs|vik|vikna|vindafjord|voagat|volda|voss|vossevangen|vrggt-xqad|vgan-qoa|vgsy-qoa0j|vg-yiab|vler\\.hedmark-tcb|vler\\.stfold-x8a5w|vry-yla5g|koluokta-7ya57h|laheadju-7ya|lt-liac|fjord-lra|krehamn-dxa|l-1fa|lesund-hua|lgrd-poac|mli-tla|mot-tla|rdal-poa|s-1fa|seral-lra|snes-poa|ksnes-uua|rland-uua|rskog-uua|rsta-fra|stre-toten-zcb|vre-eiker-k8a|yer-zna|ygarden-p1a|ystre-slidre-ujb|hcesuolo-7ya35b)\\.)?no)" +
    "|(?:(?:(?:biz|com|edu|gov|info|net|org)\\.)?nr)" +
    "|(?:(?:(?:merseine|mine|shacknet)\\.)?nu)" +
    "|(?:(?:(?:ac|(?:(?:blogspot)\\.)?co|cri|geek|gen|govt|health|iwi|kiwi|maori|mil|net|org|parliament|school)\\.)?nz)" +
    "|(?:(?:(?:ac|biz|com|co|edu|gov|med|mil|museum|net|org|pro|sch)\\.)?om)" +
    "|(?:(?:(?:ae|blogdns|blogsite|boldlygoingnowhere|dnsalias|dnsdojo|doesntexist|dontexist|doomdns|dvrdns|dynalias|dyndns|endofinternet|endoftheinternet|from-me|game-host|go\\.dyndns|gotdns|hobby-site|homedns|home\\.dyndns|homeftp|homelinux|homeunix|is-a-bruinsfan|is-a-candidate|is-a-celticsfan|is-a-chef|is-a-geek|isa-geek|is-a-knight|is-a-linux-user|is-a-patsfan|is-a-soxfan|is-found|is-lost|is-saved|is-very-bad|is-very-evil|is-very-good|is-very-nice|is-very-sweet|kicks-ass|misconfused|podzone|readmyblog|selfip|sellsyourhome|servebbs|serveftp|servegame|stuff-4-sale|us|webhop|za)\\.)?org)" +
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
    "|(?:(?:(?:blogspot|com|edu|gov|int|net|nome|org|publ)\\.)?pt)" +
    "|(?:(?:(?:belau|co|ed|go|ne|or)\\.)?pw)" +
    "|(?:(?:(?:com|coop|edu|gov|mil|net|org)\\.)?py)" +
    "|(?:(?:(?:com|edu|gov|mil|name|net|org|sch)\\.)?qa)" +
    "|(?:(?:(?:asso|blogspot|com|nom)\\.)?re)" +
    "|(?:(?:(?:arts|blogspot|com|firm|info|nom|nt|org|rec|store|tm|www)\\.)?ro)" +
    "|(?:(?:(?:ac|co|edu|gov|in|org)\\.)?rs)" +
    "|(?:(?:(?:ac|adygeya|altai|amur|amursk|arkhangelsk|astrakhan|baikal|bashkiria|belgorod|bir|bryansk|buryatia|cap|cbg|chel|chelyabinsk|chita|chukotka|chuvashia|cmw|com|dagestan|dudinka|e-burg|edu|fareast|gov|grozny|int|irkutsk|ivanovo|izhevsk|jamal|jar|joshkar-ola|kalmykia|kaluga|kamchatka|karelia|kazan|kchr|kemerovo|khabarovsk|khakassia|khv|kirov|kms|koenig|komi|kostroma|kranoyarsk|krasnoyarsk|kuban|k-uralsk|kurgan|kursk|kustanai|kuzbass|lipetsk|magadan|magnitka|mari|mari-el|marine|mil|mordovia|mosreg|msk|murmansk|mytis|nakhodka|nalchik|net|nkz|nnov|norilsk|nov|novosibirsk|nsk|omsk|orenburg|org|oryol|oskol|palana|penza|perm|pp|pskov|ptz|pyatigorsk|rnd|rubtsovsk|ryazan|sakhalin|samara|saratov|simbirsk|smolensk|snz|spb|stavropol|stv|surgut|syzran|tambov|tatarstan|test|tlt|tom|tomsk|tsaritsyn|tsk|tula|tuva|tver|tyumen|udm|udmurtia|ulan-ude|vdonsk|vladikavkaz|vladimir|vladivostok|volgograd|vologda|voronezh|vrn|vyatka|yakutia|yamal|yaroslavl|yekaterinburg|yuzhno-sakhalinsk|zgrad)\\.)?ru)" +
    "|(?:(?:(?:ac|co|com|edu|gouv|gov|int|mil|net)\\.)?rw)" +
    "|(?:(?:(?:com|edu|gov|med|net|org|pub|sch)\\.)?sa)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?sb)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?sc)" +
    "|(?:(?:(?:com|edu|gov|info|med|net|org|tv)\\.)?sd)" +
    "|(?:(?:(?:[a-ik-pr-uw-z]|ac|bd|blogspot|brand|fh|fhsk|fhv|komforb|kommunalforbund|komvux|lanbib|naturbruksgymn|org|parti|pp|press|sshn|tm)\\.)?se)" +
    "|(?:(?:(?:blogspot|com|edu|gov|net|org|per)\\.)?sg)" +
    "|(?:(?:(?:com|gov|mil|net|org)\\.)?sh)" +
    "|(?:(?:blogspot\\.)?sk)" +
    "|(?:(?:(?:com|edu|gov|net|org)\\.)?sl)" +
    "|(?:(?:(?:art|com|edu|gouv|org|perso|univ)\\.)?sn)" +
    "|(?:(?:(?:com|net|org)\\.)?so)" +
    "|(?:(?:(?:co|com|consulado|edu|embaixada|gov|mil|net|org|principe|saotome|store)\\.)?st)" +
    "|(?:(?:(?:com|edu|gob|org|red)\\.)?sv)" +
    "|(?:(?:gov\\.)?sx)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?sy)" +
    "|(?:(?:(?:ac|co|org)\\.)?sz)" +
    "|(?:(?:blogspot\\.)?td)" +
    "|(?:(?:(?:ac|co|go|in|mi|net|or)\\.)?th)" +
    "|(?:(?:(?:ac|biz|co|com|edu|go|gov|int|mil|name|net|nic|org|test|web)\\.)?tj)" +
    "|(?:(?:gov\\.)?tl)" +
    "|(?:(?:(?:co|com|edu|gov|mil|net|nom|org)\\.)?tm)" +
    "|(?:(?:(?:agrinet|com|defense|edunet|ens|fin|gov|ind|info|intl|mincom|nat|net|org|perso|rnrt|rns|rnu|tourism|turen)\\.)?tn)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?to)" +
    "|(?:(?:(?:av|bbs|bel|biz|com|dr|edu|gen|gov(?:\\.nc)?|info|k12|mil|name|net|org|pol|tel|tsk|tv|web)\\.)?tr)" +
    "|(?:(?:(?:aero|biz|co|com|coop|edu|gov|info|int|jobs|mobi|museum|name|net|org|pro|travel)\\.)?tt)" +
    "|(?:(?:(?:better-than|dyndns|on-the-web|worse-than)\\.)?tv)" +
    "|(?:(?:(?:blogspot|club|com|ebiz|edu|game|gov|idv|mil|net|org|czrw28b|uc0atv|zf0ao64a)\\.)?tw)" +
    "|(?:(?:(?:ac|co|go|hotel|info|me|mil|mobi|ne|or|sc|tv)\\.)?tz)" +
    "|(?:(?:(?:cherkassy|cherkasy|chernigov|chernihiv|chernivtsi|chernovtsy|ck|cn|co|com|cr|crimea|cv|dn|dnepropetrovsk|dnipropetrovsk|dominic|donetsk|dp|edu|gov|if|in|ivano-frankivsk|kh|kharkiv|kharkov|kherson|khmelnitskiy|khmelnytskyi|kiev|kirovograd|km|kr|krym|ks|kv|kyiv|lg|lt|lugansk|lutsk|lv|lviv|mk|mykolaiv|net|nikolaev|od|odesa|odessa|org|pl|poltava|pp|rivne|rovno|rv|sb|sebastopol|sevastopol|sm|sumy|te|ternopil|uz|uzhgorod|vinnica|vinnytsia|vn|volyn|yalta|zaporizhzhe|zaporizhzhia|zhitomir|zhytomyr|zp|zt)\\.)?ua)" +
    "|(?:(?:(?:ac|co|com|go|ne|or|org|sc)\\.)?ug)" +
    "|(?:(?:(?:ac|bl|(?:(?:blogspot)\\.)?co|gov|jet|judiciary|ltd|me|mil|mod|net|nic|nls|org|parliament|plc|sch)\\.)?uk)" +
    "|(?:(?:(?:ak|al|ar|as|az|ca|cc\\.(?:ak|al|ar|as|az|ca|co|ct|dc|de|fl|ga|gu|hi|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|pr|ri|sc|sd|tn|tx|ut|va|vi|vt|wa|wi|wv|wy)|chtr\\.k12\\.ma|co|ct|dc|de|dni|fed|fl|ga|gu|hi|ia|id|il|in|is-by|isa|k12\\.(?:ak|al|ar|as|az|ca|co|ct|dc|de|fl|ga|gu|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|pr|ri|sc|tn|tx|ut|va|vi|vt|wa|wi|wy)|kids|ks|ky|la|land-4-sale|lib\\.(?:ak|al|ar|as|az|ca|co|ct|dc|de|fl|ga|gu|hi|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|pr|ri|sc|sd|tn|tx|ut|va|vi|vt|wa|wi|wv|wy)|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nsn|nv|ny|oh|ok|or|pa|paroch\\.k12\\.ma|pr|pvt\\.k12\\.ma|ri|sc|sd|stuff-4-sale|tn|tx|ut|va|vi|vt|wa|wi|wv|wy)\\.)?us)" +
    "|(?:(?:(?:co|com|net|org)\\.)?uz)" +
    "|(?:(?:(?:com|edu|gov|mil|net|org)\\.)?vc)" +
    "|(?:(?:(?:co|com|e12|edu|gob|gov|info|int|mil|net|org|tec|web)\\.)?ve)" +
    "|(?:(?:(?:co|com|k12|net|org)\\.)?vi)" +
    "|(?:(?:(?:ac|biz|com|edu|gov|health|info|int|name|net|org|pro)\\.)?vn)" +
    "|(?:(?:(?:com|dyndns|edu|gov|mypets|net|org)\\.)?ws)" +
    "|(?:actor|agency|am|aq|archi|asia|autos|ax|axa|bar|bargains|bayern|beer|best|bid|black(?:friday)?|boo|boutique|brussels|budapest|buzz|bv|bzh|caravan|cards|careers?|casa|cat|catering|cg|cheap|christmas|church|cleaning|coffee|college|cologne|community|condos|consulting|cooking|cool|coop|country|cruises|dabur|dad|dating|day|desi|dj|dnp|eat|edu|er|et|eus?|events|expert|exposed|feedback|fish(?:ing)?|fj|fk|flights|fm|fo|foo|foundation|frogans|ga|gb|gd|gent|gf|ggee|gift|gl|globo|gm|gop|gov|gq|gs|gu|guitars|gw|hamburg|haus|here|hm|homes|horse|how|ifm|industries|ing|ink|jetzt|jm|jobs|ke|kh|krd(?:xyz)?|kred|kw|lacaixa|li|life|link|local|london|lu|luxe|maison|md|meet|meme|mh|miami|mil|mini|mm|mobi|mormon|moscow|motorcycles|mov|mp|mq|mz|ne|network|neustar|new|nhk|ni|np|nrw|nyc|okinawa|otsuka|ovh|paris|partners|parts|pg|photo|pics|pink|pm|post|praxi|prod|productions|properties|pub|py|qpon|quebec|recipes|ren|rentals|report|rest|rich|rio|rocks|rodeo|ruhr|ryukyu|saarland|scb|scot|services|shiksha|shoes|shriram|si|sj|sm|sohu|soy|spiegel|sr|su|supplies|supply|suzuki|tc|tel|tf|tg|tienda|tk|tokyo|tools|tp|trade|travel|uy|va|vacations|vegas|vg|villas|vision|vlaanderen|vodka|vote|voto|vu|watch|webcam|wed|wf|whoswho|wme|work|works|wtc|xn--(?:0zwm56d|11b5bs3a9aj6g|1qqw23a|3e0b707e|45brj9c|45q11c|4gbrim|54b7fta0cc|55qx5d|80adxhks|80akhbyknj4f|80ao21a|90a3ac|9t4b11yi5a|c1avg|clchc0ea0b2g2a9gcd|czr694b|czrs0t|czru2d|czru2dcasa|d1acj3b|deba0ad|fiQ64b|fiqs8s|fiqz9s|fpcrj9c3d|fzc2c9e2c|g6w251d|gecrj9c|h2brj9c|hgbk6aj7f53bba|hlcj6aya9esc7a|i1b6b1a6a2e|io0a7i|j1amh|j6w193g|jxalpdlp|kput3i|kgbechtv|kprw13d|kpry57d|l1acc|lgbbat1ad8j|mgb2ddes|mgb9awbf|mgba3a4f16a|mgba3a4f16a.ir|mgba3a4fra|mgba3a4fra.ir|mgbaam7a8h|mgbayh7gpa|mgbbh1a71e|mgbc0a9azcg|mgberp4a5d4a87g|mgberp4a5d4ar|mgbqly7c0a67fbc|mgbqly7cvafr|mgbtf8fl|mgbx4cd0ab|nnx388a|node|nqv7f|nqv7fs00ema|o3cw4h|ogbpf8fl|p1acf|p1ai|pgbs0dh|s9brj9c|ses554g|wgbh1c|wgbl6a|xhq521b|xkc2al3hye2a|xkc2dl3a5ee0h|yfro4i67o|yfro4i67o Singapore|ygbi2ammx|zckzah)|xxx|xyz|yachts|ye|yokohama|yt|za|zm|zone|zw)" +
    ")";
var PORT = "(?::(\\d+))?";
var HIER_PART = "((?:(?:\\/\\/)?(?:(?:(?:[\\w-.~!$&'()*+,;=:]|%[a-f\\d]{2})*@)?(?:" + IP + "|((?:[\\w-.~!$&'()*+,;=]|%[a-f\\d]{2})*))" + PORT + "))(?:[\\w-.~!$&'()*+,;=:@/]|%[a-f\\d]{2})*)";
var PATH = "([;/](?:[\\w-.~!$&'()*+,;=:@/]|%[a-f\\d]{2})*)?";
var QUERY_FRAGMENT = "((?:[&?](?:[\\w-.~!$&'()*+,;=:@/?]|%[a-f\\d]{2})*)?(?:#(?:[\\w-.~!$&'()*+,;=:@/?]|%[a-f\\d]{2})*)?)";

var URI1 = "(" + SCHEME + HIER_PART + QUERY_FRAGMENT + ")";
var URI2 = "(" + AUTHORITY + "(?:" + IP + "|(?:" + REG_NAME + "\\b" + TLD + "))" + PORT + PATH + QUERY_FRAGMENT + ")";

var URL_RE = new RegExp("^" + URI1 + "$", "i");
var URI_SIMPLE_RE = new RegExp("^(?:" + URI1 + "|" + URI2 + "|(" + SIMPLE_DOT + PORT + PATH + QUERY_FRAGMENT + "))$", "i");
var NO_SCHEME_RE = new RegExp("^" + URI2 + "$", "i");
var DOMAIN_RE = new RegExp("^(" + IP + "|(?:" + ULD + "\\b" + TLD + ")|" + SIMPLE_DOT + ")" + PORT + "$", "i");
var FIND_SLD_RE = new RegExp("\\b(?:" + IP + "|(?:" + SLD + "\\b" + TLD + ")|" + SIMPLE + ")" + PORT + "$", "i");
var FIND_TLD_RE = new RegExp("\\b" + TLD + "$", "i");

