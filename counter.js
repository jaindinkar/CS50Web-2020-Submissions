
// let counter = 0;

// Checking for the counter variable in localstorage
if(!localStorage.getItem('counter')){
	localStorage.setItem('counter', 0);
}


function count() {

	let counter = localStorage.getItem('counter')

	counter++;
	document.querySelector('h1').innerHTML = counter;

	localStorage.setItem('counter', counter)

	// if(counter % 10 === 0) {
	// 	alert(`Count is now ${counter}`);
	// }
}

// Wait untill content will be loaded.
document.addEventListener('DOMContentLoaded', function(){

	document.querySelector('h1').innerHTML = localStorage.getItem('counter');

	// not calling the function, just assigning it. Javascript type.
	document.querySelector('button').onclick = count;

	// // Run count function every second
	// setInterval(count, 1000);
});
			 