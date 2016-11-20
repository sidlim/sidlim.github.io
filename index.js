// Add stylesheet
var styles = document.createElement('link');
	document.head.appendChild(styles);
	styles.type = 'text/css';
	styles.rel = 'index.css';

// Add MathJax
var MathJaxSC = document.createElement('script');
	document.head.appendChild(MathJaxSC);
	MathJaxSC.type = 'text/javascript';
	MathJaxSC.src = 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML';

// Load pages.json
var pages;
	var xhr = new XMLHttpRequest();
	xhr.open('get', 'http://eyamil.github.io/pages.json',true);
	xhr.responseType = 'json';
	xhr.onload = function() {
		if (xhr.status = 200) {
			pages = xhr.response;
		}
		else { // Needs to throw a more clear error
			pages = null;
		}
	}
	xhr.send();
