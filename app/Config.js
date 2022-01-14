export const Config = {
	mediaGate: location.origin.match(/.seanmorr.is$/)
		? '//media-gate.herokuapp.com'
		: '//127.0.0.1.nip.io:2020'
}