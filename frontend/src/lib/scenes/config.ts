import { Scene } from "phaser";
import type { Unsubscriber } from "svelte/store";
import { menuLoader } from "../loaders/menu";
import { controls, type Controls } from "../stores/controls";

export class ConfigScene extends Scene {
    private allObjects: Phaser.GameObjects[] = []
    private controls: Controls
    private unsubs: Unsubscriber[] = []


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

        const { worldView, width, height } = this.cameras.main

        const centerX = worldView.x + width / 2
        const centerY0 = worldView.y + height / 4
        const centerY1 = centerY0 + height * 0.3
        const centerY2 = centerY1 + height * 0.1
        const centerY3 = centerY2 + height * 0.1

        this.add.text(centerX, centerY1, 'Volume', { font: "48px Pixelify Sans" })
            .setOrigin(0.5).setInteractive()

        this.add.text(centerX, centerY1, 'Volume', { font: "48px Pixelify Sans" })
            .setOrigin(0.5).setInteractive()

        this.events.once('destroy', () => {
            this.destroy()
        }, this)
    }

    destroy(fromScene?: boolean): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(fromScene)
        }
    }

    update(time: number, delta: number): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].update(time, delta)
        }
    }
}
