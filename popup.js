let lastStartTime = new Date();
let lastEndTime = new Date();
let lastLoadTime = new Date();
let bestTime;
const autoReloadButton = document.getElementById('enable-loop');
const stopRecordButton = document.getElementById('stop-record');

const formatDate = (date) => {
    // return ''
    //  + ('' + date.getUTCDate()) not working
    if(!date) {
        return '00:00:00.000';
    }

    return ((date.getUTCDate() - 1) > 0 ? ('00' + (date.getUTCDate() - 1)).slice(-2) + "d " : '')
        + ('00' + date.getUTCHours()).slice(-2) + ":"
        + ('00' + date.getMinutes()).slice(-2) + ":"
        + ('00' + date.getSeconds()).slice(-2) + "."
        + ('00' + date.getMilliseconds()).slice(-3);
}

const updateClock = async () => {
    const strg = chrome.storage.local;
    const clock = document.getElementById('realtime-clock');
    const bestTimeEle = document.getElementById('best-time');

    lastStartTime = await strg.get(['lastStartTime']).then((result) => new Date(Number(result.lastStartTime)));
    lastEndTime = await strg.get(['lastEndTime']).then((result) => new Date(Number(result.lastEndTime)));
    lastLoadTime = await strg.get(['lastLoadTime']).then((result) => new Date(Number(result.lastLoadTime)));
    bestTime = await strg.get(['bestTime']).then((result) => new Date(Number(result.bestTime)));

    let status = await strg.get(['status']).then((result) => result.status);

    console.debug('bestTime: ', bestTime);
    bestTimeEle.innerText = formatDate(bestTime);

    if (status === 'loading') {
        let nowLoadTime = new Date() - lastStartTime;
        console.debug('nowLoadTime: ', nowLoadTime);
        clock.innerText = formatDate(new Date(nowLoadTime));
        stopRecordButton.disabled = false;
        return;
    }

    if (status === 'loaded') {
        clock.innerText = formatDate(lastLoadTime);
        stopRecordButton.disabled = true;
        return;
    }

    if (status === 'stopped') {
        clock.innerText = "記録中止";
        stopRecordButton.disabled = true;
        return;
    }

    clock.innerText = "データなし"
    stopRecordButton.disabled = true;

    
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

const stopRecording = async () => {
    const strg = chrome.storage.local;
    strg.get(['status']).then((result) => {
        if (result.status === 'loading') {
            strg.set({'status': 'stopped'});
        }
    });
}

setInterval(updateClock, 47);
reloadAutoReload();

autoReloadButton.addEventListener('click', toggleAutoReload);
stopRecordButton.addEventListener('click', stopRecording);
