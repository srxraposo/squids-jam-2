function gameOver() {
    t = Thing();
    
    t.listen("draw", ()=>{
        draw_text("Game Over!", width / 2, 100, arial32);
        draw_text("Your collection is no longer the largest one!", width / 2, 150, arial);
        draw_text("Click to try again", width / 2, 240, arial);
    });

    t.listen("mousedown", ()=>{
        stateMachine.changeState("game");
        t.destroy();
    });

}


function victory(){
    a = new Thing();

    a.listen("draw_5", ()=>{
        draw_image(assets["VictoryScreen.png"], 0,0);
    })
    
    a.listen("mousedown", ()=>{
        stateMachine.changeState("game");
        a.destroy();
    });

}