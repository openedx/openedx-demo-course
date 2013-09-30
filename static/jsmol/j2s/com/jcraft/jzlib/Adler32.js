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
