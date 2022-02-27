$(document).ready(function() {
	document.addEventListener('deviceready', function () {
        // Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);
	}, false);
});
function onChange(tabId) {
    let node = document.getElementById("panel" + tabId);
    const isHide = node.className === "panel-hide" ? true : false;

    if (isHide) {
        // set panel visible
        node.className = "panel-show"

        // change icon
        let parent = document.getElementsByClassName("s-text-event")[tabId - 1];
        parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-dash-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z" />
        </svg>`

    } else {
        // set panel visible
        node.className = "panel-hide"

        // change icon
        let parent = document.getElementsByClassName("s-text-event")[tabId - 1];
        parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
        </svg>`
    }
}