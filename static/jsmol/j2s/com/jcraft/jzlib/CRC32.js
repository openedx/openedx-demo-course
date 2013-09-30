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
