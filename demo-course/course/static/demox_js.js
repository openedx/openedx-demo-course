/**
 * Description: DemoX utility functions
 * Author: John Swope
 * Date: September 25, 2023
 */



function expandHintFunction(a) {
    var x = document.getElementById("Hint-body-" + a);
    var y = document.getElementById("Hint-title-" + a).querySelector('.icon');

    if (x.style.height === "0px" || x.style.Height === "") {
        x.style.height = x.scrollHeight + "px";
        y.textContent = '-';
        x.classList.add("expanded");
    } else {
        x.style.height = "0px";
        y.textContent = '+';
        x.classList.remove("expanded");
    }
}

  