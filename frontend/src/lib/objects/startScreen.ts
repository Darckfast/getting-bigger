import { Cameras } from "phaser"
import type { Controls } from "../stores/controls"
import { VolumeSlider } from "./volumeSlider";

export class StartScreen extends Phaser.GameObjects.Graphics {
    private allObjects = []
    private selectionArrow: Phaser.GameObjects.Sprite

    private currentTextLevel = 0
    private texts = ['Getting Bigger', 'start', 'quit']

    public selectedOption = 0

    private selectSfx: Howl
    private controlsRef = []
    private controls: Controls
    private isInTransition = false

    constructor(scene: Phaser.Scene, controls: Controls) {
        super(scene)
        this.controls = controls

        this.optionSfx = new Howl({
            src: '/sfx/click.ogg',
            preload: true,
        })

        this.selectSfx = new Howl({
            src: '/sfx/click-2.ogg',
            preload: true,
        })

        this.controlsRef.push({
            key: 'up',
            callback: function() {
                if (this.isInTransition) return
                this.changeOptions(-1)
                this.optionSfx.play()
            }.bind(this)
        })

        this.controlsRef.push({
            key: 'left', callback: function() {
                if (this.isInTransition) return
                this.changeOptions(-1)
                this.optionSfx.play()
            }.bind(this)
        })

        this.controlsRef.push({
            key: 'down', callback: function() {
                if (this.isInTransition) return
                this.changeOptions(1)
                this.optionSfx.play()
            }.bind(this)
        })

        this.controlsRef.push({
            key: 'right', callback: function() {
                if (this.isInTransition) return
                this.changeOptions(1)
                this.optionSfx.play()
            }.bind(this)
        })

        this.controlsRef.push({ key: 'action', callback: this.selectOption.bind(this) })

        for (let i = 0; i < this.controlsRef.length; i++) {
            const { key, callback } = this.controlsRef[i]
            this.controls.on(key, callback)
        }

        this.scene.add.existing(this)
        const { worldView, width, height } = this.scene.cameras.main

        this.setScrollFactor(0)
        const centerX = worldView.x + width / 2;
        const centerY0 = worldView.y + height / 4
        const centerY1 = centerY0 + height * 0.3
        const centerY2 = centerY1 + height * 0.1

        this.allObjects.push(this.scene.add
            .text(centerX, centerY0, this.texts[0], { font: "72px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1))

        const startText = this.scene.add
            .text(centerX, centerY1, this.texts[1], { font: "48px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1).setInteractive()

        const quitText = this.scene.add
            .text(centerX, centerY2, this.texts[2], { font: "48px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1).setInteractive()

        startText.on('pointerover', function() {
            if (this.isInTransition) return
            this.optionSfx.play()
            this.selectedOption = 0
            this.changeOptions(0)
        }, this)

        startText.on('pointerdown', function() {
            if (this.isInTransition) return
            this.selectSfx.play()
            this.selectOption()
        }, this)

        quitText.on('pointerover', function() {
            if (this.isInTransition) return
            this.optionSfx.play()
            this.selectedOption = 1
            this.changeOptions(0)
        }, this)

        quitText.on('pointerdown', function() {
            if (this.isInTransition) return
            this.selectSfx.play()
            this.selectOption()
        }, this)

        this.allObjects.push(startText)
        this.allObjects.push(quitText)

        const firstOption = this.allObjects[1] as Phaser.GameObjects.Text

        const { x, y, height: textHeight } = firstOption.getBounds()

        this.selectionArrow
            = this.scene.add
                .sprite(x - 32, y + (textHeight / 2), 'selection-arrow')
                .setOrigin(0.5)
                .setDepth(this.depth + 1)

        this.selectionArrow.anims.createFromAseprite('selection-arrow')
        this.selectionArrow.anims.play({ key: 'default', yoyo: true, repeat: -1 })

        const { displayHeight, displayWidth } = this.scene.cameras.main

        const iconOffset = 48
        const mX = displayWidth - iconOffset
        const mY = displayHeight - (iconOffset * 2) - 48
        const mouseIcon = this.scene.add.sprite(mX, mY, 'mouse-icon')
            .setOrigin(1)
            .setDepth(this.depth + 1)
            .setScale(2)
        mouseIcon.anims.createFromAseprite('mouse-icon')
        mouseIcon.anims.play({ key: 'default', yoyo: true, repeat: -1 })

        const mouseIconText = this.scene.add
            .text(mX, mY + 32, "aim", { font: "32px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1)

        mouseIconText.setX(mouseIconText.x - (mouseIcon.getBounds().width / 2))

        this.allObjects.push(mouseIcon)
        this.allObjects.push(mouseIconText)

        const keyboardIcon = this.scene.add.sprite(iconOffset, mY, 'keyboard-icon')
            .setOrigin(0, 1)
            .setDepth(this.depth + 1)
            .setScale(3)

        keyboardIcon.anims.createFromAseprite('keyboard-icon')
        keyboardIcon.anims.play({ key: 'default', yoyo: true, repeat: -1 })

        const keyboardIconText = this.scene.add
            .text(iconOffset, mY + 32, "move/dialog", { font: "32px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1)

        keyboardIconText.setX(keyboardIcon.x + (keyboardIcon.getBounds().width / 2))

        const escIcon = this.scene.add.sprite(iconOffset, 96, 'esc-icon')
            .setOrigin(0, 1)
            .setDepth(this.depth + 1)
            .setScale(3)

        escIcon.anims.createFromAseprite('esc-icon')
        escIcon.play({ key: 'default', yoyo: true, repeat: -1 })

        const escIconText = this.scene.add
            .text(iconOffset, 128, "pause", { font: "32px Pixelify Sans" })
            .setOrigin(0.5).setDepth(this.depth + 1)

        escIconText.setX(escIcon.x + (escIcon.getBounds().width / 2))

        this.allObjects.push(escIcon)
        this.allObjects.push(keyboardIcon)
        this.allObjects.push(keyboardIconText)

        const slider = new VolumeSlider(this.scene)
        this.allObjects.push(slider)
    }

    destroy(fromScene?: boolean): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(fromScene)
        }

        this.controls.off()
        super.destroy(fromScene)
    }

    selectOption() {
        if (this.isInTransition) return
        this.selectSfx.play()

        if (this.selectedOption === 1) {
            window.runtime.Quit()
        } else if (this.selectedOption === 0) {
            this.scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function() {
                this.scene.scene.stop()
                this.scene.scene.start('main')
            })

            this.isInTransition = true
            this.controls.off()
            this.scene.cameras.main.fadeOut(1000)
        }
    }

    changeOptions(direction = 1) {
        this.selectedOption += direction

        if (this.selectedOption < 0) {
            this.selectedOption = 0
        } else if (this.selectedOption > 1) {
            this.selectedOption = 1
        }

        let text: Phaser.GameObjects.Text

        text = this.allObjects[this.selectedOption + 1]

        const { x, y, height: textHeight } = text.getBounds()

        this.selectionArrow.setPosition(x - 32, y + (textHeight / 2))

        if (text.text === "quit") {
            this.allObjects[0].setText("Don't do it")
        } else {
            this.allObjects[0].setText("Getting Bigger")
        }
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

    update(time, delta): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].update(time, delta)
        }
    }
}

