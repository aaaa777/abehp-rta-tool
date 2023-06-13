let lastStartTime = new Date();
let lastEndTime = new Date();
let lastLoadTime = new Date();
var autoReloadButton = document.getElementById('enable-loop');

const formatDate = (date) => {
    // return ''
    //  + ('' + date.getUTCDate()) not working
    return ('00' + (date.getUTCDate() - 1)) + ":"
    + ('00' + date.getUTCHours()).slice(-2) + ":"
    + ('00' + date.getUTCMinutes()).slice(-2) + ":"
    + ('00' + date.getUTCSeconds()).slice(-2) + ":"
    + ('00' + date.getUTCMilliseconds()).slice(-3);
}

const updateClock = async () => {
    const strg = chrome.storage.local;
    const clock = document.getElementById('realtime-clock');
    lastStartTime = await strg.get(['lastStartTime']).then((result) => new Date(Number(result.lastStartTime)));
    lastEndTime = await strg.get(['lastEndTime']).then((result) => new Date(Number(result.lastEndTime)));
    lastLoadTime = await strg.get(['lastLoadTime']).then((result) => new Date(Number(result.lastLoadTime)));
    let status = await strg.get(['status']).then((result) => result.status);

    if (status === 'loading') {
        let nowLoadTime = new Date() - lastStartTime;
        console.debug('nowLoadTime: ', nowLoadTime);
        clock.innerText = formatDate(new Date(nowLoadTime));
        return;
    }

    if (status === 'loaded') {
        clock.innerText = formatDate(lastLoadTime);
        return;
    }
    
    // console.debug('lastStartTime: ', lastStartTime);
}

const toggleAutoReload = async () => {
    const strg = chrome.storage.local;
    // const autoReloadButton = document.getElementById('enable-loop');
    const autoReloadStatus = await strg.get(['autoReload']).then((result) => result.autoReload);
    if (autoReloadStatus === 'enabled') {
        strg.set({'autoReload': 'disabled'});
    } else {
        strg.set({'autoReload': 'enabled'});
    }
}

const reloadAutoReload = async () => {
    const strg = chrome.storage.local;
    const autoReloadStatus = await strg.get(['autoReload']).then((result) => result.autoReload);
    if (autoReloadStatus === 'enabled') {
        autoReloadButton.setAttribute('checked', 'checked');
    } else {
        autoReloadButton.removeAttribute('checked');
    }
    reloadAutoReload();
}

setInterval(updateClock, 47);
reloadAutoReload();

autoReloadButton.addEventListener('click', toggleAutoReload);
