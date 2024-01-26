import { Scene } from "phaser";
import type { Unsubscriber } from "svelte/store";
import { menuLoader } from "../loaders/menu";
import { VolumeSlider } from "../objects/volumeSlider";
import { controls, type Controls } from "../stores/controls";

export class PauseScene extends Scene {
    private controls: Controls
    private unsubs: Unsubscriber[] = []
    private allObjects: Phaser.GameObjects.GameObject[] = []
    private onPauseRef: any

    constructor() {
        super('pause')

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

        const volumeSlider = new VolumeSlider(this)
        this.allObjects.push(volumeSlider)
        const { worldView, width, height } = this.cameras.main

        const centerX = worldView.x + width / 2
        const centerY0 = worldView.y + height / 4

        const bg = this.add.graphics()

        bg.fillStyle(0x000, 0.7)
        bg.fillRect(0, 0, width, height)

        this.allObjects.push(this.add
            .text(centerX, centerY0, "paused", { font: "72px Pixelify Sans" })
            .setOrigin(0.5))

        this.events.once('destroy', () => {
            this.destroy()
        }, this)

        this.onPauseRef = this.goBack.bind(this)
        this.controls.on('escape', this.onPauseRef)
    }

    goBack() {
        this.scene.stop()
        this.scene.resume('main')
        this.controls.off('escape', this.onPauseRef)
    }

    destroy() {
        for (let i = 0; i < this.unsubs.length; i++) {
            this.unsubs[i]()
        }

        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(true)
        }

        this.controls.off('escape', this.goBack.bind(this))
    }

    update(time, delta): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].update(time, delta)
        }
    }
}
