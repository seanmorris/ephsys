import { rawquire } from 'rawquire/rawquire.macro';
import { Elicit } from 'curvature/net/Elicit';
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
				0, Application.challenge.validThru - (Date.now() / 1000)).toFixed(2)
			);

			if(!this.args.validTimer)
			{
				Application.solved = false;
				this.args.files = [];
			}
		});		
	}

	getAsset(event, file)
	{
		event.preventDefault();

		const loader = this.args.mediaView = new Loader;

		file = file.replace(/\.\//, '');

		const options = {
			credentials: 'include'
			, headers: { Authorization: `Bearer ${JSON.stringify(Application.token)}` }
		};

		loader.args.received = 0;
		loader.args.length   = 0;
		loader.args.done     = 0;

		const onProgress = event => {
			loader.args.received = Number(event.detail.received / 1024).toFixed(0);
			loader.args.length   = Number(event.detail.length / 1024).toFixed(0);
			loader.args.done     = Number(event.detail.done * 100).toFixed(4);
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
			const elicit = new Elicit(`${Config.mediaGate}/media/show?assetPath=${file}`, options);

			elicit.objectUrl().then(src => this.args.mediaView = new Audio({src}));

			elicit.addEventListener('progress', onProgress);
		}

		if(file.substr(-3) === 'mp4')
		{
			const elicit = new Elicit(`${Config.mediaGate}/media/show?assetPath=${file}`, options);

			elicit.objectUrl().then(src => this.args.mediaView = new Video({src}));

			elicit.addEventListener('progress', onProgress);
		}

		if(file.substr(-4) === 'html' || file.substr(-4) === 'json')
		{
			const elicit = new Elicit(`${Config.mediaGate}/media/show?assetPath=${file}`, options);

			elicit.objectUrl().then(src => this.args.mediaView = new Doc({src}));

			elicit.addEventListener('progress', onProgress);
		}

		if(file.substr(-3) === 'pdf')
		{
			const elicit = new Elicit(`${Config.mediaGate}/media/show?assetPath=${file}`, options);

			elicit.objectUrl().then(src => this.args.mediaView = new Doc({src}));

			elicit.addEventListener('progress', onProgress);
		}
	}

	closeMediaView(event)
	{
		if(!event.target.matches('div.media-view'))
		{
			return;
		}

		if(this.args.mediaView)
		{
			this.args.mediaView.remove();
		}

		this.args.mediaView = null;
	}
}
