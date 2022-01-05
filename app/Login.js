import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from './Application';
import { Strings     } from './Strings';

export class Login extends View
{
	constructor(args, parent)
	{
		super(args, parent);
		
		this.template = rawquire('./login.html');

		if(!Application.ethereum)
		{
			this.args.status = Application.ERROR_NOTFOUND_WEB3;
		}
		
		this.args.status = 'waiting...';

		const debind = Application.bindTo('userAddress', v => {
			if(!v) { return; }
			this.args.status = Strings.MSG_USER_WELCOME(v);
		});

		this.onRemove(debind);
	}

	onLoginClicked(event)
	{
		Application.login().catch(error => this.args.status = `Please try again.`);
	}
}