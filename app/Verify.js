import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from './Application';
import { Strings     } from './Strings';

export class Verify extends View
{
	constructor(args, parent)
	{
		super(args, parent);

		this.template = rawquire('./verify.html');
	
		if(!Application.ethereum)
		{
			this.args.status = Application.ERROR_NOTFOUND_WEB3;
		}
		
		this.args.message   = null;
		this.args.address   = null;
		this.args.signature = null;

		const debindAddress = Application.bindTo('userAddress', v => {
			this.args.address = v;
		});

		const debindSignature = Application.bindTo('signature', v => {
			this.args.signature = v;
		});

		const debindMessage = Application.bindTo('message', v => {
			this.args.message = v;
		});

		this.onRemove(debindAddress);
		this.onRemove(debindMessage);
	}

	onVerifyClicked(event)
	{
		this.args.status = '...';

		Application.verify(this.args.message, this.args.signature).then(address => {
			if(String(this.args.address).toLowerCase() === String(address).toLowerCase())
			{
				this.args.status = Strings.MSG_SIG_VERIFIED(address);
			}
			else
			{
				this.args.status = String.ERR_SIG_INVALID();
			}
		});
	}
}