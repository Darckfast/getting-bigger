import { GameObjects, Physics } from "phaser"

interface DialogConfig {
    position?: 'center' | 'bottom',
    backgroundOpacity?: number
}

export class DialogBubble extends GameObjects
    .Graphics {
    private font: GameObjects.Text
    private name: GameObjects.Text
    private backgroundColor = 0x101622
    private bubblePadding = 25 as const
    private letterTime = 50
    private fullText = ''
    private shownText = ''
    private fontSize = 40
    private timeElapsed = 0
    public bubbleWidth = 0
    public bubbleHeight = 240
    public isDone = true
    public isClose = true
    private isBubbleCreate = false
    private endIndicator: Phaser.Physics.Matter.Sprite

    private config: DialogConfig

    public hasAnswer = false
    public hasChoices = false
    public onNextDialog?: () => any

    constructor(scene: Phaser.Scene, config: DialogConfig = {}) {
        super(scene, { x: 0, y: 0 })

        this.setDepth(10000)
        this.config = config

        this.scene.add.existing(this)

        this.font = this.scene.add.text(0, 0, '', {
            fontFamily: 'Pixelify Sans',
            fontSize: this.fontSize,
            color: '#ffffff',
            align: 'center',
        })

        this.name = this.scene.add.text(0, 0, '', {
            fontFamily: 'Pixelify Sans',
            fontSize: this.fontSize,
            color: '#ffffff',
            align: 'center',
        })

        this.endIndicator = this.scene.add.sprite(0, 0, 'dialog-end')
        this.endIndicator.anims.createFromAseprite('dialog-end')
        this.endIndicator.play({ key: 'default', repeat: -1 })
        this.endIndicator.setVisible(false)
    }

    close() {
        this.fullText = ''
        this.shownText = ''
        this.font.setText('')
        this.name.setText('')
        this.clear()
        this.endIndicator.setVisible(false)
        this.isClose = true
    }

    say(text: string, name: string) {
        this.isClose = false

        this.name.setText(name)

        if (this.shownText !== '' && this.onNextDialog) {
            this.onNextDialog()
        }

        this.font.setDepth(this.depth + 1)
        this.name.setDepth(this.depth + 1)
        this.endIndicator.setDepth(this.depth + 1)

        this.fullText = text
        this.shownText = ''
        this.isDone = false
        this.isBubbleCreate = false

        const { width: camWidth, height: camHeight } = this.scene.cameras.main

        const { x: camX, y: camY } = this.scene.cameras.main.getWorldPoint(0, 0)

        this.font.setWordWrapWidth(camWidth - this.bubblePadding)
        this.bubbleWidth = camWidth

        let finalY = camY + camHeight - this.bubbleHeight

        if (this.config.position === "center") {
            finalY = camY + (camHeight / 2) - (this.bubbleHeight / 2)
        }

        this.setPosition(camX, finalY)
        this.name.setPosition(this.x + 16, this.y + 16)
    }

    destroy(fromScene?: boolean | undefined): void {
        super.destroy(fromScene)
    }

    private progressText() {
        if (this.isDone) return

        this.shownText += this.fullText.charAt(
            this.shownText.length
        )

        if (this.shownText.length === this.fullText.length) {
            this.shownText = this.fullText
            this.isDone = true
        }

        if (!this.isBubbleCreate) {
            this.fillStyle(this.backgroundColor, this.config?.backgroundOpacity ?? 1)
            this.fillRoundedRect(
                0,
                0,
                this.bubbleWidth,
                this.bubbleHeight,
                10
            )

            this.isBubbleCreate = true
        }

        this.font.setText(this.shownText)
        const fontBound = this.font.getBounds()

        this.font.setPosition(
            this.x + this.bubbleWidth / 2 - fontBound.width / 2,
            this.y + this.bubbleHeight / 2 - fontBound.height / 2
        )

        if (this.isDone) {
            this.endIndicator.setVisible(true)
            this.endIndicator.setPosition(
                fontBound.x + fontBound.width + 30,
                fontBound.y + (fontBound.height / 2))
        } else {
            this.endIndicator.setVisible(false)
        }
    }

    skip(start = true) {
        this.letterTime = start ? 1 : 50
    }

    update(_: number, dt: number) {
        if (this.timeElapsed + dt > this.letterTime) {
            this.progressText()
            this.timeElapsed = 0
        }

        this.timeElapsed += dt
    }
}

