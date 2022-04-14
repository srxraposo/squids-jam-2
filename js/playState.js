function verticalAlignment(o1, o2) {
    let t1 = o1.last.y - o1.hit_shape.y / 2;
    let t2 = o2.position.y - o2.hit_shape.y / 2;
    let b1 = o1.last.y + o1.hit_shape.y / 2;
    let b2 = o2.position.y + o2.hit_shape.y / 2;

    return (t1 < b2 && b1 > t2);
}

function horizontalAlignment(o1, o2) {
    let r1 = o1.last.x + o1.hit_shape.x / 2;
    let r2 = o2.position.x + o2.hit_shape.x / 2;
    let l1 = o1.last.x - o1.hit_shape.x / 2;
    let l2 = o2.position.x - o2.hit_shape.x / 2;
    
    return (l1 < r2 && r1 > l2);
}

function draw_ui(player)
{
    let health = assets["UI_health.png"];
    for (let i=0; i < player.health; i++) {
        draw_image(health, (width - 10) - (health.w * (i + 1)), 10);
    }

    let lUpgrades = ["superboot", "duplicator", "arrester", "caller"];

    for (let i=0; i<lUpgrades.length; i++)
    {
        let up = assets[`UI_${lUpgrades[i]}.png`];
        let opacity = player.hasUpgrade(lUpgrades[i]) ? 1 : 0.625;
        draw_image(up, width - 10 - up.w, 32 + 22 * i, opacity);
    }
}

function Platform(pos, image) {
    let rectangle = new TaggedSquid("platform", pos, image);
    rectangle.draw_priority(1);
    rectangle.hit_shape = vec(image.w, image.h);
    rectangle.listen("tick");
    rectangle.listen("collide");
    return rectangle;
}

function Lightning(pos) {
    let lightning = new TaggedSquid("lightning", pos, assets["lightning1.png"]);
    lightning.anim = new Anim([assets["lightning1.png"], assets["lightning2.png"]], 10, true, true);
    lightning.draw_priority(3);
    let size = 16;
    lightning.hit_shape = lightning.image.size();
    lightning.collected = false;
    lightning.color = "white";
    let opa = 0;
    let flash = 0;
    lightning_red_anim = new Anim([assets["lightningRed.png"]], 10, true, true)
    lightning_white_anim = new Anim([assets["lightning3.png"]], 10, true, true)
    
    lightning.listen("tick", (delta)=>{

        dt = delta / 1000
        opa += dt / 2;
        
        if (opa > 1){
            if (lightning.image != assets["lightning3.png"] && lightning.image != assets["lightningRed.png"]) {
                lightning.anim = lightning.collected ? lightning_white_anim : lightning_red_anim;
                lightning.hit_shape = assets["lightning3.png"].size();
                lightning.position.y -= (assets["lightning3.png"].h / 2 - (lightning.collected ? 0 : size / 2));
                assets["rock_breaking.wav"].play();
            }
            assets["rock_breaking.wav"].fade(0.1, 0, 500);
            lightning.color = lightning.collected ? "white" : "red";
            flash++;
        }
        if (opa > 1.3){ 
            lightning.destroy();
        }
    });

    lightning.listen("draw_5", ()=>{
        let x = lightning.position.x - size / 2;
        let y = lightning.position.y - lightning.hit_shape.y / 2;

        if (!lightning.collected && opa <= 1){
            let o = opa;
            fill_rect(x, y, lightning.hit_shape.x, lightning.hit_shape.y, `rgba(255, 255, 255, ${o})`);
        }
        else if(flash < 2) {
            fill_rect(0, 0, width, height, `rgba(255, 255, 255, 1)`);
            flash++;
        }
    });

    lightning.listen("collide", (col)=>{
        if (col.tag == "player" && !lightning.collected && lightning.hit_shape.y != assets["lightning3.png"].h) {
            lightning.hit_shape = assets["lightning3.png"].size();
            opa = 1;
            lightning.collected = true;
        } 
    });
    return lightning;
}

function lCollidesPlayer(x, y, p)
{
    s = Squid(vec(x, y)); s.hit_shape = vec(16, 16);
    return collide_squids(s, p);
}

function getSpawnArea(py, player) {
    let minX = Math.max(8, player.position.x - player.areaOfArrest / 2);
    let maxX = Math.min(width-8, player.position.x + player.areaOfArrest / 2);
    let lx = minX + roll((maxX - minX)/16) * 16;

    let ind = 0
    if (py[1].position.x - py[1].hit_shape.x / 2 < lx && 
        py[1].position.x + py[1].hit_shape.x / 2 > lx)
        ind = roll(2);

    ly = py[ind].position.y - py[ind].hit_shape.y/2 - 8;
    return vec(lx, ly);
}

function Cloud(){
    let cloud = new Squid(vec(roll(width), roll(32)), assets[`cloud${roll(2)}.png`]);
    cloud.draw_priority(4);
    let dirX = [1, -1][roll(2)];
    let vel = 10 + roll(50);

    cloud.listen("tick", (delta)=>{
        dt = delta / 1000;

        cloud.position.x += vel * dt * dirX;

        if (cloud.position.x > width || cloud.position.x < 0)
            dirX *= -1;
    });

    return cloud;
}

