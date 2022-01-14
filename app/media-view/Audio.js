import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from '../Application';
import { Strings     } from '../Strings';

export class Audio extends View
{
	template = '<audio autoplay controls cv-attr = "src:src"></audio>'
}