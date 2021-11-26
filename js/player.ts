import {Point} from "./util.js";

export class Player {
    alive: boolean;
    tile_pos: Point
    offset: Point
    dv: Point
    gravity: Point
    big: boolean
    onground: boolean
    jumping: boolean
    constructor() {
        this.alive = true
        this.big = false
        this.onground = false
        this.jumping = false
        this.offset = new Point(0,0)
        this.tile_pos = new Point(3,2)
        this.dv = new Point(0,1)
        this.gravity = new Point(0,1)
    }

    reset(): void {
        this.dv = new Point(0,0)
        this.jumping = false
        this.tile_pos = new Point(3,3)
        this.onground = false
        this.alive = true
        this.offset = new Point(0,0)
        this.big = false

    }
}
