import {Point} from "./util";

export interface Player {
    alive: boolean;
    tile_pos: Point
    offset: Point
    dv: Point
    gravity: Point
    big: boolean
    onground: boolean
    jumping: boolean
}
