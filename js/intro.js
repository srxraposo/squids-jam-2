function playIntro() {
    console.log("ok");
    
    let Intro = Thing();
    let max_interval = 0.1;
    let initialY = 120;
    let interval = max_interval;
    let text = "For many years, you had the greatest collection of lightnings in bottles on the world.\n" +
               "But, just a few days before the next counting, you noticed that someone was expanding \n" +
               "their collection and was really close to beat yours. You then decided that you wouldn't\n"+
               "let this happen!" + 
               "                                                                                      \n" + 
               "                                                                                      \n" + 
               "For the next 240 hours, you'll spend your time expanding your own lightning collection.\n" + 
               "Catch 200 bolts and, at least this year, you'll keep your position as owner of the largest\n" + 
               "lightnings in bottles collection.\n" + 
               "You can speed up the process by exchanging your bottles for power-ups.\n" +
               "Be careful! When a bolt hits the ground, you are not able to put it in a bottle.\n";

    let nextLetter = 0;

    Intro.listen("tick", (delta)=>{
        let dt = delta / 1000;
        interval -= dt;
        if (interval < 0)
        {
            do {
                nextLetter = Math.min(nextLetter+1, text.length-1);
            }while ((text.charAt(nextLetter) == " " || text.charAt(nextLetter) == "\n") && nextLetter < text.length-1);

            interval = max_interval;
            if (nextLetter < text.length && text.charAt(nextLetter) != " " && text.charAt(nextLetter) != "\n")
                assets["blip.wav"].play();
                

        }
    });

    Intro.listen("draw_5", ()=>{
        let w = 0;
        let h = 0;
        let lastWord = 0;
        
        for (let i=0; i<=nextLetter; i++) {
            if (text.charAt(i) == "\n" || 10 + w > width - 10){
                w = 0;
                h += 18;
            }
            w +=draw_text(text.charAt(i), 10 + w, initialY + h, arial, "left");
            lastWord = i+1;
        }
        if (nextLetter == text.length - 1){
            draw_image(assets["instructions.png"], (width - assets["instructions.png"].w)/2, initialY + h);
            draw_text("Click to start", width / 2, initialY + h + assets["instructions.png"].h + 64, arial);
        }
    });

    Intro.listen("mousedown", ()=>{
        if (nextLetter < text.length-1)
            nextLetter = text.length-1;
        else {
            stateMachine.changeState("game");
            Intro.destroy();
        }
    })
}