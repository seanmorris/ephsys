export class Strings
{
	static ERR_NOTFOUND_WEB3 = () => `Web3 provider not found.`;
	
	static MSG_USER_WELCOME  = address => `Hello, ${address}.`;
	
	static MSG_SIG_VERIFIED  = address => `✓ Verified message from ${address}.`;
	static ERR_SIG_INVALID   = address => `× Signature corrupt or invalid!`;

}