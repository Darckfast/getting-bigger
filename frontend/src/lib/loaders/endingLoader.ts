import type { Scene } from "phaser"

export function endingLoader(scene: Scene) {
    scene.load.image('main', '/tilesets/main.png')
    scene.load.tilemapTiledJSON('main', '/maps/main.json')

    scene.load.aseprite(
        'dialog-end',
        '/sprites/dialog-end.png',
        '/sprites/dialog-end.json'
    )

    scene.load.aseprite(
        'ego-mouth',
        '/sprites/ego-mouth.png',
        '/sprites/ego-mouth.json'
    )
}

