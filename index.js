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
			var menus = document.getElementsByClassName('menu');
				Array.prototype.forEach.call(menus, makeMenu);
		}
		else { // Needs to throw a more clear error
			pages = null;
		}
	}
	function makeMenu(menuElement) {
		var list = document.createElement('ul');
			menuElement.appendChild(list);
		var labels = Object.keys(pages.menu);
		for (i = 0; i < labels.length; i++) {
			var menuEl = document.createElement('li');
				list.appendChild(menuEl);
				var link = document.createElement('a');
				link.href = pages.menu[labels[i]].url;
				link.innerText = labels[i];
				menuEl.appendChild(link);

		}
	}
	xhr.send();


// Add MathJax
var MathJaxSC = document.createElement('script');
	document.head.appendChild(MathJaxSC);
	MathJaxSC.type = 'text/javascript';
	MathJaxSC.src = 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML';
