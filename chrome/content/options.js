
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

function YaripOptionsPrefwindow()
{
    this.reset = function()
    {
        yarip.setValue(PREF_ELEMENTS, null, DATA_TYPE_RESET);

        yarip.setValue(PREF_INDEX, null, DATA_TYPE_RESET);

        yarip.setValue(PREF_MONITOR_MODIFIERS, null, DATA_TYPE_RESET);
        yarip.setValue(PREF_MONITOR_KEY_CODE, null, DATA_TYPE_RESET);
        yarip.setValue(PREF_RECURRENCE, null, DATA_TYPE_RESET);
        yarip.setValue(PREF_LOG_WHEN_CLOSED, null, DATA_TYPE_RESET);

        yarip.setValue(PREF_PAGES_MODIFIERS, null, DATA_TYPE_RESET);
        yarip.setValue(PREF_PAGES_KEY_CODE, null, DATA_TYPE_RESET);

        yarip.setValue(PREF_PRIVATE, null, DATA_TYPE_RESET);
        yarip.setValue(PREF_PURGE, null, DATA_TYPE_RESET);
        yarip.setValue(PREF_SCHEMES, null, DATA_TYPE_RESET);

        yarip.setValue(PREF_EXCLUSIVE, null, DATA_TYPE_RESET);
        yarip.setValue(PREF_TEMPLATES, null, DATA_TYPE_RESET);
    }
}

