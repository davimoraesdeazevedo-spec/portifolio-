/* ===========================
   LOADER
=========================== */

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.style.display = "none";

        },1000);

    },2200);

});


/* ===========================
   EFEITO DIGITAÇÃO
=========================== */

const texto = [
"Desenvolvedor Python",
"Criador do JKR Bot",
"Bem-vindo ao meu Portfólio"
];

let indiceTexto = 0;
let indiceLetra = 0;

const typing = document.getElementById("typing");

function escrever(){

    if(indiceLetra < texto[indiceTexto].length){

        typing.innerHTML += texto[indiceTexto].charAt(indiceLetra);

        indiceLetra++;

        setTimeout(escrever,80);

    }else{

        setTimeout(apagar,1800);

    }

}

function apagar(){

    if(indiceLetra > 0){

        typing.innerHTML =
        texto[indiceTexto].substring(0,indiceLetra-1);

        indiceLetra--;

        setTimeout(apagar,40);

    }else{

        indiceTexto++;

        if(indiceTexto >= texto.length){

            indiceTexto = 0;

        }

        setTimeout(escrever,300);

    }

}

escrever();


/* ===========================
   SCROLL REVEAL
=========================== */

const observer = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll(".card,.project-card,.skill")
.forEach(el=>{

el.classList.add("fade");

observer.observe(el);

});


/* ===========================
   PARTÍCULAS
=========================== */

const canvas = document.createElement("canvas");

canvas.id="particleCanvas";

document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

function resize(){

canvas.width = window.innerWidth;

canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize",resize);

const particles=[];

for(let i=0;i<90;i++){

particles.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

r:Math.random()*3+1,

dx:(Math.random()-0.5),

dy:(Math.random()-0.5)

});

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#00ff66";

particles.forEach(p=>{

ctx.beginPath();

ctx.arc(p.x,p.y,p.r,0,Math.PI*2);

ctx.fill();

p.x+=p.dx;

p.y+=p.dy;

if(p.x<0)p.x=canvas.width;

if(p.x>canvas.width)p.x=0;

if(p.y<0)p.y=canvas.height;

if(p.y>canvas.height)p.y=0;

});

requestAnimationFrame(draw);

}

draw();


/* ===========================
   CURSOR GLOW
=========================== */

const glow=document.createElement("div");

document.body.appendChild(glow);

glow.style.position="fixed";
glow.style.width="20px";
glow.style.height="20px";
glow.style.borderRadius="50%";
glow.style.pointerEvents="none";
glow.style.background="#00ff66";
glow.style.boxShadow="0 0 25px #00ff66";
glow.style.zIndex="99999";

document.addEventListener("mousemove",(e)=>{

glow.style.left=e.clientX-10+"px";
glow.style.top=e.clientY-10+"px";

});


/* ===========================
   PARALLAX
=========================== */

window.addEventListener("mousemove",(e)=>{

const x=(e.clientX/window.innerWidth)-0.5;

const y=(e.clientY/window.innerHeight)-0.5;

document.querySelector(".hero").style.transform=

`translate(${x*10}px,${y*10}px)`;

});


/* ===========================
   BOTÃO
=========================== */

document.querySelectorAll(".btn").forEach(btn=>{

btn.addEventListener("mouseenter",()=>{

btn.style.transform="scale(1.08)";

});

btn.addEventListener("mouseleave",()=>{

btn.style.transform="scale(1)";

});

});


/* ===========================
   CANVAS
=========================== */

canvas.style.position="fixed";
canvas.style.left="0";
canvas.style.top="0";
canvas.style.width="100%";
canvas.style.height="100%";
canvas.style.pointerEvents="none";
canvas.style.zIndex="-1";

/* ==========================================
   EFEITO RIPPLE NOS BOTÕES
========================================== */

document.querySelectorAll(".btn").forEach(btn=>{

btn.addEventListener("click",function(e){

const circle=document.createElement("span");

const d=Math.max(this.clientWidth,this.clientHeight);

circle.style.width=d+"px";
circle.style.height=d+"px";

const rect=this.getBoundingClientRect();

circle.style.left=(e.clientX-rect.left-d/2)+"px";
circle.style.top=(e.clientY-rect.top-d/2)+"px";

circle.className="ripple";

this.appendChild(circle);

setTimeout(()=>{

circle.remove();

},600);

});

});


/* ==========================================
   CONTADOR DAS PORCENTAGENS
========================================== */

function contador(id,final){

let valor=0;

const elemento=document.getElementById(id);

if(!elemento)return;

if(final<=0){

elemento.innerHTML="0%";

return;

}

const intervalo=setInterval(()=>{

valor++;

elemento.innerHTML=valor+"%";

if(valor>=final){

clearInterval(intervalo);

}

},25);

}

window.addEventListener("load",()=>{

contador("pythonNumero",30);

contador("javaNumero",3);

contador("cppNumero",0);

});


/* ==========================================
   BRILHO DO CARD
========================================== */

document.querySelectorAll(".project-card").forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

card.style.background=

`radial-gradient(circle at ${x}px ${y}px,
rgba(0,255,120,.18),
#111 60%)`;

});

card.addEventListener("mouseleave",()=>{

card.style.background="#111";

});

});


/* ==========================================
   TÍTULO FLUTUANDO
========================================== */

const titulo=document.querySelector(".titulo");

let angulo=0;

function flutuar(){

angulo+=0.02;

titulo.style.transform=

`translateY(${Math.sin(angulo)*8}px)`;

requestAnimationFrame(flutuar);

}

flutuar();


/* ==========================================
   PARALLAX NO SCROLL
========================================== */

window.addEventListener("scroll",()=>{

const y=window.scrollY;

document.querySelector(".hero-content").style.transform=

`translateY(${y*0.2}px)`;

});


/* ==========================================
   GLOW NAS HABILIDADES
========================================== */

document.querySelectorAll(".skill").forEach(skill=>{

skill.addEventListener("mouseenter",()=>{

skill.style.transform="scale(1.02)";

skill.style.transition=".3s";

skill.style.boxShadow="0 0 25px #00ff66";

});

skill.addEventListener("mouseleave",()=>{

skill.style.transform="scale(1)";

skill.style.boxShadow="none";

});

});


/* ==========================================
   ESTRELAS
========================================== */

for(let i=0;i<60;i++){

const star=document.createElement("div");

star.style.position="fixed";
star.style.width="2px";
star.style.height="2px";
star.style.background="#00ff66";
star.style.borderRadius="50%";
star.style.left=Math.random()*100+"vw";
star.style.top=Math.random()*100+"vh";
star.style.opacity=Math.random();

star.animate([

{opacity:.2},

{opacity:1},

{opacity:.2}

],{

duration:1500+Math.random()*3000,

iterations:Infinity

});

document.body.appendChild(star);

}


/* ==========================================
   EFEITO MATRIX
========================================== */

const chars="01";

setInterval(()=>{

const code=document.createElement("div");

code.innerHTML=chars[Math.floor(Math.random()*2)];

code.style.position="fixed";

code.style.left=Math.random()*100+"vw";

code.style.top="-20px";

code.style.color="#00ff66";

code.style.fontSize=(10+Math.random()*18)+"px";

code.style.opacity=".2";

code.style.pointerEvents="none";

document.body.appendChild(code);

let pos=-20;

const queda=setInterval(()=>{

pos+=5;

code.style.top=pos+"px";

if(pos>window.innerHeight){

clearInterval(queda);

code.remove();

}

},25);

},120);