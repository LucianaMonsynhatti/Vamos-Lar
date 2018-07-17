const menu = document.querySelector("aside");
const botao = document.querySelector("#hamburger");
const botao2 = document.querySelector("#clicar");

function deslizar(){
    if(menu.classList.contains("active")){
        menu.classList.remove("active");
        botao.classList.remove("active");
    }
    else{
        menu.classList.add("active");
        botao.classList.add("active");
    }
}




botao2.onclick = deslizar;
botao.onclick = deslizar;