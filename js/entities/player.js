let move_left = newInputType("move_left", ["a", "ArrowLeft"]);
let move_right = newInputType("move_right", ["d", "ArrowRight"]);
let jump = newInputType("jump", ["space", "w", "ArrowUp"]);
let invulnerable_time = 0;
let max_invulnerable_time = 1;

function playerAnimations(self={}){
    self.idle_right = new Anim([assets["collectorWalkingRight1.png"]], 10, true, true);
    self.jumping_right = new Anim([assets["collectorJumpRight.png"]], 10, true, true); 
    self.collecting_right = new Anim([assets["collectorCollectingRight.png"]], 10, true, true); 

    self.walking_right = new Anim([assets["collectorWalkingRight1.png"],
                                       assets["collectorWalkingRight2.png"],
                                       assets["collectorWalkingRight3.png"],
                                       assets["collectorWalkingRight4.png"],], 10, true, true);
    
    self.idle_left = new Anim([assets["collectorWalkingLeft1.png"]], 10, true, true);
    self.jumping_left = new Anim([assets["collectorJumpLeft.png"]], 10, true, true); 
    self.collecting_left = new Anim([assets["collectorCollectingLeft.png"]], 10, true, true); 

    self.walking_left = new Anim([assets["collectorWalkingLeft1.png"],
                                        assets["collectorWalkingLeft2.png"],
                                        assets["collectorWalkingLeft3.png"],
                                        assets["collectorWalkingLeft4.png"],], 10, true, true);
    
    return self
}

function Player() {
    let player = new TaggedSquid("player", vec(width / 2 - 8, 0), assets["collectorWalkingRight1.png"]);
    let anim = new playerAnimations();

    player.draw_priority(2);
    player.score = 0;
    player.hit_shape = player.image.size()
    player.velocity_limit = vec(10, 5);
    player.gravity = vec(0, 0.08);
    player.state = "falling"
    player.can_move = true;
    player.idling_time = 0.2;
    player.dirX = 1;
    player.health = 3;
    player.upgrades = [];
    player.invulnerable = false;
    player.movingSpeed = 2;
    player.catchingRate = 1;
    player.areaOfArrest = width * 2;

    player.addUpgrade = function(up) {
        player.upgrades.push(up);
        switch (up) {
        case "superboot":
            player.movingSpeed = 3;
            break;
        case "duplicator":
            player.catchingRate = 2;
            break;
        case "arrester":
            player.areaOfArrest = width / 3;
            break;
        case "caller":
            player.lightningSpawnTime = .5;
            break;
        }
    } 

    player.hasUpgrade = function(up){
        return player.upgrades.filter((u)=>{ return u == up}).length == 1;
    }

    player.listen("tick", (delta)=>{
        player.last = player.position
        
        let dt = delta / 1000;

        if (player.can_move){
            if (move_right.pressed) {
                player.velocity.x = player.movingSpeed;
                player.anim = anim.walking_right;
                player.dirX = 1
            }
            else if (move_left.pressed){
                player.velocity.x = -player.movingSpeed;
                player.anim = anim.walking_left;
                player.dirX = -1
            }else
                player.anim = player.dirX > 0 ? anim.idle_right : anim.idle_left;

            if (jump.pressed && player.state == "grounded") {
                player.velocity.y = -3.2;
            }
        }
        else if (player.idling_time < 0) {
            player.idling_time = 0.2;
            player.can_move = true;
        }
        else{
            player.idling_time -= dt;
            player.anim = player.dirX > 0 ? anim.collecting_right : anim.collecting_left;
            player.velocity.x = 0;
        }
        if (player.velocity.y != 0){
            player.state = "falling";
            player.anim = player.dirX > 0 ? anim.jumping_right : anim.jumping_left;
        }

        if (player.invulnerable){
            invulnerable_time += dt;
            player.opacity = .2;

            if (invulnerable_time > max_invulnerable_time){
                player.invulnerable = false;
                invulnerable_time = 0;
                player.opacity = 1;
            }

        }
        player.velocity.x *= 0.8;

        if (player.position.x < 0) player.position.x = 0;
        else if (player.position.x > width) player.position.x = width;
    });

    player.listen("collide", (col)=>{
        if (col.tag == "platform"){
            if (horizontalAlignment(player, col)) {
                if (player.position.y < col.position.y) {
                    player.position.y = col.position.y - (col.hit_shape.y + player.hit_shape.y) / 2;
                    player.state = "grounded"
                }
                else{
                    player.position.y = col.position.y + (col.hit_shape.y + player.hit_shape.y) / 2 + 1;
                }
                player.velocity.y = 0
            }
            else if (verticalAlignment(player, col)) {
                if (player.position.x < col.position.x)
                    player.position.x = col.position.x - (col.hit_shape.x + player.hit_shape.x) / 2;
                else
                    player.position.x = col.position.x + (col.hit_shape.x + player.hit_shape.x) / 2;
            }
        }
        else if(col.tag == "lightning") {
            if (!col.collected && col.color != "red"){
                player.can_move = false;
                player.score += player.catchingRate;
            }

            if (col.color == "red" && !player.invulnerable){            
                player.health--;
                player.invulnerable = true;
            }
        }
    })

    return player
}