function storeUsername(){
    var username = document.getElementById('username').value
    window.localStorage.setItem('username', username)
}

function clearUsername() {
    window.localStorage.removeItem('username');
    const url = new URL(window.location.href);
    url.searchParams.delete('username');
    window.history.replaceState({}, '', url);
}

function sendReq(url) {
    console.debug('sendReq called with', url);
    
    let username = window.localStorage.getItem('username');
    let finalUrl = '/' + url;

    // Always append username if it exists
    if (username) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'username=' + encodeURIComponent(username);
    }

    // For POST requests that need the body
    if (url === 'create_action' || url === 'lgn_action' || url === 'logout') {
        const body = {};
        if (username) body.username = username;

        fetch(finalUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams(body).toString()
        })
        .then(res => res.text())
        .then(text => {
            document.open();
            document.write(text);
            document.close();
        })
        .catch(err => console.error(err));
        return;
    }

    // Fallback GET request
    fetch(finalUrl, { method: 'GET' })
        .then(res => {
            if (res.ok) window.location.href = finalUrl;
            else window.location.href = url + '.html';
        })
        .catch(() => window.location.href = url + '.html');
}
