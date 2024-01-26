import { text } from "svelte/internal"
import type { Controls } from "../stores/controls"

export class DeathScreen extends Phaser.GameObjects.Graphics {
    private allObjects = []
    private selectionArrow: Phaser.GameObjects.Sprite

    private currentTextLevel = 0
    private texts = [
        ['You failed, what a shame', 'Try again ?', 'I wanna give up'],
        ['Are you sure ?', 'No, i was wrong', 'Yes'],
        ['Are you really sure ?', '...', 'Yes, i wanna quit'],
    ]
    public selectedOption = 0

    private controls: Controls
    private optionSfx: Howl
    private selectSfx: Howl

    constructor(scene, controls) {
        super(scene)

        this.optionSfx = new Howl({
            src: '/sfx/click.ogg',
            preload: true,
        })

        this.selectSfx = new Howl({
            src: '/sfx/click-2.ogg',
            preload: true,
        })

        this.controls = controls
        this.scene.add.existing(this)
        this.setDepth(100000)
        const { worldView, width, height } = this.scene.cameras.main

        this.setScrollFactor(0)
        this.fillStyle(0x000, 0.7)
        this.fillRect(0, 0, width, height)

        const centerX = worldView.x + width / 2;
        const centerY0 = worldView.y + height / 3
        const centerY1 = centerY0 + 150
        const centerY2 = centerY1 + 100

        this.allObjects.push(this.scene.add
            .text(centerX, centerY0, this.texts[0][0], { font: "48px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1))

        const option0 = this.scene.add
            .text(centerX, centerY1, this.texts[0][1], { font: "48px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1).setInteractive()

        const option1 = this.scene.add
            .text(centerX, centerY2, this.texts[0][2], { font: "48px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1).setInteractive()

        this.allObjects.push(option0)
        this.allObjects.push(option1)

        const { x, y, height: textHeight } = option0.getBounds()

        this.selectionArrow
            = this.scene.add
                .sprite(x - 32, y + (textHeight / 2), 'selection-arrow')
                .setOrigin(0.5)
                .setDepth(this.depth + 1)

        this.selectionArrow.anims.createFromAseprite('selection-arrow')
        this.selectionArrow.anims.play({ key: 'default', yoyo: true, repeat: -1 })

        this.controls.on('up', function() {
            this.changeOptions(-1)
            this.optionSfx.play()
        }.bind(this))

        this.controls.on('left', function() {
            this.changeOptions(-1)
            this.optionSfx.play()
        }.bind(this))

        this.controls.on('down', function() {
            this.changeOptions(-1)
            this.optionSfx.play()
        }.bind(this))

        this.controls.on('right', function() {
            this.changeOptions(-1)
            this.optionSfx.play()
        }.bind(this))

        this.controls.on('action', function() {
            this.selectOption()
        }.bind(this))

        option0.on('pointerover', function() {
            this.optionSfx.play()
            this.selectedOption = 0
            this.changeOptions(0)
        }, this)

        option1.on('pointerover', function() {
            this.optionSfx.play()
            this.selectedOption = 1
            this.changeOptions(0)
        }, this)

        option1.on('pointerdown', function() {
            this.selectSfx.play()
            this.selectOption()
        }, this)

        option0.on('pointerdown', function() {
            this.selectSfx.play()
            this.selectOption()
        }, this)

    }

    destroy(fromScene?: boolean): void {
        this.controls.off()

        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].off()
            this.allObjects[i].destroy(fromScene)

        }

        super.destroy(fromScene)
    }

    changeOptions(direction = 1) {
        this.selectedOption += direction

        if (this.selectedOption < 0) {
            this.selectedOption = 0
        } else if (this.selectedOption > 2) {
            this.selectedOption = 2
        }

        let text: Phaser.GameObjects.Text

        if (this.selectedOption === 0) {
            text = this.allObjects[1]
        } else {
            text = this.allObjects[2]
        }

        const { x, y, height: textHeight } = text.getBounds()

        this.selectionArrow.setPosition(x - 32, y + (textHeight / 2))
    }

    nextText() {
        this.currentTextLevel += 1

        if (this.currentTextLevel > this.texts.length) {
            this.currentTextLevel -= 1
        }

        for (let i = 0; i < 3; i++) {
            const text: Phaser.GameObjects.Text = this.allObjects[i]

            text.setText(this.texts[this.currentTextLevel][i])
        }
    }

    getAction() {
        if (this.selectedOption === 0) {
            return 'startOver'
        }

        if (this.currentTextLevel === this.texts.length - 1) {
            return 'quit'
        }
    }

    selectOption() {
        if (!this.scene) return

        const action = this.getAction()

        if (action === "quit") {
            window.runtime.Quit()
        } else if (action === "startOver") {
            this.controls.off()
            this.scene.scene.resume('main')
            this.scene.scene.stop('main')
            this.scene.scene.start('main', { dead: true })
            this.scene.scene.stop()
        } else {
            this.nextText()
        }
    }

}

