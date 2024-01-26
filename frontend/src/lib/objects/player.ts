import { getDistance } from "../funcs/getDistance"
import type { Controls } from "../stores/controls"

export class Player extends Phaser.GameObjects.Graphics {
    private controls: Controls
    private vetVelocity = 0
    private horVelocity = 0
    private currentColor = 0xffffff
    private health = 1
    private matterBodyRef: Phaser.Physics.Matter.Image
    private healthBar: Phaser.GameObjects.Graphics
    private deathAnimation: Phaser.Physics.Matter.Sprite
    private currentSize = 0.01
    private deathSfx: Howl

    public enemyAttraction = 0.000001
    public essenceAttraction = 0.00005
    public size = 0.01
    public score = 0
    public color = 0xfff
    public moveSpeed = 1
    public isReady = false

    constructor(scene: Phaser.Scene, controls: Controls) {
        super(scene)

        this.controls = controls
        this.scene.add.existing(this)

        this.deathAnimation = this.scene.add.sprite(0, 0, 'death')
        this.deathAnimation.setScale(2)
        this.deathAnimation.anims.createFromAseprite('death')
        this.deathAnimation.setVisible(false)

        this.fillStyle(this.currentColor)
        this.fillCircle(0, 0, this.currentSize)

        this.increaseSize()

        this.deathSfx = new Howl({
            src: '/sfx/death.ogg',
            preload: true
        })
    }

    increaseSize() {
        this.fillCircle(0, 0, this.size)
        if (this.matterBodyRef) {
            this.matterBodyRef.setCircle(this.size, {
                position: {
                    x: this.x,
                    y: this.y,
                },
                shape: {
                    type: 'circle',
                    radius: this.size,
                },
                plugin: {
                    attractors: [
                        this.handleAttraction.bind(this),
                    ]
                }
            })
            return
        }

        this.matterBodyRef = this.scene.matter.add.gameObject(this, {
            shape: {
                type: 'circle',
                radius: this.size,
            },
            plugin: {
                attractors: [
                    this.handleAttraction.bind(this)
                ]
            }
        })
    }

    handleAttraction(bodyA, bodyB) {
        const { gameObject } = bodyB

        if (gameObject?.ignoreAttractor) {
            return bodyB.poisition
        }

        if (gameObject?.minAttractionDist) {
            const dist = getDistance(
                bodyA.position.x,
                bodyA.position.y,
                bodyB.position.x,
                bodyB.position.y
            )

            if (dist > gameObject.minAttractionDist) {
                return
            }

            return {
                x: (bodyA.position.x - bodyB.position.x) * this.essenceAttraction,
                y: (bodyA.position.y - bodyB.position.y) * this.essenceAttraction
            }
        }

        return {
            x: (bodyA.position.x - bodyB.position.x) * this.enemyAttraction,
            y: (bodyA.position.y - bodyB.position.y) * this.enemyAttraction
        }
    }

    move() {
        this.vetVelocity = 0
        this.horVelocity = 0

        if (!this.isReady) return

        if (this.controls.isUpPress) {
            this.vetVelocity = -this.moveSpeed
        } else if (this.controls.isDownPress) {
            this.vetVelocity = this.moveSpeed
        }

        if (this.controls.isLeftPress) {
            this.horVelocity = -this.moveSpeed
        } else if (this.controls.isRightPress) {
            this.horVelocity = this.moveSpeed
        }

        this.setVelocity(this.horVelocity, this.vetVelocity)
    }

    update(time, delta: number): void {
        this.move()

        if (this.currentSize !== this.size) {
            this.currentSize = this.size
            this.increaseSize()
        }
    }

    changeHealth(amount = 0) {
        this.health += amount

        if (this.health <= 0 && this.isReady) {
            this.deathSfx.play()
            this.scene.cameras.main.stopFollow()

            this.scene.tweens.add({
                targets: this,
                scale: 0,
                alpha: 0,
                duration: 200,
            })

            this.deathAnimation.setPosition(this.x, this.y)
            this.deathAnimation.setVisible(true)
            this.deathAnimation.play('default')

            this.isReady = false

            this.scene.time.delayedCall(1500, () => {
                this.scene.events.emit('playerDeath', this)

            }, this)
        }
    }
}
