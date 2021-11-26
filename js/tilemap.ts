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
