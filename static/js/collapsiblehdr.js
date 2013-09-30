function toggle2(showHideDiv, switchTextDiv) {
    var ele = document.getElementById(showHideDiv);
    var text = document.getElementById(switchTextDiv);
    if(ele.style.display == "block") {
        ele.style.display = "none";
        text.innerHTML = "+ open";
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "- close";
    }
}

