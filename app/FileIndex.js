import { rawquire } from 'rawquire/rawquire.macro';
import { View } from 'curvature/base/View';

import { Application } from './Application';
import { Loader      } from './Loader';
import { Strings     } from './Strings';

import { Image } from './media-view/Image';
import { Audio } from './media-view/Audio';
import { Video } from './media-view/Video';
import { Doc   } from './media-view/Doc';

import { Config } from './Config';

export class FileIndex extends View
{
	template = rawquire('./file-index.html');

	constructor(args, parent)
	{
		super(args, parent);

		this.args.mediaView = null;

		Application.bindTo('token', v => {
			if(!v) { return };

			this.args.validTimer = Application.challenge.validThru - (Date.now() / 1000);

			fetch(`${Config.mediaGate}/media`)
			.then(response => response.json())
			.then(response => this.args.files = response);

		});
		
		this.onFrame(() => {

			if(!Application.challenge)
			{
				this.args.validTimer = 0;
				return;
			}

			this.args.validTimer = Number(Math.max(
				0, Application.challenge.validThru - (Date.now() / 1000)).toFixed(3
			));
		});		
	}

	getAsset(event, file)
	{
		event.preventDefault();

		this.args.mediaView = new Loader;

		file = file.replace(/\.\//, '');

		const options = {
			credentials: 'include'
			, headers: { Authorization: `Bearer ${JSON.stringify(Application.token)}` }
		};

		if(file.substr(-3) === 'jpg' || file.substr(-3) === 'png')
		{
			fetch(`${Config.mediaGate}/media/show?assetPath=${file}`, options)
			.then(response => response.blob())
			.then(response => {
				const src = URL.createObjectURL(response, {type: 'image/' + file.substr(-3)});
				this.args.mediaView = new Image({src});
			});
		}

		if(file.substr(-3) === 'mp3' || file.substr(-3) === 'wav')
		{
			fetch(`${Config.mediaGate}/media/show?assetPath=${file}`, options)
			.then(response => response.blob())
			.then(response => {
				const src = URL.createObjectURL(response, {type: 'audio/' + file.substr(-3)});
				this.args.mediaView = new Audio({src});
			});
		}

		if(file.substr(-3) === 'mp4')
		{
			fetch(`${Config.mediaGate}/media/show?assetPath=${file}`, options)
			.then(response => response.blob())
			.then(response => {
				const src = URL.createObjectURL(response, {type: 'video/' + file.substr(-3)});
				this.args.mediaView = new Video({src});
			});
		}

		if(file.substr(-4) === 'html' || file.substr(-4) === 'json')
		{
			fetch(`${Config.mediaGate}/media/show?assetPath=${file}`, options)
			.then(response => response.blob())
			.then(response => {
				const src = URL.createObjectURL(response, {type: 'text/' + file.substr(-4)});
				this.args.mediaView = new Doc({src});
			});
		}
	}
}
