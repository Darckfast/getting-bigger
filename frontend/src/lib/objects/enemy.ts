export class Enemy extends Phaser.Physics.Matter.Sprite {
    private health = 10

    public isDead = false
    public hasDroppedEssence = false

    constructor(world, x = 0, y = 0) {
        super(world, x, y, 'enemy', undefined, {
            mass: 10,
            collisionFilter: {
                category: null
            }
        })

        this.scene.add.existing(this)
        this.anims.createFromAseprite('enemy')

        this.play('default')
    }

    dealDamage(amount = 5) {
        if (this.isDead) return

        this.play('hit')
        this.health -= amount

        if (this.health <= 0) {
            this.isDead = true

            this.kill()
        }
    }

    kill() {
        this.isDead = true
        this.play('death')
        this.once('animationcomplete', () => {
            this.destroy(true)
        }, this)
    }
}
