import {
    BLOCK,
    BRICK, CLOUD,
    COLORS, GOOMBA, GROUND,
    JSONTileMap,
    MOUNTAIN, MOUNTAIN_LEFT, MOUNTAIN_RIGHT, MOUNTAIN_TOP,
    PIPE_LEFT,
    PIPE_RIGHT, QUESTION,
    SOLID, TileMap,
    TRANSPARENT, TREE
} from "./tilemap.js";
import {Player} from "./player.js";
import {Point} from "./util.js";

interface Board {
    setup_canvas(): void;
    draw_screen(map: JSONTileMap, player: Player): void;
}

const TILESET_MAP:Map<number,Point> = new Map<number, Point>()
TILESET_MAP.set(TRANSPARENT,new Point(3,0))

TILESET_MAP.set(MOUNTAIN,new Point(1,1))
TILESET_MAP.set(MOUNTAIN_LEFT,new Point(0,0))
TILESET_MAP.set(MOUNTAIN_TOP,new Point(1,0))
TILESET_MAP.set(MOUNTAIN_RIGHT,new Point(2,0))

TILESET_MAP.set(TREE,new Point(6,0))

TILESET_MAP.set(SOLID,new Point(0,1))
TILESET_MAP.set(GROUND,new Point(0,1))
TILESET_MAP.set(QUESTION,new Point(3,1))
TILESET_MAP.set(BRICK,new Point(2,1))
TILESET_MAP.set(BLOCK,new Point(7,0))

TILESET_MAP.set(PIPE_LEFT,new Point(4,0))
TILESET_MAP.set(PIPE_RIGHT,new Point(5,0))

TILESET_MAP.set(CLOUD,new Point(5,1))

TILESET_MAP.set(GOOMBA,new Point(0,2))

const MINIMARIO_0 = 500
const MINIMARIO_1 = 501
TILESET_MAP.set(MINIMARIO_0, new Point(2,2))
TILESET_MAP.set(MINIMARIO_1, new Point(3,2))

export class ScreenBoard implements Board {
    height: number;
    scroll: Point;
    width: number;
    private scale: number;
    private canvas: HTMLCanvasElement;
    private tileset: HTMLImageElement;
    private tick:number

    constructor(width: number, height: number, scale: number) {
        this.scroll = new Point(0, 0)
        this.width = width
        this.height = height
        this.scale = scale
        this.tick = 0
    }

    setup_canvas() {
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.width * this.scale
        this.canvas.height = this.height * this.scale
        document.body.append(this.canvas)
        this.tileset = new Image()
        this.tileset.src = "./tileset@8.png"
        this.tileset.onload = () => {
            console.log("loaded image",this.tileset)
        }
    }

    draw_screen(map: TileMap, player: Player): void {
        this.tick += 1
        let c = this.canvas.getContext('2d')
        c.save()
        c.scale(this.scale, this.scale)
        c.fillStyle = '#f0f0f0'
        c.fillRect(0, 0, this.width, this.height)


        c.translate(-this.scroll.x, -this.scroll.y)
        let ts = 2*8
        //draw the tilemap
        for (let i = 0; i < map.get_width(); i++) {
            for (let j = 0; j < map.get_height(); j++) {
                let t = map.tile_at(i, j)
                if(TILESET_MAP.has(t)) {
                    let pt:Point = TILESET_MAP.get(t)
                    c.drawImage(this.tileset,
                        pt.x*ts,pt.y*ts,ts,ts,
                        i,j,1,1
                    )
                } else {
                    c.fillStyle = 'yellow'
                    c.fillStyle = COLORS.get(t)
                    c.fillRect(i, j, 1, 1)
                }
            }
        }

        //draw the player
        let tp = player.tile_pos
        if(this.tick % 4 === 0) { //update every 10th frame
            player.frame = (player.frame + 1) % player.frame_count
        }
        let pt:Point = TILESET_MAP.get(MINIMARIO_0+player.frame)
        c.drawImage(this.tileset,
            pt.x*ts,pt.y*ts,ts,ts,
            tp.x,tp.y,1,1
        )

        c.restore()
    }

    update_scroll(player: Player) {
        //if player too far to the left, scroll to the right, unless at the end
        //if player too far to the right, scroll to the left
        let diff = player.tile_pos.x - this.scroll.x
        if (diff > 20) {
            this.scroll.x += 1
        }
        if (diff < 4) {
            this.scroll.x -= 1
        }
        if (this.scroll.x < 0) this.scroll.x = 0
    }

    reset() {
        this.scroll.x = 0
        this.scroll.y = 0
    }
}
