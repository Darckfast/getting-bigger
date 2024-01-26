import Slider from 'phaser3-rex-plugins/plugins/slider.js';

export class VolumeSlider extends Phaser.GameObjects.GameObject {
    private allObjects: Phaser.GameObjects[] = []
    private slider: Slider
    private initialVolume = 0.5
    private soundIcon: Phaser.GameObjects.Sprite

    public depth = 10000

    constructor(scene: Phaser.Scene) {
        super(scene, 'volume-slider')

        this.scene.add.existing(this)
        const { displayWidth, displayHeight } = this.scene.cameras.main

        const sliderX = (displayWidth / 2) + 50
        const sliderSprite = this.scene.add.sprite(sliderX, displayHeight - 32, 'slider')
            .setDepth(this.depth + 1)
            .setScale(2)

        const localVolume = localStorage.getItem('volume')

        if (localVolume && !Number.isNaN(localVolume)) {
            this.initialVolume = parseInt(localVolume)
        }

        this.slider = new Slider(sliderSprite, {
            endPoints: [{
                x: sliderSprite.x - 200,
                y: sliderSprite.y
            },
            {
                x: sliderSprite.x + 200,
                y: sliderSprite.y
            }],
            value: this.initialVolume
        })

        this.allObjects.push(this.slider)

        const sliderBar = this.scene.add.sprite(sliderX, displayHeight - 32, 'slider-bar')
            .setScale(2)
            .setDepth(this.depth + 1)

        this.soundIcon = this.scene.add.sprite(sliderBar.x - 232, sliderBar.y, 'sound-icon')
            .setDepth(this.depth + 1)
        this.soundIcon.anims.createFromAseprite('sound-icon')

        if (this.initialVolume === 0) {
            this.soundIcon.play('muted')
        } else {
            this.soundIcon.play('default')
        }

        this.allObjects.push(sliderBar)
        this.allObjects.push(this.soundIcon)
    }

    destroy(fromScene?: boolean): void {
        for (let i = 0; i < this.allObjects.length; i++) {
            this.allObjects[i].destroy(fromScene)
        }

        super.destroy(fromScene)
    }

    update(): void {
        Howler.volume(this.slider.value)

        if (this.slider.value > 0) {
            this.soundIcon.play('default')
        } else {
            this.soundIcon.play('muted')
        }

        localStorage.setItem('volume', this.slider.value)
    }
}

