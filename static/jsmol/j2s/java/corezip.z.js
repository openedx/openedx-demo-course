// 
//// org\jmol\api\JmolZipUtility.js 
// 
Clazz.declarePackage ("org.jmol.api");
Clazz.declareInterface (org.jmol.api, "JmolZipUtility");
// 
//// org\jmol\io2\ZipUtil.js 
// 
Clazz.declarePackage ("org.jmol.io2");
Clazz.load (["org.jmol.api.JmolZipUtility"], "org.jmol.io2.ZipUtil", ["java.io.BufferedInputStream", "$.BufferedReader", "$.ByteArrayInputStream", "$.ByteArrayOutputStream", "$.FileInputStream", "$.FileOutputStream", "$.StringReader", "java.lang.Character", "$.Long", "java.util.ArrayList", "$.Date", "$.Hashtable", "$.StringTokenizer", "java.util.zip.CRC32", "$.GZIPInputStream", "$.ZipEntry", "$.ZipInputStream", "$.ZipOutputStream", "org.jmol.adapter.smarter.AtomSetCollection", "org.jmol.api.Interface", "$.JmolViewer", "org.jmol.io.JmolBinary", "org.jmol.io2.JmolZipInputStream", "org.jmol.util.Escape", "$.Logger", "$.Parser", "$.StringXBuilder", "$.TextFormat", "org.jmol.viewer.FileManager", "$.JmolConstants", "$.Viewer"], function () {
c$ = Clazz.declareType (org.jmol.io2, "ZipUtil", null, org.jmol.api.JmolZipUtility);
Clazz.makeConstructor (c$, 
function () {
});
Clazz.overrideMethod (c$, "newZipInputStream", 
function (is) {
return org.jmol.io2.ZipUtil.newZIS (is);
}, "java.io.InputStream");
c$.newZIS = Clazz.defineMethod (c$, "newZIS", 
($fz = function (is) {
return (Clazz.instanceOf (is, org.jmol.api.ZInputStream) ? is : Clazz.instanceOf (is, java.io.BufferedInputStream) ?  new org.jmol.io2.JmolZipInputStream (is) :  new org.jmol.io2.JmolZipInputStream ( new java.io.BufferedInputStream (is)));
}, $fz.isPrivate = true, $fz), "java.io.InputStream");
Clazz.overrideMethod (c$, "getAllZipData", 
function (is, subfileList, name0, binaryFileList, fileData) {
org.jmol.io2.ZipUtil.getAllZipDataStatic (is, subfileList, name0, binaryFileList, fileData);
}, "java.io.InputStream,~A,~S,~S,java.util.Map");
c$.getAllZipDataStatic = Clazz.defineMethod (c$, "getAllZipDataStatic", 
($fz = function (is, subfileList, name0, binaryFileList, fileData) {
var zis = org.jmol.io2.ZipUtil.newZIS (is);
var ze;
var listing =  new org.jmol.util.StringXBuilder ();
binaryFileList = "|" + binaryFileList + "|";
var prefix = org.jmol.util.TextFormat.join (subfileList, '/', 1);
var prefixd = null;
if (prefix != null) {
prefixd = prefix.substring (0, prefix.indexOf ("/") + 1);
if (prefixd.length == 0) prefixd = null;
}try {
while ((ze = zis.getNextEntry ()) != null) {
var name = ze.getName ();
if (prefix != null && prefixd != null && !(name.equals (prefix) || name.startsWith (prefixd))) continue;
listing.append (name).appendC ('\n');
var sname = "|" + name.substring (name.lastIndexOf ("/") + 1) + "|";
var asBinaryString = (binaryFileList.indexOf (sname) >= 0);
var bytes = org.jmol.io.JmolBinary.getStreamBytes (zis, ze.getSize ());
var str;
if (asBinaryString) {
str = org.jmol.io2.ZipUtil.getBinaryStringForBytes (bytes);
name += ":asBinaryString";
} else {
str = org.jmol.io.JmolBinary.fixUTF (bytes);
}str = "BEGIN Directory Entry " + name + "\n" + str + "\nEND Directory Entry " + name + "\n";
fileData.put (name0 + "|" + name, str);
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
fileData.put ("#Directory_Listing", listing.toString ());
}, $fz.isPrivate = true, $fz), "java.io.InputStream,~A,~S,~S,java.util.Map");
c$.getBinaryStringForBytes = Clazz.defineMethod (c$, "getBinaryStringForBytes", 
($fz = function (bytes) {
var ret =  new org.jmol.util.StringXBuilder ();
for (var i = 0; i < bytes.length; i++) ret.append (Integer.toHexString (bytes[i] & 0xFF)).appendC (' ');

return ret.toString ();
}, $fz.isPrivate = true, $fz), "~A");
Clazz.overrideMethod (c$, "getZipFileContents", 
function (bis, list, listPtr, asBufferedInputStream) {
var ret;
if (list == null || listPtr >= list.length) return this.getZipDirectoryAsStringAndClose (bis);
var fileName = list[listPtr];
var zis =  new java.util.zip.ZipInputStream (bis);
var ze;
try {
var isAll = (fileName.equals ("."));
if (isAll || fileName.lastIndexOf ("/") == fileName.length - 1) {
ret =  new org.jmol.util.StringXBuilder ();
while ((ze = zis.getNextEntry ()) != null) {
var name = ze.getName ();
if (isAll || name.startsWith (fileName)) ret.append (name).appendC ('\n');
}
var str = ret.toString ();
if (asBufferedInputStream) return  new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (str.getBytes ()));
return str;
}var asBinaryString = false;
if (fileName.indexOf (":asBinaryString") > 0) {
fileName = fileName.substring (0, fileName.indexOf (":asBinaryString"));
asBinaryString = true;
}while ((ze = zis.getNextEntry ()) != null) {
if (!fileName.equals (ze.getName ())) continue;
var bytes = org.jmol.io.JmolBinary.getStreamBytes (zis, ze.getSize ());
if (org.jmol.io.JmolBinary.isZipFile (bytes)) return this.getZipFileContents ( new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes)), list, ++listPtr, asBufferedInputStream);
if (asBufferedInputStream) return  new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes));
if (asBinaryString) {
ret =  new org.jmol.util.StringXBuilder ();
for (var i = 0; i < bytes.length; i++) ret.append (Integer.toHexString (bytes[i] & 0xFF)).appendC (' ');

return ret.toString ();
}return org.jmol.io.JmolBinary.fixUTF (bytes);
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
return "";
}, "java.io.BufferedInputStream,~A,~N,~B");
Clazz.overrideMethod (c$, "getZipFileContentsAsBytes", 
function (bis, list, listPtr) {
var ret =  Clazz.newByteArray (0, 0);
var fileName = list[listPtr];
if (fileName.lastIndexOf ("/") == fileName.length - 1) return ret;
try {
bis = org.jmol.io.JmolBinary.checkPngZipStream (bis);
var zis =  new java.util.zip.ZipInputStream (bis);
var ze;
while ((ze = zis.getNextEntry ()) != null) {
if (!fileName.equals (ze.getName ())) continue;
var bytes = org.jmol.io.JmolBinary.getStreamBytes (zis, ze.getSize ());
if (org.jmol.io.JmolBinary.isZipFile (bytes) && ++listPtr < list.length) return this.getZipFileContentsAsBytes ( new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes)), list, listPtr);
return bytes;
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
return ret;
}, "java.io.BufferedInputStream,~A,~N");
Clazz.overrideMethod (c$, "getZipDirectoryAsStringAndClose", 
function (bis) {
var sb =  new org.jmol.util.StringXBuilder ();
var s =  new Array (0);
try {
s = this.getZipDirectoryOrErrorAndClose (bis, false);
bis.close ();
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
org.jmol.util.Logger.error (e.getMessage ());
} else {
throw e;
}
}
for (var i = 0; i < s.length; i++) sb.append (s[i]).appendC ('\n');

return sb.toString ();
}, "java.io.BufferedInputStream");
Clazz.overrideMethod (c$, "getZipDirectoryAndClose", 
function (bis, addManifest) {
var s =  new Array (0);
try {
s = this.getZipDirectoryOrErrorAndClose (bis, addManifest);
bis.close ();
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
org.jmol.util.Logger.error (e.getMessage ());
} else {
throw e;
}
}
return s;
}, "java.io.BufferedInputStream,~B");
Clazz.defineMethod (c$, "getZipDirectoryOrErrorAndClose", 
($fz = function (bis, addManifest) {
bis = org.jmol.io.JmolBinary.checkPngZipStream (bis);
var v =  new java.util.ArrayList ();
var zis =  new java.util.zip.ZipInputStream (bis);
var ze;
var manifest = null;
while ((ze = zis.getNextEntry ()) != null) {
var fileName = ze.getName ();
if (addManifest && org.jmol.io2.ZipUtil.isJmolManifest (fileName)) manifest = org.jmol.io2.ZipUtil.getZipEntryAsString (zis);
 else if (!fileName.startsWith ("__MACOS")) v.add (fileName);
}
zis.close ();
if (addManifest) v.add (0, manifest == null ? "" : manifest + "\n############\n");
return v.toArray ( new Array (v.size ()));
}, $fz.isPrivate = true, $fz), "java.io.BufferedInputStream,~B");
c$.getZipEntryAsString = Clazz.defineMethod (c$, "getZipEntryAsString", 
($fz = function (is) {
return org.jmol.io.JmolBinary.fixUTF (org.jmol.io.JmolBinary.getStreamBytes (is, -1));
}, $fz.isPrivate = true, $fz), "java.io.InputStream");
c$.isJmolManifest = Clazz.defineMethod (c$, "isJmolManifest", 
($fz = function (thisEntry) {
return thisEntry.startsWith ("JmolManifest");
}, $fz.isPrivate = true, $fz), "~S");
Clazz.overrideMethod (c$, "cacheZipContents", 
function (bis, fileName, cache) {
var zis = this.newZipInputStream (bis);
var ze;
var listing =  new org.jmol.util.StringXBuilder ();
var n = 0;
try {
while ((ze = zis.getNextEntry ()) != null) {
var name = ze.getName ();
listing.append (name).appendC ('\n');
var nBytes = ze.getSize ();
var bytes = org.jmol.io.JmolBinary.getStreamBytes (zis, nBytes);
n += bytes.length;
cache.put (fileName + "|" + name, bytes);
}
zis.close ();
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
try {
zis.close ();
} catch (e1) {
if (Clazz.exceptionOf (e1, java.io.IOException)) {
} else {
throw e1;
}
}
return null;
} else {
throw e;
}
}
org.jmol.util.Logger.info ("ZipUtil cached " + n + " bytes from " + fileName);
return listing.toString ();
}, "java.io.BufferedInputStream,~S,java.util.Map");
Clazz.overrideMethod (c$, "getGzippedBytesAsString", 
function (bytes) {
return org.jmol.io2.ZipUtil.staticGetGzippedBytesAsString (bytes);
}, "~A");
c$.staticGetGzippedBytesAsString = Clazz.defineMethod (c$, "staticGetGzippedBytesAsString", 
function (bytes) {
try {
var is =  new java.io.ByteArrayInputStream (bytes);
do {
is =  new java.io.BufferedInputStream ( new java.util.zip.GZIPInputStream (is, 512));
} while (org.jmol.io.JmolBinary.isGzipS (is));
var s = org.jmol.io2.ZipUtil.getZipEntryAsString (is);
is.close ();
return s;
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return "";
} else {
throw e;
}
}
}, "~A");
Clazz.defineMethod (c$, "getGzippedInputStream", 
function (bytes) {
try {
var is =  new java.io.ByteArrayInputStream (bytes);
do {
is =  new java.io.BufferedInputStream ( new java.util.zip.GZIPInputStream (is, 512));
} while (org.jmol.io.JmolBinary.isGzipS (is));
return is;
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return null;
} else {
throw e;
}
}
}, "~A");
Clazz.overrideMethod (c$, "newGZIPInputStream", 
function (bis) {
return  new java.util.zip.GZIPInputStream (bis, 512);
}, "java.io.BufferedInputStream");
Clazz.overrideMethod (c$, "addPngFileBytes", 
function (name, ret, iFile, crcMap, isSparDir, newName, ptSlash, v) {
var crc =  new java.util.zip.CRC32 ();
crc.update (ret);
var crcValue = Long.$valueOf (crc.getValue ());
if (crcMap.containsKey (crcValue)) {
newName = crcMap.get (crcValue);
} else {
if (isSparDir) newName = newName.$replace ('.', '_');
if (crcMap.containsKey (newName)) {
var pt = newName.lastIndexOf (".");
if (pt > ptSlash) newName = newName.substring (0, pt) + "[" + iFile + "]" + newName.substring (pt);
 else newName = newName + "[" + iFile + "]";
}v.add (name);
v.add (newName);
v.add (ret);
crcMap.put (crcValue, newName);
}return newName;
}, "~S,~A,~N,java.util.Hashtable,~B,~S,~N,java.util.List");
Clazz.overrideMethod (c$, "writeZipFile", 
function (fm, viewer, outFileName, fileNamesAndByteArrays, msg) {
var buf =  Clazz.newByteArray (1024, 0);
var nBytesOut = 0;
var nBytes = 0;
org.jmol.util.Logger.info ("creating zip file " + (outFileName == null ? "" : outFileName) + "...");
var fullFilePath = null;
var fileList = "";
try {
var bos = (outFileName == null || outFileName.startsWith ("http://") ?  new java.io.ByteArrayOutputStream () : null);
var os =  new java.util.zip.ZipOutputStream (bos == null ?  new java.io.FileOutputStream (outFileName) : bos);
for (var i = 0; i < fileNamesAndByteArrays.size (); i += 3) {
var fname = fileNamesAndByteArrays.get (i);
var bytes = null;
if (fname.indexOf ("file:/") == 0) {
fname = fname.substring (5);
if (fname.length > 2 && fname.charAt (2) == ':') fname = fname.substring (1);
} else if (fname.indexOf ("cache://") == 0) {
var data = fm.cacheGet (fname, false);
fname = fname.substring (8);
bytes = (org.jmol.util.Escape.isAB (data) ? data : (data).getBytes ());
}var fnameShort = fileNamesAndByteArrays.get (i + 1);
if (fnameShort == null) fnameShort = fname;
if (bytes == null) bytes = fileNamesAndByteArrays.get (i + 2);
var key = ";" + fnameShort + ";";
if (fileList.indexOf (key) >= 0) {
org.jmol.util.Logger.info ("duplicate entry");
continue;
}fileList += key;
os.putNextEntry ( new java.util.zip.ZipEntry (fnameShort));
var nOut = 0;
if (bytes == null) {
var $in =  new java.io.FileInputStream (fname);
var len;
while ((len = $in.read (buf, 0, 1024)) > 0) {
os.write (buf, 0, len);
nOut += len;
}
$in.close ();
} else {
os.write (bytes, 0, bytes.length);
nOut += bytes.length;
}nBytesOut += nOut;
os.closeEntry ();
org.jmol.util.Logger.info ("...added " + fname + " (" + nOut + " bytes)");
}
os.close ();
org.jmol.util.Logger.info (nBytesOut + " bytes prior to compression");
if (bos != null) {
var bytes = bos.toByteArray ();
if (outFileName == null) return bytes;
fullFilePath = outFileName;
nBytes = bytes.length;
var ret = org.jmol.io2.ZipUtil.postByteArray (fm, outFileName, bytes);
if (ret.indexOf ("Exception") >= 0) return ret;
msg += " " + ret;
} else {
var f = viewer.apiPlatform.newFile (outFileName);
fullFilePath = f.getAbsolutePath ().$replace ('\\', '/');
nBytes = f.length ();
}} catch (e) {
if (Clazz.exceptionOf (e, java.io.IOException)) {
org.jmol.util.Logger.info (e.getMessage ());
return e.getMessage ();
} else {
throw e;
}
}
return msg + " " + nBytes + " " + fullFilePath;
}, "org.jmol.viewer.FileManager,org.jmol.viewer.Viewer,~S,java.util.List,~S");
c$.postByteArray = Clazz.defineMethod (c$, "postByteArray", 
($fz = function (fm, outFileName, bytes) {
var ret = fm.getBufferedInputStreamOrErrorMessageFromName (outFileName, null, false, false, bytes, false);
if (Clazz.instanceOf (ret, String)) return ret;
try {
ret = org.jmol.io.JmolBinary.getStreamAsBytes (ret, null);
} catch (e) {
if (Clazz.exceptionOf (e, java.io.IOException)) {
try {
(ret).close ();
} catch (e1) {
if (Clazz.exceptionOf (e1, java.io.IOException)) {
} else {
throw e1;
}
}
} else {
throw e;
}
}
return org.jmol.io.JmolBinary.fixUTF (ret);
}, $fz.isPrivate = true, $fz), "org.jmol.viewer.FileManager,~S,~A");
Clazz.overrideMethod (c$, "getSceneScript", 
function (scenes, htScenes, list) {
var iSceneLast = 0;
var iScene = 0;
var sceneScript =  new org.jmol.util.StringXBuilder ().append ("###scene.spt###").append (" Jmol ").append (org.jmol.api.JmolViewer.getJmolVersion ()).append ("\n{\nsceneScripts={");
for (var i = 1; i < scenes.length; i++) {
scenes[i - 1] = org.jmol.util.TextFormat.trim (scenes[i - 1], "\t\n\r ");
var pt =  Clazz.newIntArray (1, 0);
iScene = org.jmol.util.Parser.parseIntNext (scenes[i], pt);
if (iScene == -2147483648) return "bad scene ID: " + iScene;
scenes[i] = scenes[i].substring (pt[0]);
list.add (Integer.$valueOf (iScene));
var key = iSceneLast + "-" + iScene;
htScenes.put (key, scenes[i - 1]);
if (i > 1) sceneScript.append (",");
sceneScript.appendC ('\n').append (org.jmol.util.Escape.escapeStr (key)).append (": ").append (org.jmol.util.Escape.escapeStr (scenes[i - 1]));
iSceneLast = iScene;
}
sceneScript.append ("\n}\n");
if (list.size () == 0) return "no lines 'pause scene n'";
sceneScript.append ("\nthisSceneRoot = '$SCRIPT_PATH$'.split('_scene_')[1];\n").append ("thisSceneID = 0 + ('$SCRIPT_PATH$'.split('_scene_')[2]).split('.')[1];\n").append ("var thisSceneState = '$SCRIPT_PATH$'.replace('.min.png','.all.png') + 'state.spt';\n").append ("var spath = ''+currentSceneID+'-'+thisSceneID;\n").append ("print thisSceneRoot + ' ' + spath;\n").append ("var sscript = sceneScripts[spath];\n").append ("var isOK = true;\n").append ("try{\n").append ("if (thisSceneRoot != currentSceneRoot){\n").append (" isOK = false;\n").append ("} else if (sscript != '') {\n").append (" isOK = true;\n").append ("} else if (thisSceneID <= currentSceneID){\n").append (" isOK = false;\n").append ("} else {\n").append (" sscript = '';\n").append (" for (var i = currentSceneID; i < thisSceneID; i++){\n").append ("  var key = ''+i+'-'+(i + 1); var script = sceneScripts[key];\n").append ("  if (script = '') {isOK = false;break;}\n").append ("  sscript += ';'+script;\n").append (" }\n").append ("}\n}catch(e){print e;isOK = false}\n").append ("if (isOK) {" + org.jmol.io2.ZipUtil.wrapPathForAllFiles ("script inline @sscript", "print e;isOK = false") + "}\n").append ("if (!isOK){script @thisSceneState}\n").append ("currentSceneRoot = thisSceneRoot; currentSceneID = thisSceneID;\n}\n");
return sceneScript.toString ();
}, "~A,java.util.Map,java.util.List");
c$.wrapPathForAllFiles = Clazz.defineMethod (c$, "wrapPathForAllFiles", 
($fz = function (cmd, strCatch) {
var vname = "v__" + ("" + Math.random ()).substring (3);
return "# Jmol script\n{\n\tVar " + vname + " = pathForAllFiles\n\tpathForAllFiles=\"$SCRIPT_PATH$\"\n\ttry{\n\t\t" + cmd + "\n\t}catch(e){" + strCatch + "}\n\tpathForAllFiles = " + vname + "\n}\n";
}, $fz.isPrivate = true, $fz), "~S,~S");
Clazz.overrideMethod (c$, "createZipSet", 
function (fm, viewer, fileName, script, scripts, includeRemoteFiles) {
var v =  new java.util.ArrayList ();
var fileNames =  new java.util.ArrayList ();
var crcMap =  new java.util.Hashtable ();
var haveSceneScript = (scripts != null && scripts.length == 3 && scripts[1].startsWith ("###scene.spt###"));
var sceneScriptOnly = (haveSceneScript && scripts[2].equals ("min"));
if (!sceneScriptOnly) {
org.jmol.io.JmolBinary.getFileReferences (script, fileNames);
if (haveSceneScript) org.jmol.io.JmolBinary.getFileReferences (scripts[1], fileNames);
}var haveScripts = (!haveSceneScript && scripts != null && scripts.length > 0);
if (haveScripts) {
script = org.jmol.io2.ZipUtil.wrapPathForAllFiles ("script " + org.jmol.util.Escape.escapeStr (scripts[0]), "");
for (var i = 0; i < scripts.length; i++) fileNames.add (scripts[i]);

}var nFiles = fileNames.size ();
if (fileName != null) fileName = fileName.$replace ('\\', '/');
var fileRoot = fileName;
if (fileRoot != null) {
fileRoot = fileName.substring (fileName.lastIndexOf ("/") + 1);
if (fileRoot.indexOf (".") >= 0) fileRoot = fileRoot.substring (0, fileRoot.indexOf ("."));
}var newFileNames =  new java.util.ArrayList ();
for (var iFile = 0; iFile < nFiles; iFile++) {
var name = fileNames.get (iFile);
var itype = org.jmol.viewer.FileManager.urlTypeIndex (name);
var isLocal = (itype < 0 || itype == 3);
var newName = name;
if (isLocal || includeRemoteFiles) {
var ptSlash = name.lastIndexOf ("/");
newName = (name.indexOf ("?") > 0 && name.indexOf ("|") < 0 ? org.jmol.util.TextFormat.replaceAllCharacters (name, "/:?\"'=&", "_") : org.jmol.viewer.FileManager.stripPath (name));
newName = org.jmol.util.TextFormat.replaceAllCharacters (newName, "[]", "_");
var isSparDir = (fm.spardirCache != null && fm.spardirCache.containsKey (name));
if (isLocal && name.indexOf ("|") < 0 && !isSparDir) {
v.add (name);
v.add (newName);
v.add (null);
} else {
var ret = (isSparDir ? fm.spardirCache.get (name) : fm.getFileAsBytes (name, null, true));
if (!org.jmol.util.Escape.isAB (ret)) return ret;
newName = this.addPngFileBytes (name, ret, iFile, crcMap, isSparDir, newName, ptSlash, v);
}name = "$SCRIPT_PATH$" + newName;
}crcMap.put (newName, newName);
newFileNames.add (name);
}
if (!sceneScriptOnly) {
script = org.jmol.util.TextFormat.replaceQuotedStrings (script, fileNames, newFileNames);
v.add ("state.spt");
v.add (null);
v.add (script.getBytes ());
}if (haveSceneScript) {
if (scripts[0] != null) {
v.add ("animate.spt");
v.add (null);
v.add (scripts[0].getBytes ());
}v.add ("scene.spt");
v.add (null);
script = org.jmol.util.TextFormat.replaceQuotedStrings (scripts[1], fileNames, newFileNames);
v.add (script.getBytes ());
}var sname = (haveSceneScript ? "scene.spt" : "state.spt");
v.add ("JmolManifest.txt");
v.add (null);
var sinfo = "# Jmol Manifest Zip Format 1.1\n# Created " + ( new java.util.Date ()) + "\n" + "# JmolVersion " + org.jmol.viewer.Viewer.getJmolVersion () + "\n" + sname;
v.add (sinfo.getBytes ());
v.add ("Jmol_version_" + org.jmol.viewer.Viewer.getJmolVersion ().$replace (' ', '_').$replace (':', '.'));
v.add (null);
v.add ( Clazz.newByteArray (0, 0));
if (fileRoot != null) {
var bytes = viewer.getImageAsWithComment ("PNG", -1, -1, -1, null, null, null, org.jmol.viewer.JmolConstants.embedScript (script));
if (org.jmol.util.Escape.isAB (bytes)) {
v.add ("preview.png");
v.add (null);
v.add (bytes);
}}return org.jmol.io.JmolBinary.writeZipFile (fm, viewer, fileName, v, "OK JMOL");
}, "org.jmol.viewer.FileManager,org.jmol.viewer.Viewer,~S,~S,~A,~B");
Clazz.overrideMethod (c$, "getAtomSetCollectionOrBufferedReaderFromZip", 
function (adapter, is, fileName, zipDirectory, htParams, subFilePtr, asBufferedReader, asBufferedInputStream) {
var doCombine = (subFilePtr == 1);
htParams.put ("zipSet", fileName);
var subFileList = htParams.get ("subFileList");
if (subFileList == null) subFileList = org.jmol.io2.ZipUtil.checkSpecialInZip (zipDirectory);
var subFileName = (subFileList == null || subFilePtr >= subFileList.length ? null : subFileList[subFilePtr]);
if (subFileName != null && (subFileName.startsWith ("/") || subFileName.startsWith ("\\"))) subFileName = subFileName.substring (1);
var selectedFile = 0;
if (subFileName == null && htParams.containsKey ("modelNumber")) {
selectedFile = (htParams.get ("modelNumber")).intValue ();
if (selectedFile > 0 && doCombine) htParams.remove ("modelNumber");
}var manifest = htParams.get ("manifest");
var useFileManifest = (manifest == null);
if (useFileManifest) manifest = (zipDirectory.length > 0 ? zipDirectory[0] : "");
var haveManifest = (manifest.length > 0);
if (haveManifest) {
if (org.jmol.util.Logger.debugging) org.jmol.util.Logger.info ("manifest for  " + fileName + ":\n" + manifest);
}var ignoreErrors = (manifest.indexOf ("IGNORE_ERRORS") >= 0);
var selectAll = (manifest.indexOf ("IGNORE_MANIFEST") >= 0);
var exceptFiles = (manifest.indexOf ("EXCEPT_FILES") >= 0);
if (selectAll || subFileName != null) haveManifest = false;
if (useFileManifest && haveManifest) {
var path = org.jmol.io.JmolBinary.getManifestScriptPath (manifest);
if (path != null) return "NOTE: file recognized as a script file: " + fileName + path + "\n";
}var vCollections =  new java.util.ArrayList ();
var htCollections = (haveManifest ?  new java.util.Hashtable () : null);
var nFiles = 0;
var ret = org.jmol.io2.ZipUtil.checkSpecialData (is, zipDirectory);
if (Clazz.instanceOf (ret, String)) return ret;
var data = ret;
try {
if (data != null) {
var reader =  new java.io.BufferedReader ( new java.io.StringReader (data.toString ()));
if (asBufferedReader) {
return reader;
}ret = adapter.getAtomSetCollectionFromReader (fileName, reader, htParams);
if (Clazz.instanceOf (ret, String)) return ret;
if (Clazz.instanceOf (ret, org.jmol.adapter.smarter.AtomSetCollection)) {
var atomSetCollection = ret;
if (atomSetCollection.errorMessage != null) {
if (ignoreErrors) return null;
return atomSetCollection.errorMessage;
}return atomSetCollection;
}if (ignoreErrors) return null;
return "unknown reader error";
}if (Clazz.instanceOf (is, java.io.BufferedInputStream)) is = org.jmol.io.JmolBinary.checkPngZipStream (is);
var zis = org.jmol.io.JmolBinary.newZipInputStream (is);
var ze;
if (haveManifest) manifest = '|' + manifest.$replace ('\r', '|').$replace ('\n', '|') + '|';
while ((ze = zis.getNextEntry ()) != null && (selectedFile <= 0 || vCollections.size () < selectedFile)) {
if (ze.isDirectory ()) continue;
var thisEntry = ze.getName ();
if (subFileName != null && !thisEntry.equals (subFileName)) continue;
if (subFileName != null) htParams.put ("subFileName", subFileName);
if (org.jmol.io2.ZipUtil.isJmolManifest (thisEntry) || haveManifest && exceptFiles == manifest.indexOf ("|" + thisEntry + "|") >= 0) continue;
var bytes = org.jmol.io.JmolBinary.getStreamBytes (zis, ze.getSize ());
if (org.jmol.io.JmolBinary.isZipFile (bytes)) {
var bis =  new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes));
var zipDir2 = org.jmol.io.JmolBinary.getZipDirectoryAndClose (bis, true);
bis =  new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes));
var atomSetCollections = this.getAtomSetCollectionOrBufferedReaderFromZip (adapter, bis, fileName + "|" + thisEntry, zipDir2, htParams, ++subFilePtr, asBufferedReader, asBufferedInputStream);
if (Clazz.instanceOf (atomSetCollections, String)) {
if (ignoreErrors) continue;
return atomSetCollections;
} else if (Clazz.instanceOf (atomSetCollections, org.jmol.adapter.smarter.AtomSetCollection) || Clazz.instanceOf (atomSetCollections, java.util.List)) {
if (haveManifest && !exceptFiles) htCollections.put (thisEntry, atomSetCollections);
 else vCollections.add (atomSetCollections);
} else if (Clazz.instanceOf (atomSetCollections, java.io.BufferedReader)) {
if (doCombine) zis.close ();
return atomSetCollections;
} else {
if (ignoreErrors) continue;
zis.close ();
return "unknown zip reader error";
}} else if (asBufferedInputStream) {
if (org.jmol.io.JmolBinary.isGzipB (bytes)) return this.getGzippedInputStream (bytes);
var bis =  new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes));
if (doCombine) zis.close ();
return bis;
} else {
var sData;
if (org.jmol.io.JmolBinary.isCompoundDocumentArray (bytes)) {
var jd = org.jmol.api.Interface.getInterface ("jmol.util.CompoundDocument");
jd.setStream ( new java.io.BufferedInputStream ( new java.io.ByteArrayInputStream (bytes)), true);
sData = jd.getAllDataFiles ("Molecule", "Input").toString ();
} else if (org.jmol.io.JmolBinary.isGzipB (bytes)) {
sData = org.jmol.io.JmolBinary.getGzippedBytesAsString (bytes);
} else {
sData = org.jmol.io.JmolBinary.fixUTF (bytes);
}var reader =  new java.io.BufferedReader ( new java.io.StringReader (sData));
if (asBufferedReader) {
if (doCombine) zis.close ();
return reader;
}var fname = fileName + "|" + ze.getName ();
ret = adapter.getAtomSetCollectionFromReader (fname, reader, htParams);
if (!(Clazz.instanceOf (ret, org.jmol.adapter.smarter.AtomSetCollection))) {
if (ignoreErrors) continue;
zis.close ();
return "" + ret;
}if (haveManifest && !exceptFiles) htCollections.put (thisEntry, ret);
 else vCollections.add (ret);
var a = ret;
if (a.errorMessage != null) {
if (ignoreErrors) continue;
zis.close ();
return a.errorMessage;
}}}
if (doCombine) zis.close ();
if (haveManifest && !exceptFiles) {
var list = org.jmol.util.TextFormat.split (manifest, '|');
for (var i = 0; i < list.length; i++) {
var file = list[i];
if (file.length == 0 || file.indexOf ("#") == 0) continue;
if (htCollections.containsKey (file)) vCollections.add (htCollections.get (file));
 else if (org.jmol.util.Logger.debugging) org.jmol.util.Logger.info ("manifested file " + file + " was not found in " + fileName);
}
}if (!doCombine) return vCollections;
var result =  new org.jmol.adapter.smarter.AtomSetCollection ("Array", null, null, vCollections);
if (result.errorMessage != null) {
if (ignoreErrors) return null;
return result.errorMessage;
}if (nFiles == 1) selectedFile = 1;
if (selectedFile > 0 && selectedFile <= vCollections.size ()) return vCollections.get (selectedFile - 1);
return result;
} catch (e$$) {
if (Clazz.exceptionOf (e$$, Exception)) {
var e = e$$;
{
if (ignoreErrors) return null;
org.jmol.util.Logger.error ("" + e);
return "" + e;
}
} else if (Clazz.exceptionOf (e$$, Error)) {
var er = e$$;
{
org.jmol.util.Logger.errorEx (null, er);
return "" + er;
}
} else {
throw e$$;
}
}
}, "org.jmol.api.JmolAdapter,java.io.InputStream,~S,~A,java.util.Map,~N,~B,~B");
c$.checkSpecialData = Clazz.defineMethod (c$, "checkSpecialData", 
($fz = function (is, zipDirectory) {
var isSpartan = false;
for (var i = 1; i < zipDirectory.length; i++) {
if (zipDirectory[i].endsWith (".spardir/") || zipDirectory[i].indexOf ("_spartandir") >= 0) {
isSpartan = true;
break;
}}
if (!isSpartan) return null;
var data =  new org.jmol.util.StringXBuilder ();
data.append ("Zip File Directory: ").append ("\n").append (org.jmol.util.Escape.escapeStrA (zipDirectory, true)).append ("\n");
var fileData =  new java.util.Hashtable ();
org.jmol.io2.ZipUtil.getAllZipDataStatic (is, [], "", "Molecule", fileData);
var prefix = "|";
var outputData = fileData.get (prefix + "output");
if (outputData == null) outputData = fileData.get ((prefix = "|" + zipDirectory[1]) + "output");
data.append (outputData);
var files = org.jmol.io2.ZipUtil.getSpartanFileList (prefix, org.jmol.io2.ZipUtil.getSpartanDirs (outputData));
for (var i = 2; i < files.length; i++) {
var name = files[i];
if (fileData.containsKey (name)) data.append (fileData.get (name));
 else data.append (name + "\n");
}
return data;
}, $fz.isPrivate = true, $fz), "java.io.InputStream,~A");
Clazz.overrideMethod (c$, "spartanFileList", 
function (name, type) {
var dirNums = org.jmol.io2.ZipUtil.getSpartanDirs (type);
if (dirNums.length == 0 && name.endsWith (".spardir.zip") && type.indexOf (".zip|output") >= 0) {
var sname = name.$replace ('\\', '/');
var pt = name.lastIndexOf (".spardir");
pt = sname.lastIndexOf ("/");
sname = name + "|" + name.substring (pt + 1, name.length - 4);
return ["SpartanSmol", sname, sname + "/output"];
}return org.jmol.io2.ZipUtil.getSpartanFileList (name, dirNums);
}, "~S,~S");
c$.getSpartanDirs = Clazz.defineMethod (c$, "getSpartanDirs", 
($fz = function (outputFileData) {
if (outputFileData == null) return [];
if (outputFileData.startsWith ("java.io.FileNotFoundException") || outputFileData.startsWith ("FILE NOT FOUND") || outputFileData.indexOf ("<html") >= 0) return ["M0001"];
var v =  new java.util.ArrayList ();
var token;
var lasttoken = "";
try {
var tokens =  new java.util.StringTokenizer (outputFileData, " \t\r\n");
while (tokens.hasMoreTokens ()) {
if ((token = tokens.nextToken ()).equals (")")) v.add (lasttoken);
 else if (token.equals ("Start-") && tokens.nextToken ().equals ("Molecule")) v.add (org.jmol.util.TextFormat.split (tokens.nextToken (), '"')[1]);
lasttoken = token;
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
return v.toArray ( new Array (v.size ()));
}, $fz.isPrivate = true, $fz), "~S");
c$.getSpartanFileList = Clazz.defineMethod (c$, "getSpartanFileList", 
($fz = function (name, dirNums) {
var files =  new Array (2 + dirNums.length * 5);
files[0] = "SpartanSmol";
files[1] = "Directory Entry ";
var pt = 2;
name = name.$replace ('\\', '/');
if (name.endsWith ("/")) name = name.substring (0, name.length - 1);
for (var i = 0; i < dirNums.length; i++) {
var path = name + (Character.isDigit (dirNums[i].charAt (0)) ? "/Profile." + dirNums[i] : "/" + dirNums[i]);
files[pt++] = path + "/#JMOL_MODEL " + dirNums[i];
files[pt++] = path + "/input";
files[pt++] = path + "/archive";
files[pt++] = path + "/Molecule:asBinaryString";
files[pt++] = path + "/proparc";
}
return files;
}, $fz.isPrivate = true, $fz), "~S,~A");
c$.checkSpecialInZip = Clazz.defineMethod (c$, "checkSpecialInZip", 
function (zipDirectory) {
var name;
return (zipDirectory.length < 2 ? null : (name = zipDirectory[1]).endsWith (".spardir/") || zipDirectory.length == 2 ? ["", (name.endsWith ("/") ? name.substring (0, name.length - 1) : name)] : null);
}, "~A");
Clazz.overrideMethod (c$, "getCachedPngjBytes", 
function (fm, pathName) {
if (pathName.indexOf (".png") < 0) return null;
org.jmol.util.Logger.info ("FileManager checking PNGJ cache for " + pathName);
var shortName = org.jmol.io2.ZipUtil.shortSceneFilename (pathName);
if (fm.pngjCache == null && !this.cachePngjFile (fm, [pathName, null])) return null;
var pngjCache = fm.pngjCache;
var isMin = (pathName.indexOf (".min.") >= 0);
if (!isMin) {
var cName = fm.getCanonicalName (org.jmol.io.JmolBinary.getZipRoot (pathName));
if (!pngjCache.containsKey (cName) && !this.cachePngjFile (fm, [pathName, null])) return null;
if (pathName.indexOf ("|") < 0) shortName = cName;
}if (pngjCache.containsKey (shortName)) {
org.jmol.util.Logger.info ("FileManager using memory cache " + shortName);
return pngjCache.get (shortName);
}for (var key, $key = pngjCache.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) System.out.println (key);

System.out.println ("FileManager memory cache (" + pngjCache.size () + ") did not find " + pathName + " as " + shortName);
if (!isMin || !this.cachePngjFile (fm, [pathName, null])) return null;
org.jmol.util.Logger.info ("FileManager using memory cache " + shortName);
return pngjCache.get (shortName);
}, "org.jmol.viewer.FileManager,~S");
Clazz.overrideMethod (c$, "cachePngjFile", 
function (fm, data) {
var pngjCache = fm.pngjCache =  new java.util.Hashtable ();
data[1] = null;
if (data[0] == null) return false;
data[0] = org.jmol.io.JmolBinary.getZipRoot (data[0]);
var shortName = org.jmol.io2.ZipUtil.shortSceneFilename (data[0]);
try {
data[1] = this.cacheZipContents (org.jmol.io.JmolBinary.checkPngZipStream (fm.getBufferedInputStreamOrErrorMessageFromName (data[0], null, false, false, null, false)), shortName, fm.pngjCache);
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return false;
} else {
throw e;
}
}
if (data[1] == null) return false;
var bytes = data[1].getBytes ();
pngjCache.put (fm.getCanonicalName (data[0]), bytes);
if (shortName.indexOf ("_scene_") >= 0) {
pngjCache.put (org.jmol.io2.ZipUtil.shortSceneFilename (data[0]), bytes);
bytes = pngjCache.remove (shortName + "|state.spt");
if (bytes != null) pngjCache.put (org.jmol.io2.ZipUtil.shortSceneFilename (data[0] + "|state.spt"), bytes);
}for (var key, $key = pngjCache.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) System.out.println (key);

return true;
}, "org.jmol.viewer.FileManager,~A");
c$.shortSceneFilename = Clazz.defineMethod (c$, "shortSceneFilename", 
($fz = function (pathName) {
var pt = pathName.indexOf ("_scene_") + 7;
if (pt < 7) return pathName;
var s = "";
if (pathName.endsWith ("|state.spt")) {
var pt1 = pathName.indexOf ('.', pt);
if (pt1 < 0) return pathName;
s = pathName.substring (pt, pt1);
}var pt2 = pathName.lastIndexOf ("|");
return pathName.substring (0, pt) + s + (pt2 > 0 ? pathName.substring (pt2) : "");
}, $fz.isPrivate = true, $fz), "~S");
Clazz.defineStatics (c$,
"SCENE_TAG", "###scene.spt###");
});
// 
//// java\io\ByteArrayOutputStream.js 
// 
$_L(["java.io.OutputStream"],"java.io.ByteArrayOutputStream",["java.lang.IllegalArgumentException","$.IndexOutOfBoundsException","$.NullPointerException",null],function(){
c$=$_C(function(){
this.buf=null;
this.count=0;
$_Z(this,arguments);
},java.io,"ByteArrayOutputStream",java.io.OutputStream);
$_K(c$,
function(){
$_R(this,java.io.ByteArrayOutputStream);
this.buf=$_A(32,0);
});
$_K(c$,
function(size){
$_R(this,java.io.ByteArrayOutputStream);
if(size>=0){
this.buf=$_A(size,0);
}else{
throw new IllegalArgumentException(("K005e"));
}},"~N");
$_M(c$,"expand",
($fz=function(i){
if(this.count+i<=this.buf.length){
return;
}var newbuf=$_A((this.count+i)*2,0);
System.arraycopy(this.buf,0,newbuf,0,this.count);
this.buf=newbuf;
},$fz.isPrivate=true,$fz),"~N");
$_M(c$,"reset",
function(){
this.count=0;
});
$_M(c$,"size",
function(){
return this.count;
});
$_M(c$,"toByteArray",
function(){
var newArray=$_A(this.count,0);
System.arraycopy(this.buf,0,newArray,0,this.count);
return newArray;
});
$_M(c$,"toString",
function(){
return String.instantialize(this.buf,0,this.count);
});
$_M(c$,"toString",
function(hibyte){
var newBuf=$_A(this.size(),'\0');
for(var i=0;i<newBuf.length;i++){
newBuf[i]=String.fromCharCode((((hibyte&0xff)<<8)|(this.buf[i]&0xff)));
}
return String.instantialize(newBuf);
},"~N");
$_M(c$,"toString",
function(enc){
return String.instantialize(this.buf,0,this.count,enc);
},"~S");
$_M(c$,"write",
function(buffer,offset,len){
if(this.buf==null){
return;
}if(buffer!=null){
if(0<=offset&&offset<=buffer.length&&0<=len&&len<=buffer.length-offset){
this.expand(len);
System.arraycopy(buffer,offset,this.buf,this.count,len);
this.count+=len;
}else{
throw new IndexOutOfBoundsException(("K002f"));
}}else{
throw new NullPointerException(("K0047"));
}},"~A,~N,~N");
$_M(c$,"write",
function(oneByte){
try{
this.buf[this.count]=oneByte;
this.count++;
}catch(e$$){
if($_O(e$$,IndexOutOfBoundsException)){
var e=e$$;
{
this.expand(1);
this.buf[this.count++]=oneByte;
}
}else if($_O(e$$,NullPointerException)){
var e=e$$;
{
}
}else{
throw e$$;
}
}
},"~N");
$_M(c$,"writeTo",
function(out){
out.write(this.buf,0,this.count);
},"java.io.OutputStream");
});
// 
//// java\io\FileInputStream.js 
// 
$_L(["java.io.Closeable","$.InputStream"],"java.io.FileInputStream",["java.lang.IndexOutOfBoundsException","$.NullPointerException"],function(){
c$=$_C(function(){
this.fd=null;
this.innerFD=false;
$_Z(this,arguments);
},java.io,"FileInputStream",java.io.InputStream,java.io.Closeable);
$_K(c$,
function(file){
$_R(this,java.io.FileInputStream);
},"java.io.File");
$_K(c$,
function(fd){
$_R(this,java.io.FileInputStream);
if(fd==null){
throw new NullPointerException();
}},"java.io.FileDescriptor");
$_K(c$,
function(fileName){
this.construct(null==fileName?null:null);
},"~S");
$_V(c$,"available",
function(){
return 0;
});
$_V(c$,"close",
function(){
if(this.fd==null){
return;
}});
$_V(c$,"finalize",
function(){
this.close();
});
$_M(c$,"getFD",
function(){
return this.fd;
});
$_M(c$,"read",
function(){
var readed=$_A(1,0);
var result=this.read(readed,0,1);
return result==-1?-1:readed[0]&0xff;
});
$_M(c$,"read",
function(buffer){
return this.read(buffer,0,buffer.length);
},"~A");
$_M(c$,"read",
function(buffer,offset,count){
if(count>buffer.length-offset||count<0||offset<0){
throw new IndexOutOfBoundsException();
}if(0==count){
return 0;
}return 0;
},"~A,~N,~N");
$_V(c$,"skip",
function(count){
return 0;
},"~N");
});
// 
//// com\jcraft\jzlib\Checksum.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.declareInterface (com.jcraft.jzlib, "Checksum");
// 
//// com\jcraft\jzlib\CRC32.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["com.jcraft.jzlib.Checksum"], "com.jcraft.jzlib.CRC32", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.v = 0;
this.b1 = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "CRC32", null, com.jcraft.jzlib.Checksum);
Clazz.prepareFields (c$, function () {
this.b1 =  Clazz.newByteArray (1, 0);
});
Clazz.overrideMethod (c$, "updateRange", 
function (buf, index, len) {
var c = ~this.v;
while (--len >= 0) c = com.jcraft.jzlib.CRC32.crc_table[(c ^ buf[index++]) & 0xff] ^ (c >>> 8);

this.v = ~c;
}, "~A,~N,~N");
Clazz.overrideMethod (c$, "resetAll", 
function () {
this.v = 0;
});
Clazz.overrideMethod (c$, "reset", 
function (vv) {
this.v = (vv & 0xffffffff);
}, "~N");
Clazz.overrideMethod (c$, "getValue", 
function () {
return this.v & 0xffffffff;
});
c$.combine = Clazz.defineMethod (c$, "combine", 
function (crc1, crc2, len2) {
var row;
var even =  Clazz.newLongArray (32, 0);
var odd =  Clazz.newLongArray (32, 0);
if (len2 <= 0) return crc1;
odd[0] = 0xedb88320;
row = 1;
for (var n = 1; n < 32; n++) {
odd[n] = row;
row <<= 1;
}
com.jcraft.jzlib.CRC32.gf2_matrix_square (even, odd);
com.jcraft.jzlib.CRC32.gf2_matrix_square (odd, even);
do {
com.jcraft.jzlib.CRC32.gf2_matrix_square (even, odd);
if ((len2 & 1) != 0) crc1 = com.jcraft.jzlib.CRC32.gf2_matrix_times (even, crc1);
len2 >>= 1;
if (len2 == 0) break;
com.jcraft.jzlib.CRC32.gf2_matrix_square (odd, even);
if ((len2 & 1) != 0) crc1 = com.jcraft.jzlib.CRC32.gf2_matrix_times (odd, crc1);
len2 >>= 1;
} while (len2 != 0);
crc1 ^= crc2;
return crc1;
}, "~N,~N,~N");
c$.gf2_matrix_times = Clazz.defineMethod (c$, "gf2_matrix_times", 
($fz = function (mat, vec) {
var sum = 0;
var index = 0;
while (vec != 0) {
if ((vec & 1) != 0) sum ^= mat[index];
vec >>= 1;
index++;
}
return sum;
}, $fz.isPrivate = true, $fz), "~A,~N");
c$.gf2_matrix_square = Clazz.defineMethod (c$, "gf2_matrix_square", 
function (square, mat) {
for (var n = 0; n < 32; n++) square[n] = com.jcraft.jzlib.CRC32.gf2_matrix_times (mat, mat[n]);

}, "~A,~A");
Clazz.overrideMethod (c$, "copy", 
function () {
var foo =  new com.jcraft.jzlib.CRC32 ();
foo.v = this.v;
return foo;
});
c$.getCRC32Table = Clazz.defineMethod (c$, "getCRC32Table", 
function () {
var tmp =  Clazz.newIntArray (com.jcraft.jzlib.CRC32.crc_table.length, 0);
System.arraycopy (com.jcraft.jzlib.CRC32.crc_table, 0, tmp, 0, tmp.length);
return tmp;
});
Clazz.overrideMethod (c$, "update", 
function (b) {
this.b1[0] = b;
this.updateRange (this.b1, 0, 1);
}, "~N");
Clazz.defineStatics (c$,
"crc_table", null);
{
($t$ = com.jcraft.jzlib.CRC32.crc_table =  Clazz.newIntArray (256, 0), com.jcraft.jzlib.CRC32.prototype.crc_table = com.jcraft.jzlib.CRC32.crc_table, $t$);
for (var n = 0; n < 256; n++) {
var c = n;
for (var k = 8; --k >= 0; ) {
if ((c & 1) != 0) c = 0xedb88320 ^ (c >>> 1);
 else c = c >>> 1;
}
com.jcraft.jzlib.CRC32.crc_table[n] = c;
}
}Clazz.defineStatics (c$,
"GF2_DIM", 32);
});
// 
//// java\util\zip\CRC32.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["com.jcraft.jzlib.CRC32"], "java.util.zip.CRC32", null, function () {
c$ = Clazz.declareType (java.util.zip, "CRC32", com.jcraft.jzlib.CRC32);
Clazz.defineMethod (c$, "update", 
function (ret) {
this.updateRange (ret, 0, ret.length);
}, "~A");
});
// 
//// com\jcraft\jzlib\InflaterInputStream.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["java.io.FilterInputStream"], "com.jcraft.jzlib.InflaterInputStream", ["com.jcraft.jzlib.Inflater", "java.io.EOFException", "$.IOException", "java.lang.IllegalArgumentException", "$.IndexOutOfBoundsException", "$.NullPointerException"], function () {
c$ = Clazz.decorateAsClass (function () {
this.inflater = null;
this.buf = null;
this.len = 0;
this.closed = false;
this.eof = false;
this.close_in = true;
this.myinflater = false;
this.byte1 = null;
this.b = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "InflaterInputStream", java.io.FilterInputStream);
Clazz.prepareFields (c$, function () {
this.byte1 =  Clazz.newByteArray (1, 0);
this.b =  Clazz.newByteArray (512, 0);
});
Clazz.makeConstructor (c$, 
function ($in) {
this.construct ($in,  new com.jcraft.jzlib.Inflater ());
this.myinflater = true;
}, "java.io.InputStream");
Clazz.makeConstructor (c$, 
function ($in, inflater) {
this.construct ($in, inflater, 512);
}, "java.io.InputStream,com.jcraft.jzlib.Inflater");
Clazz.makeConstructor (c$, 
function ($in, inflater, size) {
this.construct ($in, inflater, size, true);
}, "java.io.InputStream,com.jcraft.jzlib.Inflater,~N");
Clazz.makeConstructor (c$, 
function ($in, inflater, size, close_in) {
Clazz.superConstructor (this, com.jcraft.jzlib.InflaterInputStream, [$in]);
this.inflater = inflater;
this.buf =  Clazz.newByteArray (size, 0);
this.close_in = close_in;
}, "java.io.InputStream,com.jcraft.jzlib.Inflater,~N,~B");
Clazz.overrideMethod (c$, "readByteAsInt", 
function () {
if (this.closed) {
throw  new java.io.IOException ("Stream closed");
}return this.read (this.byte1, 0, 1) == -1 ? -1 : this.byte1[0] & 0xff;
});
Clazz.overrideMethod (c$, "read", 
function (b, off, len) {
if (this.closed) {
throw  new java.io.IOException ("Stream closed");
}if (b == null) {
throw  new NullPointerException ();
} else if (off < 0 || len < 0 || len > b.length - off) {
throw  new IndexOutOfBoundsException ();
} else if (len == 0) {
return 0;
} else if (this.eof) {
return -1;
}var n = 0;
this.inflater.setOutput (b, off, len);
while (!this.eof) {
if (this.inflater.avail_in == 0) this.fill ();
var err = this.inflater.inflate (0);
n += this.inflater.next_out_index - off;
off = this.inflater.next_out_index;
switch (err) {
case -3:
throw  new java.io.IOException (this.inflater.msg);
case 1:
case 2:
this.eof = true;
if (err == 2) return -1;
break;
default:
}
if (this.inflater.avail_out == 0) break;
}
return n;
}, "~A,~N,~N");
Clazz.overrideMethod (c$, "available", 
function () {
if (this.closed) {
throw  new java.io.IOException ("Stream closed");
}return (this.eof ? 0 : 1);
});
Clazz.overrideMethod (c$, "skip", 
function (n) {
if (n < 0) {
throw  new IllegalArgumentException ("negative skip length");
}if (this.closed) {
throw  new java.io.IOException ("Stream closed");
}var max = Math.min (n, 2147483647);
var total = 0;
while (total < max) {
var len = max - total;
if (len > this.b.length) {
len = this.b.length;
}len = this.read (this.b, 0, len);
if (len == -1) {
this.eof = true;
break;
}total += len;
}
return total;
}, "~N");
Clazz.overrideMethod (c$, "close", 
function () {
if (!this.closed) {
if (this.myinflater) this.inflater.end ();
if (this.close_in) this.$in.close ();
this.closed = true;
}});
Clazz.defineMethod (c$, "fill", 
function () {
if (this.closed) {
throw  new java.io.IOException ("Stream closed");
}this.len = this.$in.read (this.buf, 0, this.buf.length);
if (this.len == -1) {
if (this.inflater.istate.wrap == 0 && !this.inflater.finished ()) {
this.buf[0] = 0;
this.len = 1;
} else if (this.inflater.istate.was != -1) {
throw  new java.io.IOException ("footer is not found");
} else {
throw  new java.io.EOFException ("Unexpected end of ZLIB input stream");
}}this.inflater.setInput (this.buf, 0, this.len, true);
});
Clazz.overrideMethod (c$, "markSupported", 
function () {
return false;
});
Clazz.overrideMethod (c$, "mark", 
function (readlimit) {
}, "~N");
Clazz.overrideMethod (c$, "reset", 
function () {
throw  new java.io.IOException ("mark/reset not supported");
});
Clazz.defineMethod (c$, "getTotalIn", 
function () {
return this.inflater.getTotalIn ();
});
Clazz.defineMethod (c$, "getTotalOut", 
function () {
return this.inflater.getTotalOut ();
});
Clazz.defineMethod (c$, "getAvailIn", 
function () {
if (this.inflater.avail_in <= 0) return null;
var tmp =  Clazz.newByteArray (this.inflater.avail_in, 0);
System.arraycopy (this.inflater.next_in, this.inflater.next_in_index, tmp, 0, this.inflater.avail_in);
return tmp;
});
Clazz.defineMethod (c$, "readHeader", 
function () {
var empty = "".getBytes ();
this.inflater.setInput (empty, 0, 0, false);
this.inflater.setOutput (empty, 0, 0);
var err = this.inflater.inflate (0);
if (!this.inflater.istate.inParsingHeader ()) {
return;
}var b1 =  Clazz.newByteArray (1, 0);
do {
var i = this.$in.read (b1, 0, 1);
if (i <= 0) throw  new java.io.IOException ("no input");
this.inflater.setInput (b1);
err = this.inflater.inflate (0);
if (err != 0) throw  new java.io.IOException (this.inflater.msg);
} while (this.inflater.istate.inParsingHeader ());
});
Clazz.defineMethod (c$, "getInflater", 
function () {
return this.inflater;
});
Clazz.defineStatics (c$,
"DEFAULT_BUFSIZE", 512);
});
// 
//// java\util\zip\InflaterInputStream.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["com.jcraft.jzlib.InflaterInputStream"], "java.util.zip.InflaterInputStream", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.inf = null;
Clazz.instantialize (this, arguments);
}, java.util.zip, "InflaterInputStream", com.jcraft.jzlib.InflaterInputStream);
Clazz.makeConstructor (c$, 
function ($in, inflater, size) {
Clazz.superConstructor (this, java.util.zip.InflaterInputStream, [$in, inflater, size]);
this.inf = inflater;
}, "java.io.InputStream,java.util.zip.Inflater,~N");
Clazz.defineMethod (c$, "getRemaining", 
function () {
return this.inf.getRemaining ();
});
Clazz.defineMethod (c$, "needsInput", 
function () {
return this.len <= 0;
});
});
// 
//// java\util\zip\GZIPInputStream.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["java.util.zip.InflaterInputStream", "$.CRC32"], "java.util.zip.GZIPInputStream", ["java.io.EOFException", "$.IOException", "java.util.zip.CheckedInputStream", "$.Inflater", "$.ZipException"], function () {
c$ = Clazz.decorateAsClass (function () {
this.crc = null;
this.eos = false;
this.$closed = false;
this.tmpbuf = null;
Clazz.instantialize (this, arguments);
}, java.util.zip, "GZIPInputStream", java.util.zip.InflaterInputStream);
Clazz.prepareFields (c$, function () {
this.crc =  new java.util.zip.CRC32 ();
this.tmpbuf =  Clazz.newByteArray (128, 0);
});
Clazz.defineMethod (c$, "ensureOpen", 
($fz = function () {
if (this.$closed) {
throw  new java.io.IOException ("Stream closed");
}}, $fz.isPrivate = true, $fz));
Clazz.makeConstructor (c$, 
function ($in, size) {
Clazz.superConstructor (this, java.util.zip.GZIPInputStream, [$in,  new java.util.zip.Inflater (true), size]);
this.readHeader ($in);
}, "java.io.InputStream,~N");
Clazz.defineMethod (c$, "read", 
function (buf, off, len) {
this.ensureOpen ();
if (this.eos) {
return -1;
}var n = Clazz.superCall (this, java.util.zip.GZIPInputStream, "read", [buf, off, len]);
if (n == -1) {
if (this.readTrailer ()) this.eos = true;
 else return this.read (buf, off, len);
} else {
this.crc.updateRange (buf, off, n);
}return n;
}, "~A,~N,~N");
Clazz.defineMethod (c$, "close", 
function () {
if (!this.$closed) {
Clazz.superCall (this, java.util.zip.GZIPInputStream, "close", []);
this.eos = true;
this.$closed = true;
}});
Clazz.defineMethod (c$, "readHeader", 
($fz = function (this_in) {
var $in =  new java.util.zip.CheckedInputStream (this_in, this.crc);
this.crc.resetAll ();
if (this.readUShort ($in) != 35615) {
throw  new java.util.zip.ZipException ("Not in GZIP format");
}if (this.readUByte ($in) != 8) {
throw  new java.util.zip.ZipException ("Unsupported compression method");
}var flg = this.readUByte ($in);
this.skipBytes ($in, 6);
var n = 10;
if ((flg & 4) == 4) {
var m = this.readUShort ($in);
this.skipBytes ($in, m);
n += m + 2;
}if ((flg & 8) == 8) {
do {
n++;
} while (this.readUByte ($in) != 0);
}if ((flg & 16) == 16) {
do {
n++;
} while (this.readUByte ($in) != 0);
}if ((flg & 2) == 2) {
var v = this.crc.getValue () & 0xffff;
if (this.readUShort ($in) != v) {
throw  new java.util.zip.ZipException ("Corrupt GZIP header");
}n += 2;
}this.crc.resetAll ();
return n;
}, $fz.isPrivate = true, $fz), "java.io.InputStream");
Clazz.defineMethod (c$, "readTrailer", 
($fz = function () {
return true;
}, $fz.isPrivate = true, $fz));
Clazz.defineMethod (c$, "readUShort", 
($fz = function ($in) {
var b = this.readUByte ($in);
return (this.readUByte ($in) << 8) | b;
}, $fz.isPrivate = true, $fz), "java.io.InputStream");
Clazz.defineMethod (c$, "readUByte", 
($fz = function ($in) {
var b = $in.readByteAsInt ();
if (b == -1) {
throw  new java.io.EOFException ();
}if (b < -1 || b > 255) {
throw  new java.io.IOException (this.$in.getClass ().getName () + ".read() returned value out of range -1..255: " + b);
}return b;
}, $fz.isPrivate = true, $fz), "java.io.InputStream");
Clazz.defineMethod (c$, "skipBytes", 
($fz = function ($in, n) {
while (n > 0) {
var len = $in.read (this.tmpbuf, 0, n < this.tmpbuf.length ? n : this.tmpbuf.length);
if (len == -1) {
throw  new java.io.EOFException ();
}n -= len;
}
}, $fz.isPrivate = true, $fz), "java.io.InputStream,~N");
Clazz.defineStatics (c$,
"GZIP_MAGIC", 0x8b1f,
"FHCRC", 2,
"FEXTRA", 4,
"FNAME", 8,
"FCOMMENT", 16);
});
// 
//// com\jcraft\jzlib\ZStream.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (null, "com.jcraft.jzlib.ZStream", ["com.jcraft.jzlib.Adler32", "$.Deflate", "$.Inflate"], function () {
c$ = Clazz.decorateAsClass (function () {
this.next_in = null;
this.next_in_index = 0;
this.avail_in = 0;
this.total_in = 0;
this.next_out = null;
this.next_out_index = 0;
this.avail_out = 0;
this.total_out = 0;
this.msg = null;
this.dstate = null;
this.istate = null;
this.data_type = 0;
this.adler = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "ZStream");
Clazz.makeConstructor (c$, 
function () {
this.construct ( new com.jcraft.jzlib.Adler32 ());
});
Clazz.makeConstructor (c$, 
function (adler) {
this.adler = adler;
}, "com.jcraft.jzlib.Checksum");
Clazz.defineMethod (c$, "inflateInit", 
function () {
return this.inflateInit (15);
});
Clazz.defineMethod (c$, "inflateInit", 
function (nowrap) {
return this.inflateInit (15, nowrap);
}, "~B");
Clazz.defineMethod (c$, "inflateInit", 
function (w) {
return this.inflateInit (w, false);
}, "~N");
Clazz.defineMethod (c$, "inflateInit", 
function (w, nowrap) {
this.istate =  new com.jcraft.jzlib.Inflate (this);
return this.istate.inflateInit (nowrap ? -w : w);
}, "~N,~B");
Clazz.defineMethod (c$, "inflate", 
function (f) {
if (this.istate == null) return -2;
return this.istate.inflate (f);
}, "~N");
Clazz.defineMethod (c$, "inflateEnd", 
function () {
if (this.istate == null) return -2;
var ret = this.istate.inflateEnd ();
return ret;
});
Clazz.defineMethod (c$, "inflateSync", 
function () {
if (this.istate == null) return -2;
return this.istate.inflateSync ();
});
Clazz.defineMethod (c$, "inflateSyncPoint", 
function () {
if (this.istate == null) return -2;
return this.istate.inflateSyncPoint ();
});
Clazz.defineMethod (c$, "inflateSetDictionary", 
function (dictionary, dictLength) {
if (this.istate == null) return -2;
return this.istate.inflateSetDictionary (dictionary, dictLength);
}, "~A,~N");
Clazz.defineMethod (c$, "inflateFinished", 
function () {
return this.istate.mode == 12;
});
Clazz.defineMethod (c$, "deflateInit", 
function (level) {
return this.deflateInit (level, 15);
}, "~N");
Clazz.defineMethod (c$, "deflateInit", 
function (level, nowrap) {
return this.deflateInit (level, 15, nowrap);
}, "~N,~B");
Clazz.defineMethod (c$, "deflateInit", 
function (level, bits) {
return this.deflateInit (level, bits, false);
}, "~N,~N");
Clazz.defineMethod (c$, "deflateInit", 
function (level, bits, memlevel) {
this.dstate =  new com.jcraft.jzlib.Deflate (this);
return this.dstate.deflateInit3 (level, bits, memlevel);
}, "~N,~N,~N");
Clazz.defineMethod (c$, "deflateInit", 
function (level, bits, nowrap) {
this.dstate =  new com.jcraft.jzlib.Deflate (this);
return this.dstate.deflateInit2 (level, nowrap ? -bits : bits);
}, "~N,~N,~B");
Clazz.defineMethod (c$, "deflate", 
function (flush) {
if (this.dstate == null) {
return -2;
}return this.dstate.deflate (flush);
}, "~N");
Clazz.defineMethod (c$, "deflateEnd", 
function () {
if (this.dstate == null) return -2;
var ret = this.dstate.deflateEnd ();
this.dstate = null;
return ret;
});
Clazz.defineMethod (c$, "deflateParams", 
function (level, strategy) {
if (this.dstate == null) return -2;
return this.dstate.deflateParams (level, strategy);
}, "~N,~N");
Clazz.defineMethod (c$, "deflateSetDictionary", 
function (dictionary, dictLength) {
if (this.dstate == null) return -2;
return this.dstate.deflateSetDictionary (dictionary, dictLength);
}, "~A,~N");
Clazz.defineMethod (c$, "flush_pending", 
function () {
var len = this.dstate.pending;
if (len > this.avail_out) len = this.avail_out;
if (len == 0) return;
if (this.dstate.pending_buf.length <= this.dstate.pending_out || this.next_out.length <= this.next_out_index || this.dstate.pending_buf.length < (this.dstate.pending_out + len) || this.next_out.length < (this.next_out_index + len)) {
}System.arraycopy (this.dstate.pending_buf, this.dstate.pending_out, this.next_out, this.next_out_index, len);
this.next_out_index += len;
this.dstate.pending_out += len;
this.total_out += len;
this.avail_out -= len;
this.dstate.pending -= len;
if (this.dstate.pending == 0) {
this.dstate.pending_out = 0;
}});
Clazz.defineMethod (c$, "read_buf", 
function (buf, start, size) {
var len = this.avail_in;
if (len > size) len = size;
if (len == 0) return 0;
this.avail_in -= len;
if (this.dstate.wrap != 0) {
this.adler.updateRange (this.next_in, this.next_in_index, len);
}System.arraycopy (this.next_in, this.next_in_index, buf, start, len);
this.next_in_index += len;
this.total_in += len;
return len;
}, "~A,~N,~N");
Clazz.defineMethod (c$, "getAdler", 
function () {
return this.adler.getValue ();
});
Clazz.defineMethod (c$, "free", 
function () {
this.next_in = null;
this.next_out = null;
this.msg = null;
});
Clazz.defineMethod (c$, "setOutput", 
function (buf) {
this.setOutput (buf, 0, buf.length);
}, "~A");
Clazz.defineMethod (c$, "setOutput", 
function (buf, off, len) {
this.next_out = buf;
this.next_out_index = off;
this.avail_out = len;
}, "~A,~N,~N");
Clazz.defineMethod (c$, "setInput", 
function (buf) {
this.setInput (buf, 0, buf.length, false);
}, "~A");
Clazz.defineMethod (c$, "setInput", 
function (buf, append) {
this.setInput (buf, 0, buf.length, append);
}, "~A,~B");
Clazz.defineMethod (c$, "setInput", 
function (buf, off, len, append) {
if (len <= 0 && append && this.next_in != null) return;
if (this.avail_in > 0 && append) {
var tmp =  Clazz.newByteArray (this.avail_in + len, 0);
System.arraycopy (this.next_in, this.next_in_index, tmp, 0, this.avail_in);
System.arraycopy (buf, off, tmp, this.avail_in, len);
this.next_in = tmp;
this.next_in_index = 0;
this.avail_in += len;
} else {
this.next_in = buf;
this.next_in_index = off;
this.avail_in = len;
}}, "~A,~N,~N,~B");
Clazz.defineMethod (c$, "getNextIn", 
function () {
return this.next_in;
});
Clazz.defineMethod (c$, "setNextIn", 
function (next_in) {
this.next_in = next_in;
}, "~A");
Clazz.defineMethod (c$, "getNextInIndex", 
function () {
return this.next_in_index;
});
Clazz.defineMethod (c$, "setNextInIndex", 
function (next_in_index) {
this.next_in_index = next_in_index;
}, "~N");
Clazz.defineMethod (c$, "getAvailIn", 
function () {
return this.avail_in;
});
Clazz.defineMethod (c$, "setAvailIn", 
function (avail_in) {
this.avail_in = avail_in;
}, "~N");
Clazz.defineMethod (c$, "getNextOut", 
function () {
return this.next_out;
});
Clazz.defineMethod (c$, "setNextOut", 
function (next_out) {
this.next_out = next_out;
}, "~A");
Clazz.defineMethod (c$, "getNextOutIndex", 
function () {
return this.next_out_index;
});
Clazz.defineMethod (c$, "setNextOutIndex", 
function (next_out_index) {
this.next_out_index = next_out_index;
}, "~N");
Clazz.defineMethod (c$, "getAvailOut", 
function () {
return this.avail_out;
});
Clazz.defineMethod (c$, "setAvailOut", 
function (avail_out) {
this.avail_out = avail_out;
}, "~N");
Clazz.defineMethod (c$, "getTotalOut", 
function () {
return this.total_out;
});
Clazz.defineMethod (c$, "getTotalIn", 
function () {
return this.total_in;
});
Clazz.defineMethod (c$, "getMessage", 
function () {
return this.msg;
});
Clazz.defineMethod (c$, "end", 
function () {
return 0;
});
Clazz.defineMethod (c$, "finished", 
function () {
return false;
});
Clazz.defineStatics (c$,
"MAX_WBITS", 15,
"DEF_WBITS", 15,
"Z_OK", 0,
"Z_STREAM_ERROR", -2);
});
// 
//// com\jcraft\jzlib\Inflater.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["com.jcraft.jzlib.ZStream"], "com.jcraft.jzlib.Inflater", ["com.jcraft.jzlib.Inflate"], function () {
c$ = Clazz.declareType (com.jcraft.jzlib, "Inflater", com.jcraft.jzlib.ZStream);
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, com.jcraft.jzlib.Inflater);
this.init ();
});
Clazz.makeConstructor (c$, 
function (w) {
this.construct (w, false);
}, "~N");
Clazz.makeConstructor (c$, 
function (nowrap) {
Clazz.superConstructor (this, com.jcraft.jzlib.Inflater);
this.init (nowrap);
}, "~B");
Clazz.makeConstructor (c$, 
function (w, nowrap) {
Clazz.superConstructor (this, com.jcraft.jzlib.Inflater);
this.init (w, nowrap);
}, "~N,~B");
Clazz.defineMethod (c$, "init", 
function () {
return this.init (15);
});
Clazz.defineMethod (c$, "init", 
function (nowrap) {
return this.init (15, nowrap);
}, "~B");
Clazz.defineMethod (c$, "init", 
function (w) {
return this.init (w, false);
}, "~N");
Clazz.defineMethod (c$, "init", 
function (w, nowrap) {
this.istate =  new com.jcraft.jzlib.Inflate (this);
return this.istate.inflateInit (nowrap ? -w : w);
}, "~N,~B");
Clazz.overrideMethod (c$, "inflate", 
function (f) {
if (this.istate == null) return -2;
var ret = this.istate.inflate (f);
return ret;
}, "~N");
Clazz.overrideMethod (c$, "end", 
function () {
if (this.istate == null) return -2;
var ret = this.istate.inflateEnd ();
return ret;
});
Clazz.defineMethod (c$, "sync", 
function () {
if (this.istate == null) return -2;
return this.istate.inflateSync ();
});
Clazz.defineMethod (c$, "syncPoint", 
function () {
if (this.istate == null) return -2;
return this.istate.inflateSyncPoint ();
});
Clazz.defineMethod (c$, "setDictionary", 
function (dictionary, dictLength) {
if (this.istate == null) return -2;
return this.istate.inflateSetDictionary (dictionary, dictLength);
}, "~A,~N");
Clazz.overrideMethod (c$, "finished", 
function () {
return this.istate.mode == 12;
});
Clazz.defineMethod (c$, "reset", 
function () {
this.avail_in = 0;
if (this.istate != null) this.istate.reset ();
});
Clazz.defineStatics (c$,
"$MAX_WBITS", 15,
"$DEF_WBITS", 15,
"$Z_STREAM_ERROR", -2);
});
// 
//// com\jcraft\jzlib\Adler32.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["com.jcraft.jzlib.Checksum"], "com.jcraft.jzlib.Adler32", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.s1 = 1;
this.s2 = 0;
this.b1 = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "Adler32", null, com.jcraft.jzlib.Checksum);
Clazz.prepareFields (c$, function () {
this.b1 =  Clazz.newByteArray (1, 0);
});
Clazz.overrideMethod (c$, "reset", 
function (init) {
this.s1 = init & 0xffff;
this.s2 = (init >> 16) & 0xffff;
}, "~N");
Clazz.overrideMethod (c$, "resetAll", 
function () {
this.s1 = 1;
this.s2 = 0;
});
Clazz.overrideMethod (c$, "getValue", 
function () {
return ((this.s2 << 16) | this.s1);
});
Clazz.overrideMethod (c$, "updateRange", 
function (buf, index, len) {
if (len == 1) {
this.s1 += buf[index++] & 0xff;
this.s2 += this.s1;
this.s1 %= 65521;
this.s2 %= 65521;
return;
}var len1 = Clazz.doubleToInt (len / 5552);
var len2 = len % 5552;
while (len1-- > 0) {
var k = 5552;
len -= k;
while (k-- > 0) {
this.s1 += buf[index++] & 0xff;
this.s2 += this.s1;
}
this.s1 %= 65521;
this.s2 %= 65521;
}
var k = len2;
len -= k;
while (k-- > 0) {
this.s1 += buf[index++] & 0xff;
this.s2 += this.s1;
}
this.s1 %= 65521;
this.s2 %= 65521;
}, "~A,~N,~N");
Clazz.overrideMethod (c$, "copy", 
function () {
var foo =  new com.jcraft.jzlib.Adler32 ();
foo.s1 = this.s1;
foo.s2 = this.s2;
return foo;
});
c$.combine = Clazz.defineMethod (c$, "combine", 
function (adler1, adler2, len2) {
var BASEL = 65521;
var sum1;
var sum2;
var rem;
rem = len2 % BASEL;
sum1 = adler1 & 0xffff;
sum2 = rem * sum1;
sum2 %= BASEL;
sum1 += (adler2 & 0xffff) + BASEL - 1;
sum2 += ((adler1 >> 16) & 0xffff) + ((adler2 >> 16) & 0xffff) + BASEL - rem;
if (sum1 >= BASEL) sum1 -= BASEL;
if (sum1 >= BASEL) sum1 -= BASEL;
if (sum2 >= (BASEL << 1)) sum2 -= (BASEL << 1);
if (sum2 >= BASEL) sum2 -= BASEL;
return sum1 | (sum2 << 16);
}, "~N,~N,~N");
Clazz.overrideMethod (c$, "update", 
function (b) {
this.b1[0] = b;
this.updateRange (this.b1, 0, 1);
}, "~N");
Clazz.defineStatics (c$,
"BASE", 65521,
"NMAX", 5552);
});
// 
//// com\jcraft\jzlib\Tree.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
c$ = Clazz.decorateAsClass (function () {
this.dyn_tree = null;
this.max_code = 0;
this.stat_desc = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "Tree");
c$.d_code = Clazz.defineMethod (c$, "d_code", 
function (dist) {
return ((dist) < 256 ? com.jcraft.jzlib.Tree._dist_code[dist] : com.jcraft.jzlib.Tree._dist_code[256 + ((dist) >>> 7)]);
}, "~N");
Clazz.defineMethod (c$, "gen_bitlen", 
function (s) {
var tree = this.dyn_tree;
var stree = this.stat_desc.static_tree;
var extra = this.stat_desc.extra_bits;
var base = this.stat_desc.extra_base;
var max_length = this.stat_desc.max_length;
var h;
var n;
var m;
var bits;
var xbits;
var f;
var overflow = 0;
for (bits = 0; bits <= 15; bits++) s.bl_count[bits] = 0;

tree[s.heap[s.heap_max] * 2 + 1] = 0;
for (h = s.heap_max + 1; h < 573; h++) {
n = s.heap[h];
bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
if (bits > max_length) {
bits = max_length;
overflow++;
}tree[n * 2 + 1] = bits;
if (n > this.max_code) continue;
s.bl_count[bits]++;
xbits = 0;
if (n >= base) xbits = extra[n - base];
f = tree[n * 2];
s.opt_len += f * (bits + xbits);
if (stree != null) s.static_len += f * (stree[n * 2 + 1] + xbits);
}
if (overflow == 0) return;
do {
bits = max_length - 1;
while (s.bl_count[bits] == 0) bits--;

s.bl_count[bits]--;
s.bl_count[bits + 1] += 2;
s.bl_count[max_length]--;
overflow -= 2;
} while (overflow > 0);
for (bits = max_length; bits != 0; bits--) {
n = s.bl_count[bits];
while (n != 0) {
m = s.heap[--h];
if (m > this.max_code) continue;
if (tree[m * 2 + 1] != bits) {
s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
tree[m * 2 + 1] = bits;
}n--;
}
}
}, "com.jcraft.jzlib.Deflate");
Clazz.defineMethod (c$, "build_tree", 
function (s) {
var tree = this.dyn_tree;
var stree = this.stat_desc.static_tree;
var elems = this.stat_desc.elems;
var n;
var m;
var max_code = -1;
var node;
s.heap_len = 0;
s.heap_max = 573;
for (n = 0; n < elems; n++) {
if (tree[n * 2] != 0) {
s.heap[++s.heap_len] = max_code = n;
s.depth[n] = 0;
} else {
tree[n * 2 + 1] = 0;
}}
while (s.heap_len < 2) {
node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
tree[node * 2] = 1;
s.depth[node] = 0;
s.opt_len--;
if (stree != null) s.static_len -= stree[node * 2 + 1];
}
this.max_code = max_code;
for (n = Clazz.doubleToInt (s.heap_len / 2); n >= 1; n--) s.pqdownheap (tree, n);

node = elems;
do {
n = s.heap[1];
s.heap[1] = s.heap[s.heap_len--];
s.pqdownheap (tree, 1);
m = s.heap[1];
s.heap[--s.heap_max] = n;
s.heap[--s.heap_max] = m;
tree[node * 2] = (tree[n * 2] + tree[m * 2]);
s.depth[node] = (Math.max (s.depth[n], s.depth[m]) + 1);
tree[n * 2 + 1] = tree[m * 2 + 1] = node;
s.heap[1] = node++;
s.pqdownheap (tree, 1);
} while (s.heap_len >= 2);
s.heap[--s.heap_max] = s.heap[1];
this.gen_bitlen (s);
com.jcraft.jzlib.Tree.gen_codes (tree, max_code, s.bl_count);
}, "com.jcraft.jzlib.Deflate");
c$.gen_codes = Clazz.defineMethod (c$, "gen_codes", 
function (tree, max_code, bl_count) {
var code = 0;
var bits;
var n;
com.jcraft.jzlib.Tree.next_code[0] = 0;
for (bits = 1; bits <= 15; bits++) {
com.jcraft.jzlib.Tree.next_code[bits] = code = ((code + bl_count[bits - 1]) << 1);
}
for (n = 0; n <= max_code; n++) {
var len = tree[n * 2 + 1];
if (len == 0) continue;
tree[n * 2] = (com.jcraft.jzlib.Tree.bi_reverse (com.jcraft.jzlib.Tree.next_code[len]++, len));
}
}, "~A,~N,~A");
c$.bi_reverse = Clazz.defineMethod (c$, "bi_reverse", 
function (code, len) {
var res = 0;
do {
res |= code & 1;
code >>>= 1;
res <<= 1;
} while (--len > 0);
return res >>> 1;
}, "~N,~N");
Clazz.defineStatics (c$,
"MAX_BITS", 15,
"LITERALS", 256,
"LENGTH_CODES", 29,
"L_CODES", (286),
"HEAP_SIZE", (573),
"MAX_BL_BITS", 7,
"END_BLOCK", 256,
"REP_3_6", 16,
"REPZ_3_10", 17,
"REPZ_11_138", 18,
"extra_lbits", [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0],
"extra_dbits", [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
"extra_blbits", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
"bl_order", [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
"Buf_size", 16,
"DIST_CODE_LEN", 512,
"_dist_code", [0, 1, 2, 3, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 0, 0, 16, 17, 18, 18, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29],
"_length_code", [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28],
"base_length", [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 0],
"base_dist", [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192, 12288, 16384, 24576],
"next_code",  Clazz.newShortArray (16, 0));
// 
//// com\jcraft\jzlib\Deflate.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["com.jcraft.jzlib.Tree"], "com.jcraft.jzlib.Deflate", ["com.jcraft.jzlib.CRC32", "$.GZIPHeader", "$.StaticTree"], function () {
c$ = Clazz.decorateAsClass (function () {
this.strm = null;
this.status = 0;
this.pending_buf = null;
this.pending_buf_size = 0;
this.pending_out = 0;
this.pending = 0;
this.wrap = 1;
this.data_type = 0;
this.method = 0;
this.last_flush = 0;
this.w_size = 0;
this.w_bits = 0;
this.w_mask = 0;
this.window = null;
this.window_size = 0;
this.prev = null;
this.head = null;
this.ins_h = 0;
this.hash_size = 0;
this.hash_bits = 0;
this.hash_mask = 0;
this.hash_shift = 0;
this.block_start = 0;
this.match_length = 0;
this.prev_match = 0;
this.match_available = 0;
this.strstart = 0;
this.match_start = 0;
this.lookahead = 0;
this.prev_length = 0;
this.max_chain_length = 0;
this.max_lazy_match = 0;
this.level = 0;
this.strategy = 0;
this.good_match = 0;
this.nice_match = 0;
this.dyn_ltree = null;
this.dyn_dtree = null;
this.bl_tree = null;
this.l_desc = null;
this.d_desc = null;
this.bl_desc = null;
this.bl_count = null;
this.heap = null;
this.heap_len = 0;
this.heap_max = 0;
this.depth = null;
this.l_buf = 0;
this.lit_bufsize = 0;
this.last_lit = 0;
this.d_buf = 0;
this.opt_len = 0;
this.static_len = 0;
this.matches = 0;
this.last_eob_len = 0;
this.bi_buf = 0;
this.bi_valid = 0;
this.gheader = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "Deflate");
Clazz.prepareFields (c$, function () {
this.l_desc =  new com.jcraft.jzlib.Tree ();
this.d_desc =  new com.jcraft.jzlib.Tree ();
this.bl_desc =  new com.jcraft.jzlib.Tree ();
this.bl_count =  Clazz.newShortArray (16, 0);
this.heap =  Clazz.newIntArray (573, 0);
this.depth =  Clazz.newByteArray (573, 0);
});
Clazz.makeConstructor (c$, 
function (strm) {
this.strm = strm;
this.dyn_ltree =  Clazz.newShortArray (1146, 0);
this.dyn_dtree =  Clazz.newShortArray (122, 0);
this.bl_tree =  Clazz.newShortArray (78, 0);
}, "com.jcraft.jzlib.ZStream");
Clazz.defineMethod (c$, "lm_init", 
function () {
this.window_size = 2 * this.w_size;
this.head[this.hash_size - 1] = 0;
for (var i = 0; i < this.hash_size - 1; i++) {
this.head[i] = 0;
}
this.max_lazy_match = com.jcraft.jzlib.Deflate.config_table[this.level].max_lazy;
this.good_match = com.jcraft.jzlib.Deflate.config_table[this.level].good_length;
this.nice_match = com.jcraft.jzlib.Deflate.config_table[this.level].nice_length;
this.max_chain_length = com.jcraft.jzlib.Deflate.config_table[this.level].max_chain;
this.strstart = 0;
this.block_start = 0;
this.lookahead = 0;
this.match_length = this.prev_length = 2;
this.match_available = 0;
this.ins_h = 0;
});
Clazz.defineMethod (c$, "tr_init", 
function () {
this.l_desc.dyn_tree = this.dyn_ltree;
this.l_desc.stat_desc = com.jcraft.jzlib.StaticTree.static_l_desc;
this.d_desc.dyn_tree = this.dyn_dtree;
this.d_desc.stat_desc = com.jcraft.jzlib.StaticTree.static_d_desc;
this.bl_desc.dyn_tree = this.bl_tree;
this.bl_desc.stat_desc = com.jcraft.jzlib.StaticTree.static_bl_desc;
this.bi_buf = 0;
this.bi_valid = 0;
this.last_eob_len = 8;
this.init_block ();
});
Clazz.defineMethod (c$, "init_block", 
function () {
for (var i = 0; i < 286; i++) this.dyn_ltree[i * 2] = 0;

for (var i = 0; i < 30; i++) this.dyn_dtree[i * 2] = 0;

for (var i = 0; i < 19; i++) this.bl_tree[i * 2] = 0;

this.dyn_ltree[512] = 1;
this.opt_len = this.static_len = 0;
this.last_lit = this.matches = 0;
});
Clazz.defineMethod (c$, "pqdownheap", 
function (tree, k) {
var v = this.heap[k];
var j = k << 1;
while (j <= this.heap_len) {
if (j < this.heap_len && com.jcraft.jzlib.Deflate.smaller (tree, this.heap[j + 1], this.heap[j], this.depth)) {
j++;
}if (com.jcraft.jzlib.Deflate.smaller (tree, v, this.heap[j], this.depth)) break;
this.heap[k] = this.heap[j];
k = j;
j <<= 1;
}
this.heap[k] = v;
}, "~A,~N");
c$.smaller = Clazz.defineMethod (c$, "smaller", 
function (tree, n, m, depth) {
var tn2 = tree[n * 2];
var tm2 = tree[m * 2];
return (tn2 < tm2 || (tn2 == tm2 && depth[n] <= depth[m]));
}, "~A,~N,~N,~A");
Clazz.defineMethod (c$, "scan_tree", 
function (tree, max_code) {
var n;
var prevlen = -1;
var curlen;
var nextlen = tree[1];
var count = 0;
var max_count = 7;
var min_count = 4;
if (nextlen == 0) {
max_count = 138;
min_count = 3;
}tree[(max_code + 1) * 2 + 1] = 0xffff;
for (n = 0; n <= max_code; n++) {
curlen = nextlen;
nextlen = tree[(n + 1) * 2 + 1];
if (++count < max_count && curlen == nextlen) {
continue;
} else if (count < min_count) {
this.bl_tree[curlen * 2] += count;
} else if (curlen != 0) {
if (curlen != prevlen) this.bl_tree[curlen * 2]++;
this.bl_tree[32]++;
} else if (count <= 10) {
this.bl_tree[34]++;
} else {
this.bl_tree[36]++;
}count = 0;
prevlen = curlen;
if (nextlen == 0) {
max_count = 138;
min_count = 3;
} else if (curlen == nextlen) {
max_count = 6;
min_count = 3;
} else {
max_count = 7;
min_count = 4;
}}
}, "~A,~N");
Clazz.defineMethod (c$, "build_bl_tree", 
function () {
var max_blindex;
this.scan_tree (this.dyn_ltree, this.l_desc.max_code);
this.scan_tree (this.dyn_dtree, this.d_desc.max_code);
this.bl_desc.build_tree (this);
for (max_blindex = 18; max_blindex >= 3; max_blindex--) {
if (this.bl_tree[com.jcraft.jzlib.Tree.bl_order[max_blindex] * 2 + 1] != 0) break;
}
this.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
return max_blindex;
});
Clazz.defineMethod (c$, "send_all_trees", 
function (lcodes, dcodes, blcodes) {
var rank;
this.send_bits (lcodes - 257, 5);
this.send_bits (dcodes - 1, 5);
this.send_bits (blcodes - 4, 4);
for (rank = 0; rank < blcodes; rank++) {
this.send_bits (this.bl_tree[com.jcraft.jzlib.Tree.bl_order[rank] * 2 + 1], 3);
}
this.send_tree (this.dyn_ltree, lcodes - 1);
this.send_tree (this.dyn_dtree, dcodes - 1);
}, "~N,~N,~N");
Clazz.defineMethod (c$, "send_tree", 
function (tree, max_code) {
var n;
var prevlen = -1;
var curlen;
var nextlen = tree[1];
var count = 0;
var max_count = 7;
var min_count = 4;
if (nextlen == 0) {
max_count = 138;
min_count = 3;
}for (n = 0; n <= max_code; n++) {
curlen = nextlen;
nextlen = tree[(n + 1) * 2 + 1];
if (++count < max_count && curlen == nextlen) {
continue;
} else if (count < min_count) {
do {
this.send_code (curlen, this.bl_tree);
} while (--count != 0);
} else if (curlen != 0) {
if (curlen != prevlen) {
this.send_code (curlen, this.bl_tree);
count--;
}this.send_code (16, this.bl_tree);
this.send_bits (count - 3, 2);
} else if (count <= 10) {
this.send_code (17, this.bl_tree);
this.send_bits (count - 3, 3);
} else {
this.send_code (18, this.bl_tree);
this.send_bits (count - 11, 7);
}count = 0;
prevlen = curlen;
if (nextlen == 0) {
max_count = 138;
min_count = 3;
} else if (curlen == nextlen) {
max_count = 6;
min_count = 3;
} else {
max_count = 7;
min_count = 4;
}}
}, "~A,~N");
Clazz.defineMethod (c$, "put_byte", 
function (p, start, len) {
System.arraycopy (p, start, this.pending_buf, this.pending, len);
this.pending += len;
}, "~A,~N,~N");
Clazz.defineMethod (c$, "put_byteB", 
function (c) {
this.pending_buf[this.pending++] = c;
}, "~N");
Clazz.defineMethod (c$, "put_short", 
function (w) {
this.put_byteB ((w));
this.put_byteB ((w >>> 8));
}, "~N");
Clazz.defineMethod (c$, "putShortMSB", 
function (b) {
this.put_byteB ((b >> 8));
this.put_byteB ((b));
}, "~N");
Clazz.defineMethod (c$, "send_code", 
function (c, tree) {
var c2 = c * 2;
this.send_bits ((tree[c2] & 0xffff), (tree[c2 + 1] & 0xffff));
}, "~N,~A");
Clazz.defineMethod (c$, "send_bits", 
function (value, length) {
var len = length;
if (this.bi_valid > 16 - len) {
var val = value;
this.bi_buf |= ((val << this.bi_valid) & 0xffff);
this.put_short (this.bi_buf);
this.bi_buf = (val >>> (16 - this.bi_valid));
this.bi_valid += len - 16;
} else {
this.bi_buf |= (((value) << this.bi_valid) & 0xffff);
this.bi_valid += len;
}}, "~N,~N");
Clazz.defineMethod (c$, "_tr_align", 
function () {
this.send_bits (2, 3);
this.send_code (256, com.jcraft.jzlib.StaticTree.static_ltree);
this.bi_flush ();
if (1 + this.last_eob_len + 10 - this.bi_valid < 9) {
this.send_bits (2, 3);
this.send_code (256, com.jcraft.jzlib.StaticTree.static_ltree);
this.bi_flush ();
}this.last_eob_len = 7;
});
Clazz.defineMethod (c$, "_tr_tally", 
function (dist, lc) {
this.pending_buf[this.d_buf + this.last_lit * 2] = (dist >>> 8);
this.pending_buf[this.d_buf + this.last_lit * 2 + 1] = dist;
this.pending_buf[this.l_buf + this.last_lit] = lc;
this.last_lit++;
if (dist == 0) {
this.dyn_ltree[lc * 2]++;
} else {
this.matches++;
dist--;
this.dyn_ltree[(com.jcraft.jzlib.Tree._length_code[lc] + 256 + 1) * 2]++;
this.dyn_dtree[com.jcraft.jzlib.Tree.d_code (dist) * 2]++;
}if ((this.last_lit & 0x1fff) == 0 && this.level > 2) {
var out_length = this.last_lit * 8;
var in_length = this.strstart - this.block_start;
var dcode;
for (dcode = 0; dcode < 30; dcode++) {
out_length += this.dyn_dtree[dcode * 2] * (5 + com.jcraft.jzlib.Tree.extra_dbits[dcode]);
}
out_length >>>= 3;
if ((this.matches < (Clazz.doubleToInt (this.last_lit / 2))) && out_length < Clazz.doubleToInt (in_length / 2)) return true;
}return (this.last_lit == this.lit_bufsize - 1);
}, "~N,~N");
Clazz.defineMethod (c$, "compress_block", 
function (ltree, dtree) {
var dist;
var lc;
var lx = 0;
var code;
var extra;
if (this.last_lit != 0) {
do {
dist = ((this.pending_buf[this.d_buf + lx * 2] << 8) & 0xff00) | (this.pending_buf[this.d_buf + lx * 2 + 1] & 0xff);
lc = (this.pending_buf[this.l_buf + lx]) & 0xff;
lx++;
if (dist == 0) {
this.send_code (lc, ltree);
} else {
code = com.jcraft.jzlib.Tree._length_code[lc];
this.send_code (code + 256 + 1, ltree);
extra = com.jcraft.jzlib.Tree.extra_lbits[code];
if (extra != 0) {
lc -= com.jcraft.jzlib.Tree.base_length[code];
this.send_bits (lc, extra);
}dist--;
code = com.jcraft.jzlib.Tree.d_code (dist);
this.send_code (code, dtree);
extra = com.jcraft.jzlib.Tree.extra_dbits[code];
if (extra != 0) {
dist -= com.jcraft.jzlib.Tree.base_dist[code];
this.send_bits (dist, extra);
}}} while (lx < this.last_lit);
}this.send_code (256, ltree);
this.last_eob_len = ltree[513];
}, "~A,~A");
Clazz.defineMethod (c$, "set_data_type", 
function () {
var n = 0;
var ascii_freq = 0;
var bin_freq = 0;
while (n < 7) {
bin_freq += this.dyn_ltree[n * 2];
n++;
}
while (n < 128) {
ascii_freq += this.dyn_ltree[n * 2];
n++;
}
while (n < 256) {
bin_freq += this.dyn_ltree[n * 2];
n++;
}
this.data_type = (bin_freq > (ascii_freq >>> 2) ? 0 : 1);
});
Clazz.defineMethod (c$, "bi_flush", 
function () {
if (this.bi_valid == 16) {
this.put_short (this.bi_buf);
this.bi_buf = 0;
this.bi_valid = 0;
} else if (this.bi_valid >= 8) {
this.put_byteB (this.bi_buf);
this.bi_buf >>>= 8;
this.bi_valid -= 8;
}});
Clazz.defineMethod (c$, "bi_windup", 
function () {
if (this.bi_valid > 8) {
this.put_short (this.bi_buf);
} else if (this.bi_valid > 0) {
this.put_byteB (this.bi_buf);
}this.bi_buf = 0;
this.bi_valid = 0;
});
Clazz.defineMethod (c$, "copy_block", 
function (buf, len, header) {
this.bi_windup ();
this.last_eob_len = 8;
if (header) {
this.put_short (len);
this.put_short (~len);
}this.put_byte (this.window, buf, len);
}, "~N,~N,~B");
Clazz.defineMethod (c$, "flush_block_only", 
function (eof) {
this._tr_flush_block (this.block_start >= 0 ? this.block_start : -1, this.strstart - this.block_start, eof);
this.block_start = this.strstart;
this.strm.flush_pending ();
}, "~B");
Clazz.defineMethod (c$, "deflate_stored", 
function (flush) {
var max_block_size = 0xffff;
var max_start;
if (max_block_size > this.pending_buf_size - 5) {
max_block_size = this.pending_buf_size - 5;
}while (true) {
if (this.lookahead <= 1) {
this.fill_window ();
if (this.lookahead == 0 && flush == 0) return 0;
if (this.lookahead == 0) break;
}this.strstart += this.lookahead;
this.lookahead = 0;
max_start = this.block_start + max_block_size;
if (this.strstart == 0 || this.strstart >= max_start) {
this.lookahead = (this.strstart - max_start);
this.strstart = max_start;
this.flush_block_only (false);
if (this.strm.avail_out == 0) return 0;
}if (this.strstart - this.block_start >= this.w_size - 262) {
this.flush_block_only (false);
if (this.strm.avail_out == 0) return 0;
}}
this.flush_block_only (flush == 4);
if (this.strm.avail_out == 0) return (flush == 4) ? 2 : 0;
return flush == 4 ? 3 : 1;
}, "~N");
Clazz.defineMethod (c$, "_tr_stored_block", 
function (buf, stored_len, eof) {
this.send_bits ((0) + (eof ? 1 : 0), 3);
this.copy_block (buf, stored_len, true);
}, "~N,~N,~B");
Clazz.defineMethod (c$, "_tr_flush_block", 
function (buf, stored_len, eof) {
var opt_lenb;
var static_lenb;
var max_blindex = 0;
if (this.level > 0) {
if (this.data_type == 2) this.set_data_type ();
this.l_desc.build_tree (this);
this.d_desc.build_tree (this);
max_blindex = this.build_bl_tree ();
opt_lenb = (this.opt_len + 3 + 7) >>> 3;
static_lenb = (this.static_len + 3 + 7) >>> 3;
if (static_lenb <= opt_lenb) opt_lenb = static_lenb;
} else {
opt_lenb = static_lenb = stored_len + 5;
}if (stored_len + 4 <= opt_lenb && buf != -1) {
this._tr_stored_block (buf, stored_len, eof);
} else if (static_lenb == opt_lenb) {
this.send_bits ((2) + (eof ? 1 : 0), 3);
this.compress_block (com.jcraft.jzlib.StaticTree.static_ltree, com.jcraft.jzlib.StaticTree.static_dtree);
} else {
this.send_bits ((4) + (eof ? 1 : 0), 3);
this.send_all_trees (this.l_desc.max_code + 1, this.d_desc.max_code + 1, max_blindex + 1);
this.compress_block (this.dyn_ltree, this.dyn_dtree);
}this.init_block ();
if (eof) {
this.bi_windup ();
}}, "~N,~N,~B");
Clazz.defineMethod (c$, "fill_window", 
function () {
var n;
var m;
var p;
var more;
do {
more = (this.window_size - this.lookahead - this.strstart);
if (more == 0 && this.strstart == 0 && this.lookahead == 0) {
more = this.w_size;
} else if (more == -1) {
more--;
} else if (this.strstart >= this.w_size + this.w_size - 262) {
System.arraycopy (this.window, this.w_size, this.window, 0, this.w_size);
this.match_start -= this.w_size;
this.strstart -= this.w_size;
this.block_start -= this.w_size;
n = this.hash_size;
p = n;
do {
m = (this.head[--p] & 0xffff);
this.head[p] = (m >= this.w_size ? (m - this.w_size) : 0);
} while (--n != 0);
n = this.w_size;
p = n;
do {
m = (this.prev[--p] & 0xffff);
this.prev[p] = (m >= this.w_size ? (m - this.w_size) : 0);
} while (--n != 0);
more += this.w_size;
}if (this.strm.avail_in == 0) return;
n = this.strm.read_buf (this.window, this.strstart + this.lookahead, more);
this.lookahead += n;
if (this.lookahead >= 3) {
this.ins_h = this.window[this.strstart] & 0xff;
this.ins_h = (((this.ins_h) << this.hash_shift) ^ (this.window[this.strstart + 1] & 0xff)) & this.hash_mask;
}} while (this.lookahead < 262 && this.strm.avail_in != 0);
});
Clazz.defineMethod (c$, "deflate_fast", 
function (flush) {
var hash_head = 0;
var bflush;
while (true) {
if (this.lookahead < 262) {
this.fill_window ();
if (this.lookahead < 262 && flush == 0) {
return 0;
}if (this.lookahead == 0) break;
}if (this.lookahead >= 3) {
this.ins_h = (((this.ins_h) << this.hash_shift) ^ (this.window[(this.strstart) + (2)] & 0xff)) & this.hash_mask;
hash_head = (this.head[this.ins_h] & 0xffff);
this.prev[this.strstart & this.w_mask] = this.head[this.ins_h];
this.head[this.ins_h] = this.strstart;
}if (hash_head != 0 && ((this.strstart - hash_head) & 0xffff) <= this.w_size - 262) {
if (this.strategy != 2) {
this.match_length = this.longest_match (hash_head);
}}if (this.match_length >= 3) {
bflush = this._tr_tally (this.strstart - this.match_start, this.match_length - 3);
this.lookahead -= this.match_length;
if (this.match_length <= this.max_lazy_match && this.lookahead >= 3) {
this.match_length--;
do {
this.strstart++;
this.ins_h = ((this.ins_h << this.hash_shift) ^ (this.window[(this.strstart) + (2)] & 0xff)) & this.hash_mask;
hash_head = (this.head[this.ins_h] & 0xffff);
this.prev[this.strstart & this.w_mask] = this.head[this.ins_h];
this.head[this.ins_h] = this.strstart;
} while (--this.match_length != 0);
this.strstart++;
} else {
this.strstart += this.match_length;
this.match_length = 0;
this.ins_h = this.window[this.strstart] & 0xff;
this.ins_h = (((this.ins_h) << this.hash_shift) ^ (this.window[this.strstart + 1] & 0xff)) & this.hash_mask;
}} else {
bflush = this._tr_tally (0, this.window[this.strstart] & 0xff);
this.lookahead--;
this.strstart++;
}if (bflush) {
this.flush_block_only (false);
if (this.strm.avail_out == 0) return 0;
}}
this.flush_block_only (flush == 4);
if (this.strm.avail_out == 0) {
if (flush == 4) return 2;
return 0;
}return flush == 4 ? 3 : 1;
}, "~N");
Clazz.defineMethod (c$, "deflate_slow", 
function (flush) {
var hash_head = 0;
var bflush;
while (true) {
if (this.lookahead < 262) {
this.fill_window ();
if (this.lookahead < 262 && flush == 0) {
return 0;
}if (this.lookahead == 0) break;
}if (this.lookahead >= 3) {
this.ins_h = (((this.ins_h) << this.hash_shift) ^ (this.window[(this.strstart) + (2)] & 0xff)) & this.hash_mask;
hash_head = (this.head[this.ins_h] & 0xffff);
this.prev[this.strstart & this.w_mask] = this.head[this.ins_h];
this.head[this.ins_h] = this.strstart;
}this.prev_length = this.match_length;
this.prev_match = this.match_start;
this.match_length = 2;
if (hash_head != 0 && this.prev_length < this.max_lazy_match && ((this.strstart - hash_head) & 0xffff) <= this.w_size - 262) {
if (this.strategy != 2) {
this.match_length = this.longest_match (hash_head);
}if (this.match_length <= 5 && (this.strategy == 1 || (this.match_length == 3 && this.strstart - this.match_start > 4096))) {
this.match_length = 2;
}}if (this.prev_length >= 3 && this.match_length <= this.prev_length) {
var max_insert = this.strstart + this.lookahead - 3;
bflush = this._tr_tally (this.strstart - 1 - this.prev_match, this.prev_length - 3);
this.lookahead -= this.prev_length - 1;
this.prev_length -= 2;
do {
if (++this.strstart <= max_insert) {
this.ins_h = (((this.ins_h) << this.hash_shift) ^ (this.window[(this.strstart) + (2)] & 0xff)) & this.hash_mask;
hash_head = (this.head[this.ins_h] & 0xffff);
this.prev[this.strstart & this.w_mask] = this.head[this.ins_h];
this.head[this.ins_h] = this.strstart;
}} while (--this.prev_length != 0);
this.match_available = 0;
this.match_length = 2;
this.strstart++;
if (bflush) {
this.flush_block_only (false);
if (this.strm.avail_out == 0) return 0;
}} else if (this.match_available != 0) {
bflush = this._tr_tally (0, this.window[this.strstart - 1] & 0xff);
if (bflush) {
this.flush_block_only (false);
}this.strstart++;
this.lookahead--;
if (this.strm.avail_out == 0) return 0;
} else {
this.match_available = 1;
this.strstart++;
this.lookahead--;
}}
if (this.match_available != 0) {
bflush = this._tr_tally (0, this.window[this.strstart - 1] & 0xff);
this.match_available = 0;
}this.flush_block_only (flush == 4);
if (this.strm.avail_out == 0) {
if (flush == 4) return 2;
return 0;
}return flush == 4 ? 3 : 1;
}, "~N");
Clazz.defineMethod (c$, "longest_match", 
function (cur_match) {
var chain_length = this.max_chain_length;
var scan = this.strstart;
var match;
var len;
var best_len = this.prev_length;
var limit = this.strstart > (this.w_size - 262) ? this.strstart - (this.w_size - 262) : 0;
var nice_match = this.nice_match;
var wmask = this.w_mask;
var strend = this.strstart + 258;
var scan_end1 = this.window[scan + best_len - 1];
var scan_end = this.window[scan + best_len];
if (this.prev_length >= this.good_match) {
chain_length >>= 2;
}if (nice_match > this.lookahead) nice_match = this.lookahead;
do {
match = cur_match;
if (this.window[match + best_len] != scan_end || this.window[match + best_len - 1] != scan_end1 || this.window[match] != this.window[scan] || this.window[++match] != this.window[scan + 1]) continue;
scan += 2;
match++;
do {
} while (this.window[++scan] == this.window[++match] && this.window[++scan] == this.window[++match] && this.window[++scan] == this.window[++match] && this.window[++scan] == this.window[++match] && this.window[++scan] == this.window[++match] && this.window[++scan] == this.window[++match] && this.window[++scan] == this.window[++match] && this.window[++scan] == this.window[++match] && scan < strend);
len = 258 - (strend - scan);
scan = strend - 258;
if (len > best_len) {
this.match_start = cur_match;
best_len = len;
if (len >= nice_match) break;
scan_end1 = this.window[scan + best_len - 1];
scan_end = this.window[scan + best_len];
}} while ((cur_match = (this.prev[cur_match & wmask] & 0xffff)) > limit && --chain_length != 0);
if (best_len <= this.lookahead) return best_len;
return this.lookahead;
}, "~N");
Clazz.defineMethod (c$, "deflateInit3", 
function (level, bits, memlevel) {
return this.deflateInit5 (level, 8, bits, memlevel, 0);
}, "~N,~N,~N");
Clazz.defineMethod (c$, "deflateInit2", 
function (level, bits) {
return this.deflateInit5 (level, 8, bits, 8, 0);
}, "~N,~N");
Clazz.defineMethod (c$, "deflateInit", 
function (level) {
return this.deflateInit2 (level, 15);
}, "~N");
Clazz.defineMethod (c$, "deflateInit5", 
($fz = function (level, method, windowBits, memLevel, strategy) {
var wrap = 1;
this.strm.msg = null;
if (level == -1) level = 6;
if (windowBits < 0) {
wrap = 0;
windowBits = -windowBits;
} else if (windowBits > 15) {
wrap = 2;
windowBits -= 16;
this.strm.adler =  new com.jcraft.jzlib.CRC32 ();
}if (memLevel < 1 || memLevel > 9 || method != 8 || windowBits < 9 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > 2) {
return -2;
}this.strm.dstate = this;
this.wrap = wrap;
this.w_bits = windowBits;
this.w_size = 1 << this.w_bits;
this.w_mask = this.w_size - 1;
this.hash_bits = memLevel + 7;
this.hash_size = 1 << this.hash_bits;
this.hash_mask = this.hash_size - 1;
this.hash_shift = (Clazz.doubleToInt ((this.hash_bits + 3 - 1) / 3));
this.window =  Clazz.newByteArray (this.w_size * 2, 0);
this.prev =  Clazz.newShortArray (this.w_size, 0);
this.head =  Clazz.newShortArray (this.hash_size, 0);
this.lit_bufsize = 1 << (memLevel + 6);
this.pending_buf =  Clazz.newByteArray (this.lit_bufsize * 4, 0);
this.pending_buf_size = this.lit_bufsize * 4;
this.d_buf = Clazz.doubleToInt (this.lit_bufsize / 2);
this.l_buf = (3) * this.lit_bufsize;
this.level = level;
this.strategy = strategy;
this.method = method;
return this.deflateReset ();
}, $fz.isPrivate = true, $fz), "~N,~N,~N,~N,~N");
Clazz.defineMethod (c$, "deflateReset", 
function () {
this.strm.total_in = this.strm.total_out = 0;
this.strm.msg = null;
this.strm.data_type = 2;
this.pending = 0;
this.pending_out = 0;
if (this.wrap < 0) {
this.wrap = -this.wrap;
}this.status = (this.wrap == 0) ? 113 : 42;
this.strm.adler.resetAll ();
this.last_flush = 0;
this.tr_init ();
this.lm_init ();
return 0;
});
Clazz.defineMethod (c$, "deflateEnd", 
function () {
if (this.status != 42 && this.status != 113 && this.status != 666) {
return -2;
}this.pending_buf = null;
this.head = null;
this.prev = null;
this.window = null;
return this.status == 113 ? -3 : 0;
});
Clazz.defineMethod (c$, "deflateParams", 
function (_level, _strategy) {
var err = 0;
if (_level == -1) {
_level = 6;
}if (_level < 0 || _level > 9 || _strategy < 0 || _strategy > 2) {
return -2;
}if (com.jcraft.jzlib.Deflate.config_table[this.level].func != com.jcraft.jzlib.Deflate.config_table[_level].func && this.strm.total_in != 0) {
err = this.strm.deflate (1);
}if (this.level != _level) {
this.level = _level;
this.max_lazy_match = com.jcraft.jzlib.Deflate.config_table[this.level].max_lazy;
this.good_match = com.jcraft.jzlib.Deflate.config_table[this.level].good_length;
this.nice_match = com.jcraft.jzlib.Deflate.config_table[this.level].nice_length;
this.max_chain_length = com.jcraft.jzlib.Deflate.config_table[this.level].max_chain;
}this.strategy = _strategy;
return err;
}, "~N,~N");
Clazz.defineMethod (c$, "deflateSetDictionary", 
function (dictionary, dictLength) {
var length = dictLength;
var index = 0;
if (dictionary == null || this.status != 42) return -2;
this.strm.adler.updateRange (dictionary, 0, dictLength);
if (length < 3) return 0;
if (length > this.w_size - 262) {
length = this.w_size - 262;
index = dictLength - length;
}System.arraycopy (dictionary, index, this.window, 0, length);
this.strstart = length;
this.block_start = length;
this.ins_h = this.window[0] & 0xff;
this.ins_h = (((this.ins_h) << this.hash_shift) ^ (this.window[1] & 0xff)) & this.hash_mask;
for (var n = 0; n <= length - 3; n++) {
this.ins_h = (((this.ins_h) << this.hash_shift) ^ (this.window[(n) + (2)] & 0xff)) & this.hash_mask;
this.prev[n & this.w_mask] = this.head[this.ins_h];
this.head[this.ins_h] = n;
}
return 0;
}, "~A,~N");
Clazz.defineMethod (c$, "deflate", 
function (flush) {
var old_flush;
if (flush > 4 || flush < 0) {
return -2;
}if (this.strm.next_out == null || (this.strm.next_in == null && this.strm.avail_in != 0) || (this.status == 666 && flush != 4)) {
this.strm.msg = com.jcraft.jzlib.Deflate.z_errmsg[4];
return -2;
}if (this.strm.avail_out == 0) {
this.strm.msg = com.jcraft.jzlib.Deflate.z_errmsg[7];
return -5;
}old_flush = this.last_flush;
this.last_flush = flush;
if (this.status == 42) {
if (this.wrap == 2) {
this.getGZIPHeader ().put (this);
this.status = 113;
this.strm.adler.resetAll ();
} else {
var header = (8 + ((this.w_bits - 8) << 4)) << 8;
var level_flags = ((this.level - 1) & 0xff) >> 1;
if (level_flags > 3) level_flags = 3;
header |= (level_flags << 6);
if (this.strstart != 0) header |= 32;
header += 31 - (header % 31);
this.status = 113;
this.putShortMSB (header);
if (this.strstart != 0) {
var adler = this.strm.adler.getValue ();
this.putShortMSB ((adler >>> 16));
this.putShortMSB ((adler & 0xffff));
}this.strm.adler.resetAll ();
}}if (this.pending != 0) {
this.strm.flush_pending ();
if (this.strm.avail_out == 0) {
this.last_flush = -1;
return 0;
}} else if (this.strm.avail_in == 0 && flush <= old_flush && flush != 4) {
this.strm.msg = com.jcraft.jzlib.Deflate.z_errmsg[7];
return -5;
}if (this.status == 666 && this.strm.avail_in != 0) {
this.strm.msg = com.jcraft.jzlib.Deflate.z_errmsg[7];
return -5;
}if (this.strm.avail_in != 0 || this.lookahead != 0 || (flush != 0 && this.status != 666)) {
var bstate = -1;
switch (com.jcraft.jzlib.Deflate.config_table[this.level].func) {
case 0:
bstate = this.deflate_stored (flush);
break;
case 1:
bstate = this.deflate_fast (flush);
break;
case 2:
bstate = this.deflate_slow (flush);
break;
default:
}
if (bstate == 2 || bstate == 3) {
this.status = 666;
}if (bstate == 0 || bstate == 2) {
if (this.strm.avail_out == 0) {
this.last_flush = -1;
}return 0;
}if (bstate == 1) {
if (flush == 1) {
this._tr_align ();
} else {
this._tr_stored_block (0, 0, false);
if (flush == 3) {
for (var i = 0; i < this.hash_size; i++) this.head[i] = 0;

}}this.strm.flush_pending ();
if (this.strm.avail_out == 0) {
this.last_flush = -1;
return 0;
}}}if (flush != 4) return 0;
if (this.wrap <= 0) return 1;
if (this.wrap == 2) {
var adler = this.strm.adler.getValue ();
this.put_byteB ((adler & 0xff));
this.put_byteB (((adler >> 8) & 0xff));
this.put_byteB (((adler >> 16) & 0xff));
this.put_byteB (((adler >> 24) & 0xff));
this.put_byteB ((this.strm.total_in & 0xff));
this.put_byteB (((this.strm.total_in >> 8) & 0xff));
this.put_byteB (((this.strm.total_in >> 16) & 0xff));
this.put_byteB (((this.strm.total_in >> 24) & 0xff));
this.getGZIPHeader ().setCRC (adler);
} else {
var adler = this.strm.adler.getValue ();
this.putShortMSB ((adler >>> 16));
this.putShortMSB ((adler & 0xffff));
}this.strm.flush_pending ();
if (this.wrap > 0) this.wrap = -this.wrap;
return this.pending != 0 ? 0 : 1;
}, "~N");
Clazz.defineMethod (c$, "getGZIPHeader", 
function () {
if (this.gheader == null) {
this.gheader =  new com.jcraft.jzlib.GZIPHeader ();
}return this.gheader;
});
Clazz.pu$h ();
c$ = Clazz.decorateAsClass (function () {
this.good_length = 0;
this.max_lazy = 0;
this.nice_length = 0;
this.max_chain = 0;
this.func = 0;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib.Deflate, "Config");
Clazz.makeConstructor (c$, 
function (a, b, c, d, e) {
this.good_length = a;
this.max_lazy = b;
this.nice_length = c;
this.max_chain = d;
this.func = e;
}, "~N,~N,~N,~N,~N");
c$ = Clazz.p0p ();
Clazz.defineStatics (c$,
"MAX_MEM_LEVEL", 9,
"Z_DEFAULT_COMPRESSION", -1,
"MAX_WBITS", 15,
"DEF_MEM_LEVEL", 8,
"STORED", 0,
"FAST", 1,
"SLOW", 2,
"config_table", null);
{
($t$ = com.jcraft.jzlib.Deflate.config_table =  new Array (10), com.jcraft.jzlib.Deflate.prototype.config_table = com.jcraft.jzlib.Deflate.config_table, $t$);
com.jcraft.jzlib.Deflate.config_table[0] =  new com.jcraft.jzlib.Deflate.Config (0, 0, 0, 0, 0);
com.jcraft.jzlib.Deflate.config_table[1] =  new com.jcraft.jzlib.Deflate.Config (4, 4, 8, 4, 1);
com.jcraft.jzlib.Deflate.config_table[2] =  new com.jcraft.jzlib.Deflate.Config (4, 5, 16, 8, 1);
com.jcraft.jzlib.Deflate.config_table[3] =  new com.jcraft.jzlib.Deflate.Config (4, 6, 32, 32, 1);
com.jcraft.jzlib.Deflate.config_table[4] =  new com.jcraft.jzlib.Deflate.Config (4, 4, 16, 16, 2);
com.jcraft.jzlib.Deflate.config_table[5] =  new com.jcraft.jzlib.Deflate.Config (8, 16, 32, 32, 2);
com.jcraft.jzlib.Deflate.config_table[6] =  new com.jcraft.jzlib.Deflate.Config (8, 16, 128, 128, 2);
com.jcraft.jzlib.Deflate.config_table[7] =  new com.jcraft.jzlib.Deflate.Config (8, 32, 128, 256, 2);
com.jcraft.jzlib.Deflate.config_table[8] =  new com.jcraft.jzlib.Deflate.Config (32, 128, 258, 1024, 2);
com.jcraft.jzlib.Deflate.config_table[9] =  new com.jcraft.jzlib.Deflate.Config (32, 258, 258, 4096, 2);
}Clazz.defineStatics (c$,
"z_errmsg", ["need dictionary", "stream end", "", "file error", "stream error", "data error", "insufficient memory", "buffer error", "incompatible version", ""],
"NeedMore", 0,
"BlockDone", 1,
"FinishStarted", 2,
"FinishDone", 3,
"PRESET_DICT", 0x20,
"Z_FILTERED", 1,
"Z_HUFFMAN_ONLY", 2,
"Z_DEFAULT_STRATEGY", 0,
"Z_NO_FLUSH", 0,
"Z_PARTIAL_FLUSH", 1,
"Z_FULL_FLUSH", 3,
"Z_FINISH", 4,
"Z_OK", 0,
"Z_STREAM_END", 1,
"Z_NEED_DICT", 2,
"Z_STREAM_ERROR", -2,
"Z_DATA_ERROR", -3,
"Z_BUF_ERROR", -5,
"INIT_STATE", 42,
"BUSY_STATE", 113,
"FINISH_STATE", 666,
"Z_DEFLATED", 8,
"STORED_BLOCK", 0,
"STATIC_TREES", 1,
"DYN_TREES", 2,
"Z_BINARY", 0,
"Z_ASCII", 1,
"Z_UNKNOWN", 2,
"Buf_size", 16,
"REP_3_6", 16,
"REPZ_3_10", 17,
"REPZ_11_138", 18,
"MIN_MATCH", 3,
"MAX_MATCH", 258,
"MIN_LOOKAHEAD", (262),
"MAX_BITS", 15,
"D_CODES", 30,
"BL_CODES", 19,
"LENGTH_CODES", 29,
"LITERALS", 256,
"L_CODES", (286),
"HEAP_SIZE", (573),
"END_BLOCK", 256);
});
// 
//// com\jcraft\jzlib\GZIPHeader.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (null, "com.jcraft.jzlib.GZIPHeader", ["java.lang.IllegalArgumentException", "$.InternalError"], function () {
c$ = Clazz.decorateAsClass (function () {
this.text = false;
this.fhcrc = false;
this.time = 0;
this.xflags = 0;
this.os = 255;
this.extra = null;
this.name = null;
this.comment = null;
this.hcrc = 0;
this.crc = 0;
this.done = false;
this.mtime = 0;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "GZIPHeader", null, Cloneable);
Clazz.defineMethod (c$, "setModifiedTime", 
function (mtime) {
this.mtime = mtime;
}, "~N");
Clazz.defineMethod (c$, "getModifiedTime", 
function () {
return this.mtime;
});
Clazz.defineMethod (c$, "setOS", 
function (os) {
if ((0 <= os && os <= 13) || os == 255) this.os = os;
 else throw  new IllegalArgumentException ("os: " + os);
}, "~N");
Clazz.defineMethod (c$, "getOS", 
function () {
return this.os;
});
Clazz.defineMethod (c$, "setName", 
function (name) {
try {
this.name = name.getBytes ("ISO-8859-1");
} catch (e) {
if (Clazz.exceptionOf (e, java.io.UnsupportedEncodingException)) {
throw  new IllegalArgumentException ("name must be in ISO-8859-1 " + name);
} else {
throw e;
}
}
}, "~S");
Clazz.defineMethod (c$, "getName", 
function () {
if (this.name == null) return "";
try {
return  String.instantialize (this.name, "ISO-8859-1");
} catch (e) {
if (Clazz.exceptionOf (e, java.io.UnsupportedEncodingException)) {
throw  new InternalError (e.toString ());
} else {
throw e;
}
}
});
Clazz.defineMethod (c$, "setComment", 
function (comment) {
try {
this.comment = comment.getBytes ("ISO-8859-1");
} catch (e) {
if (Clazz.exceptionOf (e, java.io.UnsupportedEncodingException)) {
throw  new IllegalArgumentException ("comment must be in ISO-8859-1 " + this.name);
} else {
throw e;
}
}
}, "~S");
Clazz.defineMethod (c$, "getComment", 
function () {
if (this.comment == null) return "";
try {
return  String.instantialize (this.comment, "ISO-8859-1");
} catch (e) {
if (Clazz.exceptionOf (e, java.io.UnsupportedEncodingException)) {
throw  new InternalError (e.toString ());
} else {
throw e;
}
}
});
Clazz.defineMethod (c$, "setCRC", 
function (crc) {
this.crc = crc;
}, "~N");
Clazz.defineMethod (c$, "getCRC", 
function () {
return this.crc;
});
Clazz.defineMethod (c$, "put", 
function (d) {
var flag = 0;
if (this.text) {
flag |= 1;
}if (this.fhcrc) {
flag |= 2;
}if (this.extra != null) {
flag |= 4;
}if (this.name != null) {
flag |= 8;
}if (this.comment != null) {
flag |= 16;
}var xfl = 0;
if (d.level == 1) {
xfl |= 4;
} else if (d.level == 9) {
xfl |= 2;
}d.put_short (0x8b1f);
d.put_byteB (8);
d.put_byteB (flag);
d.put_byteB (this.mtime);
d.put_byteB ((this.mtime >> 8));
d.put_byteB ((this.mtime >> 16));
d.put_byteB ((this.mtime >> 24));
d.put_byteB (xfl);
d.put_byteB (this.os);
if (this.extra != null) {
d.put_byteB (this.extra.length);
d.put_byteB ((this.extra.length >> 8));
d.put_byte (this.extra, 0, this.extra.length);
}if (this.name != null) {
d.put_byte (this.name, 0, this.name.length);
d.put_byteB (0);
}if (this.comment != null) {
d.put_byte (this.comment, 0, this.comment.length);
d.put_byteB (0);
}}, "com.jcraft.jzlib.Deflate");
Clazz.defineMethod (c$, "clone", 
function () {
var gheader = Clazz.superCall (this, com.jcraft.jzlib.GZIPHeader, "clone", []);
var tmp;
if (gheader.extra != null) {
tmp =  Clazz.newByteArray (gheader.extra.length, 0);
System.arraycopy (gheader.extra, 0, tmp, 0, tmp.length);
gheader.extra = tmp;
}if (gheader.name != null) {
tmp =  Clazz.newByteArray (gheader.name.length, 0);
System.arraycopy (gheader.name, 0, tmp, 0, tmp.length);
gheader.name = tmp;
}if (gheader.comment != null) {
tmp =  Clazz.newByteArray (gheader.comment.length, 0);
System.arraycopy (gheader.comment, 0, tmp, 0, tmp.length);
gheader.comment = tmp;
}return gheader;
});
Clazz.defineStatics (c$,
"OS_MSDOS", 0x00,
"OS_AMIGA", 0x01,
"OS_VMS", 0x02,
"OS_UNIX", 0x03,
"OS_ATARI", 0x05,
"OS_OS2", 0x06,
"OS_MACOS", 0x07,
"OS_TOPS20", 0x0a,
"OS_WIN32", 0x0b,
"OS_VMCMS", 0x04,
"OS_ZSYSTEM", 0x08,
"OS_CPM", 0x09,
"OS_QDOS", 0x0c,
"OS_RISCOS", 0x0d,
"OS_UNKNOWN", 0xff);
});
// 
//// com\jcraft\jzlib\StaticTree.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["com.jcraft.jzlib.Tree"], "com.jcraft.jzlib.StaticTree", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.static_tree = null;
this.extra_bits = null;
this.extra_base = 0;
this.elems = 0;
this.max_length = 0;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "StaticTree");
Clazz.makeConstructor (c$, 
($fz = function (static_tree, extra_bits, extra_base, elems, max_length) {
this.static_tree = static_tree;
this.extra_bits = extra_bits;
this.extra_base = extra_base;
this.elems = elems;
this.max_length = max_length;
}, $fz.isPrivate = true, $fz), "~A,~A,~N,~N,~N");
Clazz.defineStatics (c$,
"MAX_BITS", 15,
"BL_CODES", 19,
"D_CODES", 30,
"LITERALS", 256,
"LENGTH_CODES", 29,
"L_CODES", (286),
"MAX_BL_BITS", 7,
"static_ltree", [12, 8, 140, 8, 76, 8, 204, 8, 44, 8, 172, 8, 108, 8, 236, 8, 28, 8, 156, 8, 92, 8, 220, 8, 60, 8, 188, 8, 124, 8, 252, 8, 2, 8, 130, 8, 66, 8, 194, 8, 34, 8, 162, 8, 98, 8, 226, 8, 18, 8, 146, 8, 82, 8, 210, 8, 50, 8, 178, 8, 114, 8, 242, 8, 10, 8, 138, 8, 74, 8, 202, 8, 42, 8, 170, 8, 106, 8, 234, 8, 26, 8, 154, 8, 90, 8, 218, 8, 58, 8, 186, 8, 122, 8, 250, 8, 6, 8, 134, 8, 70, 8, 198, 8, 38, 8, 166, 8, 102, 8, 230, 8, 22, 8, 150, 8, 86, 8, 214, 8, 54, 8, 182, 8, 118, 8, 246, 8, 14, 8, 142, 8, 78, 8, 206, 8, 46, 8, 174, 8, 110, 8, 238, 8, 30, 8, 158, 8, 94, 8, 222, 8, 62, 8, 190, 8, 126, 8, 254, 8, 1, 8, 129, 8, 65, 8, 193, 8, 33, 8, 161, 8, 97, 8, 225, 8, 17, 8, 145, 8, 81, 8, 209, 8, 49, 8, 177, 8, 113, 8, 241, 8, 9, 8, 137, 8, 73, 8, 201, 8, 41, 8, 169, 8, 105, 8, 233, 8, 25, 8, 153, 8, 89, 8, 217, 8, 57, 8, 185, 8, 121, 8, 249, 8, 5, 8, 133, 8, 69, 8, 197, 8, 37, 8, 165, 8, 101, 8, 229, 8, 21, 8, 149, 8, 85, 8, 213, 8, 53, 8, 181, 8, 117, 8, 245, 8, 13, 8, 141, 8, 77, 8, 205, 8, 45, 8, 173, 8, 109, 8, 237, 8, 29, 8, 157, 8, 93, 8, 221, 8, 61, 8, 189, 8, 125, 8, 253, 8, 19, 9, 275, 9, 147, 9, 403, 9, 83, 9, 339, 9, 211, 9, 467, 9, 51, 9, 307, 9, 179, 9, 435, 9, 115, 9, 371, 9, 243, 9, 499, 9, 11, 9, 267, 9, 139, 9, 395, 9, 75, 9, 331, 9, 203, 9, 459, 9, 43, 9, 299, 9, 171, 9, 427, 9, 107, 9, 363, 9, 235, 9, 491, 9, 27, 9, 283, 9, 155, 9, 411, 9, 91, 9, 347, 9, 219, 9, 475, 9, 59, 9, 315, 9, 187, 9, 443, 9, 123, 9, 379, 9, 251, 9, 507, 9, 7, 9, 263, 9, 135, 9, 391, 9, 71, 9, 327, 9, 199, 9, 455, 9, 39, 9, 295, 9, 167, 9, 423, 9, 103, 9, 359, 9, 231, 9, 487, 9, 23, 9, 279, 9, 151, 9, 407, 9, 87, 9, 343, 9, 215, 9, 471, 9, 55, 9, 311, 9, 183, 9, 439, 9, 119, 9, 375, 9, 247, 9, 503, 9, 15, 9, 271, 9, 143, 9, 399, 9, 79, 9, 335, 9, 207, 9, 463, 9, 47, 9, 303, 9, 175, 9, 431, 9, 111, 9, 367, 9, 239, 9, 495, 9, 31, 9, 287, 9, 159, 9, 415, 9, 95, 9, 351, 9, 223, 9, 479, 9, 63, 9, 319, 9, 191, 9, 447, 9, 127, 9, 383, 9, 255, 9, 511, 9, 0, 7, 64, 7, 32, 7, 96, 7, 16, 7, 80, 7, 48, 7, 112, 7, 8, 7, 72, 7, 40, 7, 104, 7, 24, 7, 88, 7, 56, 7, 120, 7, 4, 7, 68, 7, 36, 7, 100, 7, 20, 7, 84, 7, 52, 7, 116, 7, 3, 8, 131, 8, 67, 8, 195, 8, 35, 8, 163, 8, 99, 8, 227, 8],
"static_dtree", [0, 5, 16, 5, 8, 5, 24, 5, 4, 5, 20, 5, 12, 5, 28, 5, 2, 5, 18, 5, 10, 5, 26, 5, 6, 5, 22, 5, 14, 5, 30, 5, 1, 5, 17, 5, 9, 5, 25, 5, 5, 5, 21, 5, 13, 5, 29, 5, 3, 5, 19, 5, 11, 5, 27, 5, 7, 5, 23, 5]);
c$.static_l_desc = c$.prototype.static_l_desc =  new com.jcraft.jzlib.StaticTree (com.jcraft.jzlib.StaticTree.static_ltree, com.jcraft.jzlib.Tree.extra_lbits, 257, 286, 15);
c$.static_d_desc = c$.prototype.static_d_desc =  new com.jcraft.jzlib.StaticTree (com.jcraft.jzlib.StaticTree.static_dtree, com.jcraft.jzlib.Tree.extra_dbits, 0, 30, 15);
c$.static_bl_desc = c$.prototype.static_bl_desc =  new com.jcraft.jzlib.StaticTree (null, com.jcraft.jzlib.Tree.extra_blbits, 0, 19, 7);
});
// 
//// com\jcraft\jzlib\Inflate.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["java.lang.Exception"], "com.jcraft.jzlib.Inflate", ["com.jcraft.jzlib.Adler32", "$.CRC32", "$.GZIPHeader", "$.InfBlocks", "java.io.ByteArrayOutputStream"], function () {
c$ = Clazz.decorateAsClass (function () {
this.mode = 0;
this.method = 0;
this.was = -1;
this.need = 0;
this.marker = 0;
this.wrap = 0;
this.wbits = 0;
this.blocks = null;
this.z = null;
this.flags = 0;
this.need_bytes = -1;
this.crcbuf = null;
this.gheader = null;
if (!Clazz.isClassDefined ("com.jcraft.jzlib.Inflate.Return")) {
com.jcraft.jzlib.Inflate.$Inflate$Return$ ();
}
this.tmp_string = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "Inflate");
Clazz.prepareFields (c$, function () {
this.crcbuf =  Clazz.newByteArray (4, 0);
});
Clazz.defineMethod (c$, "reset", 
function () {
this.inflateReset ();
});
Clazz.defineMethod (c$, "inflateReset", 
function () {
if (this.z == null) return -2;
this.z.total_in = this.z.total_out = 0;
this.z.msg = null;
this.mode = 14;
this.need_bytes = -1;
this.blocks.reset ();
return 0;
});
Clazz.defineMethod (c$, "inflateEnd", 
function () {
if (this.blocks != null) {
this.blocks.free ();
}return 0;
});
Clazz.makeConstructor (c$, 
function (z) {
this.z = z;
}, "com.jcraft.jzlib.ZStream");
Clazz.defineMethod (c$, "inflateInit", 
function (w) {
this.z.msg = null;
this.blocks = null;
this.wrap = 0;
if (w < 0) {
w = -w;
} else {
this.wrap = (w >> 4) + 1;
if (w < 48) w &= 15;
}if (w < 8 || w > 15) {
this.inflateEnd ();
return -2;
}if (this.blocks != null && this.wbits != w) {
this.blocks.free ();
this.blocks = null;
}this.wbits = w;
this.blocks =  new com.jcraft.jzlib.InfBlocks (this.z, 1 << w);
this.inflateReset ();
return 0;
}, "~N");
Clazz.defineMethod (c$, "inflate", 
function (f) {
var r;
var b;
if (this.z == null || this.z.next_in == null) {
if (f == 4 && this.mode == 14) return 0;
return -2;
}f = f == 4 ? -5 : 0;
r = -5;
while (true) {
switch (this.mode) {
case 14:
if (this.wrap == 0) {
this.mode = 7;
break;
}try {
r = this.readBytes (2, r, f);
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
if ((this.wrap & 2) != 0 && this.need == 0x8b1f) {
this.z.adler =  new com.jcraft.jzlib.CRC32 ();
this.checksum (2, this.need);
if (this.gheader == null) this.gheader =  new com.jcraft.jzlib.GZIPHeader ();
this.mode = 23;
break;
}this.flags = 0;
this.method = (this.need) & 0xff;
b = ((this.need >> 8)) & 0xff;
if ((this.wrap & 1) == 0 || (((this.method << 8) + b) % 31) != 0) {
this.mode = 13;
this.z.msg = "incorrect header check";
break;
}if ((this.method & 0xf) != 8) {
this.mode = 13;
this.z.msg = "unknown compression method";
break;
}if ((this.method >> 4) + 8 > this.wbits) {
this.mode = 13;
this.z.msg = "invalid window size";
break;
}this.z.adler =  new com.jcraft.jzlib.Adler32 ();
if ((b & 32) == 0) {
this.mode = 7;
break;
}this.mode = 2;
case 2:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need = ((this.z.next_in[this.z.next_in_index++] & 0xff) << 24) & 0xff000000;
this.mode = 3;
case 3:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need += ((this.z.next_in[this.z.next_in_index++] & 0xff) << 16) & 0xff0000;
this.mode = 4;
case 4:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need += ((this.z.next_in[this.z.next_in_index++] & 0xff) << 8) & 0xff00;
this.mode = 5;
case 5:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need += (this.z.next_in[this.z.next_in_index++] & 0xff);
this.z.adler.reset (this.need);
this.mode = 6;
return 2;
case 6:
this.mode = 13;
this.z.msg = "need dictionary";
this.marker = 0;
return -2;
case 7:
r = this.blocks.proc (r);
if (r == -3) {
this.mode = 13;
this.marker = 0;
break;
}if (r == 0) {
r = f;
}if (r != 1) {
return r;
}r = f;
this.was = this.z.adler.getValue ();
this.blocks.reset ();
if (this.wrap == 0) {
this.mode = 12;
break;
}this.mode = 8;
case 8:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need = ((this.z.next_in[this.z.next_in_index++] & 0xff) << 24) & 0xff000000;
this.mode = 9;
case 9:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need += ((this.z.next_in[this.z.next_in_index++] & 0xff) << 16) & 0xff0000;
this.mode = 10;
case 10:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need += ((this.z.next_in[this.z.next_in_index++] & 0xff) << 8) & 0xff00;
this.mode = 11;
case 11:
if (this.z.avail_in == 0) return r;
r = f;
this.z.avail_in--;
this.z.total_in++;
this.need += (this.z.next_in[this.z.next_in_index++] & 0xff);
if (this.flags != 0) {
this.need = ((this.need & 0xff000000) >> 24 | (this.need & 0x00ff0000) >> 8 | (this.need & 0x0000ff00) << 8 | (this.need & 0x0000ffff) << 24) & 0xffffffff;
}if (((this.was)) != ((this.need))) {
this.z.msg = "incorrect data check";
} else if (this.flags != 0 && this.gheader != null) {
this.gheader.crc = this.need;
}this.mode = 15;
case 15:
if (this.wrap != 0 && this.flags != 0) {
try {
r = this.readBytes (4, r, f);
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
if (this.z.msg != null && this.z.msg.equals ("incorrect data check")) {
this.mode = 13;
this.marker = 5;
break;
}if (this.need != (this.z.total_out & 0xffffffff)) {
this.z.msg = "incorrect length check";
this.mode = 13;
break;
}this.z.msg = null;
} else {
if (this.z.msg != null && this.z.msg.equals ("incorrect data check")) {
this.mode = 13;
this.marker = 5;
break;
}}this.mode = 12;
case 12:
return 1;
case 13:
return -3;
case 23:
try {
r = this.readBytes (2, r, f);
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
this.flags = (this.need) & 0xffff;
if ((this.flags & 0xff) != 8) {
this.z.msg = "unknown compression method";
this.mode = 13;
break;
}if ((this.flags & 0xe000) != 0) {
this.z.msg = "unknown header flags set";
this.mode = 13;
break;
}if ((this.flags & 0x0200) != 0) {
this.checksum (2, this.need);
}this.mode = 16;
case 16:
try {
r = this.readBytes (4, r, f);
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
if (this.gheader != null) this.gheader.time = this.need;
if ((this.flags & 0x0200) != 0) {
this.checksum (4, this.need);
}this.mode = 17;
case 17:
try {
r = this.readBytes (2, r, f);
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
if (this.gheader != null) {
this.gheader.xflags = (this.need) & 0xff;
this.gheader.os = ((this.need) >> 8) & 0xff;
}if ((this.flags & 0x0200) != 0) {
this.checksum (2, this.need);
}this.mode = 18;
case 18:
if ((this.flags & 0x0400) != 0) {
try {
r = this.readBytes (2, r, f);
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
if (this.gheader != null) {
this.gheader.extra =  Clazz.newByteArray ((this.need) & 0xffff, 0);
}if ((this.flags & 0x0200) != 0) {
this.checksum (2, this.need);
}} else if (this.gheader != null) {
this.gheader.extra = null;
}this.mode = 19;
case 19:
if ((this.flags & 0x0400) != 0) {
try {
r = this.readBytes (r, f);
if (this.gheader != null) {
var foo = this.tmp_string.toByteArray ();
this.tmp_string = null;
if (foo.length == this.gheader.extra.length) {
System.arraycopy (foo, 0, this.gheader.extra, 0, foo.length);
} else {
this.z.msg = "bad extra field length";
this.mode = 13;
break;
}}} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
} else if (this.gheader != null) {
this.gheader.extra = null;
}this.mode = 20;
case 20:
if ((this.flags & 0x0800) != 0) {
try {
r = this.readString (r, f);
if (this.gheader != null) {
this.gheader.name = this.tmp_string.toByteArray ();
}this.tmp_string = null;
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
} else if (this.gheader != null) {
this.gheader.name = null;
}this.mode = 21;
case 21:
if ((this.flags & 0x1000) != 0) {
try {
r = this.readString (r, f);
if (this.gheader != null) {
this.gheader.comment = this.tmp_string.toByteArray ();
}this.tmp_string = null;
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
} else if (this.gheader != null) {
this.gheader.comment = null;
}this.mode = 22;
case 22:
if ((this.flags & 0x0200) != 0) {
try {
r = this.readBytes (2, r, f);
} catch (e) {
if (Clazz.exceptionOf (e, com.jcraft.jzlib.Inflate.Return)) {
return e.r;
} else {
throw e;
}
}
if (this.gheader != null) {
this.gheader.hcrc = (this.need & 0xffff);
}if (this.need != (this.z.adler.getValue () & 0xffff)) {
this.mode = 13;
this.z.msg = "header crc mismatch";
this.marker = 5;
break;
}}this.z.adler =  new com.jcraft.jzlib.CRC32 ();
this.mode = 7;
break;
default:
return -2;
}
}
}, "~N");
Clazz.defineMethod (c$, "inflateSetDictionary", 
function (dictionary, dictLength) {
if (this.z == null || (this.mode != 6 && this.wrap != 0)) {
return -2;
}var index = 0;
var length = dictLength;
if (this.mode == 6) {
var adler_need = this.z.adler.getValue ();
this.z.adler.resetAll ();
this.z.adler.updateRange (dictionary, 0, dictLength);
if (this.z.adler.getValue () != adler_need) {
return -3;
}}this.z.adler.resetAll ();
if (length >= (1 << this.wbits)) {
length = (1 << this.wbits) - 1;
index = dictLength - length;
}this.blocks.set_dictionary (dictionary, index, length);
this.mode = 7;
return 0;
}, "~A,~N");
Clazz.defineMethod (c$, "inflateSync", 
function () {
var n;
var p;
var m;
var r;
var w;
if (this.z == null) return -2;
if (this.mode != 13) {
this.mode = 13;
this.marker = 0;
}if ((n = this.z.avail_in) == 0) return -5;
p = this.z.next_in_index;
m = this.marker;
while (n != 0 && m < 4) {
if (this.z.next_in[p] == com.jcraft.jzlib.Inflate.mark[m]) {
m++;
} else if (this.z.next_in[p] != 0) {
m = 0;
} else {
m = 4 - m;
}p++;
n--;
}
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.z.avail_in = n;
this.marker = m;
if (m != 4) {
return -3;
}r = this.z.total_in;
w = this.z.total_out;
this.inflateReset ();
this.z.total_in = r;
this.z.total_out = w;
this.mode = 7;
return 0;
});
Clazz.defineMethod (c$, "inflateSyncPoint", 
function () {
if (this.z == null || this.blocks == null) return -2;
return this.blocks.sync_point ();
});
Clazz.defineMethod (c$, "readBytes", 
($fz = function (n, r, f) {
if (this.need_bytes == -1) {
this.need_bytes = n;
this.need = 0;
}while (this.need_bytes > 0) {
if (this.z.avail_in == 0) {
throw Clazz.innerTypeInstance (com.jcraft.jzlib.Inflate.Return, this, null, r);
}r = f;
this.z.avail_in--;
this.z.total_in++;
this.need = this.need | ((this.z.next_in[this.z.next_in_index++] & 0xff) << ((n - this.need_bytes) * 8));
this.need_bytes--;
}
if (n == 2) {
this.need &= 0xffff;
} else if (n == 4) {
this.need &= 0xffffffff;
}this.need_bytes = -1;
return r;
}, $fz.isPrivate = true, $fz), "~N,~N,~N");
Clazz.defineMethod (c$, "readString", 
($fz = function (r, f) {
if (this.tmp_string == null) {
this.tmp_string =  new java.io.ByteArrayOutputStream ();
}var b = 0;
do {
if (this.z.avail_in == 0) {
throw Clazz.innerTypeInstance (com.jcraft.jzlib.Inflate.Return, this, null, r);
}r = f;
this.z.avail_in--;
this.z.total_in++;
b = this.z.next_in[this.z.next_in_index];
if (b != 0) this.tmp_string.write (this.z.next_in, this.z.next_in_index, 1);
this.z.adler.updateRange (this.z.next_in, this.z.next_in_index, 1);
this.z.next_in_index++;
} while (b != 0);
return r;
}, $fz.isPrivate = true, $fz), "~N,~N");
Clazz.defineMethod (c$, "readBytes", 
($fz = function (r, f) {
if (this.tmp_string == null) {
this.tmp_string =  new java.io.ByteArrayOutputStream ();
}while (this.need > 0) {
if (this.z.avail_in == 0) {
throw Clazz.innerTypeInstance (com.jcraft.jzlib.Inflate.Return, this, null, r);
}r = f;
this.z.avail_in--;
this.z.total_in++;
this.tmp_string.write (this.z.next_in, this.z.next_in_index, 1);
this.z.adler.updateRange (this.z.next_in, this.z.next_in_index, 1);
this.z.next_in_index++;
this.need--;
}
return r;
}, $fz.isPrivate = true, $fz), "~N,~N");
Clazz.defineMethod (c$, "checksum", 
($fz = function (n, v) {
for (var i = 0; i < n; i++) {
this.crcbuf[i] = (v & 0xff);
v >>= 8;
}
this.z.adler.updateRange (this.crcbuf, 0, n);
}, $fz.isPrivate = true, $fz), "~N,~N");
Clazz.defineMethod (c$, "getGZIPHeader", 
function () {
return this.gheader;
});
Clazz.defineMethod (c$, "inParsingHeader", 
function () {
switch (this.mode) {
case 14:
case 2:
case 3:
case 4:
case 5:
case 23:
case 16:
case 17:
case 18:
case 19:
case 20:
case 21:
case 22:
return true;
default:
return false;
}
});
c$.$Inflate$Return$ = function () {
Clazz.pu$h ();
c$ = Clazz.decorateAsClass (function () {
Clazz.prepareCallback (this, arguments);
this.r = 0;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib.Inflate, "Return", Exception);
Clazz.makeConstructor (c$, 
function (a) {
Clazz.superConstructor (this, com.jcraft.jzlib.Inflate.Return, []);
this.r = a;
}, "~N");
c$ = Clazz.p0p ();
};
Clazz.defineStatics (c$,
"PRESET_DICT", 0x20,
"Z_NO_FLUSH", 0,
"Z_PARTIAL_FLUSH", 1,
"Z_SYNC_FLUSH", 2,
"Z_FULL_FLUSH", 3,
"Z_FINISH", 4,
"Z_DEFLATED", 8,
"Z_OK", 0,
"Z_STREAM_END", 1,
"Z_NEED_DICT", 2,
"Z_STREAM_ERROR", -2,
"Z_DATA_ERROR", -3,
"Z_BUF_ERROR", -5,
"DICT4", 2,
"DICT3", 3,
"DICT2", 4,
"DICT1", 5,
"DICT0", 6,
"BLOCKS", 7,
"CHECK4", 8,
"CHECK3", 9,
"CHECK2", 10,
"CHECK1", 11,
"DONE", 12,
"BAD", 13,
"HEAD", 14,
"LENGTH", 15,
"TIME", 16,
"OS", 17,
"EXLEN", 18,
"EXTRA", 19,
"NAME", 20,
"COMMENT", 21,
"HCRC", 22,
"FLAGS", 23,
"mark", [0, 0, 0xff, 0xff]);
});
// 
//// com\jcraft\jzlib\InfTree.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
c$ = Clazz.decorateAsClass (function () {
this.hn = null;
this.v = null;
this.c = null;
this.r = null;
this.u = null;
this.x = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "InfTree");
Clazz.defineMethod (c$, "huft_build", 
($fz = function (b, bindex, n, s, d, e, t, m, hp, hn, v) {
var a;
var f;
var g;
var h;
var i;
var j;
var k;
var l;
var mask;
var p;
var q;
var w;
var xp;
var y;
var z;
p = 0;
i = n;
do {
this.c[b[bindex + p]]++;
p++;
i--;
} while (i != 0);
if (this.c[0] == n) {
t[0] = -1;
m[0] = 0;
return 0;
}l = m[0];
for (j = 1; j <= 15; j++) if (this.c[j] != 0) break;

k = j;
if (l < j) {
l = j;
}for (i = 15; i != 0; i--) {
if (this.c[i] != 0) break;
}
g = i;
if (l > i) {
l = i;
}m[0] = l;
for (y = 1 << j; j < i; j++, y <<= 1) {
if ((y -= this.c[j]) < 0) {
return -3;
}}
if ((y -= this.c[i]) < 0) {
return -3;
}this.c[i] += y;
this.x[1] = j = 0;
p = 1;
xp = 2;
while (--i != 0) {
this.x[xp] = (j += this.c[p]);
xp++;
p++;
}
i = 0;
p = 0;
do {
if ((j = b[bindex + p]) != 0) {
v[this.x[j]++] = i;
}p++;
} while (++i < n);
n = this.x[g];
this.x[0] = i = 0;
p = 0;
h = -1;
w = -l;
this.u[0] = 0;
q = 0;
z = 0;
for (; k <= g; k++) {
a = this.c[k];
while (a-- != 0) {
while (k > w + l) {
h++;
w += l;
z = g - w;
z = (z > l) ? l : z;
if ((f = 1 << (j = k - w)) > a + 1) {
f -= a + 1;
xp = k;
if (j < z) {
while (++j < z) {
if ((f <<= 1) <= this.c[++xp]) break;
f -= this.c[xp];
}
}}z = 1 << j;
if (hn[0] + z > 1440) {
return -3;
}this.u[h] = q = hn[0];
hn[0] += z;
if (h != 0) {
this.x[h] = i;
this.r[0] = j;
this.r[1] = l;
j = i >>> (w - l);
this.r[2] = (q - this.u[h - 1] - j);
System.arraycopy (this.r, 0, hp, (this.u[h - 1] + j) * 3, 3);
} else {
t[0] = q;
}}
this.r[1] = (k - w);
if (p >= n) {
this.r[0] = 192;
} else if (v[p] < s) {
this.r[0] = (v[p] < 256 ? 0 : 96);
this.r[2] = v[p++];
} else {
this.r[0] = (e[v[p] - s] + 16 + 64);
this.r[2] = d[v[p++] - s];
}f = 1 << (k - w);
for (j = i >>> w; j < z; j += f) {
System.arraycopy (this.r, 0, hp, (q + j) * 3, 3);
}
for (j = 1 << (k - 1); (i & j) != 0; j >>>= 1) {
i ^= j;
}
i ^= j;
mask = (1 << w) - 1;
while ((i & mask) != this.x[h]) {
h--;
w -= l;
mask = (1 << w) - 1;
}
}
}
return y != 0 && g != 1 ? -5 : 0;
}, $fz.isPrivate = true, $fz), "~A,~N,~N,~N,~A,~A,~A,~A,~A,~A,~A");
Clazz.defineMethod (c$, "inflate_trees_bits", 
function (c, bb, tb, hp, z) {
var result;
this.initWorkArea (19);
this.hn[0] = 0;
result = this.huft_build (c, 0, 19, 19, null, null, tb, bb, hp, this.hn, this.v);
if (result == -3) {
z.msg = "oversubscribed dynamic bit lengths tree";
} else if (result == -5 || bb[0] == 0) {
z.msg = "incomplete dynamic bit lengths tree";
result = -3;
}return result;
}, "~A,~A,~A,~A,com.jcraft.jzlib.ZStream");
Clazz.defineMethod (c$, "inflate_trees_dynamic", 
function (nl, nd, c, bl, bd, tl, td, hp, z) {
var result;
this.initWorkArea (288);
this.hn[0] = 0;
result = this.huft_build (c, 0, nl, 257, com.jcraft.jzlib.InfTree.cplens, com.jcraft.jzlib.InfTree.cplext, tl, bl, hp, this.hn, this.v);
if (result != 0 || bl[0] == 0) {
if (result == -3) {
z.msg = "oversubscribed literal/length tree";
} else if (result != -4) {
z.msg = "incomplete literal/length tree";
result = -3;
}return result;
}this.initWorkArea (288);
result = this.huft_build (c, nl, nd, 0, com.jcraft.jzlib.InfTree.cpdist, com.jcraft.jzlib.InfTree.cpdext, td, bd, hp, this.hn, this.v);
if (result != 0 || (bd[0] == 0 && nl > 257)) {
if (result == -3) {
z.msg = "oversubscribed distance tree";
} else if (result == -5) {
z.msg = "incomplete distance tree";
result = -3;
} else if (result != -4) {
z.msg = "empty distance tree with lengths";
result = -3;
}return result;
}return 0;
}, "~N,~N,~A,~A,~A,~A,~A,~A,com.jcraft.jzlib.ZStream");
c$.inflate_trees_fixed = Clazz.defineMethod (c$, "inflate_trees_fixed", 
function (bl, bd, tl, td, z) {
bl[0] = 9;
bd[0] = 5;
tl[0] = com.jcraft.jzlib.InfTree.fixed_tl;
td[0] = com.jcraft.jzlib.InfTree.fixed_td;
return 0;
}, "~A,~A,~A,~A,com.jcraft.jzlib.ZStream");
Clazz.defineMethod (c$, "initWorkArea", 
($fz = function (vsize) {
if (this.hn == null) {
this.hn =  Clazz.newIntArray (1, 0);
this.v =  Clazz.newIntArray (vsize, 0);
this.c =  Clazz.newIntArray (16, 0);
this.r =  Clazz.newIntArray (3, 0);
this.u =  Clazz.newIntArray (15, 0);
this.x =  Clazz.newIntArray (16, 0);
}if (this.v.length < vsize) {
this.v =  Clazz.newIntArray (vsize, 0);
}for (var i = 0; i < vsize; i++) {
this.v[i] = 0;
}
for (var i = 0; i < 16; i++) {
this.c[i] = 0;
}
for (var i = 0; i < 3; i++) {
this.r[i] = 0;
}
System.arraycopy (this.c, 0, this.u, 0, 15);
System.arraycopy (this.c, 0, this.x, 0, 16);
}, $fz.isPrivate = true, $fz), "~N");
Clazz.defineStatics (c$,
"MANY", 1440,
"Z_OK", 0,
"Z_DATA_ERROR", -3,
"Z_MEM_ERROR", -4,
"Z_BUF_ERROR", -5,
"fixed_bl", 9,
"fixed_bd", 5,
"fixed_tl", [96, 7, 256, 0, 8, 80, 0, 8, 16, 84, 8, 115, 82, 7, 31, 0, 8, 112, 0, 8, 48, 0, 9, 192, 80, 7, 10, 0, 8, 96, 0, 8, 32, 0, 9, 160, 0, 8, 0, 0, 8, 128, 0, 8, 64, 0, 9, 224, 80, 7, 6, 0, 8, 88, 0, 8, 24, 0, 9, 144, 83, 7, 59, 0, 8, 120, 0, 8, 56, 0, 9, 208, 81, 7, 17, 0, 8, 104, 0, 8, 40, 0, 9, 176, 0, 8, 8, 0, 8, 136, 0, 8, 72, 0, 9, 240, 80, 7, 4, 0, 8, 84, 0, 8, 20, 85, 8, 227, 83, 7, 43, 0, 8, 116, 0, 8, 52, 0, 9, 200, 81, 7, 13, 0, 8, 100, 0, 8, 36, 0, 9, 168, 0, 8, 4, 0, 8, 132, 0, 8, 68, 0, 9, 232, 80, 7, 8, 0, 8, 92, 0, 8, 28, 0, 9, 152, 84, 7, 83, 0, 8, 124, 0, 8, 60, 0, 9, 216, 82, 7, 23, 0, 8, 108, 0, 8, 44, 0, 9, 184, 0, 8, 12, 0, 8, 140, 0, 8, 76, 0, 9, 248, 80, 7, 3, 0, 8, 82, 0, 8, 18, 85, 8, 163, 83, 7, 35, 0, 8, 114, 0, 8, 50, 0, 9, 196, 81, 7, 11, 0, 8, 98, 0, 8, 34, 0, 9, 164, 0, 8, 2, 0, 8, 130, 0, 8, 66, 0, 9, 228, 80, 7, 7, 0, 8, 90, 0, 8, 26, 0, 9, 148, 84, 7, 67, 0, 8, 122, 0, 8, 58, 0, 9, 212, 82, 7, 19, 0, 8, 106, 0, 8, 42, 0, 9, 180, 0, 8, 10, 0, 8, 138, 0, 8, 74, 0, 9, 244, 80, 7, 5, 0, 8, 86, 0, 8, 22, 192, 8, 0, 83, 7, 51, 0, 8, 118, 0, 8, 54, 0, 9, 204, 81, 7, 15, 0, 8, 102, 0, 8, 38, 0, 9, 172, 0, 8, 6, 0, 8, 134, 0, 8, 70, 0, 9, 236, 80, 7, 9, 0, 8, 94, 0, 8, 30, 0, 9, 156, 84, 7, 99, 0, 8, 126, 0, 8, 62, 0, 9, 220, 82, 7, 27, 0, 8, 110, 0, 8, 46, 0, 9, 188, 0, 8, 14, 0, 8, 142, 0, 8, 78, 0, 9, 252, 96, 7, 256, 0, 8, 81, 0, 8, 17, 85, 8, 131, 82, 7, 31, 0, 8, 113, 0, 8, 49, 0, 9, 194, 80, 7, 10, 0, 8, 97, 0, 8, 33, 0, 9, 162, 0, 8, 1, 0, 8, 129, 0, 8, 65, 0, 9, 226, 80, 7, 6, 0, 8, 89, 0, 8, 25, 0, 9, 146, 83, 7, 59, 0, 8, 121, 0, 8, 57, 0, 9, 210, 81, 7, 17, 0, 8, 105, 0, 8, 41, 0, 9, 178, 0, 8, 9, 0, 8, 137, 0, 8, 73, 0, 9, 242, 80, 7, 4, 0, 8, 85, 0, 8, 21, 80, 8, 258, 83, 7, 43, 0, 8, 117, 0, 8, 53, 0, 9, 202, 81, 7, 13, 0, 8, 101, 0, 8, 37, 0, 9, 170, 0, 8, 5, 0, 8, 133, 0, 8, 69, 0, 9, 234, 80, 7, 8, 0, 8, 93, 0, 8, 29, 0, 9, 154, 84, 7, 83, 0, 8, 125, 0, 8, 61, 0, 9, 218, 82, 7, 23, 0, 8, 109, 0, 8, 45, 0, 9, 186, 0, 8, 13, 0, 8, 141, 0, 8, 77, 0, 9, 250, 80, 7, 3, 0, 8, 83, 0, 8, 19, 85, 8, 195, 83, 7, 35, 0, 8, 115, 0, 8, 51, 0, 9, 198, 81, 7, 11, 0, 8, 99, 0, 8, 35, 0, 9, 166, 0, 8, 3, 0, 8, 131, 0, 8, 67, 0, 9, 230, 80, 7, 7, 0, 8, 91, 0, 8, 27, 0, 9, 150, 84, 7, 67, 0, 8, 123, 0, 8, 59, 0, 9, 214, 82, 7, 19, 0, 8, 107, 0, 8, 43, 0, 9, 182, 0, 8, 11, 0, 8, 139, 0, 8, 75, 0, 9, 246, 80, 7, 5, 0, 8, 87, 0, 8, 23, 192, 8, 0, 83, 7, 51, 0, 8, 119, 0, 8, 55, 0, 9, 206, 81, 7, 15, 0, 8, 103, 0, 8, 39, 0, 9, 174, 0, 8, 7, 0, 8, 135, 0, 8, 71, 0, 9, 238, 80, 7, 9, 0, 8, 95, 0, 8, 31, 0, 9, 158, 84, 7, 99, 0, 8, 127, 0, 8, 63, 0, 9, 222, 82, 7, 27, 0, 8, 111, 0, 8, 47, 0, 9, 190, 0, 8, 15, 0, 8, 143, 0, 8, 79, 0, 9, 254, 96, 7, 256, 0, 8, 80, 0, 8, 16, 84, 8, 115, 82, 7, 31, 0, 8, 112, 0, 8, 48, 0, 9, 193, 80, 7, 10, 0, 8, 96, 0, 8, 32, 0, 9, 161, 0, 8, 0, 0, 8, 128, 0, 8, 64, 0, 9, 225, 80, 7, 6, 0, 8, 88, 0, 8, 24, 0, 9, 145, 83, 7, 59, 0, 8, 120, 0, 8, 56, 0, 9, 209, 81, 7, 17, 0, 8, 104, 0, 8, 40, 0, 9, 177, 0, 8, 8, 0, 8, 136, 0, 8, 72, 0, 9, 241, 80, 7, 4, 0, 8, 84, 0, 8, 20, 85, 8, 227, 83, 7, 43, 0, 8, 116, 0, 8, 52, 0, 9, 201, 81, 7, 13, 0, 8, 100, 0, 8, 36, 0, 9, 169, 0, 8, 4, 0, 8, 132, 0, 8, 68, 0, 9, 233, 80, 7, 8, 0, 8, 92, 0, 8, 28, 0, 9, 153, 84, 7, 83, 0, 8, 124, 0, 8, 60, 0, 9, 217, 82, 7, 23, 0, 8, 108, 0, 8, 44, 0, 9, 185, 0, 8, 12, 0, 8, 140, 0, 8, 76, 0, 9, 249, 80, 7, 3, 0, 8, 82, 0, 8, 18, 85, 8, 163, 83, 7, 35, 0, 8, 114, 0, 8, 50, 0, 9, 197, 81, 7, 11, 0, 8, 98, 0, 8, 34, 0, 9, 165, 0, 8, 2, 0, 8, 130, 0, 8, 66, 0, 9, 229, 80, 7, 7, 0, 8, 90, 0, 8, 26, 0, 9, 149, 84, 7, 67, 0, 8, 122, 0, 8, 58, 0, 9, 213, 82, 7, 19, 0, 8, 106, 0, 8, 42, 0, 9, 181, 0, 8, 10, 0, 8, 138, 0, 8, 74, 0, 9, 245, 80, 7, 5, 0, 8, 86, 0, 8, 22, 192, 8, 0, 83, 7, 51, 0, 8, 118, 0, 8, 54, 0, 9, 205, 81, 7, 15, 0, 8, 102, 0, 8, 38, 0, 9, 173, 0, 8, 6, 0, 8, 134, 0, 8, 70, 0, 9, 237, 80, 7, 9, 0, 8, 94, 0, 8, 30, 0, 9, 157, 84, 7, 99, 0, 8, 126, 0, 8, 62, 0, 9, 221, 82, 7, 27, 0, 8, 110, 0, 8, 46, 0, 9, 189, 0, 8, 14, 0, 8, 142, 0, 8, 78, 0, 9, 253, 96, 7, 256, 0, 8, 81, 0, 8, 17, 85, 8, 131, 82, 7, 31, 0, 8, 113, 0, 8, 49, 0, 9, 195, 80, 7, 10, 0, 8, 97, 0, 8, 33, 0, 9, 163, 0, 8, 1, 0, 8, 129, 0, 8, 65, 0, 9, 227, 80, 7, 6, 0, 8, 89, 0, 8, 25, 0, 9, 147, 83, 7, 59, 0, 8, 121, 0, 8, 57, 0, 9, 211, 81, 7, 17, 0, 8, 105, 0, 8, 41, 0, 9, 179, 0, 8, 9, 0, 8, 137, 0, 8, 73, 0, 9, 243, 80, 7, 4, 0, 8, 85, 0, 8, 21, 80, 8, 258, 83, 7, 43, 0, 8, 117, 0, 8, 53, 0, 9, 203, 81, 7, 13, 0, 8, 101, 0, 8, 37, 0, 9, 171, 0, 8, 5, 0, 8, 133, 0, 8, 69, 0, 9, 235, 80, 7, 8, 0, 8, 93, 0, 8, 29, 0, 9, 155, 84, 7, 83, 0, 8, 125, 0, 8, 61, 0, 9, 219, 82, 7, 23, 0, 8, 109, 0, 8, 45, 0, 9, 187, 0, 8, 13, 0, 8, 141, 0, 8, 77, 0, 9, 251, 80, 7, 3, 0, 8, 83, 0, 8, 19, 85, 8, 195, 83, 7, 35, 0, 8, 115, 0, 8, 51, 0, 9, 199, 81, 7, 11, 0, 8, 99, 0, 8, 35, 0, 9, 167, 0, 8, 3, 0, 8, 131, 0, 8, 67, 0, 9, 231, 80, 7, 7, 0, 8, 91, 0, 8, 27, 0, 9, 151, 84, 7, 67, 0, 8, 123, 0, 8, 59, 0, 9, 215, 82, 7, 19, 0, 8, 107, 0, 8, 43, 0, 9, 183, 0, 8, 11, 0, 8, 139, 0, 8, 75, 0, 9, 247, 80, 7, 5, 0, 8, 87, 0, 8, 23, 192, 8, 0, 83, 7, 51, 0, 8, 119, 0, 8, 55, 0, 9, 207, 81, 7, 15, 0, 8, 103, 0, 8, 39, 0, 9, 175, 0, 8, 7, 0, 8, 135, 0, 8, 71, 0, 9, 239, 80, 7, 9, 0, 8, 95, 0, 8, 31, 0, 9, 159, 84, 7, 99, 0, 8, 127, 0, 8, 63, 0, 9, 223, 82, 7, 27, 0, 8, 111, 0, 8, 47, 0, 9, 191, 0, 8, 15, 0, 8, 143, 0, 8, 79, 0, 9, 255],
"fixed_td", [80, 5, 1, 87, 5, 257, 83, 5, 17, 91, 5, 4097, 81, 5, 5, 89, 5, 1025, 85, 5, 65, 93, 5, 16385, 80, 5, 3, 88, 5, 513, 84, 5, 33, 92, 5, 8193, 82, 5, 9, 90, 5, 2049, 86, 5, 129, 192, 5, 24577, 80, 5, 2, 87, 5, 385, 83, 5, 25, 91, 5, 6145, 81, 5, 7, 89, 5, 1537, 85, 5, 97, 93, 5, 24577, 80, 5, 4, 88, 5, 769, 84, 5, 49, 92, 5, 12289, 82, 5, 13, 90, 5, 3073, 86, 5, 193, 192, 5, 24577],
"cplens", [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0],
"cplext", [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 112, 112],
"cpdist", [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
"cpdext", [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
"BMAX", 15);
// 
//// com\jcraft\jzlib\InfBlocks.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
Clazz.load (["com.jcraft.jzlib.InfTree"], "com.jcraft.jzlib.InfBlocks", ["com.jcraft.jzlib.InfCodes"], function () {
c$ = Clazz.decorateAsClass (function () {
this.mode = 0;
this.left = 0;
this.table = 0;
this.index = 0;
this.blens = null;
this.bb = null;
this.tb = null;
this.bl = null;
this.bd = null;
this.tl = null;
this.td = null;
this.tli = null;
this.tdi = null;
this.codes = null;
this.last = 0;
this.bitk = 0;
this.bitb = 0;
this.hufts = null;
this.window = null;
this.end = 0;
this.read = 0;
this.write = 0;
this.check = false;
this.inftree = null;
this.z = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "InfBlocks");
Clazz.prepareFields (c$, function () {
this.bb =  Clazz.newIntArray (1, 0);
this.tb =  Clazz.newIntArray (1, 0);
this.bl =  Clazz.newIntArray (1, 0);
this.bd =  Clazz.newIntArray (1, 0);
this.tli =  Clazz.newIntArray (1, 0);
this.tdi =  Clazz.newIntArray (1, 0);
this.inftree =  new com.jcraft.jzlib.InfTree ();
});
Clazz.makeConstructor (c$, 
function (z, w) {
this.z = z;
this.codes =  new com.jcraft.jzlib.InfCodes (this.z, this);
this.hufts =  Clazz.newIntArray (4320, 0);
this.window =  Clazz.newByteArray (w, 0);
this.end = w;
this.check = (z.istate.wrap == 0) ? false : true;
this.mode = 0;
{
this.tl = Clazz.newArray(1, null);
this.td = Clazz.newArray(1, null);
}this.reset ();
}, "com.jcraft.jzlib.ZStream,~N");
Clazz.defineMethod (c$, "reset", 
function () {
if (this.mode == 4 || this.mode == 5) {
}if (this.mode == 6) {
this.codes.free (this.z);
}this.mode = 0;
this.bitk = 0;
this.bitb = 0;
this.read = this.write = 0;
if (this.check) {
this.z.adler.resetAll ();
}});
Clazz.defineMethod (c$, "proc", 
function (r) {
var t;
var b;
var k;
var p;
var n;
var q;
var m;
{
p = this.z.next_in_index;
n = this.z.avail_in;
b = this.bitb;
k = this.bitk;
}{
q = this.write;
m = (q < this.read ? this.read - q - 1 : this.end - q);
}while (true) {
switch (this.mode) {
case 0:
while (k < (3)) {
if (n != 0) {
r = 0;
} else {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
t = (b & 7);
this.last = t & 1;
switch (t >>> 1) {
case 0:
{
b >>>= (3);
k -= (3);
}t = k & 7;
{
b >>>= (t);
k -= (t);
}this.mode = 1;
break;
case 1:
com.jcraft.jzlib.InfTree.inflate_trees_fixed (this.bl, this.bd, this.tl, this.td, this.z);
this.codes.init (this.bl[0], this.bd[0], this.tl[0], 0, this.td[0], 0);
{
b >>>= (3);
k -= (3);
}this.mode = 6;
break;
case 2:
{
b >>>= (3);
k -= (3);
}this.mode = 3;
break;
case 3:
{
b >>>= (3);
k -= (3);
}this.mode = 9;
this.z.msg = "invalid block type";
r = -3;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}
break;
case 1:
while (k < (32)) {
if (n != 0) {
r = 0;
} else {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
if ((((~b) >>> 16) & 0xffff) != (b & 0xffff)) {
this.mode = 9;
this.z.msg = "invalid stored block lengths";
r = -3;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}this.left = (b & 0xffff);
b = k = 0;
this.mode = this.left != 0 ? 2 : (this.last != 0 ? 7 : 0);
break;
case 2:
if (n == 0) {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}if (m == 0) {
if (q == this.end && this.read != 0) {
q = 0;
m = (q < this.read ? this.read - q - 1 : this.end - q);
}if (m == 0) {
this.write = q;
r = this.inflate_flush (r);
q = this.write;
m = (q < this.read ? this.read - q - 1 : this.end - q);
if (q == this.end && this.read != 0) {
q = 0;
m = (q < this.read ? this.read - q - 1 : this.end - q);
}if (m == 0) {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}}}r = 0;
t = this.left;
if (t > n) t = n;
if (t > m) t = m;
System.arraycopy (this.z.next_in, p, this.window, q, t);
p += t;
n -= t;
q += t;
m -= t;
if ((this.left -= t) != 0) break;
this.mode = this.last != 0 ? 7 : 0;
break;
case 3:
while (k < (14)) {
if (n != 0) {
r = 0;
} else {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
this.table = t = (b & 0x3fff);
if ((t & 0x1f) > 29 || ((t >> 5) & 0x1f) > 29) {
this.mode = 9;
this.z.msg = "too many length or distance symbols";
r = -3;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}t = 258 + (t & 0x1f) + ((t >> 5) & 0x1f);
if (this.blens == null || this.blens.length < t) {
this.blens =  Clazz.newIntArray (t, 0);
} else {
for (var i = 0; i < t; i++) {
this.blens[i] = 0;
}
}{
b >>>= (14);
k -= (14);
}this.index = 0;
this.mode = 4;
case 4:
while (this.index < 4 + (this.table >>> 10)) {
while (k < (3)) {
if (n != 0) {
r = 0;
} else {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
this.blens[com.jcraft.jzlib.InfBlocks.border[this.index++]] = b & 7;
{
b >>>= (3);
k -= (3);
}}
while (this.index < 19) {
this.blens[com.jcraft.jzlib.InfBlocks.border[this.index++]] = 0;
}
this.bb[0] = 7;
t = this.inftree.inflate_trees_bits (this.blens, this.bb, this.tb, this.hufts, this.z);
if (t != 0) {
r = t;
if (r == -3) {
this.blens = null;
this.mode = 9;
}this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}this.index = 0;
this.mode = 5;
case 5:
while (true) {
t = this.table;
if (!(this.index < 258 + (t & 0x1f) + ((t >> 5) & 0x1f))) {
break;
}var i;
var j;
var c;
t = this.bb[0];
while (k < (t)) {
if (n != 0) {
r = 0;
} else {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
if (this.tb[0] == -1) {
}t = this.hufts[(this.tb[0] + (b & com.jcraft.jzlib.InfBlocks.inflate_mask[t])) * 3 + 1];
c = this.hufts[(this.tb[0] + (b & com.jcraft.jzlib.InfBlocks.inflate_mask[t])) * 3 + 2];
if (c < 16) {
b >>>= (t);
k -= (t);
this.blens[this.index++] = c;
} else {
i = c == 18 ? 7 : c - 14;
j = c == 18 ? 11 : 3;
while (k < (t + i)) {
if (n != 0) {
r = 0;
} else {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
b >>>= (t);
k -= (t);
j += (b & com.jcraft.jzlib.InfBlocks.inflate_mask[i]);
b >>>= (i);
k -= (i);
i = this.index;
t = this.table;
if (i + j > 258 + (t & 0x1f) + ((t >> 5) & 0x1f) || (c == 16 && i < 1)) {
this.blens = null;
this.mode = 9;
this.z.msg = "invalid bit length repeat";
r = -3;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}c = c == 16 ? this.blens[i - 1] : 0;
do {
this.blens[i++] = c;
} while (--j != 0);
this.index = i;
}}
this.tb[0] = -1;
{
this.bl[0] = 9;
this.bd[0] = 6;
t = this.table;
t = this.inftree.inflate_trees_dynamic (257 + (t & 0x1f), 1 + ((t >> 5) & 0x1f), this.blens, this.bl, this.bd, this.tli, this.tdi, this.hufts, this.z);
if (t != 0) {
if (t == -3) {
this.blens = null;
this.mode = 9;
}r = t;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}this.codes.init (this.bl[0], this.bd[0], this.hufts, this.tli[0], this.hufts, this.tdi[0]);
}this.mode = 6;
case 6:
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
if ((r = this.codes.proc (r)) != 1) {
return this.inflate_flush (r);
}r = 0;
this.codes.free (this.z);
p = this.z.next_in_index;
n = this.z.avail_in;
b = this.bitb;
k = this.bitk;
q = this.write;
m = (q < this.read ? this.read - q - 1 : this.end - q);
if (this.last == 0) {
this.mode = 0;
break;
}this.mode = 7;
case 7:
this.write = q;
r = this.inflate_flush (r);
q = this.write;
m = (q < this.read ? this.read - q - 1 : this.end - q);
if (this.read != this.write) {
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}this.mode = 8;
case 8:
r = 1;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
case 9:
r = -3;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
default:
r = -2;
this.bitb = b;
this.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.write = q;
return this.inflate_flush (r);
}
}
}, "~N");
Clazz.defineMethod (c$, "free", 
function () {
this.reset ();
this.window = null;
this.hufts = null;
});
Clazz.defineMethod (c$, "set_dictionary", 
function (d, start, n) {
System.arraycopy (d, start, this.window, 0, n);
this.read = this.write = n;
}, "~A,~N,~N");
Clazz.defineMethod (c$, "sync_point", 
function () {
return this.mode == 1 ? 1 : 0;
});
Clazz.defineMethod (c$, "inflate_flush", 
function (r) {
var n;
var p;
var q;
p = this.z.next_out_index;
q = this.read;
n = ((q <= this.write ? this.write : this.end) - q);
if (n > this.z.avail_out) n = this.z.avail_out;
if (n != 0 && r == -5) r = 0;
this.z.avail_out -= n;
this.z.total_out += n;
if (this.check && n > 0) {
this.z.adler.updateRange (this.window, q, n);
}System.arraycopy (this.window, q, this.z.next_out, p, n);
p += n;
q += n;
if (q == this.end) {
q = 0;
if (this.write == this.end) this.write = 0;
n = this.write - q;
if (n > this.z.avail_out) n = this.z.avail_out;
if (n != 0 && r == -5) r = 0;
this.z.avail_out -= n;
this.z.total_out += n;
if (this.check && n > 0) {
this.z.adler.updateRange (this.window, q, n);
}System.arraycopy (this.window, q, this.z.next_out, p, n);
p += n;
q += n;
}this.z.next_out_index = p;
this.read = q;
return r;
}, "~N");
Clazz.defineStatics (c$,
"MANY", 1440,
"inflate_mask", [0x00000000, 0x00000001, 0x00000003, 0x00000007, 0x0000000f, 0x0000001f, 0x0000003f, 0x0000007f, 0x000000ff, 0x000001ff, 0x000003ff, 0x000007ff, 0x00000fff, 0x00001fff, 0x00003fff, 0x00007fff, 0x0000ffff],
"border", [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
"Z_OK", 0,
"Z_STREAM_END", 1,
"Z_STREAM_ERROR", -2,
"Z_DATA_ERROR", -3,
"Z_BUF_ERROR", -5,
"TYPE", 0,
"LENS", 1,
"STORED", 2,
"TABLE", 3,
"BTREE", 4,
"DTREE", 5,
"CODES", 6,
"DRY", 7,
"DONE", 8,
"BAD", 9);
});
// 
//// com\jcraft\jzlib\InfCodes.js 
// 
Clazz.declarePackage ("com.jcraft.jzlib");
c$ = Clazz.decorateAsClass (function () {
this.mode = 0;
this.len = 0;
this.tree = null;
this.tree_index = 0;
this.need = 0;
this.lit = 0;
this.get = 0;
this.dist = 0;
this.lbits = 0;
this.dbits = 0;
this.ltree = null;
this.ltree_index = 0;
this.dtree = null;
this.dtree_index = 0;
this.z = null;
this.s = null;
Clazz.instantialize (this, arguments);
}, com.jcraft.jzlib, "InfCodes");
Clazz.makeConstructor (c$, 
function (z, s) {
this.z = z;
this.s = s;
}, "com.jcraft.jzlib.ZStream,com.jcraft.jzlib.InfBlocks");
Clazz.defineMethod (c$, "init", 
function (bl, bd, tl, tl_index, td, td_index) {
this.mode = 0;
this.lbits = bl;
this.dbits = bd;
this.ltree = tl;
this.ltree_index = tl_index;
this.dtree = td;
this.dtree_index = td_index;
this.tree = null;
}, "~N,~N,~A,~N,~A,~N");
Clazz.defineMethod (c$, "proc", 
function (r) {
var j;
var tindex;
var e;
var b = 0;
var k = 0;
var p = 0;
var n;
var q;
var m;
var f;
p = this.z.next_in_index;
n = this.z.avail_in;
b = this.s.bitb;
k = this.s.bitk;
q = this.s.write;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
while (true) {
switch (this.mode) {
case 0:
if (m >= 258 && n >= 10) {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
r = this.inflate_fast (this.lbits, this.dbits, this.ltree, this.ltree_index, this.dtree, this.dtree_index, this.s, this.z);
p = this.z.next_in_index;
n = this.z.avail_in;
b = this.s.bitb;
k = this.s.bitk;
q = this.s.write;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
if (r != 0) {
this.mode = r == 1 ? 7 : 9;
break;
}}this.need = this.lbits;
this.tree = this.ltree;
this.tree_index = this.ltree_index;
this.mode = 1;
case 1:
j = this.need;
while (k < (j)) {
if (n != 0) r = 0;
 else {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
tindex = (this.tree_index + (b & com.jcraft.jzlib.InfCodes.inflate_mask[j])) * 3;
b >>>= (this.tree[tindex + 1]);
k -= (this.tree[tindex + 1]);
e = this.tree[tindex];
if (e == 0) {
this.lit = this.tree[tindex + 2];
this.mode = 6;
break;
}if ((e & 16) != 0) {
this.get = e & 15;
this.len = this.tree[tindex + 2];
this.mode = 2;
break;
}if ((e & 64) == 0) {
this.need = e;
this.tree_index = Clazz.doubleToInt (tindex / 3) + this.tree[tindex + 2];
break;
}if ((e & 32) != 0) {
this.mode = 7;
break;
}this.mode = 9;
this.z.msg = "invalid literal/length code";
r = -3;
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
case 2:
j = this.get;
while (k < (j)) {
if (n != 0) r = 0;
 else {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
this.len += (b & com.jcraft.jzlib.InfCodes.inflate_mask[j]);
b >>= j;
k -= j;
this.need = this.dbits;
this.tree = this.dtree;
this.tree_index = this.dtree_index;
this.mode = 3;
case 3:
j = this.need;
while (k < (j)) {
if (n != 0) r = 0;
 else {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
tindex = (this.tree_index + (b & com.jcraft.jzlib.InfCodes.inflate_mask[j])) * 3;
b >>= this.tree[tindex + 1];
k -= this.tree[tindex + 1];
e = (this.tree[tindex]);
if ((e & 16) != 0) {
this.get = e & 15;
this.dist = this.tree[tindex + 2];
this.mode = 4;
break;
}if ((e & 64) == 0) {
this.need = e;
this.tree_index = Clazz.doubleToInt (tindex / 3) + this.tree[tindex + 2];
break;
}this.mode = 9;
this.z.msg = "invalid distance code";
r = -3;
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
case 4:
j = this.get;
while (k < (j)) {
if (n != 0) r = 0;
 else {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}n--;
b |= (this.z.next_in[p++] & 0xff) << k;
k += 8;
}
this.dist += (b & com.jcraft.jzlib.InfCodes.inflate_mask[j]);
b >>= j;
k -= j;
this.mode = 5;
case 5:
f = q - this.dist;
while (f < 0) {
f += this.s.end;
}
while (this.len != 0) {
if (m == 0) {
if (q == this.s.end && this.s.read != 0) {
q = 0;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
}if (m == 0) {
this.s.write = q;
r = this.s.inflate_flush (r);
q = this.s.write;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
if (q == this.s.end && this.s.read != 0) {
q = 0;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
}if (m == 0) {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}}}this.s.window[q++] = this.s.window[f++];
m--;
if (f == this.s.end) f = 0;
this.len--;
}
this.mode = 0;
break;
case 6:
if (m == 0) {
if (q == this.s.end && this.s.read != 0) {
q = 0;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
}if (m == 0) {
this.s.write = q;
r = this.s.inflate_flush (r);
q = this.s.write;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
if (q == this.s.end && this.s.read != 0) {
q = 0;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
}if (m == 0) {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}}}r = 0;
this.s.window[q++] = this.lit;
m--;
this.mode = 0;
break;
case 7:
if (k > 7) {
k -= 8;
n++;
p--;
}this.s.write = q;
r = this.s.inflate_flush (r);
q = this.s.write;
m = q < this.s.read ? this.s.read - q - 1 : this.s.end - q;
if (this.s.read != this.s.write) {
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}this.mode = 8;
case 8:
r = 1;
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
case 9:
r = -3;
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
default:
r = -2;
this.s.bitb = b;
this.s.bitk = k;
this.z.avail_in = n;
this.z.total_in += p - this.z.next_in_index;
this.z.next_in_index = p;
this.s.write = q;
return this.s.inflate_flush (r);
}
}
}, "~N");
Clazz.defineMethod (c$, "free", 
function (z) {
}, "com.jcraft.jzlib.ZStream");
Clazz.defineMethod (c$, "inflate_fast", 
function (bl, bd, tl, tl_index, td, td_index, s, z) {
var t;
var tp;
var tp_index;
var e;
var b;
var k;
var p;
var n;
var q;
var m;
var ml;
var md;
var c;
var d;
var r;
var tp_index_t_3;
p = z.next_in_index;
n = z.avail_in;
b = s.bitb;
k = s.bitk;
q = s.write;
m = q < s.read ? s.read - q - 1 : s.end - q;
ml = com.jcraft.jzlib.InfCodes.inflate_mask[bl];
md = com.jcraft.jzlib.InfCodes.inflate_mask[bd];
do {
while (k < (20)) {
n--;
b |= (z.next_in[p++] & 0xff) << k;
k += 8;
}
t = b & ml;
tp = tl;
tp_index = tl_index;
tp_index_t_3 = (tp_index + t) * 3;
if ((e = tp[tp_index_t_3]) == 0) {
b >>= (tp[tp_index_t_3 + 1]);
k -= (tp[tp_index_t_3 + 1]);
s.window[q++] = tp[tp_index_t_3 + 2];
m--;
continue;
}do {
b >>= (tp[tp_index_t_3 + 1]);
k -= (tp[tp_index_t_3 + 1]);
if ((e & 16) != 0) {
e &= 15;
c = tp[tp_index_t_3 + 2] + (b & com.jcraft.jzlib.InfCodes.inflate_mask[e]);
b >>= e;
k -= e;
while (k < (15)) {
n--;
b |= (z.next_in[p++] & 0xff) << k;
k += 8;
}
t = b & md;
tp = td;
tp_index = td_index;
tp_index_t_3 = (tp_index + t) * 3;
e = tp[tp_index_t_3];
do {
b >>= (tp[tp_index_t_3 + 1]);
k -= (tp[tp_index_t_3 + 1]);
if ((e & 16) != 0) {
e &= 15;
while (k < (e)) {
n--;
b |= (z.next_in[p++] & 0xff) << k;
k += 8;
}
d = tp[tp_index_t_3 + 2] + (b & com.jcraft.jzlib.InfCodes.inflate_mask[e]);
b >>= (e);
k -= (e);
m -= c;
if (q >= d) {
r = q - d;
if (q - r > 0 && 2 > (q - r)) {
s.window[q++] = s.window[r++];
s.window[q++] = s.window[r++];
c -= 2;
} else {
System.arraycopy (s.window, r, s.window, q, 2);
q += 2;
r += 2;
c -= 2;
}} else {
r = q - d;
do {
r += s.end;
} while (r < 0);
e = s.end - r;
if (c > e) {
c -= e;
if (q - r > 0 && e > (q - r)) {
do {
s.window[q++] = s.window[r++];
} while (--e != 0);
} else {
System.arraycopy (s.window, r, s.window, q, e);
q += e;
r += e;
e = 0;
}r = 0;
}}if (q - r > 0 && c > (q - r)) {
do {
s.window[q++] = s.window[r++];
} while (--c != 0);
} else {
System.arraycopy (s.window, r, s.window, q, c);
q += c;
r += c;
c = 0;
}break;
} else if ((e & 64) == 0) {
t += tp[tp_index_t_3 + 2];
t += (b & com.jcraft.jzlib.InfCodes.inflate_mask[e]);
tp_index_t_3 = (tp_index + t) * 3;
e = tp[tp_index_t_3];
} else {
z.msg = "invalid distance code";
c = z.avail_in - n;
c = (k >> 3) < c ? k >> 3 : c;
n += c;
p -= c;
k -= c << 3;
s.bitb = b;
s.bitk = k;
z.avail_in = n;
z.total_in += p - z.next_in_index;
z.next_in_index = p;
s.write = q;
return -3;
}} while (true);
break;
}if ((e & 64) == 0) {
t += tp[tp_index_t_3 + 2];
t += (b & com.jcraft.jzlib.InfCodes.inflate_mask[e]);
tp_index_t_3 = (tp_index + t) * 3;
if ((e = tp[tp_index_t_3]) == 0) {
b >>= (tp[tp_index_t_3 + 1]);
k -= (tp[tp_index_t_3 + 1]);
s.window[q++] = tp[tp_index_t_3 + 2];
m--;
break;
}} else if ((e & 32) != 0) {
c = z.avail_in - n;
c = (k >> 3) < c ? k >> 3 : c;
n += c;
p -= c;
k -= c << 3;
s.bitb = b;
s.bitk = k;
z.avail_in = n;
z.total_in += p - z.next_in_index;
z.next_in_index = p;
s.write = q;
return 1;
} else {
z.msg = "invalid literal/length code";
c = z.avail_in - n;
c = (k >> 3) < c ? k >> 3 : c;
n += c;
p -= c;
k -= c << 3;
s.bitb = b;
s.bitk = k;
z.avail_in = n;
z.total_in += p - z.next_in_index;
z.next_in_index = p;
s.write = q;
return -3;
}} while (true);
} while (m >= 258 && n >= 10);
c = z.avail_in - n;
c = (k >> 3) < c ? k >> 3 : c;
n += c;
p -= c;
k -= c << 3;
s.bitb = b;
s.bitk = k;
z.avail_in = n;
z.total_in += p - z.next_in_index;
z.next_in_index = p;
s.write = q;
return 0;
}, "~N,~N,~A,~N,~A,~N,com.jcraft.jzlib.InfBlocks,com.jcraft.jzlib.ZStream");
Clazz.defineStatics (c$,
"inflate_mask", [0x00000000, 0x00000001, 0x00000003, 0x00000007, 0x0000000f, 0x0000001f, 0x0000003f, 0x0000007f, 0x000000ff, 0x000001ff, 0x000003ff, 0x000007ff, 0x00000fff, 0x00001fff, 0x00003fff, 0x00007fff, 0x0000ffff],
"Z_OK", 0,
"Z_STREAM_END", 1,
"Z_STREAM_ERROR", -2,
"Z_DATA_ERROR", -3,
"START", 0,
"LEN", 1,
"LENEXT", 2,
"DIST", 3,
"DISTEXT", 4,
"COPY", 5,
"LIT", 6,
"WASH", 7,
"END", 8,
"BADCODE", 9);
// 
//// java\util\zip\CheckedInputStream.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["java.io.FilterInputStream"], "java.util.zip.CheckedInputStream", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.cksum = null;
Clazz.instantialize (this, arguments);
}, java.util.zip, "CheckedInputStream", java.io.FilterInputStream);
Clazz.makeConstructor (c$, 
function ($in, cksum) {
Clazz.superConstructor (this, java.util.zip.CheckedInputStream, [$in]);
this.cksum = cksum;
}, "java.io.InputStream,com.jcraft.jzlib.Checksum");
Clazz.overrideMethod (c$, "readByteAsInt", 
function () {
var b = this.$in.readByteAsInt ();
if (b != -1) {
this.cksum.update (b);
}return b;
});
Clazz.overrideMethod (c$, "read", 
function (buf, off, len) {
len = this.$in.read (buf, off, len);
if (len != -1) {
this.cksum.updateRange (buf, off, len);
}return len;
}, "~A,~N,~N");
Clazz.overrideMethod (c$, "skip", 
function (n) {
var buf =  Clazz.newByteArray (512, 0);
var total = 0;
while (total < n) {
var len = n - total;
len = this.read (buf, 0, len < buf.length ? len : buf.length);
if (len == -1) {
return total;
}total += len;
}
return total;
}, "~N");
Clazz.defineMethod (c$, "getChecksum", 
function () {
return this.cksum;
});
});
// 
//// java\util\zip\Inflater.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["com.jcraft.jzlib.Inflater"], "java.util.zip.Inflater", null, function () {
c$ = Clazz.declareType (java.util.zip, "Inflater", com.jcraft.jzlib.Inflater);
Clazz.makeConstructor (c$, 
function (nowrap) {
Clazz.superConstructor (this, java.util.zip.Inflater, [15, nowrap]);
}, "~B");
Clazz.defineMethod (c$, "getRemaining", 
function () {
return this.avail_in;
});
Clazz.defineMethod (c$, "getBytesWritten", 
function () {
return this.total_out;
});
Clazz.defineMethod (c$, "getBytesRead", 
function () {
return this.total_in;
});
});
// 
//// java\util\zip\ZipException.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["java.io.IOException"], "java.util.zip.ZipException", null, function () {
c$ = Clazz.declareType (java.util.zip, "ZipException", java.io.IOException);
});
// 
//// java\util\zip\ZipConstants.js 
// 
Clazz.declarePackage ("java.util.zip");
c$ = Clazz.declareInterface (java.util.zip, "ZipConstants");
Clazz.defineStatics (c$,
"LOCSIG", 0x04034b50,
"EXTSIG", 0x08074b50,
"CENSIG", 0x02014b50,
"ENDSIG", 0x06054b50,
"LOCHDR", 30,
"EXTHDR", 16,
"CENHDR", 46,
"ENDHDR", 22,
"LOCVER", 4,
"LOCFLG", 6,
"LOCHOW", 8,
"LOCTIM", 10,
"LOCCRC", 14,
"LOCSIZ", 18,
"LOCLEN", 22,
"LOCNAM", 26,
"LOCEXT", 28,
"EXTCRC", 4,
"EXTSIZ", 8,
"EXTLEN", 12,
"CENVEM", 4,
"CENVER", 6,
"CENFLG", 8,
"CENHOW", 10,
"CENTIM", 12,
"CENCRC", 16,
"CENSIZ", 20,
"CENLEN", 24,
"CENNAM", 28,
"CENEXT", 30,
"CENCOM", 32,
"CENDSK", 34,
"CENATT", 36,
"CENATX", 38,
"CENOFF", 42,
"ENDSUB", 8,
"ENDTOT", 10,
"ENDSIZ", 12,
"ENDOFF", 16,
"ENDCOM", 20);
// 
//// java\util\zip\ZipEntry.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["java.util.zip.ZipConstants"], "java.util.zip.ZipEntry", ["java.lang.IllegalArgumentException", "$.InternalError", "$.NullPointerException", "java.util.Date"], function () {
c$ = Clazz.decorateAsClass (function () {
this.name = null;
this.time = -1;
this.crc = -1;
this.size = -1;
this.csize = -1;
this.method = -1;
this.flag = 0;
this.extra = null;
this.comment = null;
Clazz.instantialize (this, arguments);
}, java.util.zip, "ZipEntry", null, [java.util.zip.ZipConstants, Cloneable]);
Clazz.makeConstructor (c$, 
function (name) {
if (name == null) {
throw  new NullPointerException ();
}if (name.length > 0xFFFF) {
throw  new IllegalArgumentException ("entry name too long");
}this.name = name;
}, "~S");
Clazz.defineMethod (c$, "getName", 
function () {
return this.name;
});
Clazz.defineMethod (c$, "setTime", 
function (time) {
this.time = java.util.zip.ZipEntry.javaToDosTime (time);
}, "~N");
Clazz.defineMethod (c$, "getTime", 
function () {
return this.time != -1 ? java.util.zip.ZipEntry.dosToJavaTime (this.time) : -1;
});
Clazz.defineMethod (c$, "setSize", 
function (size) {
if (size < 0) {
throw  new IllegalArgumentException ("invalid entry size");
}this.size = size;
}, "~N");
Clazz.defineMethod (c$, "getSize", 
function () {
return this.size;
});
Clazz.defineMethod (c$, "getCompressedSize", 
function () {
return this.csize;
});
Clazz.defineMethod (c$, "setCompressedSize", 
function (csize) {
this.csize = csize;
}, "~N");
Clazz.defineMethod (c$, "setCrc", 
function (crc) {
if (crc < 0 || crc > 0xFFFFFFFF) {
throw  new IllegalArgumentException ("invalid entry crc-32");
}this.crc = crc;
}, "~N");
Clazz.defineMethod (c$, "getCrc", 
function () {
return this.crc;
});
Clazz.defineMethod (c$, "setMethod", 
function (method) {
if (method != 0 && method != 8) {
throw  new IllegalArgumentException ("invalid compression method");
}this.method = method;
}, "~N");
Clazz.defineMethod (c$, "getMethod", 
function () {
return this.method;
});
Clazz.defineMethod (c$, "setExtra", 
function (extra) {
if (extra != null && extra.length > 0xFFFF) {
throw  new IllegalArgumentException ("invalid extra field length");
}this.extra = extra;
}, "~A");
Clazz.defineMethod (c$, "getExtra", 
function () {
return this.extra;
});
Clazz.defineMethod (c$, "setComment", 
function (comment) {
this.comment = comment;
}, "~S");
Clazz.defineMethod (c$, "getComment", 
function () {
return this.comment;
});
Clazz.defineMethod (c$, "isDirectory", 
function () {
return this.name.endsWith ("/");
});
Clazz.overrideMethod (c$, "toString", 
function () {
return this.getName ();
});
c$.dosToJavaTime = Clazz.defineMethod (c$, "dosToJavaTime", 
($fz = function (dtime) {
var d =  new java.util.Date ((((dtime >> 25) & 0x7f) + 80), (((dtime >> 21) & 0x0f) - 1), ((dtime >> 16) & 0x1f), ((dtime >> 11) & 0x1f), ((dtime >> 5) & 0x3f), ((dtime << 1) & 0x3e));
return d.getTime ();
}, $fz.isPrivate = true, $fz), "~N");
c$.javaToDosTime = Clazz.defineMethod (c$, "javaToDosTime", 
($fz = function (time) {
var d =  new java.util.Date (time);
var year = d.getYear () + 1900;
if (year < 1980) {
return 2162688;
}return (year - 1980) << 25 | (d.getMonth () + 1) << 21 | d.getDate () << 16 | d.getHours () << 11 | d.getMinutes () << 5 | d.getSeconds () >> 1;
}, $fz.isPrivate = true, $fz), "~N");
Clazz.overrideMethod (c$, "hashCode", 
function () {
return this.name.hashCode ();
});
Clazz.defineMethod (c$, "clone", 
function () {
try {
var e = Clazz.superCall (this, java.util.zip.ZipEntry, "clone", []);
if (this.extra != null) {
e.extra =  Clazz.newByteArray (this.extra.length, 0);
System.arraycopy (this.extra, 0, e.extra, 0, this.extra.length);
}return e;
} catch (e) {
if (Clazz.exceptionOf (e, CloneNotSupportedException)) {
throw  new InternalError ();
} else {
throw e;
}
}
});
Clazz.defineStatics (c$,
"STORED", 0,
"DEFLATED", 8);
});
// 
//// java\util\zip\ZipConstants64.js 
// 
Clazz.declarePackage ("java.util.zip");
c$ = Clazz.declareType (java.util.zip, "ZipConstants64");
Clazz.defineStatics (c$,
"ZIP64_ENDSIG", 0x06064b50,
"ZIP64_LOCSIG", 0x07064b50,
"ZIP64_ENDHDR", 56,
"ZIP64_LOCHDR", 20,
"ZIP64_EXTHDR", 24,
"ZIP64_EXTID", 0x0001,
"ZIP64_MAGICCOUNT", 0xFFFF,
"ZIP64_MAGICVAL", 0xFFFFFFFF,
"ZIP64_ENDLEN", 4,
"ZIP64_ENDVEM", 12,
"ZIP64_ENDVER", 14,
"ZIP64_ENDNMD", 16,
"ZIP64_ENDDSK", 20,
"ZIP64_ENDTOD", 24,
"ZIP64_ENDTOT", 32,
"ZIP64_ENDSIZ", 40,
"ZIP64_ENDOFF", 48,
"ZIP64_ENDEXT", 56,
"ZIP64_LOCDSK", 4,
"ZIP64_LOCOFF", 8,
"ZIP64_LOCTOT", 16,
"ZIP64_EXTCRC", 4,
"ZIP64_EXTSIZ", 8,
"ZIP64_EXTLEN", 16,
"EFS", 0x800);
// 
//// java\util\zip\ZipInputStream.js 
// 
Clazz.declarePackage ("java.util.zip");
Clazz.load (["java.util.zip.InflaterInputStream", "$.ZipConstants", "$.ZipConstants64", "$.CRC32"], "java.util.zip.ZipInputStream", ["java.io.EOFException", "$.IOException", "$.PushbackInputStream", "java.lang.IllegalArgumentException", "$.IndexOutOfBoundsException", "$.Long", "$.NullPointerException", "java.util.zip.Inflater", "$.ZipEntry", "$.ZipException"], function () {
c$ = Clazz.decorateAsClass (function () {
this.entry = null;
this.flag = 0;
this.crc = null;
this.remaining = 0;
this.tmpbuf = null;
this.$closed = false;
this.entryEOF = false;
this.zc = null;
this.byteTest = null;
this.$b = null;
Clazz.instantialize (this, arguments);
}, java.util.zip, "ZipInputStream", java.util.zip.InflaterInputStream, java.util.zip.ZipConstants);
Clazz.prepareFields (c$, function () {
this.crc =  new java.util.zip.CRC32 ();
this.tmpbuf =  Clazz.newByteArray (512, 0);
this.byteTest = [0x20];
this.$b =  Clazz.newByteArray (256, 0);
});
Clazz.defineMethod (c$, "ensureOpen", 
($fz = function () {
if (this.$closed) {
throw  new java.io.IOException ("Stream closed");
}}, $fz.isPrivate = true, $fz));
Clazz.makeConstructor (c$, 
function ($in) {
Clazz.superConstructor (this, java.util.zip.ZipInputStream, [ new java.io.PushbackInputStream ($in, 1024),  new java.util.zip.Inflater (true), 512]);
var charset = "UTF-8";
try {
 String.instantialize (this.byteTest, charset);
} catch (e) {
if (Clazz.exceptionOf (e, java.io.UnsupportedEncodingException)) {
throw  new NullPointerException ("charset is invalid");
} else {
throw e;
}
}
this.zc = charset;
}, "java.io.InputStream");
Clazz.defineMethod (c$, "getNextEntry", 
function () {
this.ensureOpen ();
if (this.entry != null) {
this.closeEntry ();
}this.crc.resetAll ();
this.inflater = this.inf =  new java.util.zip.Inflater (true);
if ((this.entry = this.readLOC ()) == null) {
return null;
}if (this.entry.method == 0) {
this.remaining = this.entry.size;
}this.entryEOF = false;
return this.entry;
});
Clazz.defineMethod (c$, "closeEntry", 
function () {
this.ensureOpen ();
while (this.read (this.tmpbuf, 0, this.tmpbuf.length) != -1) {
}
this.entryEOF = true;
});
Clazz.overrideMethod (c$, "available", 
function () {
this.ensureOpen ();
return (this.entryEOF ? 0 : 1);
});
Clazz.defineMethod (c$, "read", 
function (b, off, len) {
this.ensureOpen ();
if (off < 0 || len < 0 || off > b.length - len) {
throw  new IndexOutOfBoundsException ();
} else if (len == 0) {
return 0;
}if (this.entry == null) {
return -1;
}switch (this.entry.method) {
case 8:
len = Clazz.superCall (this, java.util.zip.ZipInputStream, "read", [b, off, len]);
if (len == -1) {
this.readEnd (this.entry);
this.entryEOF = true;
this.entry = null;
} else {
this.crc.updateRange (b, off, len);
}return len;
case 0:
if (this.remaining <= 0) {
this.entryEOF = true;
this.entry = null;
return -1;
}if (len > this.remaining) {
len = this.remaining;
}len = this.$in.read (b, off, len);
if (len == -1) {
throw  new java.util.zip.ZipException ("unexpected EOF");
}this.crc.updateRange (b, off, len);
this.remaining -= len;
if (this.remaining == 0 && this.entry.crc != this.crc.getValue ()) {
throw  new java.util.zip.ZipException ("invalid entry CRC (expected 0x" + Long.toHexString (this.entry.crc) + " but got 0x" + Long.toHexString (this.crc.getValue ()) + ")");
}return len;
default:
throw  new java.util.zip.ZipException ("invalid compression method");
}
}, "~A,~N,~N");
Clazz.overrideMethod (c$, "skip", 
function (n) {
if (n < 0) {
throw  new IllegalArgumentException ("negative skip length");
}this.ensureOpen ();
var max = Math.min (n, 2147483647);
var total = 0;
while (total < max) {
var len = max - total;
if (len > this.tmpbuf.length) {
len = this.tmpbuf.length;
}len = this.read (this.tmpbuf, 0, len);
if (len == -1) {
this.entryEOF = true;
break;
}total += len;
}
return total;
}, "~N");
Clazz.defineMethod (c$, "close", 
function () {
if (!this.$closed) {
Clazz.superCall (this, java.util.zip.ZipInputStream, "close", []);
this.$closed = true;
}});
Clazz.defineMethod (c$, "readLOC", 
($fz = function () {
try {
this.readFully (this.tmpbuf, 0, 30);
} catch (e) {
if (Clazz.exceptionOf (e, java.io.EOFException)) {
return null;
} else {
throw e;
}
}
if (java.util.zip.ZipInputStream.get32 (this.tmpbuf, 0) != 67324752) {
return null;
}this.flag = java.util.zip.ZipInputStream.get16 (this.tmpbuf, 6);
var len = java.util.zip.ZipInputStream.get16 (this.tmpbuf, 26);
var blen = this.$b.length;
if (len > blen) {
do blen = blen * 2;
 while (len > blen);
this.$b =  Clazz.newByteArray (blen, 0);
}this.readFully (this.$b, 0, len);
var e = this.createZipEntry (((this.flag & 2048) != 0) ? this.toStringUTF8 (this.$b, len) : this.toString (this.$b, len));
if ((this.flag & 1) == 1) {
throw  new java.util.zip.ZipException ("encrypted ZIP entry not supported");
}e.method = java.util.zip.ZipInputStream.get16 (this.tmpbuf, 8);
e.time = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 10);
if ((this.flag & 8) == 8) {
if (e.method != 8) {
throw  new java.util.zip.ZipException ("only DEFLATED entries can have EXT descriptor");
}} else {
e.crc = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 14);
e.csize = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 18);
e.size = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 22);
}len = java.util.zip.ZipInputStream.get16 (this.tmpbuf, 28);
if (len > 0) {
var bb =  Clazz.newByteArray (len, 0);
this.readFully (bb, 0, len);
e.setExtra (bb);
if (e.csize == 4294967295 || e.size == 4294967295) {
var off = 0;
while (off + 4 < len) {
var sz = java.util.zip.ZipInputStream.get16 (bb, off + 2);
if (java.util.zip.ZipInputStream.get16 (bb, off) == 1) {
off += 4;
if (sz < 16 || (off + sz) > len) {
return e;
}e.size = java.util.zip.ZipInputStream.get64 (bb, off);
e.csize = java.util.zip.ZipInputStream.get64 (bb, off + 8);
break;
}off += (sz + 4);
}
}}return e;
}, $fz.isPrivate = true, $fz));
Clazz.defineMethod (c$, "toString", 
($fz = function (b2, len) {
return  String.instantialize (b2, 0, len);
}, $fz.isPrivate = true, $fz), "~A,~N");
Clazz.defineMethod (c$, "toStringUTF8", 
($fz = function (b2, len) {
try {
return  String.instantialize (b2, 0, len, this.zc);
} catch (e) {
if (Clazz.exceptionOf (e, java.io.UnsupportedEncodingException)) {
return this.toString (b2, len);
} else {
throw e;
}
}
}, $fz.isPrivate = true, $fz), "~A,~N");
Clazz.defineMethod (c$, "createZipEntry", 
function (name) {
return  new java.util.zip.ZipEntry (name);
}, "~S");
Clazz.defineMethod (c$, "readEnd", 
($fz = function (e) {
var n = this.inf.getRemaining ();
if (n > 0) {
(this.$in).unread (this.buf, this.len - n, n);
this.eof = false;
}if ((this.flag & 8) == 8) {
if (this.inf.getBytesWritten () > 4294967295 || this.inf.getBytesRead () > 4294967295) {
this.readFully (this.tmpbuf, 0, 24);
var sig = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 0);
if (sig != 134695760) {
e.crc = sig;
e.csize = java.util.zip.ZipInputStream.get64 (this.tmpbuf, 4);
e.size = java.util.zip.ZipInputStream.get64 (this.tmpbuf, 12);
(this.$in).unread (this.tmpbuf, 19, 4);
} else {
e.crc = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 4);
e.csize = java.util.zip.ZipInputStream.get64 (this.tmpbuf, 8);
e.size = java.util.zip.ZipInputStream.get64 (this.tmpbuf, 16);
}} else {
this.readFully (this.tmpbuf, 0, 16);
var sig = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 0);
if (sig != 134695760) {
e.crc = sig;
e.csize = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 4);
e.size = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 8);
(this.$in).unread (this.tmpbuf, 11, 4);
} else {
e.crc = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 4);
e.csize = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 8);
e.size = java.util.zip.ZipInputStream.get32 (this.tmpbuf, 12);
}}}if (e.size != this.inf.getBytesWritten ()) {
throw  new java.util.zip.ZipException ("invalid entry size (expected " + e.size + " but got " + this.inf.getBytesWritten () + " bytes)");
}if (e.csize != this.inf.getBytesRead ()) {
throw  new java.util.zip.ZipException ("invalid entry compressed size (expected " + e.csize + " but got " + this.inf.getBytesRead () + " bytes)");
}if (e.crc != this.crc.getValue ()) {
throw  new java.util.zip.ZipException ("invalid entry CRC (expected 0x" + Long.toHexString (e.crc) + " but got 0x" + Long.toHexString (this.crc.getValue ()) + ")");
}}, $fz.isPrivate = true, $fz), "java.util.zip.ZipEntry");
Clazz.defineMethod (c$, "readFully", 
($fz = function (b, off, len) {
while (len > 0) {
var n = this.$in.read (b, off, len);
if (n == -1) {
throw  new java.io.EOFException ();
}off += n;
len -= n;
}
}, $fz.isPrivate = true, $fz), "~A,~N,~N");
c$.get16 = Clazz.defineMethod (c$, "get16", 
($fz = function (b, off) {
return (b[off] & 0xff) | ((b[off + 1] & 0xff) << 8);
}, $fz.isPrivate = true, $fz), "~A,~N");
c$.get32 = Clazz.defineMethod (c$, "get32", 
($fz = function (b, off) {
return (java.util.zip.ZipInputStream.get16 (b, off) | (java.util.zip.ZipInputStream.get16 (b, off + 2) << 16)) & 0xffffffff;
}, $fz.isPrivate = true, $fz), "~A,~N");
c$.get64 = Clazz.defineMethod (c$, "get64", 
($fz = function (b, off) {
return java.util.zip.ZipInputStream.get32 (b, off) | (java.util.zip.ZipInputStream.get32 (b, off + 4) << 32);
}, $fz.isPrivate = true, $fz), "~A,~N");
Clazz.defineStatics (c$,
"STORED", 0,
"DEFLATED", 8);
});
// 
//// java\io\PushbackInputStream.js 
// 
Clazz.load (["java.io.FilterInputStream"], "java.io.PushbackInputStream", ["java.io.IOException", "java.lang.IllegalArgumentException", "$.IndexOutOfBoundsException", "$.NullPointerException"], function () {
c$ = Clazz.decorateAsClass (function () {
this.buf = null;
this.pos = 0;
Clazz.instantialize (this, arguments);
}, java.io, "PushbackInputStream", java.io.FilterInputStream);
Clazz.defineMethod (c$, "ensureOpen", 
($fz = function () {
if (this.$in == null) throw  new java.io.IOException ("Stream closed");
}, $fz.isPrivate = true, $fz));
Clazz.makeConstructor (c$, 
function ($in, size) {
Clazz.superConstructor (this, java.io.PushbackInputStream, [$in]);
if (size <= 0) {
throw  new IllegalArgumentException ("size <= 0");
}this.buf =  Clazz.newByteArray (size, 0);
this.pos = size;
}, "java.io.InputStream,~N");
Clazz.defineMethod (c$, "readByteAsInt", 
function () {
this.ensureOpen ();
if (this.pos < this.buf.length) {
return this.buf[this.pos++] & 0xff;
}return Clazz.superCall (this, java.io.PushbackInputStream, "readByteAsInt", []);
});
Clazz.defineMethod (c$, "read", 
function (b, off, len) {
this.ensureOpen ();
if (b == null) {
throw  new NullPointerException ();
} else if (off < 0 || len < 0 || len > b.length - off) {
throw  new IndexOutOfBoundsException ();
} else if (len == 0) {
return 0;
}var avail = this.buf.length - this.pos;
if (avail > 0) {
if (len < avail) {
avail = len;
}System.arraycopy (this.buf, this.pos, b, off, avail);
this.pos += avail;
off += avail;
len -= avail;
}if (len > 0) {
len = Clazz.superCall (this, java.io.PushbackInputStream, "read", [b, off, len]);
if (len == -1) {
return avail == 0 ? -1 : avail;
}return avail + len;
}return avail;
}, "~A,~N,~N");
Clazz.defineMethod (c$, "unreadByte", 
function (b) {
this.ensureOpen ();
if (this.pos == 0) {
throw  new java.io.IOException ("Push back buffer is full");
}this.buf[--this.pos] = b;
}, "~N");
Clazz.defineMethod (c$, "unread", 
function (b, off, len) {
this.ensureOpen ();
if (len > this.pos) {
throw  new java.io.IOException ("Push back buffer is full");
}this.pos -= len;
System.arraycopy (b, off, this.buf, this.pos, len);
}, "~A,~N,~N");
Clazz.defineMethod (c$, "available", 
function () {
this.ensureOpen ();
var n = this.buf.length - this.pos;
var avail = Clazz.superCall (this, java.io.PushbackInputStream, "available", []);
return n > (2147483647 - avail) ? 2147483647 : n + avail;
});
Clazz.defineMethod (c$, "skip", 
function (n) {
this.ensureOpen ();
if (n <= 0) {
return 0;
}var pskip = this.buf.length - this.pos;
if (pskip > 0) {
if (n < pskip) {
pskip = n;
}this.pos += pskip;
n -= pskip;
}if (n > 0) {
pskip += Clazz.superCall (this, java.io.PushbackInputStream, "skip", [n]);
}return pskip;
}, "~N");
Clazz.overrideMethod (c$, "markSupported", 
function () {
return false;
});
Clazz.overrideMethod (c$, "mark", 
function (readlimit) {
}, "~N");
Clazz.overrideMethod (c$, "reset", 
function () {
throw  new java.io.IOException ("mark/reset not supported");
});
Clazz.overrideMethod (c$, "close", 
function () {
if (this.$in == null) return;
this.$in.close ();
this.$in = null;
this.buf = null;
});
});
// 
//// org\jmol\api\ZInputStream.js 
// 
Clazz.declarePackage ("org.jmol.api");
Clazz.declareInterface (org.jmol.api, "ZInputStream");
// 
//// org\jmol\io2\JmolZipInputStream.js 
// 
Clazz.declarePackage ("org.jmol.io2");
Clazz.load (["java.util.zip.ZipInputStream", "org.jmol.api.ZInputStream"], "org.jmol.io2.JmolZipInputStream", null, function () {
c$ = Clazz.declareType (org.jmol.io2, "JmolZipInputStream", java.util.zip.ZipInputStream, org.jmol.api.ZInputStream);
});
