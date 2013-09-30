Clazz.declarePackage ("java.util.zip");
Clazz.load (["com.jcraft.jzlib.CRC32"], "java.util.zip.CRC32", null, function () {
c$ = Clazz.declareType (java.util.zip, "CRC32", com.jcraft.jzlib.CRC32);
Clazz.defineMethod (c$, "update", 
function (ret) {
this.updateRange (ret, 0, ret.length);
}, "~A");
});
