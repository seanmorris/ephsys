import { rawquire } from 'rawquire/rawquire.macro';
import { Elicit   } from 'curvature/net/Elicit';
import { View     } from 'curvature/base/View';
import { Tag      } from 'curvature/base/Tag';

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

		Application.bindTo('token', v => {
			if(!v) { return };

			new Elicit(`${Config.mediaGate}/media`).json().then(
				response => this.args.files = response.map(f => f.replace(/\.\//, ''))
			);
		});

		this.onFrame(() => {
			if(!Application.challenge)
			{
				this.args.validTimer = 0;
				return;
			}

			const tokenExpiry    = Application.challenge.validThru;
			this.args.validTimer = Math.max( 0, tokenExpiry - (Date.now() / 1000) ).toFixed(2);

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
		const options  = {credentials: 'include', timeout: 10000, headers: { Authorization }};
		const assetUrl = `${Config.mediaGate}/media/show?assetPath=${file}`;
		const loader   = this.args.mediaView = new Loader;
		const elicit   = this.elicit = new Elicit(assetUrl, options);

		elicit.addEventListener('firstByte', event => loader.args.forward = true);
		elicit.addEventListener('paused',    event => loader.args.dlSpeed = 'Paused ');
		elicit.addEventListener('fail',      event => this.closeMediaView());

		elicit.addEventListener('complete', event => this.onTimeout(500, () => {

			this.elicit = null;

			const type = elicit.type.split(';').shift();
			const [category, extension] = type.split('/');

			elicit.objectUrl().then(src => {

				switch(category)
				{
					case 'text': case 'application':
						this.args.mediaView = new Doc({src});
						break;

					case 'image':
						this.args.mediaView = new Image({src});
						break;

					case 'audio':
						this.args.mediaView = new Audio({src});
						break;

					case 'video':
						this.args.mediaView = new Video({src});
						break;

					default:
						new Tag('<a download>').attr({'href': src}).click();

				}
			});
		}));

		let speedTimeout = null

		elicit.addEventListener('progress', event => {

			speedTimeout && clearTimeout(speedTimeout);
			speedTimeout = this.onTimeout(750, ()=> elicit.isPaused || (loader.args.dlSpeed = '0 KBps '));

			if(elicit.isPaused)
			{ return; }

			loader.args.received = (event.detail.received / 1024).toFixed(0);
			loader.args.length   = (elicit.length / 1024).toFixed(0);
			loader.args.done     = (event.detail.done * 100).toFixed(2);

			if(elicit.speed < 1024)
			{
				loader.args.dlSpeed = (elicit.speed).toFixed(2) + ' kBps ';
			}
			else
			{
				loader.args.dlSpeed = (elicit.speed / 1024).toFixed(2) + ' MBps ';
			}
		});
	}

	closeMediaView(event)
	{
		if(event && !event.target.matches('div.media-view'))
		{ return; }

		this.elicit && this.elicit.cancel();

		if(this.args.mediaView)
		{
			this.args.mediaView.remove();
			this.args.mediaView = null;
		}
	}

	wheelMediaView(event)
	{
		event.preventDefault();
	}
}
