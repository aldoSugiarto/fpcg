var colors = [
	new BABYLON.Color3(1,0,0),
	new BABYLON.Color3(1,1,0),
	new BABYLON.Color3(1,0,1),
	new BABYLON.Color3(0,1,0),
	new BABYLON.Color3(0,1,1),
	new BABYLON.Color3(0,0,1),
	new BABYLON.Color3(1,1,1),
	new BABYLON.Color3(1,0.5,0)
];

// array use to store card values
var gameArray = [0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7];

// shuffling the array.

shuffle = function(v){
    for(var j, x, i = v.length;
			 i;
			 j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
};

gameArray = shuffle(gameArray);

// ounter how many animation completed
var animationCompleted = 0;
// counter how many cards picked
var pickedCards=0;
// array for picked cards
var pickedArray = [];

var canvas = document.getElementById("gameCanvas");
// create engine
var engine = new BABYLON.Engine(canvas,true);
// attach scene to engine, this game will take place
var scene = new BABYLON.Scene(engine);

scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
scene.fogDensity = 0.05;

// 1 name cmr
// 2 angle north-south arc
// 3 angle east-west arc
// 4 camera position
// 5 target
var camera = new BABYLON.ArcRotateCamera("camera",3 * Math.PI / 2, 11*Math.PI/16, 20, BABYLON.Vector3.Zero(), scene);
// add movement on camera
camera.attachControl(canvas, false);

// light for shadow
var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(5,0,20), scene);
light.position = new BABYLON.Vector3(1,1,-10);

//table material
var tableMaterial = new BABYLON.StandardMaterial("tableMaterial", scene);
tableMaterial.diffuseTexture = new BABYLON.Texture("bricks.jpg", scene);

//table
var table = BABYLON.Mesh.CreateBox("table", 12, scene);
table.scaling.z = 0.025;
table.material=tableMaterial;

// placing cards
var cardsArray = [];
for(i=0;i<16;i++){
	var card = BABYLON.Mesh.CreateBox("card", 2, scene);
	card.picked = false;
	// determine card index
	card.cardIndex = i;
	// assign card color attribute: the value
	card.cardValue = gameArray[i];
	// scaling and placing
	card.scaling.z = 0.125;
	card.position = new BABYLON.Vector3((i%4)*2.5-3.5	,Math.floor(i/4)*2.5-3.75,-0.25);

	card.subMeshes=[];
	card.subMeshes.push(new BABYLON.SubMesh(0, 4, 20, 6, 30, card));
	card.subMeshes.push(new BABYLON.SubMesh(1, 0, 4, 0, 6, card));

	var cardMaterial = new BABYLON.StandardMaterial("cardMaterial", scene);
	cardMaterial.diffuseColor = new BABYLON.Color3(0.5,0.5,0.5);
	// back card
	var cardBackMaterial = new BABYLON.StandardMaterial("cardBackMaterial", scene);
	cardBackMaterial.diffuseColor = colors[gameArray[i]];
	// multi material
	var cardMultiMat = new BABYLON.MultiMaterial("cardMulti", scene);
	// push
	cardMultiMat.subMaterials.push(cardMaterial);
	cardMultiMat.subMaterials.push(cardBackMaterial);

	card.material=cardMultiMat;
	cardsArray[i]=card;
}

// animations

var firstCardMoveAnimation = new BABYLON.Animation(
	"1st card move animation",
	"position.z",
	60,
	BABYLON.Animation.ANIMATIONTYPE_FLOAT, // animation type
	BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT // animation loop mode
);

var secondCardMoveAnimation = new BABYLON.Animation(
	"2nd card move animation",
	"position.z",
	60,
	BABYLON.Animation.ANIMATIONTYPE_FLOAT,
	BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
);

var firstCardRotateAnimation = new BABYLON.Animation(
	"1st card rotate animation",
	"rotation.y", // rotate card around y axis
	40,
	BABYLON.Animation.ANIMATIONTYPE_FLOAT,
	BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
);

