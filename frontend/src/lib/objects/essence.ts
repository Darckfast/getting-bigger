export class Essence extends Phaser.Physics.Matter.Sprite {
    public isCollected = false
    public minAttractionDist = 50

    constructor(world, x = 0, y = 0) {
        super(world, x, y, 'essence', undefined, {
            collisionFilter: {
                category: null
            },
            mass: 10,
            ignorePointer: true,
        })

        this.scene.add.existing(this)


        this.anims.createFromAseprite('essence')
        this.play({ key: 'default', yoyo: true, repeat: -1 })
    }
}
