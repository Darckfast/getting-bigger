import { Cameras, Scene } from "phaser";
import type { Unsubscriber } from "svelte/store";
import { menuLoader } from "../loaders/menu";
import { controls, type Controls } from "../stores/controls";

export class SplashScene extends Scene {
    private allObjects: Phaser.GameObjects[] = []
    private controls: Controls
    private unsubs: Unsubscriber[] = []

    constructor() {
        super('splash')

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

        this.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, function() {
            this.time.delayedCall(500, () => {

                this.cameras.main.fadeOut(1000, 0, 0)

                this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function() {
                    this.scene.start('start')
                    this.scene.stop()
                }, this)
            }, this)

        }, this)

        this.cameras.main.fadeIn(1000, 0, 0)
        const { displayWidth, displayHeight } = this.cameras.main
        const obj = this.add.sprite(displayWidth / 2, displayHeight / 2, 'JamSmall')
            .setOrigin(0.5)

        this.add
            .text(displayWidth / 2, (displayHeight / 2) + 300, "made by darckfast",
                { font: "48px Pixelify Sans" })
            .setOrigin(0.5)

        this.events.once('destroy', () => {
            this.destroy()
        }, this)
    }

    destroy(fromScene?: boolean): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(fromScene)
        }

        this.controls.off()
    }
}
