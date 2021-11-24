import {Point} from "./util.js";

const log = (...args) => console.log(...args)

export class Keyboard {
    private key_states: {};
    private enabled: boolean;
    constructor() {
        this.key_states = {}
        this.enabled = true
    }
    setup_input() {
        document.addEventListener('keydown', (e) => {
            if(!this.enabled) return
            this.get_key_state(e.code).press = true
        })
        document.addEventListener('keyup', (e) => {
            if(!this.enabled) return
            this.get_key_state(e.code).press = false
        })
    }
    is_pressed(name):boolean {
        if(!this.enabled) return false
        return this.get_key_state(name).press
    }
    stop() {
        this.enabled = false
        Object.keys(this.key_states).forEach(key => {
            this.key_states[key] = false
        })
    }
    start() {
        this.enabled = true
    }

    update() {

    }

    private get_key_state(code: string) {
        if(!this.key_states.hasOwnProperty(code)) {
            this.key_states[code] = {
                press:false
            }
        }
        return this.key_states[code]
    }
}

interface Player {
    alive: boolean;
    tile_pos:Point
    offset:Point
    dv:Point
    gravity:Point
    big:boolean
    onground:boolean
    jumping:boolean
}

const NONE = 0
const TRANSPARENT = 1
const SOLID = 2
const PIPE = 3

const COLORS:Map<TileType,string> = new Map<TileType, string>()
COLORS.set(NONE,'magenta')
COLORS.set(TRANSPARENT,'#3366FF')
COLORS.set(SOLID,'#FFcc44')
COLORS.set(PIPE,'#22cc22')


type TileType = 0 | 1 | 2 | 3

interface TileMap {
    tile_at(x,y):TileType
}

class JSONTileMap implements TileMap {
    private data: TileType[];
    width: number;
    height: number;
    constructor() {
        this.width = 64
        this.height = 16
        this.data = []
        for(let i=0; i<this.width; i++) {
            for(let j=0; j<this.height; j++) {
                this.data[this.xy2n(i,j)] = TRANSPARENT
            }
        }
    }
    tile_at(x, y): TileType {
        return this.get_xy(x,y)
    }
    tile_at_point(pt:Point):TileType {
        return this.get_xy(pt.x,pt.y)
    }

    private xy2n(i: number, j: number) {
        return i + j*this.width
    }

    hline(x: number, y: number, len: number, tt:TileType) {
        for(let i=0; i<len; i++) {
            this.set_xy(x+i,y,tt)
        }
    }
    vline(x: number, y: number, len: number, tt:TileType) {
        for(let i=0; i<len; i++) {
            this.set_xy(x,y+i,tt)
        }
    }
    private get_xy(x:number, y:number):TileType {
        if(x<0) return NONE
        if(x>=this.width) return NONE
        if(y<0)return NONE
        if(y>=this.height) return NONE
        return this.data[this.xy2n(x,y)]
    }

    private set_xy(x: number, y: number, tt: TileType) {
        if(x<0) return
        if(x>=this.width) return
        if(y<0)return;
        if(y>=this.height) return
        this.data[this.xy2n(x,y)] = tt
    }
}

interface Board {
    scroll:Point
    width:32,
    height:16
}


export class Game {
    private board: Board;
    private player: Player;
    private canvas: HTMLCanvasElement;
    private scale: number;
    private map: JSONTileMap;
    private debug:{
        slow: boolean;
    }
    private keyboard: Keyboard;

    constructor() {
        this.debug = {
            slow:true
        }
        this.scale = 10
        this.board = {
            height: 16,
            scroll: new Point(0,0),
            width: 32
        }
        this.player = {
            alive:true,
            big: false,
            onground:false,
            jumping:false,
            offset: new Point(0,0),
            tile_pos: new Point(3,2),
            dv:new Point(0,1),
            gravity: new Point(0,1)
        }

        this.map = new JSONTileMap()
        this.map.hline(0,12,50, SOLID)
        this.map.hline(0,13,50, SOLID)
        this.map.hline(0,14,50, SOLID)
        this.map.hline(0,15,50, SOLID)

        this.map.vline(0,0,20,SOLID)

        this.map.vline(20,11,1, SOLID)
        this.map.vline(21,10,2, SOLID)
        this.map.vline(22,9,3, SOLID)

        this.map.vline(27, 7,5,PIPE)
        this.map.vline(28, 7,5,PIPE)

        this.keyboard = new Keyboard()
    }

    start() {
        log('starting')
        this.setup_canvas()
        this.loop()
    }
    loop() {
        this.check_input()
        this.run_physics()
        this.update_scroll()
        this.draw_screen()
        if(this.debug.slow) {
            setTimeout(()=>this.loop(),50)
        } else {
            requestAnimationFrame(() => this.loop())
        }
    }

    private setup_canvas() {
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.board.width*this.scale
        this.canvas.height = this.board.height*this.scale
        document.body.append(this.canvas)
        this.keyboard.setup_input()
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
        // log("new pos",next_tile,new_pos)
        if(next_tile === TRANSPARENT || next_tile === NONE) {
            this.player.tile_pos = new_pos
            return
        }

        //now check just left or right
        let adj_tile = this.map.tile_at_point(this.player.tile_pos.add(new Point(this.player.dv.x,0)))
        // log("adj",adj_tile)
        if(adj_tile === TRANSPARENT || adj_tile === NONE) {
            this.player.tile_pos = this.player.tile_pos.add(new Point(this.player.dv.x,0))
            this.player.dv.y = 0
            this.player.onground = true
            this.player.jumping = false
            return
        }

        //now check just falling straight down
        let below_tile = this.map.tile_at_point(this.player.tile_pos.add(new Point(0,this.player.dv.y)))
        log("below",below_tile,this.player.tile_pos)
        if(below_tile === TRANSPARENT || below_tile === NONE) {
            //we are falling
            this.player.tile_pos = this.player.tile_pos.add(new Point(0,this.player.dv.y))
            this.player.dv.x = 0
        }

        //we must be stopped
        this.player.onground = true


    }

    private draw_screen() {
        let c = this.canvas.getContext('2d')
        c.save()
        c.scale(this.scale,this.scale)
        c.fillStyle = '#f0f0f0'
        c.fillRect(0,0,this.board.width,this.board.height)


        c.translate(-this.board.scroll.x,-this.board.scroll.y)
        //draw the tilemap
        for(let i=0; i<this.map.width; i++) {
            for(let j=0; j<this.map.height; j++) {
                let t = this.map.tile_at(i,j)
                c.fillStyle = 'yellow'
                c.fillStyle = COLORS.get(t)
                // if(t === NONE) c.fillStyle = '#cccccc'
                // if(t === TRANSPARENT) c.fillStyle = 'white'
                // if(t === SOLID) c.fillStyle = 'tan'
                c.fillRect(i,j,1,1)
            }
        }

        //draw the player
        let tp = this.player.tile_pos
        c.fillStyle = '#ff0000'
        c.fillRect(tp.x,tp.y,1,1)

        c.restore()
    }

    private update_scroll() {
        //if player too far to the left, scroll to the right, unless at the end
        //if player too far to the right, scroll to the left
        let diff = this.player.tile_pos.x - this.board.scroll.x
        if(diff > 20) {
            this.board.scroll.x += 1
        }
        if(diff < 4) {
            this.board.scroll.x -= 1
        }
        if(this.board.scroll.x < 0) this.board.scroll.x = 0
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
