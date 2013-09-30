Clazz.declarePackage ("org.jmol.i18n");
Clazz.load (null, "org.jmol.i18n.GT", ["java.text.MessageFormat"], function () {
c$ = Clazz.declareType (org.jmol.i18n, "GT");
Clazz.makeConstructor (c$, 
function (la) {
}, "~S");
c$.getLanguage = Clazz.defineMethod (c$, "getLanguage", 
function () {
return "en_US";
});
c$.ignoreApplicationBundle = Clazz.defineMethod (c$, "ignoreApplicationBundle", 
function () {
});
c$.setDoTranslate = Clazz.defineMethod (c$, "setDoTranslate", 
function (TF) {
}, "~B");
c$.getDoTranslate = Clazz.defineMethod (c$, "getDoTranslate", 
function () {
return false;
});
c$._ = Clazz.defineMethod (c$, "_", 
function (string) {
return string;
}, "~S");
c$._ = Clazz.defineMethod (c$, "_", 
function (string, item) {
return org.jmol.i18n.GT.getString (string, [item]);
}, "~S,~S");
c$._ = Clazz.defineMethod (c$, "_", 
function (string, item) {
return org.jmol.i18n.GT.getString (string, [Integer.$valueOf (item)]);
}, "~S,~N");
c$._ = Clazz.defineMethod (c$, "_", 
function (string, objects) {
return org.jmol.i18n.GT.getString (string, objects);
}, "~S,~A");
c$._ = Clazz.defineMethod (c$, "_", 
function (string, t) {
return string;
}, "~S,~B");
c$._ = Clazz.defineMethod (c$, "_", 
function (string, item, t) {
return org.jmol.i18n.GT.getString (string, [item]);
}, "~S,~S,~B");
c$._ = Clazz.defineMethod (c$, "_", 
function (string, item, t) {
return org.jmol.i18n.GT.getString (string, [Integer.$valueOf (item)]);
}, "~S,~N,~B");
c$._ = Clazz.defineMethod (c$, "_", 
function (string, objects, t) {
return (objects == null ? string : org.jmol.i18n.GT.getString (string, objects));
}, "~S,~A,~B");
c$.getString = Clazz.defineMethod (c$, "getString", 
($fz = function (string, objects) {
return java.text.MessageFormat.format (string, objects);
}, $fz.isPrivate = true, $fz), "~S,~A");
});
