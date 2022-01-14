import { rawquire } from 'rawquire/rawquire.macro';
import { Config } from 'curvature/base/Config';
import { View } from 'curvature/base/View';

export class Loader extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template         = rawquire('./loader.svg');
		this.args.repeatCount = 'indefinite';
		// this.args.color    = '#000';
		this.args.color       = '#FFF';
		this.args.speed       = 0.333;
		
		this.args.rotFrom     = 360;
		this.args.rotTo       = 0;

		this.args.dashFrom    = 628;
		this.args.dashTo      = 0;

		this.args.bindTo('speed', v=>{
			this.args.halfSpeed = v*3;
		});
	}
}