function startGame() {
    const player = new Player();
    const rectangle = new Platform(vec(width/2, height-50), assets["grass.png"]);
    const rectangle2 = new Platform(vec(width/4, height-150), assets["flyingGrass.png"]);

    let timeLimit = 240;

    const zeus = new Thing();
    let max_timer = 1.2;
    let timer = max_timer;
    let recs = [ rectangle, rectangle2 ]
    zeus.lightnings = []

    zeus.clouds = [ new Cloud(), new Cloud(), new Cloud(), new Cloud(), new Cloud(), 
                    new Cloud(), new Cloud(), new Cloud(), new Cloud(), new Cloud(), 
                    new Cloud(), new Cloud(), new Cloud(), new Cloud(), new Cloud(), ];

    zeus.listen("tick", (delta)=>{
        dt = delta / 1000;
        if (timer < 0){
            let v;
            do {
                v = getSpawnArea(recs, player);
            } while(lCollidesPlayer(v.x, v.y, player));

            zeus.lightnings.push(new Lightning(v));
            timer = max_timer;
        }

        if (!zeus.pushShop){
            timer -= dt;
            timeLimit -= dt;
        }else
            player.can_move = false;
        

        if (player.health == 0 || timeLimit < 0 || player.score >= 200) {
            player.destroy();
            rectangle.destroy();
            rectangle2.destroy();
            zeus.lightnings.forEach((element) => {
                element.destroy();
            });
            zeus.clouds.forEach((element) => {
                element.destroy();
            });
            zeus.destroy();
            
            if (player.score >= 200)
                stateMachine.changeState("victory");
            else 
                stateMachine.changeState("gameOver");
        }
    });

    zeus.listen("draw_0", ()=>{
        draw_image(assets["background.png"], 0, 0)
    });

    zeus.listen("draw_5", ()=>{
        draw_image(assets["UI_Bottle.png"], 10, 10)
        draw_text(`${player.score}`, 32, 20, arial, "left");
        draw_ui(player);
        draw_text(`${Math.ceil(timeLimit)}`, width / 2, 24, arial32);
    });

    zeus.listen("keyup", (k)=>{
        if (k == "b" || k == "Escape"){
            zeus.pushShop = !zeus.pushShop;
            if (zeus.pushShop) {
                pushShopUI(player);
            }
            if (player.hasUpgrade("caller")){
                max_timer = player.lightningSpawnTime;
            }
        }
    })

}

function UpgradeProduct(pos, name, price) {
    let up = new TaggedSquid("upgrade", pos, assets[`UI_${name}_shop.png`]);
    up.hit_shape = up.image.size();
    up.name = name;
    up.price = price;
    
    up.listen("mousemove", (x, y)=>{
        let s = Squid(vec(x, y))
        s.hit_shape = 1;
        up.hover = collide_squids(s, up);
        s.destroy();
    });

    up.listen("draw_5", ()=>{
        if (up.hover){
            fill_rect(up.position.x - up.hit_shape.x / 2, 
                      up.position.y - up.hit_shape.y / 2,
                      up.hit_shape.x, up.hit_shape.y, "#FFFFFF44");
            fill_rect(width / 2 - 200, 10, 400, 100, "#777700AA");
            draw_text(DESCRIPTIONS[name], width / 2, 55, arial);
            let w = draw_text(`$ ${price}`, width / 2, 79, arial);
            draw_image(assets["UI_Bottle.png"], (width + w)/ 2 + 4, 68);
        }
    });

    return up
}

function pushShopUI(player) {
    let shop = new Thing();
    let left = width/2 - 64;
    let top = height/2 - 64;
    let w = 128;
    let h = 128;
    let centerX = width/2;
    let centerY = height/2;

    let objects = [
        new UpgradeProduct(vec(width/2, height/2), "superboot", 10),    
        new UpgradeProduct(vec(width/2, height/2 + 32), "duplicator", 20),
        new UpgradeProduct(vec(width/2, height/2 + 64), "arrester", 40),
        new UpgradeProduct(vec(width/2, height/2 + 96), "caller", 100),
    ]

    objects.forEach((o)=>{
        if (player.hasUpgrade(o.name))
            o.destroy();
    }); 

    shop.listen("mouseup", (x, y)=>{
        objects.forEach((o)=>{
            if (o.hover && player.score >= o.price && !player.hasUpgrade(o.name)) {
                player.addUpgrade(o.name);
                player.score -= o.price;
                o.destroy();
            }
        });
    });

    shop.listen("draw_5", () => {
        draw_text("SHOP", width / 2, height / 2 - 22, arial);
        draw_rect(width / 2 - 80, height / 2 - 36, 160, 152, "#FBF236");
    })

    shop.destroyShop = function(){
        shop.destroy();
        objects.forEach((o)=>{o.destroy()});
    }

    shop.listen("keyup", (k)=>{
        if (k == "b" || k == "Escape")
            shop.destroyShop();
    })

    return shop;
}
