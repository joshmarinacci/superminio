import {Point} from "./util.js";

export const NONE = 0
export const TRANSPARENT = 1
export const SOLID = 2
export const PIPE = 3
export const PIPE_LEFT = 5
export const PIPE_RIGHT = 4

export const MOUNTAIN = 6
export const MOUNTAIN_LEFT = 7
export const MOUNTAIN_RIGHT = 8
export const MOUNTAIN_TOP = 9

export const TREE = 10
export const GROUND = 11
export const QUESTION = 12
export const BRICK = 13
export const CLOUD = 14
export const GOOMBA = 15

export const COLORS: Map<TileType, string> = new Map<TileType, string>()
export const BLOCKING: Set<TileType> = new Set()

COLORS.set(NONE,'magenta')
COLORS.set(TRANSPARENT,'#3366FF')
COLORS.set(SOLID,'#FFcc44')
COLORS.set(PIPE,'#22cc22')
COLORS.set(PIPE_LEFT,'#008800')
COLORS.set(PIPE_RIGHT,'#44ff44')
COLORS.set(MOUNTAIN,"#00cc00")

BLOCKING.add(SOLID)
BLOCKING.add(GROUND)
BLOCKING.add(PIPE)
BLOCKING.add(PIPE_LEFT)
BLOCKING.add(PIPE_RIGHT)


type TileType = number

export interface TileMap {
    tile_at(x, y): TileType
    tile_at_point(pt: Point): TileType

    get_width(): number;

    get_height(): number;
}

function log(...args) {
    console.log(...args)
}

export class JSONTileMap implements TileMap {
    private data: TileType[];
    width: number;
    height: number;

    constructor() {
        this.width = 64
        this.height = 16
        this.data = []
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.data[this.xy2n(i, j)] = TRANSPARENT
            }
        }
        this.hline(0, 12, 50, GROUND)
        this.hline(0, 13, 50, SOLID)
        this.hline(0, 14, 50, SOLID)
        this.hline(0, 15, 50, SOLID)

        this.vline(0, 0, 20, SOLID)

        // this.vline(20, 11, 1, SOLID)
        // this.vline(21, 10, 2, SOLID)
        // this.vline(22, 9, 3, SOLID)


        this.hline(2,11,5, MOUNTAIN)
        this.hline(3,10,3, MOUNTAIN)
        this.hline(4,9,1, MOUNTAIN)

        this.hline(12,11,3, TREE)
        this.hline(16,7,1, QUESTION)

        this.hline(16,11,3, MOUNTAIN)
        this.hline(17,10,1, MOUNTAIN)

        this.hline(20,0,1,CLOUD)
        this.hline(20,7,5, BRICK)
        this.hline(21,7,1, QUESTION)
        this.hline(22,2,1, QUESTION)
        this.hline(22,11,1,GOOMBA)
        this.hline(23,7,1, QUESTION)
        this.hline(23,11,3, TREE)

        this.hline(28,2,3,CLOUD)
        this.vline(29, 10, 2, PIPE)
        this.vline(30, 10, 2, PIPE)

        this.hline(35,1,2,CLOUD)
        this.vline(36, 9, 3, PIPE)
        this.vline(37, 9, 3, PIPE)
        this.enhance()
    }

    enhance() {
        let d2 = new Array(this.data.length)
        d2.fill(NONE)
        for(let i=0; i<this.width; i++) {
            for(let j=0; j<this.height; j++) {
                let n = this.xy2n(i,j)
                let v = this.data[n]
                let left = this.tile_at(i-1,j)
                let right = this.tile_at(i+1,j)
                if(v === PIPE && left === TRANSPARENT) v = PIPE_LEFT
                if(v === PIPE && right === TRANSPARENT) v = PIPE_RIGHT
                if(v === MOUNTAIN && left === TRANSPARENT) v = MOUNTAIN_LEFT
                if(v === MOUNTAIN && right === TRANSPARENT) v = MOUNTAIN_RIGHT
                if(v === MOUNTAIN && left === TRANSPARENT && right === TRANSPARENT) v = MOUNTAIN_TOP
                d2[n] = v
            }
        }
        this.data = d2
    }

    tile_at(x, y): TileType {
        return this.get_xy(x, y)
    }

    tile_at_point(pt: Point): TileType {
        return this.get_xy(pt.x, pt.y)
    }

    private xy2n(i: number, j: number) {
        return i + j * this.width
    }

    hline(x: number, y: number, len: number, tt: TileType) {
        for (let i = 0; i < len; i++) {
            this.set_xy(x + i, y, tt)
        }
    }

    vline(x: number, y: number, len: number, tt: TileType) {
        for (let i = 0; i < len; i++) {
            this.set_xy(x, y + i, tt)
        }
    }

    private get_xy(x: number, y: number): TileType {
        if (x < 0) return NONE
        if (x >= this.width) return NONE
        if (y < 0) return NONE
        if (y >= this.height) return NONE
        return this.data[this.xy2n(x, y)]
    }

    private set_xy(x: number, y: number, tt: TileType) {
        if (x < 0) return
        if (x >= this.width) return
        if (y < 0) return;
        if (y >= this.height) return
        this.data[this.xy2n(x, y)] = tt
    }

    get_height(): number {
        return this.height
    }

    get_width(): number {
        return this.width
    }
}

