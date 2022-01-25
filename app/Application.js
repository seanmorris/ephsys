import { Bindable } from 'curvature/base/Bindable';
import { Strings } from './Strings';
import { Config } from './Config';
	
export const Application = window.Application = Bindable.make(class {

	userAddress;
	_web3;
	_brainTree;
	message;
	price;

	static get web3()
	{
		Application._web3 = Application._web3 || new Web3(Application.ethereum);

		return Application._web3
	}
	
	static get ethereum()
	{
		if(!'ethereum' in window)
		{
			console.warn(Strings.ERROR_NOTFOUND_WEB3());
			return;
		}

		return ethereum;
	}

	static login()
	{
		return Application.ethereum
		.request({method: 'eth_requestAccounts'})
		.then(result => Application.onLoginSuccess(result))
		.catch(error => Application.onLoginFailed(error));	
	}

	static onLoginSuccess([userAddress])
	{
		Application.userAddress = userAddress;
	}

	static onLoginFailed(err)
	{
		Application.userAddress = null;

		console.warn(err);
	}

	static sign(message)
	{
		const hex = Application.web3.utils.utf8ToHex(message);

		Application.message = message;

		return Application.ethereum
		.request({ method: 'personal_sign', params: [hex, Application.userAddress] })
		.then(result => Application.onSignSuccess(result))
		.catch(error => Application.onSignFailed(error));
	}

	static onSignSuccess(result)
	{
		Application.signature = result;

		return result;
	}

	static onSignFailed(error)
	{
		console.warn(error);
	}

	static verify(message, signature)
	{
		const encoded = Application.web3.utils.utf8ToHex(message);

		return Application.web3.eth.personal.ecRecover(encoded, signature)
		.then(result => Application.onVerifySuccess(result))
		.catch(error => Application.onVerifyFailed(error));
	}

	static onVerifySuccess(result)
	{
		console.log(result);

		return result;
	}

	static onVerifyFailed(error)
	{
		console.warn(error);
	}

	static getPrice()
	{
		return fetch(`${Config.mediaGate}/purchase/price`)
		.then(response => response.json())
		.then(price => {
			return Application.price = price;
		})
	}

	static subscribe()
	{
		if(!Application.price)
		{
			console.warn('Load price data before subscribing.')

			return;
		}

		const web3 = Application.web3;

		web3.eth.sendTransaction(
			{
				value:  Application.web3.utils.toWei(Number(Application.price.ETH).toFixed(18), "ether")
	            , from: Application.userAddress
				, to:   '0xb69d279409d0f232fdb6eaefea6cdf67fa504c00'
			}
			, (err, res) => console.log(err, res)
		);
	}

	static initBrainTree()
	{

		const selector = '#cc-input';
		const button = document.querySelector('#cc-submit');

		fetch(`${Config.mediaGate}/purchase/ccToken`)
		.then(r => r.text())
		.then(authorization => braintree.dropin.create({authorization, selector}, (err, instance) => {
				Application._brainTree = instance;
				console.log(instance);
				button.addEventListener('click', () => Application.subscribeWithBrainTree())
			}
		));

	}

	static subscribeWithBrainTree(nonce)
	{
		Application._brainTree.requestPaymentMethod((err, payload) => {
			const method = 'POST';
			const body   = new FormData;

			body.append('nonce',   payload.nonce);
			body.append('address', Application.userAddress);
			body.append('amount',  '5.00');

			const options = {method, body};

			fetch(`${Config.mediaGate}/purchase/ccPay`, options)
			.then(response => response.text())
			.then(response => {

				if(response === 'OK!')
				{
					console.log(response);

					Application._brainTree = null;
				}

			});
		});
	}

	static getSubscription()
	{
		return fetch(`${Config.mediaGate}/purchase/status/${Application.userAddress}`)
		.then(response => response.json())
		.then(subscription => {
			console.log(subscription);
			return subscription;
		})
	}
});