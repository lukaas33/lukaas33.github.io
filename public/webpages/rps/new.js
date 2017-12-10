			function play() {
				var userChoice = prompt("Do you choose rock, paper or scissors?").toLowerCase();
					
				var computerChoice = Math.random()
				
					if (computerChoice <= 0.33) {
						computerChoice = "rock";
					}
					else if (computerChoice <= 0.67) {
						computerChoice = "paper";
					}
					else {
						computerChoice = "scissors"
					}

				var answer = ["It's a tie, let's play again.", "I win, fear my robotic superiority.", "You win, jerk.", "Wait, what?", "That's a number.", "Please enter something."]	
					
				var compare = function(choice1, choice2) {
					if (isNaN(choice1)) {
						switch(choice1) {
							case "rock":
							   if (choice2 === "rock") {
								   return (answer[0])
							   }
							   else if (choice2 === "paper") {
								   return (answer[1])
							   }
							   else {
								   return (answer[2])
							   }
							   break;
							case "paper":
							   if (choice2 === "rock") {
								   return (answer[2])
							   }
							   else if (choice2 === "paper") {
								   return (answer[0]) 
							   }
							   else {
								   return (answer[1])
							   }
							   break;
							case "scissors":
								if (choice2 === "rock") {
								   return (answer[1])
							   }
								else if (choice2 === "paper") {
								   return (answer[2]) 
							   }
								else {
								   return (answer[0])
							   }
								break;
							default:
								return (answer[3])
						}
					}
					else if (choice1 === "") {
						return (answer[5]);
					}
					else {
						return (answer[4])
					}
				}
				
				
				var card = document.createElement("section");
				card.id = "card"
					document.getElementById("results").appendChild(card);
					
				var text = document.createElement("section");
				text.id = "text"
					card.appendChild(text);
				
				var p = document.createElement("p")
					text.appendChild(p);
				var p2 = document.createElement("p")
					text.appendChild(p2);
				var p3 = document.createElement("p")
					text.appendChild(p3);
				
				var t  = document.createTextNode("I chose" + " " + computerChoice + ".");
				var t2 = document.createTextNode("You chose" + " " + userChoice + ".");
				var t3 = document.createTextNode(compare(userChoice, computerChoice));			
					p.appendChild(t);
					p2.appendChild(t2);
					p3.appendChild(t3);
			}			