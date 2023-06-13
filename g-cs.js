const strg = chrome.storage.local;
let abeHPButton;

window.addEventListener('click', async (e) => {
    if (abeHPButton === undefined) {
        return;
    }
    // e.preventDefault();
    // console.log(e.srcElement.parentElement.href);
    if(e.srcElement.parentElement.href === 'http://abehiroshi.la.coocan.jp/') {
        console.log('abehp timer started');
        
        await strg.set({'lastStartTime': new Date().getTime().toString(), 'status': 'loading'});
        return;
    }
});
    

window.addEventListener('load', async (e) => {
    console.log('abeHP timer ready');
    abeHPButton = document.querySelector('a[href="http://abehiroshi.la.coocan.jp/"]');
});