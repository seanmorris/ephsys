import { Bindable } from 'curvature/base/Bindable';
import { Strings } from './Strings';
	
export const Application = window.Application = Bindable.make(class {

	userAddress;
	_web3;
	message;

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
		// console.log(message, signature);

		// console.log(Application.web3.eth.personal.ecRecover(
		// 	Application.web3.utils.utf8ToHex(message)
		// 	, signature
		// ));


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
});