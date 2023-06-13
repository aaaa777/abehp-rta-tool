const strg = chrome.storage.local;

const abeHPButton = document.querySelector('a[href="http://abehiroshi.la.coocan.jp/"]');

abeHPButton.addEventListener('click', async (e) => {
    await strg.set({'lastStartTime': new Date().getTime().toString(), 'status': 'loading'});
    console.log('abehp timer started');
});