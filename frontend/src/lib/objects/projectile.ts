import { getDistance } from "../funcs/getDistance"
import type { Enemy } from "./enemy"

export class Projectile extends Phaser.Physics.Matter.Sprite {
    public ignoreAttractor = true
    public speed = 5
    public maxDistance = 2000
    public ttl = 2000
    public enemiesHitten: Enemy[] = []

    private startX = 0
    private startY = 0
    private aliveFor = 0

    constructor(world, x = 0, y = 0, dirX = 0, dirY = 0, rotation = 0) {
        super(world, x, y, 'projectile-1', undefined, {
            collisionFilter: {
                category: null
            }
        })

        this.startX = x
        this.startY = y

        this.setRotation(rotation)
        this.setFrictionAir(0.000)
        this.setFixedRotation()
        this.setVelocity(this.speed * dirX, this.speed * dirY)

        this.scene.add.existing(this)
    }

    update(time, delta: number): void {
        this.aliveFor += delta

        if (this.aliveFor > this.ttl) {
            this.destroy(true)
            return
        }

        const distance = getDistance(this.startX, this.startY, this.x, this.y)

        if (distance >= this.maxDistance) {
            this.destroy(true)
        }
    }
}
