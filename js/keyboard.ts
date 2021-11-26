export class Keyboard {
    private key_states: {};
    private enabled: boolean;

    constructor() {
        this.key_states = {}
        this.enabled = true
    }

    setup_input() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return
            this.get_key_state(e.code).press = true
        })
        document.addEventListener('keyup', (e) => {
            if (!this.enabled) return
            this.get_key_state(e.code).press = false
        })
    }

    is_pressed(name): boolean {
        if (!this.enabled) return false
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
        if (!this.key_states.hasOwnProperty(code)) {
            this.key_states[code] = {
                press: false
            }
        }
        return this.key_states[code]
    }
}
