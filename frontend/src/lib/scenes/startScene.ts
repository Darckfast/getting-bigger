import { Scene } from "phaser";
import type { Unsubscriber } from "svelte/store";
import { menuLoader } from "../loaders/menu";
import { StartScreen } from "../objects/startScreen";
import { controls, type Controls } from "../stores/controls";

export function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export class StartScene extends Scene {
    private allObjects: Phaser.GameObjects[] = []
    private controls: Controls
    private unsubs: Unsubscriber[] = []
    private startScreen: StartScreen
    private rainSfx: Howl
    private rainDropped = 0
    private timeElapsed = 0

    constructor() {
        super('start')

        const unsub = controls.subscribe(function(ctrl) {
            this.controls = ctrl
        }.bind(this))

        this.unsubs.push(unsub)
    }

    preload() {
        menuLoader(this)

        if (!this.rainSfx) {
            this.rainSfx = new Howl({
                src: '/sfx/rain.ogg',
                preload: true,
                loop: true,
                autoplay: true,
            })
        }
    }

    spawnRain() {
        if (this.timeElapsed < 200) return
        if (this.rainDropped > 20) return

        this.timeElapsed = 0

        const { displayHeight, displayWidth } = this.cameras.main
        const { x: topX, y: topY } = this.cameras.main.getWorldPoint(0, 0)
        const { x: botX }
            = this.cameras.main.getWorldPoint(displayWidth, displayHeight)

        const finalX = randomIntFromInterval(topX, botX)
        const rainDrop
            = this.matter.add.sprite(finalX, topY, 'rain').setScrollFactor(0)

        rainDrop.setVelocityY(5)
        rainDrop.setVelocityX(-1)
        rainDrop.setFrictionAir(0)
        rainDrop.setScale(2)
        rainDrop.anims.createFromAseprite('rain')
        rainDrop.play('default')

        this.allObjects.push(rainDrop)
        this.rainDropped += 1
    }

    create() {
        this.cameras.main.fadeIn(1000)
        this.allObjects = []

        this.startScreen = new StartScreen(this, this.controls)
        this.allObjects.push(this.startScreen)

        this.events.once('destroy', () => {
            this.destroy()
        }, this)

        this.spawnRain()
    }

    destroy(fromScene?: boolean): void {
        this.rainSfx.stop()

        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(fromScene)
        }
    }

    isInScreen(x, y) {
        const { displayHeight, displayWidth } = this.cameras.main
        const { x: topX, y: topY } = this.cameras.main.getWorldPoint(0, 0)
        const { x: botX, y: botY }
            = this.cameras.main.getWorldPoint(displayWidth, displayHeight)

        return (x >= topX && x <= botX) || (y >= topY && y <= botY)
    }

    update(time: number, delta: number): void {
        this.timeElapsed += delta

        for (let i = 0; i < this.allObjects.length; i++) {
            const object = this.allObjects[i]
            object.update(time, delta)

            const result = this.isInScreen(object.x, object.y)

            if (!result) {
                this.rainDropped -= 1
                object.destroy(true)
                this.allObjects.splice(i, 1)
            }
        }

        this.spawnRain()
    }
}
