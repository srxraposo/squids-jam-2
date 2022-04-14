const width = canvas.width;
const height = canvas.height;

const arial = load_font("Arial", 16, "#FFF");
const arial32 = load_font("Arial", 32, "#FFF");

const DESCRIPTIONS = {
    "superboot": "Increases movement speed by 50%",
    "duplicator":"Catches 1 extra bolt each time.",
    "arrester":"Lightnings spawn closer to you.",
    "caller":"Lightnings spawn more frequently.",
}

let images = [  "assets/sprites/background.png",
                "assets/sprites/grass.png",
                "assets/sprites/VictoryScreen.png",
                "assets/sprites/instructions.png",
                "assets/sprites/flyingGrass.png",
                "assets/sprites/cloud0.png",
                "assets/sprites/cloud1.png",
                "assets/sprites/collectorWalkingRight1.png", 
                "assets/sprites/collectorWalkingRight2.png", 
                "assets/sprites/collectorWalkingRight3.png", 
                "assets/sprites/collectorWalkingRight4.png", 
                "assets/sprites/collectorWalkingLeft1.png", 
                "assets/sprites/collectorWalkingLeft2.png", 
                "assets/sprites/collectorWalkingLeft3.png", 
                "assets/sprites/collectorWalkingLeft4.png", 
                "assets/sprites/collectorJumpRight.png", 
                "assets/sprites/collectorJumpLeft.png", 
                "assets/sprites/collectorCollectingRight.png", 
                "assets/sprites/collectorCollectingLeft.png", 
                "assets/sprites/lightning1.png", 
                "assets/sprites/lightning2.png", 
                "assets/sprites/lightning3.png",
                "assets/sprites/lightningRed.png",
                "assets/sprites/UI_Bottle.png",
                "assets/sprites/UI_superboot.png",
                "assets/sprites/UI_superboot_shop.png",
                "assets/sprites/UI_duplicator.png",
                "assets/sprites/UI_duplicator_shop.png",
                "assets/sprites/UI_arrester.png",
                "assets/sprites/UI_arrester_shop.png",
                "assets/sprites/UI_caller.png",
                "assets/sprites/UI_caller_shop.png",
                "assets/sprites/UI_health.png",];
let sounds = ["assets/sounds/rock_breaking.wav",
              "assets/sounds/blip.wav",];
let assets = []

function removePath(s){
    return s.replace("assets/sprites/","")
            .replace("assets/sounds/","")
}

function TaggedSquid(tag, position = vec( 0, 0 ), img = null, rot = 0, opa = 1, scl = 1 ){
    let o = new Squid(position, img, rot, scl);
    o.tag = tag
    return o
}

function StateMachine(states){
    this.states = states;   
    this.current_state = "";

    this.changeState = function(state) {
        console.log(this.current_state)
        if (state != this.current_state){
            this.states[state]();   
            this.current_state = state;
        }
    }
}

load_sound("assets/sounds/Menu_loop_1.wav", (sound)=>{
    sound.volume(0.1);
    sound.on("end", ()=>{
        sound.play();
    })
    sound.play();
});

stateMachine = new StateMachine({
    "loading": function(){},
    "intro": playIntro,
    "game": startGame,
    "victory": victory,
    "gameOver": gameOver,
});
stateMachine.changeState("loading");

load_assets(images, sounds, (progress, filename, asset, type)=>{
    
    if (type == "image") 
        asset.smoothing = false;
    else 
        asset.volume(0.1);

    assets[removePath(filename)] = asset;
    if (progress >= 1){
        stateMachine.changeState("intro");
    }
}, ()=>{
    console.log("fail");
});

tick(true);
