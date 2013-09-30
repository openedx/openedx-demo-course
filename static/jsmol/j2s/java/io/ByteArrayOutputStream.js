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
