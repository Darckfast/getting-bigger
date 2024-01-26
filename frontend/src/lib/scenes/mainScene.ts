import { Scene } from "phaser";
import { mainLoader } from "../loaders/mainLoader";
import { Enemy } from "../objects/enemy";
import { Essence } from "../objects/essence";
import { Player } from "../objects/player";
import { Projectile } from "../objects/projectile";
import { controls, type Controls } from "../stores/controls";
import { Howl } from 'howler';
import { DialogBubble } from "../objects/dialog";
import { spawnDialogs, spawnDialogs1 } from "./dialogText";
import { randomIntFromInterval } from "./startScene";

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export class MainScene extends Scene {
    private tilesetName = 'main'
    private allObjects: Phaser.GameObjects[] = []
    private controls: Controls
    private unsubs: Unsubscriber[] = []
    private player: Player
    private map: Phaser.Tilemaps.Tilemap
    private mainLayer: Phaser.Tilemaps.TilemapLayer

    private onPauseRef: any
    private spawnSfx: Howl
    private popSfx: Howl
    private rainSfx: Howl
    private tilesBuffer = 3
    private xTiles = 0
    private yTiles = 0
    private tilesetSize = 32
    private dialog: DialogBubble
    private currentDialog = 0
    private spawnedEnemies = 0
    private scoreText: Phaser.GameObjects.Text
    private lastShootFiredAt = 0
    private lastEnemySpawn = 0
    private introFinished = false
    private qoutaReached = false
    private spawnInterval = 2000
    private portal: Phaser.Physics.Matter.Sprite | undefined
    private rainDropped = 0
    private timeElapsed = 0
    private essencesGoal = 100

    public dead = false

    constructor() {
        super('main')

        const unsub = controls.subscribe(function(ctrl) {
            this.controls = ctrl
        }.bind(this))

        this.unsubs.push(unsub)

    }

    preload() {
        mainLoader(this)

        if (!this.rainSfx) {
            this.rainSfx = new Howl({
                src: '/sfx/rain.ogg',
                preload: true,
                loop: true,
                autoplay: true,
            })
        }

        this.spawnSfx = new Howl({
            src: '/sfx/spawn.ogg',
            preload: true
        })

        this.popSfx = new Howl({
            src: '/sfx/pop.ogg',
            preload: true
        })
    }

    init({ dead }) {
        this.dead = dead
    }

    create() {
        this.spawnInterval = 2000
        this.spawnedEnemies = 0
        this.allObjects = []
        this.currentDialog = 0
        this.portal = undefined
        this.qoutaReached = false
        this.introFinished = false
        this.lastEnemySpawn = 0
        this.lastShootFiredAt = 0

        this.dialog = new DialogBubble(this)
        this.allObjects.push(this.dialog)
        this.controls.on('action', this.nextDialog.bind(this))

        const mapTiles = []
        const { displayWidth, displayHeight } = this.cameras.main

        this.xTiles = (Math.ceil(displayWidth / 32) + this.tilesBuffer) * 5
        this.yTiles = (Math.ceil(displayHeight / 32) + this.tilesBuffer) * 5

        if (this.xTiles > this.yTiles) {
            this.yTiles = this.xTiles
        }

        if (this.xTiles < this.yTiles) {
            this.xTiles = this.yTiles
        }

        for (let i = 0; i < this.xTiles; i++) {
            for (let k = 0; k < this.yTiles; k++) {
                mapTiles[k] ||= []
                mapTiles[k][i] = 1
            }
        }

        this.map
            = this.make.tilemap({ data: mapTiles, tileWidth: 32, tileHeight: 32 })

        const tileset = this.map.addTilesetImage(this.tilesetName, this.tilesetName)

        this.mainLayer = this.map.createLayer(0, tileset, -32 * this.tilesBuffer, -32 * this.tilesBuffer)

        const x = (this.xTiles * 32) / 2
        const y = (this.yTiles * 32) / 2

        this.player = new Player(this, this.controls)
        this.allObjects.push(this.player)
        this.player.setPosition(x, y)

        this.spawnSfx.play()
        this.time.delayedCall(1800, () => {
            this.tweens.add({
                targets: this.player,
                size: 10,
                duration: 100,
                onComplete: function() {
                    this.introFinished = true
                    this.nextDialog(
                    )
                }.bind(this)
            })
        }, this)

        this.cameras.main.startFollow(this.player, true, undefined, undefined,
            undefined, this.player.radius)

        this.events.on('playerDeath', this.showDeathScreen, this)

        this.events.once('destroy', () => {
            this.destroy()
        }, this)

        this.events.on('resume', () => {
            this.onPauseRef = this.callPause.bind(this)
            this.controls.on('escape', this.onPauseRef)
        }, this)

        this.onPauseRef = this.callPause.bind(this)
        this.controls.on('escape', this.onPauseRef)

        this.scoreText = this.add.text(0, 0, '', {
            fontFamily: 'Pixelify Sans',
            fontSize: 40,
            color: '#ffffff',
            align: 'center',
        })

        this.scoreText.setScrollFactor(0)
        this.scoreText.setPosition(16, 16)

        const offset = Math.ceil(displayWidth / 32) * 64

        const border = this.add.graphics()

        border.lineStyle(10, 0xec3e3e, 0.8)
        border.strokeRect(offset, offset, offset, offset)
    }

    nextDialog() {
        if (!this.introFinished) return
        if (this.currentDialog !== 0 && this.dialog.isClose) return

        if (!this.dialog.isDone) {
            this.dialog.skip(true)
            return
        }

        this.dialog.skip(false)

        let nextText = spawnDialogs[this.currentDialog]

        if (this.dead) {
            nextText = spawnDialogs1[this.currentDialog]
        }

        if (nextText) {
            this.dialog.say(nextText[0], nextText[1])
            this.currentDialog += 1
        } else {
            this.dialog.close()
            this.player.isReady = true
            this.scoreText.setText('000/100')
        }
    }

    callPause() {
        this.popSfx.stop()
        this.spawnSfx.stop()
        this.scene.pause()
        this.scene.launch('pause')
        this.controls.off('escape', this.onPauseRef)
    }

    stillHaveEnemies() {
        for (let i = 0; i < this.allObjects.length; i++) {
            if (this.allObjects[i] instanceof Enemy) {
                return true
            }
        }
        return false
    }

    showDeathScreen(player: Player) {
        this.scene.launch('death')
        this.scene.pause('main')
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
            = this.matter.add.sprite(finalX, topY, 'rain', undefined,
                { collisionFilter: { category: null } })

        rainDrop.setVelocityY(5)
        rainDrop.setVelocityX(-1)
        rainDrop.setFrictionAir(0)
        rainDrop.setScale(2)
        rainDrop.anims.createFromAseprite('rain')

        rainDrop.play('default')
        rainDrop.isRain = true
        rainDrop.ignoreAttractor = true

        this.allObjects.push(rainDrop)
        this.rainDropped += 1
    }

    destroy() {
        for (let i = 0; i < this.unsubs.length; i++) {
            this.unsubs[i]()
        }

        this.events.off('playerDeath', this.showDeathScreen)
        this.matter.world.off('collisionstart', this.player.checkCollision)
        this.rainSfx.stop()
        this.controls.off()
    }

    spawnEnemy() {
        if (this.spawnedEnemies === 100) return
        if (this.qoutaReached) return
        if (!this.player.isReady) return

        if (this.lastEnemySpawn < 2000) return

        this.lastEnemySpawn = 0

        const { displayHeight, displayWidth } = this.cameras.main

        const offset = Math.ceil(displayWidth / 32) * 64
        let isTooClose = false
        let randX = 0
        let randY = 0

        while (!isTooClose) {
            randX = randomIntFromInterval(offset, offset * 2)
            randY = randomIntFromInterval(offset, offset * 2)
            const xSqrt = Math.pow(randX - this.player.x, 2)
            const ySqrt = Math.pow(randY - this.player.y, 2)
            const distance = Math.sqrt(xSqrt + ySqrt)

            isTooClose = distance > 100
        }

        const enemy = new Enemy(this.matter.world, randX, randY)
        this.spawnedEnemies += 1

        this.allObjects.push(enemy)
        this.spawnInterval -= this.spawnInterval * (this.spawnedEnemies / 200)
    }

    shoot() {
        if (this.qoutaReached && !this.stillHaveEnemies()) return
        if (!this.player.isReady) return
        if (this.lastShootFiredAt < 1000) return
        this.lastShootFiredAt = 0

        const direction = Math.atan2(
            this.input.mousePointer.worldY - this.player.y,
            this.input.mousePointer.worldX - this.player.x,
        )

        const dirX = Math.cos(direction) * 0.5
        const dirY = Math.sin(direction) * 0.5

        const projectile = new Projectile(
            this.matter.world,
            this.player.x,
            this.player.y,
            dirX,
            dirY,
            direction,
        )

        this.allObjects.push(projectile)
    }

    isInRange(x, y) {
        const { displayWidth } = this.cameras.main

        const offset = Math.ceil(displayWidth / 32) * 64

        if (x > offset * 2) {
            return false
        }

        if (y > offset * 2) {
            return false
        }

        if (x < offset) {
            return false
        }

        if (y < offset) {
            return false
        }

        return true
    }
    extendMap() {
        const { displayWidth } = this.cameras.main

        const offset = Math.ceil(displayWidth / 32) * 64

        if (this.player.x > offset * 2) {
            this.player.x = offset
        }

        if (this.player.y > offset * 2) {
            this.player.y = offset
        }

        if (this.player.x < offset) {
            this.player.x = offset * 2
        }

        if (this.player.y < offset) {
            this.player.y = offset * 2
        }
    }

    spawnPortal() {
        const portalOffset = 120

        let foundBestSpot = false

        let portalX = 0, portalY = 0

        portalX = this.player.x - portalOffset
        portalY = this.player.y - portalOffset

        foundBestSpot = this.isInRange(portalX, portalY)

        if (!foundBestSpot) {
            portalX = this.player.x + portalOffset
            portalY = this.player.y - portalOffset

            foundBestSpot = this.isInRange(portalX, portalY)
        }

        if (!foundBestSpot) {
            portalX = this.player.x + portalOffset
            portalY = this.player.y + portalOffset

            foundBestSpot = this.isInRange(portalX, portalY)
        }

        if (!foundBestSpot) {
            portalX = this.player.x - portalOffset
            portalY = this.player.y + portalOffset

            foundBestSpot = this.isInRange(portalX, portalY)
        }

        this.portal = this.matter.add.sprite(portalX - 10, portalY - 10, 'portal', undefined, {
            collisionFilter: {
                category: null
            }
        }).setScale(2)

        this.portal.ignoreAttractor = true
        this.portal.anims.createFromAseprite('portal')
        this.portal.play({ key: 'default', repeat: -1 })

        this.allObjects.push(this.portal)
    }

    update(time: number, delta: number): void {
        this.timeElapsed += delta
        this.extendMap()

        const projectiles = []
        const enemies = []
        const essences = []

        for (let i = 0; i < this.allObjects.length; i++) {
            if (!this.allObjects[i].scene) {
                this.allObjects.splice(i, 1)
                continue
            }

            if (this.allObjects[i] instanceof Projectile) {
                projectiles.push(this.allObjects[i].body)
            }

            if (this.allObjects[i] instanceof Enemy) {
                enemies.push(this.allObjects[i].body)
            }

            if (this.allObjects[i] instanceof Essence) {
                essences.push(this.allObjects[i].body)
            }

            const object = this.allObjects[i]
            object.update(time, delta)

            if (!object.isRain) continue

            const result = this.isInScreen(object.x, object.y)

            if (!result) {
                this.rainDropped -= 1
                object.destroy(true)
                this.allObjects.splice(i, 1)
            } else if (!object.isDone) {
                const shouldPlay = Math.floor(Math.random() * 100, 0) > 98

                if (shouldPlay) {
                    object.isDone = true
                    object.setVelocity(0)
                    object.play('full')
                    object.once('animationcomplete', () => {
                        object.destroy(true)
                        this.rainDropped -= 1
                    }, this)
                }
            }
        }

        if (this.portal) {
            this.matter.overlap(this.player.body, this.portal.body, (bodyA, bodyB) => {
                this.portal = undefined
                this.controls.off()
                this.cameras.main.fadeOut(1000)

                this.time.delayedCall(3000, () => {
                    this.scene.stop()
                    this.scene.start("ending")
                }, this)
            }, undefined, this)
        }

        this.matter.overlap(this.player.body, essences, (bodyA, bodyB) => {
            if (!bodyA.gameObject || !bodyB.gameObject) return

            const { player, essence }
                = this.getInstance(bodyA, bodyB)

            if (essence && player && !essence.isCollected) {
                this.popSfx.play()
                essence.isCollected = true
                essence.destroy(true)
                player.size += .5
                player.score += 1
                player.fillCircle(0, 0, player.size)
                player.increaseSize()

                const scoreLength = player.score.toString().length

                const scoreString = `${'0'.repeat(3 - scoreLength)}${player.score}/100`

                this.scoreText.setText(scoreString)

                if (player.score === this.essencesGoal) {
                    this.qoutaReached = true
                    this.spawnPortal()
                }
            }
        }, undefined, this)

        this.matter.overlap(this.player.body, enemies, (bodyA, bodyB) => {
            if (!bodyA.gameObject || !bodyB.gameObject) return

            const { player, enemy }
                = this.getInstance(bodyA, bodyB)

            if (enemy && player && !enemy.isDead) {
                enemy.kill()
                player.changeHealth(-1)
            }
        }, undefined, this)

        this.matter.overlap(enemies, projectiles, (bodyA, bodyB) => {
            if (!bodyA.gameObject || !bodyB.gameObject) return

            const { enemy, projectile }
                = this.getInstance(bodyA, bodyB)

            if (projectile && enemy) {
                if (projectile.enemiesHitten.includes(enemy)) return
                if (enemy.isDead) return

                const bX = enemy.x
                const bY = enemy.y

                enemy.dealDamage()
                projectile.enemiesHitten.push(enemy)

                if (enemy.isDead && !enemy.hasDroppedEssence) {
                    enemy.hasDroppedEssence = true
                    const essence = new Essence(this.matter.world, bX, bY)
                    this.allObjects.push(essence)
                }
            }
        }, undefined, this)

        this.lastEnemySpawn += delta
        this.lastShootFiredAt += delta

        this.spawnEnemy()
        this.shoot()
        this.spawnRain()
    }


    isInScreen(x, y) {
        const { displayHeight, displayWidth } = this.cameras.main
        const { x: topX, y: topY } = this.cameras.main.getWorldPoint(0, 0)
        const { x: botX, y: botY }
            = this.cameras.main.getWorldPoint(displayWidth, displayHeight)

        return (x >= topX && x <= botX) || (y >= topY && y <= botY)
    }

    getInstance(bodyA, bodyB) {
        let player: Player
        let projectile: Projectile
        let enemy: Enemy
        let essence: Essence

        if (bodyA.gameObject instanceof Player) {
            player = bodyA.gameObject
        }

        if (bodyB.gameObject instanceof Player) {
            player = bodyB.gameObject
        }

        if (bodyB.gameObject instanceof Essence) {
            essence = bodyB.gameObject
        }

        if (bodyA.gameObject instanceof Essence) {
            essence = bodyA.gameObject
        }

        if (bodyB.gameObject instanceof Enemy) {
            enemy = bodyB.gameObject
        }

        if (bodyA.gameObject instanceof Enemy) {
            enemy = bodyA.gameObject

        }
        if (bodyB.gameObject instanceof Projectile) {
            projectile = bodyB.gameObject
        }

        if (bodyA.gameObject instanceof Projectile) {
            projectile = bodyA.gameObject
        }

        return {
            enemy, projectile, player, essence
        }
    }
}
