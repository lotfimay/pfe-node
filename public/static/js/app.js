let downL = false;
let downM = false;
let main = document.querySelector('.specialites');
let main2 = document.querySelector('.specialites.two');
let showP_M = document.querySelector('.Master');
let showP_L = document.querySelector('.License');
showP_L.addEventListener('click',
    function(){
        if(downL === false){
            main.classList.add('show');
            downL = true;
        }else{
            main.classList.remove('show');
            downL = false;
        }
        
    });
showP_M.addEventListener('click',
function(){
    if(downM === false){
        main2.classList.add('show');
        downM = true;
    }else{
        main2.classList.remove('show');
            downM = false;
    }
        
});