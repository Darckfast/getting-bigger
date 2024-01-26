export function menuLoader(scene: Scene) {
    scene.load.image(
        'JamSmall',
        '/imgs/JamSmall.png',
    )
    scene.load.aseprite(
        'esc-icon',
        '/sprites/esc-icon.png',
        '/sprites/esc-icon.json'
    )
    scene.load.aseprite(
        'sound-icon',
        '/sprites/sound-icon.png',
        '/sprites/sound-icon.json'
    )
    scene.load.aseprite(
        'slider-bar',
        '/sprites/slider-bar.png',
        '/sprites/slider-bar.json'
    )
    scene.load.aseprite(
        'slider',
        '/sprites/slider.png',
        '/sprites/slider.json'
    )
    scene.load.aseprite(
        'rain',
        '/sprites/rain.png',
        '/sprites/rain.json'
    )
    scene.load.aseprite(
        'selection-arrow',
        '/sprites/selection-arrow.png',
        '/sprites/selection-arrow.json'
    )
    scene.load.aseprite(
        'mouse-icon',
        '/sprites/mouse-icon.png',
        '/sprites/mouse-icon.json'
    )
    scene.load.aseprite(
        'keyboard-icon',
        '/sprites/keyboard-icon.png',
        '/sprites/keyboard-icon.json'
    )
}
