import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from './Application';
import { Strings     } from './Strings';

export class Subscribe extends View
{
	constructor(args, parent)
	{
		super(args, parent);
		
		this.template = rawquire('./subscribe.html');

		this.args.ethPrice = '...';
		this.args.usdPrice = '...';
		this.args.expires  = '...';
		this.args.disable  = true;

		this.args.alreadySubscribed = false;

		const debindAddress = Application.bindTo('userAddress', v => {
			if(!v) { return; }
			this.args.disable = false;
			Application.getSubscription().then(subscription => {
				
				this.args.alreadySubscribed = !!subscription;
				
				const expires = new Date(subscription.expiry * 1000);
				
				this.args.expires = expires.toString();
			})
		},{wait:1});

		const debindBrainTree = Application.bindTo('_brainTree', v => {
			console.log(v);
			if(v || !this.tags.ccInput) { return; }
			while(this.tags.ccInput.firstChild)
			{
				this.tags.ccInput.firstChild.remove();
			}
			Application.getSubscription().then(subscription => {

				this.args.alreadySubscribed = !!subscription;

				const expires = new Date(subscription.expiry * 1000);

				this.args.expires = expires.toString();
			})
		});

		this.onRemove(debindAddress);
		this.onRemove(debindBrainTree);

		Application.getPrice().then(price => {
			this.args.ethPrice = price.ETH
			this.args.usdPrice = price.USD

			console.log(price);
		});
	}

	onSubscribeClicked(event)
	{
		Application.subscribe();
	}

	onSubscribeWithCardClicked(event)
	{
		Application.initBrainTree();
	}
}