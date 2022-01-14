import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from './Application';
import { Strings     } from './Strings';

import { Config } from './Config';

export class Challenge extends View
{
	constructor(args, parent)
	{
		super(args, parent);
		
		this.template = rawquire('./challenge.html');

		this.args.status = '...';
		this.args.solved = false;

		this.args.disabled = true;

		if(!Application.ethereum)
		{
			this.args.status = Application.ERROR_NOTFOUND_WEB3;
		}

		const debindSolved = Application.bindTo('solved', v => {
			this.args.solved = v;
			if(!v)
			{
				this.args.challenge = '';
				this.args.status = '';
				this.args.retort = '';
				this.args.result = '';
			}
		});

		const debindAddress = Application.bindTo('userAddress', v => {
			this.args.disabled = !v;
			if(!v) { return; }
			this.args.address = v;
		});

		this.onRemove(debindSolved);
		this.onRemove(debindAddress);
	}

	onStartClicked(event)
	{
		const credentials = 'include';
		const address = this.args.address;
		const method = 'POST';
		const body   = new FormData;

		body.append('address', address);

		fetch(`${Config.mediaGate}/challenge`, {method, body, credentials})
		.then(response => response.text())
		.then(challenge => {
			this.args.challenge = challenge;
			
			return Application.sign(this.args.challenge).then(signature => {
				const retort = {address, signature, challenge, time: Date.now()};
			
				this.args.retort = JSON.stringify(retort);

				return retort;
			
			});
		
		}).then(retort => {

			body.append('retort', JSON.stringify(retort));

			fetch(`//${Config.mediaGate}/challenge`, {method, body, credentials})
			.then(response => response.text())
			.then(result => {
				this.args.result = result

				result   = JSON.parse(result);
				const original = result.requested;

				Application.challenge = JSON.parse(original.challenge);
				Application.token     = retort;

				if(result.response.valid)
				{
					this.onTimeout(150, () => {
						this.args.status = Strings.MSG_CHALLENGE_VERIFIED();
						Application.solved = true;
					});
				}
				else
				{
					this.args.status = Strings.ERR_CHALLENGE_FAILED();
					Application.solved = false;						
				}
			});

		});
	}
}
