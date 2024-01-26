
import { Scene } from "phaser";
import type { Unsubscriber } from "svelte/store";
import { menuLoader } from "../loaders/menu";
import { DeathScreen } from "../objects/deathScreen";
import { controls, type Controls } from "../stores/controls";

export class DeathScene extends Scene {
    private allObjects: Phaser.GameObjects[] = []
    private controls: Controls
    private unsubs: Unsubscriber[] = []
    private deathScreen: DeathScreen

    constructor() {
        super('death')

        const unsub = controls.subscribe(function(ctrl) {
            this.controls = ctrl
        }.bind(this))

        this.unsubs.push(unsub)
    }

    preload() {
        menuLoader(this)
    }

    create() {
        this.allObjects = []

        this.deathScreen = new DeathScreen(this, this.controls)
        this.allObjects.push(this.deathScreen)

        this.events.once('destroy', () => {
            this.destroy()
        }, this)
    }

    destroy(fromScene?: boolean): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(fromScene)
        }
    }
}
