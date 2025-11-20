//var title=document.querySelector("h1");
title.innerHTML="My Personal Website";

/*
//"About Me"
var button= document.querySelector(".subpage1");
button.addEventListener("click", function1);

function function1(){
    alert("Let me tell you more about me!");
}

//"My Works"
var button= document.querySelector("#subpage2");
button.addEventListener("click", function2);

function function2(){
    alert("Click 'OK' to continue");
}

//"CV"
var button= document.querySelector("#subpage3");
button.addEventListener("click", function3);

function function3(){
    alert("Student of creative media");
}
*/

var mynode= document.createElement("div");
//change basic attributes
mynode.id="my_works";
mynode.innerHTML="The work is an exhibition";
mynode.style.color="blue";

//add event listener
mynode.addEventListener("click", welcomeToWork1);
//document.querySelector("#my_works").appendChild(mynode);

function welcomeToWork1(){
    mynode.innerHTML="Thank you for your interest!"
}