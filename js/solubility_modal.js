export function initSolubilityModal(data){
 const modal=document.getElementById("solubilityModal");
 const close=modal.querySelector(".sol-close");
 const tabs=modal.querySelectorAll(".sol-tab");
 const contents=modal.querySelectorAll(".sol-tab-content");

 window.openSolIon=function(ionName){
   const ion=data.find(i=>i.name===ionName||i.symbol===ionName);
   if(!ion){console.warn("Not found",ionName);return;}
   modal.querySelector(".sol-ion-symbol").textContent=ion.symbol;
   modal.querySelector(".sol-ion-name").textContent=ion.fullName;
   document.getElementById("sol-charge").textContent=ion.charge;
   document.getElementById("sol-type").textContent=ion.type;
   document.getElementById("sol-basic").innerHTML=ion.description;
   document.getElementById("sol-solubility").innerHTML=ion.solubilityTable;
   document.getElementById("sol-compounds").innerHTML=ion.compounds;
   document.getElementById("sol-reactions").innerHTML=ion.reactions;
   document.getElementById("sol-obtain").innerHTML=ion.obtain;
   document.getElementById("sol-usage").innerHTML=ion.usage;
   document.getElementById("sol-safety").innerHTML=ion.safety;
   document.getElementById("sol-temp").innerHTML=ion.tempStability;
   document.getElementById("sol-related").innerHTML=ion.relatedIons;
   document.getElementById("sol-exceptions").innerHTML=ion.exceptions;
   modal.style.display="flex";
 };

 tabs.forEach(tab=>tab.addEventListener("click",()=>{
   tabs.forEach(t=>t.classList.remove("active"));
   contents.forEach(c=>c.classList.remove("active"));
   tab.classList.add("active");
   modal.querySelector("#"+tab.dataset.tab).classList.add("active");
 }));

 close.addEventListener("click",()=>modal.style.display="none");
}


