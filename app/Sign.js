import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from './Application';
import { Strings     } from './Strings';

export class Sign extends View
{

	constructor(args, parent)
	{
		super(args, parent);
		
		this.template = rawquire('./sign.html');

		if(!Application.ethereum)
		{
			this.args.status = Application.ERROR_NOTFOUND_WEB3;
		}
		
		this.args.address = null;
		this.args.message = 'testing!';
		this.args.sig     = null;

		const debind = Application.bindTo('userAddress', v => {
			if(!v) { return; }
			this.args.address = v;
		});

		this.onRemove(debind);
	}

	onSignClicked(event)
	{
		Application.sign(this.args.message).then(signature => {
			console.log(signature);
			this.args.sig = signature;
		});
	}
}