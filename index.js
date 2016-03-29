/* Onload stuff. */
var postdata = null;

window.addEventListener('load', loader);
    function loader() {
        var menu = document.createElement('div');
        document.body.appendChild(menu);
        menu.id = 'menu';
        var Mspacing = document.createElement('div');
        menu.appendChild(Mspacing);
        Mspacing.className = 'menuspacing';
        
        request = new XMLHttpRequest();
        request.open('GET', 'posts.json', true);
        
        request.onload = function() {
            if (request.status >= 200 && request.status < 400){
                // Success!
                var data = JSON.parse(request.responseText);
                postdata = data;
            } else {
                // We reached our target server, but it returned an error
        }
    };
    
    request.onerror = function() {
        // There was a connection error of some sort
    };
    
    request.send();
    }
