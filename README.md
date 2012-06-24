    Copyright 2007-2012 Kim A. Brandt <kimabrandt@gmx.de>

    This file is part of yarip.

    Yarip is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    Yarip is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with yarip; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA



Yet Another Remove It Permanently
======

[Yarip][1] is a Mozilla-addon, which allows users to modify Web pages in a
number of different ways. It works by injecting and applying user created
code-snippets onto a Web page in order to change the look and feel and by
using rule-based matching in order to remove elements ([DOM][5]) and block
or redirect page-content (URLs).



Getting help
------

A [wiki][2] is in the process of being written. Questions and comments can
be send to either the yarip [mailing-list][3] or directly to [myself][4].



XPI packaging
------

The Makefiles have dependencies to the `zip` and `fastjar` programs. On
Debian derivatives you can install them as follows:

    # apt-get install zip fastjar

After this, packaging yarip into a XPI installer-module, should be as easy
as calling:

    $ make


Have fun!


[1]: https://addons.mozilla.org/en-US/firefox/addon/yarip/
    "Yet Another Remove It Permanently"
[2]: https://github.com/kimabrandt/yarip/wiki
    "Yarip wiki"
[3]: http://yarip.mozdev.org/list.html
    "mozdev.org - yarip: list"
[4]: mailto:kimabrandt@gmx.de?subject=Yarip
    "Kim A. Brandt"
[5]: http://en.wikipedia.org/wiki/Document_Object_Model
    "Document Object Model (DOM)"
