import {Point} from "./util.js";

export const NONE = 0
export const TRANSPARENT = 1
export const SOLID = 2
export const PIPE = 3
export const PIPE_LEFT = 5
export const PIPE_RIGHT = 4

export const MOUNTAIN = 6

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
BLOCKING.add(PIPE)
BLOCKING.add(PIPE_LEFT)
BLOCKING.add(PIPE_RIGHT)


type TileType = number

interface TileMap {
    tile_at(x, y): TileType
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
        this.hline(0, 12, 50, SOLID)
        this.hline(0, 13, 50, SOLID)
        this.hline(0, 14, 50, SOLID)
        this.hline(0, 15, 50, SOLID)

        this.vline(0, 0, 20, SOLID)

        this.vline(20, 11, 1, SOLID)
        this.vline(21, 10, 2, SOLID)
        this.vline(22, 9, 3, SOLID)

        this.vline(27, 7, 5, PIPE)
        this.vline(28, 7, 5, PIPE)

        this.hline(1,11,5, MOUNTAIN)
        this.hline(2,10,3, MOUNTAIN)
        this.hline(3,9,1, MOUNTAIN)
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
}