function get_image_data(img: HTMLImageElement):ImageData {
    let can = document.createElement('canvas')
    can.width = img.width
    can.height = img.height
    let ctx = can.getContext('2d')
    ctx.drawImage(img,0,0)
    return ctx.getImageData(0,0,img.width,img.height)
}

function equal_colors(color1: number[], color2: number[]):boolean {
    if(color1.length !== color2.length) return false
    for(let i=0; i<color1.length; i++) {
        if(color1[i] !== color2[i]) return false
    }
    return true
}

function calc_type(color: number[]):TileType {
    let DARK_BROWN = [80,48,0,255]
    let sky_blue = [60,188,252,255]
    let dark_green = [0,88,0,255]

    let light_green = [184,248,24,255]
    let white = [252,252,252,255]
    let orange_brown = [228,92,16,255]
    let brown = [172,124,0,255]
    let medium_green = [0,168,68,255]

    if(equal_colors(color,DARK_BROWN)) return GROUND
    if(equal_colors(color,sky_blue)) return TRANSPARENT
    if(equal_colors(color,dark_green)) return MOUNTAIN
    if(equal_colors(color,light_green)) return TREE
    if(equal_colors(color,white)) return CLOUD
    if(equal_colors(color,orange_brown)) return QUESTION
    if(equal_colors(color,brown)) return BRICK
    if(equal_colors(color,medium_green)) return PIPE
    // throw new Error(`unknown color ${color}`)
    return NONE

}

export class PNGTileMap implements TileMap {
    private img: HTMLImageElement;
    private data: TileType[];
    private loaded: boolean;
    constructor() {
        this.loaded = false
        this.img = new Image()
        this.img.src = "./mario-1-1@1.png"
        this.img.onload = () => {
            this.process_image()
        }
    }

    get_height(): number {
        if(this.loaded) return this.img.height
        return 16
    }

    get_width(): number {
        if(this.loaded) return this.img.width
        return 16
    }

    tile_at(x, y): TileType {
        if(this.loaded) {
            return this.data[this.xy2n(x, y)]
        }
        return SOLID
    }

    tile_at_point(pt: Point): TileType {
        return this.tile_at(pt.x,pt.y)
    }

    private process_image() {
        this.data = new Array(this.img.width*this.img.height)
        this.data.fill(TRANSPARENT)
        let id = get_image_data(this.img)
        for(let i=0; i<1000; i++) {
            for(let j=0; j<this.get_height(); j++) {
                let n = (i + j*id.width)*4
                let color = [id.data[n+0],id.data[n+1],id.data[n+2],id.data[n+3]]
                this.set_xy(i,j,calc_type(color))
            }
        }
        // this.enhance()
        this.loaded = true
    }
    private xy2n(i: number, j: number) {
        return i + j * this.img.width
    }
    private set_xy(x: number, y: number, tt: TileType) {
        if (x < 0) return
        if (x >= this.img.width) return
        if (y < 0) return;
        if (y >= this.img.height) return
        this.data[this.xy2n(x, y)] = tt
    }
    enhance() {
        let d2 = new Array(this.data.length)
        d2.fill(NONE)
        for(let i=0; i<this.get_width(); i++) {
            for(let j=0; j<this.get_height(); j++) {
                let n = this.xy2n(i,j)
                let v = this.data[n]
                let left = this.tile_at(i-1,j)
                let right = this.tile_at(i+1,j)
                if(v === PIPE && left === TRANSPARENT) v = PIPE_LEFT
                if(v === PIPE && right === TRANSPARENT) {
                    console.log('doing pipe right')
                    v = PIPE_RIGHT
                }
                if(v === MOUNTAIN && left === TRANSPARENT) v = MOUNTAIN_LEFT
                if(v === MOUNTAIN && right === TRANSPARENT) v = MOUNTAIN_RIGHT
                if(v === MOUNTAIN && left === TRANSPARENT && right === TRANSPARENT) v = MOUNTAIN_TOP
                d2[n] = v
            }
        }
        this.data = d2
    }
}
