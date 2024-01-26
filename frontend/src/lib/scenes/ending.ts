
import { Cameras, Scene } from "phaser";
import type { Unsubscriber } from "svelte/store";
import { endingLoader } from "../loaders/endingLoader";
import { DialogBubble } from "../objects/dialog";
import { controls, type Controls } from "../stores/controls";
import { endingDialogs } from "./dialogText";

export class EndingScene extends Scene {
    private controls: Controls
    private unsubs: Unsubscriber[] = []
    private allObjects: Phaser.GameObjects.GameObject[] = []
    private egoMouth: Phaser.Physics.Matter.Sprite
    private dialog: DialogBubble
    private dummyPlayer: Phaser.GameObjects.Graphics
    private currentDialog = 0
    private introFinished = false
    private mouthSfx: Howl
    private mouth2Sfx: Howl

    constructor() {
        super('ending')

        const unsub = controls.subscribe(function(ctrl) {
            this.controls = ctrl
        }.bind(this))

        this.unsubs.push(unsub)
        this.mouthSfx = new Howl({
            src: '/sfx/mouth.ogg',
            preload: true
        })
        this.mouth2Sfx = new Howl({
            src: '/sfx/mouth-2.ogg',
            preload: true
        })
    }

    preload() {
        endingLoader(this)
    }

    create() {
        this.cameras.main.fadeIn(1000)

        this.introFinished = false
        this.currentDialog = 0
        this.allObjects = []

        this.dialog = new DialogBubble(this)
        this.allObjects.push(this.dialog)

        this.controls.on('action', this.nextDialog.bind(this))

        const mapTiles = []
        const { displayWidth, displayHeight } = this.cameras.main

        const xTiles = (Math.ceil(displayWidth / 32) + 3) * 3
        const yTiles = (Math.ceil(displayHeight / 32) + 3) * 3

        for (let i = 0; i < xTiles; i++) {
            for (let k = 0; k < yTiles; k++) {
                mapTiles[k] ||= []
                mapTiles[k][i] = 1
            }
        }

        const map
            = this.make.tilemap({ data: mapTiles, tileWidth: 32, tileHeight: 32 })

        const tileset = map.addTilesetImage("main", "main")

        map.createLayer(0, tileset, -32 * 3, -32 * 3)

        const x = (xTiles * 32) / 2
        const y = (yTiles * 32) / 2

        this.egoMouth = this.add.sprite(x, y - 210, 'ego-mouth')
        this.egoMouth.setOrigin(0.5)
        this.egoMouth.setScale(8)
        this.egoMouth.anims.createFromAseprite('ego-mouth')
        this.egoMouth.play('default')

        this.dummyPlayer = this.add.graphics({ x, y, fillStyle: { color: 0xffffff } })
        this.dummyPlayer.setPosition(x, y + 200)
        this.dummyPlayer.fillCircle(0, 0, 50)

        this.cameras.main.startFollow(this.dummyPlayer, true)

        this.tweens.add({
            targets: this.dummyPlayer,
            y: y - 200,
            duration: 2000,
            onComplete: function() {
                this.introFinished = true

                this.time.delayedCall(500, () => {
                    this.nextDialog()
                }, undefined, this)
            }.bind(this)
        })

        this.events.once('destroy', () => {
            this.destroy()
        }, this)
    }

    nextDialog() {
        if (!this.introFinished) return
        if (this.currentDialog !== 0 && this.dialog.isClose) return

        if (!this.dialog.isDone) {
            this.dialog.skip(true)

            return
        }

        const nextText = endingDialogs[this.currentDialog]

        this.dialog.skip(false)
        if (nextText) {
            this.dialog.say(nextText[0], nextText[1])
            this.currentDialog += 1
        } else {
            this.dialog.close()
            this.endSequence()
        }
    }

    endSequence() {
        this.mouthSfx.play()
        this.egoMouth.play('open')

        this.egoMouth.once('animationcomplete', () => {
            this.tweens.add({
                targets: this.dummyPlayer,
                scale: 0,
                alpha: 0,
                duration: 3000,
                onComplete: function() {
                    this.returnToStart()
                }.bind(this)
            })
        }, this)
    }

    returnToStart() {
        this.mouth2Sfx.play()
        this.egoMouth.play({ key: 'open', startFrame: 4, yoyo: true, })

        this.egoMouth.once('animationcomplete', () => {
            this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function() {
                this.scene.scene.stop()
                this.scene.scene.start('start')
            })

            this.controls.off()
            this.cameras.main.fadeOut(3000)
        }, this)
    }

    destroy() {
        for (let i = 0; i < this.unsubs.length; i++) {
            this.unsubs[i]()
        }

        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(true)
        }
    }

    update(time: number, delta: number): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].update(time, delta)
        }
    }
}
