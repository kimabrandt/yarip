pref("extensions.yarip.enabled.value", true);                          /* true=enabled (default), false=disabled */
pref("extensions.yarip.noFlicker.value", false);                       /* true=prevent flicker, false=allow flicker (default) */
pref("extensions.yarip.mode.value", 1);                                /* 0=page, 1=fqdn (default), 2=sld */
pref("extensions.yarip.elementsInContext.value", 4);                   /* show number of elements in context menu (default=4) */
pref("extensions.yarip.useIndex.value", 1);                            /* 0=always, 1=when needed (default), 2=never */
pref("extensions.yarip.matchAuthorityPort.value", true);               /* true=match authority and port in URL regex, false=don't match */
pref("extensions.yarip.privateBrowsing.value", false);                 /* true=only allow content from visited page, false=allow all content (default) */
pref("extensions.yarip.purgeInnerHTML.value", false);                  /* true=purge innerHTML of elements, false=no purge (default) */
pref("extensions.yarip.schemesRegExp.value", "^https?$");              /* tells yarip, on which pages/shemes to run */
pref("extensions.yarip.allowScript.value", true);                      /* true=allow JavaScript on pages (default), false=deny */
pref("extensions.yarip.exclusiveOnCreation.value", false);             /* true=whitelist exclusively newly created pages, false=nothing (default) */
pref("extensions.yarip.templatesList.value", "");                      /* space separated list of pages from which to inherit */

pref("extensions.yarip.managePagesModifiersList.value", "accel alt");  /* shortcut-modifiers for opening the page-manager */
pref("extensions.yarip.managePagesKeyCode.value", "m");                /* key(-code) for opening the page-manager */

pref("extensions.yarip.logWhenClosed.value", false);                   /* true=allow logging when content-monitor is closed, false=don't log when closed */
pref("extensions.yarip.monitorContentModifiersList.value", "accel");   /* shortcut-modifiers for opening the content-monitor */
pref("extensions.yarip.monitorContentKeyCode.value", "m");             /* key(-code) for opening the content-monitor */

