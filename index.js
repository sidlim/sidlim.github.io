// Base HREF fixing, so that we can run this locally without issues:
var host = window.location.host;
	if (window.location.host == '') {
		host = window.location.pathname
	}
	document.write('<base href="'+ window.location.protocol + '//' + host + '" >');

// Add stylesheet
var styles = document.createElement('link');
	document.head.appendChild(styles);
	styles.rel = 'stylesheet';
	styles.type = 'text/css';
	styles.href = 'index.css';

// Load pages.json
var pages;
	var xhr = new XMLHttpRequest();
	xhr.open('get', 'http://eyamil.github.io/pages.json',true);
	xhr.responseType = 'json';
	xhr.onload = function() {
		if (xhr.status = 200) {
			pages = xhr.response;
			var menus = document.getElementsByClassName('menucontainer');
				Array.prototype.forEach.call(menus, makeMenu);
		}
		else { // Needs to throw a more clear error
			pages = null;
		}
	}
	function makeMenu(menuElement) {
		var list = document.createElement('ul');
			menuElement.appendChild(list);
			list.className = 'menu';
		var labels = Object.keys(pages.directories);
		for (i = 0; i < labels.length; i++) {
			var menuEl = document.createElement('li');
				list.appendChild(menuEl);
				menuEl.className = 'menuelement';
				var link = document.createElement('a');
				link.href = pages.directories[labels[i]].url;
				link.innerText = labels[i];
				link.className = 'menulink';
				menuEl.appendChild(link);

		}
	}
	xhr.send();


// Add MathJax
var MathJaxSC = document.createElement('script');
	document.head.appendChild(MathJaxSC);
	MathJaxSC.type = 'text/javascript';
	MathJaxSC.src = 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML';
