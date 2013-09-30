function checkjava(){
    // Get the current url. Use it as the pass= argument to redirect back."
    var javawsInstalled = 0;  
    var javaws142Installed=0;
    var javaws150Installed=0;
    isIE = "false"; 
    if (navigator.mimeTypes && navigator.mimeTypes.length) { 
        x = navigator.mimeTypes['application/x-java-jnlp-file']; 
        if (x) { 
            javawsInstalled = 1; 
            javaws142Installed=1;
            javaws150Installed=1;
        } 
    } 
    else { 
        isIE = "true"; 
    } 
    console.log("Hi");
    var url = document.URL;
    if (javawsInstalled || (navigator.userAgent.indexOf("Gecko") !=-1)) {
        //document.write(tag);
        console.log("Java is installed");
    } else {
        console.log("Java is not installed");
        document.write("You don't have Java installed. Click ");
        document.write("<a href=http://java.sun.com/PluginBrowserCheck?  pass=" + url +" fail=http://java.sun.com/javase/downloads/ea.jsp>here</a> ");
        document.write("to download and install Java.");
    }}
    window.onload(checkjava());
