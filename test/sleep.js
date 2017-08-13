const sleep = ms => {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, ms);
    })
}

(async () => {
	console.log("start")
	await sleep(2000)
	console.log("end")
})()