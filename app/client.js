const Login  = require('./Login').Login;
const Sign   = require('./Sign').Sign;
const Verify = require('./Verify').Verify;

window.addEventListener('DOMContentLoaded', event => {
	(new Login).render(document.body);
	(new Sign).render(document.body);
	(new Verify).render(document.body);
});
