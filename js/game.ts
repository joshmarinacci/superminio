import {Point} from "./util.js";
import {Keyboard} from "./keyboard.js";
import {BLOCKING, JSONTileMap} from "./tilemap.js";
import {Player} from "./player.js";
import {ScreenBoard} from "./board.js";
import {zzfx} from '../node_modules/zzfx/ZzFx.js'

const log = (...args) => console.log(...args)

class SoundEffectManager {
    private sounds: Map<string, any>;
    constructor() {
        this.sounds = new Map<string,any>()
        this.sounds.set('coin',[,,1675,,.06,.24,1,1.82,,,837,.06])
    }
    trigger(name) {
        if(this.sounds.has(name)) {
            zzfx(...this.sounds.get(name))
        }
    }
}

export class Game {
    private board: ScreenBoard;
    private player: Player;
    private scale: number;
    private map: JSONTileMap;
    private debug:{
        slow: boolean;
    }
    private keyboard: Keyboard;
    private sounds: SoundEffectManager;

    constructor() {
        this.debug = {
            slow:true
        }
        this.scale = 20
        this.board = new ScreenBoard(32,16, this.scale)
        this.player = new Player()
        this.map = new JSONTileMap()
        this.map.enhance()
        this.keyboard = new Keyboard()
        this.sounds = new SoundEffectManager()
    }

    start() {
        log('starting')
        this.board.setup_canvas()
        this.keyboard.setup_input()
        this.loop()
    }
    loop() {
        if(this.player.alive === false) {
            this.reset_level()
        }
        this.check_input()
        this.run_physics()
        this.board.update_scroll(this.player)
        this.board.draw_screen(this.map,this.player)
        if(this.debug.slow) {
            setTimeout(()=>this.loop(),50)
        } else {
            requestAnimationFrame(() => this.loop())
        }
    }


    private check_input() {
        this.keyboard.update()
        this.player.dv.x = 0
        if(this.keyboard.is_pressed('ArrowRight')) {
            this.player.dv.x = 1
        }
        if(this.keyboard.is_pressed('ArrowLeft')) {
            this.player.dv.x = -1
        }
        if(this.keyboard.is_pressed('Space') && !this.player.jumping) {
            this.player.onground = false
            this.player.jumping = true
            this.player.dv.y = -3
            this.sounds.trigger('coin')
        }
    }

    private run_physics() {
        if(this.player.tile_pos.y > 16) {
            // log("off the bottom")
            this.player.alive = false
            return
        }
        //add gravity accelration
        this.player.dv =  this.player.dv.add(this.player.gravity)
        //max falling speed
        if(this.player.dv.y > 1) this.player.dv.y = 1
        // log(this.player.tile_pos,this.player.dv,this.player.onground,this.player.jumping)

        //go in dv direction
        let new_pos = this.player.tile_pos.add(this.player.dv)
        let next_tile = this.map.tile_at_point(new_pos)
        // log("next",next_tile)
        if(!BLOCKING.has(next_tile)) {
            this.player.tile_pos = new_pos
            return
        }

        //now check just left or right
        let adj_tile = this.map.tile_at_point(this.player.tile_pos.add(new Point(this.player.dv.x,0)))
        // log("adj",adj_tile)
        if(!BLOCKING.has(adj_tile)) {
            this.player.tile_pos = this.player.tile_pos.add(new Point(this.player.dv.x,0))
            this.player.dv.y = 0
            this.player.onground = true
            this.player.jumping = false
            return
        }

        //now check just falling straight down
        let below_tile = this.map.tile_at_point(this.player.tile_pos.add(new Point(0,this.player.dv.y)))
        // log("below",below_tile,this.player.tile_pos)
        if(!BLOCKING.has(below_tile)){
            //we are falling
            this.player.tile_pos = this.player.tile_pos.add(new Point(0,this.player.dv.y))
            this.player.dv.x = 0
        }

        //we must be stopped
        this.player.onground = true


    }

    private reset_level() {
        this.player.reset()
        this.board.reset()
    }
}

/*

super minio

make a scrolling canvas w/ player as rect.
arrow keys left and right
tile map is either solid or transparent. draw as squares.
spacebar to jump
roughly same as mario physics
start at 2*(32x16) w/ 2x2 rects for blocks and player
game loop checks input, moves player if allowed, checks if died or not, then draws, then request anim

 */
