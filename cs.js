
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
        console.info('[Abehp timer] status: ', r);
        return r;
    });
}

let isLastStatusMoving;
const islastStatusMovingCheck = async () => {
    if(isLastStatusMoving) {
        return isLastStatusMoving;
    }
    isLastStatusMoving = await strg.get(['status']).then((result) => result.status === 'moving');
    return isLastStatusMoving;
}
const init = async () => {
    if(!islastStatusMovingCheck()) {
        console.info('[Abehp timer] last status is not moving, timer not started');
        return;
    }
    console.info('[Abehp timer] last page is google, status set loading');
    strg.set({'status': 'loading'});
    console.info('[Abehp timer] init time: ', await getLastStartTime());
}

const loaded = async () => {
    
    const isLoading = await strg.get(['status']).then((result) => {
        if (result.status === 'loading' || result.status === 'moving') {
            console.info('[Abehp timer] loading page ended');
            return true;
        }

        console.info('[Abehp timer] missing start time');
        if(result.status === 'stopped') {
            console.info('[Abehp timer] timer already stopped');
        }
        return false;
    });
    
    if(!islastStatusMovingCheck()) {
        console.log('[Abehp timer] but last status is not moving, record not saved');
        return;
    }
    
    if (isLoading || isLastStatusMoving == undefined) {
        await strg.set({'lastEndTime': new Date().getTime().toString(), 'status': 'loaded'}).then(async () => {
            await strg.get(['lastStartTime', 'lastEndTime']).then(async (result) => {
                const startTime = new Date(Number(result.lastStartTime));
                const endTime = new Date(Number(result.lastEndTime));
                console.info('[Abehp timer] start time: ', startTime);
                console.info('[Abehp timer] end time: ', endTime);
                
                await strg.set({'lastLoadTime': (endTime - startTime).toString()});
                console.info('[Abehp timer] load time: ', formatDate(new Date(endTime - startTime)));
            });
        });
        
        await strg.get(['bestTime']).then(async (result) => {

            if (result.bestTime === undefined) {
                strg.set({'bestTime': (await getLastLoadMsec()).toString()});
                console.info('[Abehp timer] best time: ', formatDate(await getBestTime()));
                return;
            }

            if (Number(result.bestTime) < await getLastLoadMsec()) {
                strg.set({'bestTime': (await getLastLoadMsec()).toString()});
                console.info('[Abehp timer] best time: ', formatDate(await getBestTime()));
                return;
            }
        });
    }

    strg.get(['autoReload']).then(async (result) => {
        if (result.autoReload === 'enabled') {
            console.info('[Abehp timer] auto reload in 5 seconds...');

            await sleep(5);
            // レギュ外記録になるがlastStartTimeをセットする
            strg.set({'lastStartTime': new Date().getTime().toString(), 'status': 'moving'});
            location.reload();
        }
    });
}

init();
window.addEventListener('load', loaded);