var secondCardRotateAnimation = new BABYLON.Animation(
	"2nd card rotate animation",
	"rotation.y",
	40,
	BABYLON.Animation.ANIMATIONTYPE_FLOAT,
	BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
);

var animationsArray = [firstCardMoveAnimation,secondCardMoveAnimation,firstCardRotateAnimation,secondCardRotateAnimation];

// keyframes

var moveKeys = [
	{
		frame: 0,
		value: -0.25 // begin position when click
	},
	{
		frame: 20,
		value: -2 // how high the card will fly
	}
];

var moveBackKeys = [ // opposite
	{
		frame: 0,
		value: -2
	},
	{
		frame: 20,
		value: -2
	},
	{
		frame: 40,
		value: -0.25
	}
];

var rotateKeys = [
	{
		frame: 0,
        value: 0
	},
	{
		frame: 20,
        value: 0
	},
	{
		frame: 40,
        value: Math.PI
	}
]

var rotateBackKeys = [
	{
		frame: 0,
        value: Math.PI
	},
	{
		frame: 20,
        value: 0
	}
]

engine.runRenderLoop(function () {
	scene.render();
});

// click listener
window.addEventListener("click", function (evt) {
	// "scene.pick" : information about the clicked
	var pickResult = scene.pick(evt.clientX, evt.clientY);
	// if we haven't already picked two cards and we are picking a mesh and that mesh is called "card" and it's not picked yet...
	if(pickedCards<2 && pickResult.pickedMesh!=null && pickResult.pickedMesh.name=="card" && !pickResult.pickedMesh.picked){
		// get card index
		var cardIndex = pickResult.pickedMesh.cardIndex;
		console.log("hey aldo" + cardIndex);
		// set true, not able to pick again
		cardsArray[cardIndex].picked = true;
		// store picked card in array
    		pickedArray[pickedCards] = cardIndex;

		pickedCards++;
    		// adding keyframes to animation
		if(pickedCards==1){
			firstCardMoveAnimation.setKeys(moveKeys);
			firstCardRotateAnimation.setKeys(rotateKeys);
		}
		else{
			secondCardMoveAnimation.setKeys(moveKeys);
			secondCardRotateAnimation.setKeys(rotateKeys);
		}

		// add animations
			cardsArray[cardIndex].animations.push(animationsArray[pickedCards-1]);
	    		cardsArray[cardIndex].animations.push(animationsArray[pickedCards+1]);

    		// animCompleted function
			scene.beginAnimation(cardsArray[cardIndex], 0, 40, false, 1, animCompleted);

    }
});

function animCompleted(){

	animationCompleted++;

	if(animationCompleted==2){
		// reset
		animationCompleted = 0;
		// time to check
		window.setTimeout(function(){
			// matching card check
			if(cardsArray[pickedArray[0]].cardValue==cardsArray[pickedArray[1]].cardValue){
				cardsArray[pickedArray[0]].dispose();
				cardsArray[pickedArray[1]].dispose();
				pickedArray = [];
    				pickedCards=0;
			}
			else{
				// cards not match
				firstCardMoveAnimation.setKeys(moveBackKeys);
				firstCardRotateAnimation.setKeys(rotateBackKeys);
				secondCardMoveAnimation.setKeys(moveBackKeys);
				secondCardRotateAnimation.setKeys(rotateBackKeys);
				for(i=0;i<2;i++){
					cardsArray[pickedArray[i]].animations.push(animationsArray[i]);
	    				cardsArray[pickedArray[i]].animations.push(animationsArray[i+2]);
	    				scene.beginAnimation(cardsArray[pickedArray[i]], 0, 40, false,1,animBackCompleted);
				}
			}
		},350); //checking time
	}
}

function animBackCompleted(){
	animationCompleted++;
	if(animationCompleted==2){
		// reset
		animationCompleted = 0;
		// pick again
		cardsArray[pickedArray[0]].animations=[];
	    	cardsArray[pickedArray[1]].animations=[];
	    	cardsArray[pickedArray[0]].picked=false;
	    	cardsArray[pickedArray[1]].picked=false;
	    	pickedArray = [];
	    	pickedCards=0;
	}
}
