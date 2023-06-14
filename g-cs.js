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
    abeHPButton = document.querySelector('a[href="http://abehiroshi.la.coocan.jp/"]');
    if(abeHPButton !== null) {
        const linkPopupEle = document.createElement('div');
        linkPopupEle.innerText = '阿部寛のホームページ計測 準備完了';
        abeHPButton.parentElement.appendChild(linkPopupEle);
        console.log('abeHP timer ready');
    }
});