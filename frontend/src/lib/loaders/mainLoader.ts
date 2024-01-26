export function mainLoader(scene: Scene) {
    scene.load.image('main', '/tilesets/main.png')
    scene.load.tilemapTiledJSON('main', '/maps/main.json')

    scene.load.aseprite(
        'rain',
        '/sprites/rain.png',
        '/sprites/rain.json'
    )
    scene.load.aseprite(
        'death',
        '/sprites/death.png',
        '/sprites/death.json'
    )
    scene.load.aseprite(
        'dialog-end',
        '/sprites/dialog-end.png',
        '/sprites/dialog-end.json'
    )
    scene.load.aseprite(
        'portal',
        '/sprites/portal.png',
        '/sprites/portal.json'
    )
    scene.load.aseprite(
        'projectile-1',
        '/sprites/projectile-1.png',
        '/sprites/projectile-1.json'
    )
    scene.load.aseprite(
        'enemy',
        '/sprites/enemy.png',
        '/sprites/enemy.json'
    )
    scene.load.aseprite(
        'essence',
        '/sprites/essence.png',
        '/sprites/essence.json'
    )
}
