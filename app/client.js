const Login  = require('./Login').Login;
const Subscribe  = require('./Subscribe').Subscribe;
// const Sign   = require('./Sign').Sign;
// const Verify = require('./Verify').Verify;
const Challenge = require('./Challenge').Challenge;
const FileIndex = require('./FileIndex').FileIndex;

window.addEventListener('DOMContentLoaded', event => {
	(new Login).render(document.body);
	(new Subscribe).render(document.body);
	// (new Sign).render(document.body);
	// (new Verify).render(document.body);
	(new Challenge).render(document.body);
	(new FileIndex).render(document.body);
});
