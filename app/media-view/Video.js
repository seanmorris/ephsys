import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from '../Application';
import { Strings     } from '../Strings';

export class Video extends View
{
	template = '<video autoplay controls cv-attr = "src:src" />'
}