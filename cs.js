
const strg = chrome.storage.local;
// console.debug(strg);
const sleep = (second) => sleepMsec(second * 1000);
const sleepMsec = (msec) => new Promise(resolve => setTimeout(resolve, msec));

const formatDate = (date) => {
    return ((date.getUTCDate() - 1) > 0 ? ('00' + (date.getUTCDate() - 1)).slice(-2) + ":" : '')
        + ('00' + date.getUTCHours()).slice(-2) + ":"
        + ('00' + date.getMinutes()).slice(-2) + ":"
        + ('00' + date.getSeconds()).slice(-2) + ":"
        + ('00' + date.getMilliseconds()).slice(-3);
}

const setLastStartTime = () => {
    strg.set({'lastStartTime': new Date().getTime().toString()}).then(() => console.debug('start time set'));
    strg.set({'status': 'loading'});
}

const setLastEndTime = () => {
    strg.set({'lastEndTime': new Date().getTime().toString()}).then(() => console.debug('end time set'));
    strg.set({'status': 'loaded'});
}

const getLastStartTime = async () => {
    return await strg.get(['lastStartTime']).then((result) => new Date(Number(result.lastStartTime)));
}

const getLastEndTime = async () => {
    return await strg.get(['lastEndTime']).then((result) => new Date(Number(result.lastEndTime)));
}

const getLastLoadTime = async () => {
    return await getLastLoadMsec().then((msec) => new Date(msec));
}

const getLastLoadMsec = async () => {
    startTime = await getLastStartTime();
    endTime = await getLastEndTime();
    return endTime - startTime;
}

const getBestTime = async () => {
    return await strg.get(['bestTime']).then((result) => new Date(Number(result.bestTime)));
}

const isStatusLoading = async () => {
    return await strg.get(['status']).then((res) => {
        r = (res.status === 'loading');
        console.log('status: ', r);
        return r;
    });
}

const init = async () => {
    strg.set({'lastStartTime': new Date().getTime().toString(), 'status': 'loading'});
    console.log('init time: ', await getLastStartTime());
}

const loaded = async () => {
    const isLoading = await strg.get(['status']).then((result) => {
        if (result.status === 'loading') {
            console.log('loading page ended');
            return true;
        }
        console.log('missing start time');
        return false;
    });
    
    
    if (isLoading) {
        await strg.set({'lastEndTime': new Date().getTime().toString(), 'status': 'loaded'}).then(async () => {
            await strg.get(['lastStartTime', 'lastEndTime']).then(async (result) => {
                const startTime = new Date(Number(result.lastStartTime));
                const endTime = new Date(Number(result.lastEndTime));
                console.log('start time: ', startTime);
                console.log('end time: ', endTime);
                
                await strg.set({'lastLoadTime': (endTime - startTime).toString()});
                console.log('load time: ', formatDate(new Date(endTime - startTime)));
            });
        });
        
        await strg.get(['bestTime']).then(async (result) => {

            if (result.bestTime === undefined) {
                strg.set({'bestTime': (await getLastLoadMsec()).toString()});
                console.log('best time: ', formatDate(await getBestTime()));
                return;
            }

            if (Number(result.bestTime) < await getLastLoadMsec()) {
                strg.set({'bestTime': (await getLastLoadMsec()).toString()});
                console.log('best time: ', formatDate(await getBestTime()));
                return;
            }
        });
    }

    strg.get(['autoReload']).then(async (result) => {
        if (result.autoReload === 'enabled') {
            console.log('auto reload in 5 seconds...');

            await sleep(5);
            // レギュ外記録になるがlastStartTimeをセットする
            setLastStartTime();
            location.reload();
        }
    });
}

//init();
window.addEventListener('load', loaded);