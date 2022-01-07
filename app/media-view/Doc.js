import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from '../Application';
import { Strings     } from '../Strings';

export class Doc extends View
{
	template = '<iframe src = "[[src]]"></iframe>'
}