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

		const loader = this.args.mediaView = new Loader;

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

		const Authorization = `Bearer ${JSON.stringify(Application.token)}`;
		const loader = this.args.mediaView = new Loader;

		const options = {
			credentials: 'include'
			, headers: { Authorization }
			, timeout: 7000
		};

		file = file.replace(/\.\//, '');

		const elicit = new Elicit(`${Config.mediaGate}/media/show?assetPath=${file}`, options);

		this.elicit = elicit;

		elicit.addEventListener('paused',    event => loader.args.dlSpeed = 'Paused ');
		elicit.addEventListener('firstByte', event => loader.args.forward = true);

		elicit.addEventListener('complete',  event => setTimeout(() => {

			const type = elicit.type.split(';').shift();

			const [category, extension] = type.split('/');

			if(category === 'image')
			{
				elicit.objectUrl().then(src => this.args.mediaView = new Image({src}));
			}

			if(category === 'audio')
			{
				elicit.objectUrl().then(src => this.args.mediaView = new Audio({src}));
			}

			if(category === 'video')
			{
				elicit.objectUrl().then(src => this.args.mediaView = new Video({src}));
			}

			if(category === 'text' || category === 'application')
			{
				elicit.objectUrl().then(src => this.args.mediaView = new Doc({src}));
			}

			this.elicit = null;
		}));

		let speedTimeout = null

		elicit.addEventListener('progress', event => {

			if(speedTimeout)
			{
				clearTimeout(speedTimeout);
			}

			speedTimeout = setTimeout(() => {
				if(!elicit.isPaused)
				{
					loader.args.dlSpeed = '0 KBps ';
				}
			}, 500);

			loader.args.received = Number(event.detail.received / 1024).toFixed(0);
			loader.args.length   = Number(elicit.length / 1024).toFixed(0);
			loader.args.done     = Number(event.detail.done * 100).toFixed(2);

			if(event.detail.done === 1)
			{
				loader.args.speed = 0.1515;
			}

			if(elicit.isPaused)
			{
				return;
			}

			if(elicit.speed < 1024)
			{
				loader.args.dlSpeed = Number(elicit.speed).toFixed(2) + ' kBps ';
			}
			else
			{
				loader.args.dlSpeed = Number(elicit.speed / 1024).toFixed(2) + ' MBps ';
			}
		});

		elicit.addEventListener('fail', event => {
			if(this.args.mediaView)
			{
				this.args.mediaView.remove();
			}

			this.args.mediaView = null;
		});
	}

	closeMediaView(event)
	{
		if(this.elicit)
		{
			this.elicit.cancel();
		}

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
