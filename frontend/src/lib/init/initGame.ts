import { AUTO, Game, Scale, type Scene, type Types } from "phaser";
import { DeathScene } from "../scenes/deathScene";
import { EndingScene } from "../scenes/ending";
import { MainScene } from "../scenes/mainScene";
import { PauseScene } from "../scenes/pauseScene";
import { SplashScene } from "../scenes/splash";
import { StartScene } from "../scenes/startScene";

export function initGame(containerId: string) {
    const container = document.querySelector(containerId)

    if (container === null) {
        throw new Error("no container")
    }

    const config: Types.Core.GameConfig = {
        type: AUTO,
        parent: container,
        width: container.clientWidth,
        height: container.clientHeight,
        scale: {
            mode: Scale.FIT,
            width: container.clientWidth,
            height: container.clientHeight,
        },
        physics: {
            default: "matter",
            matter: {
                gravity: { y: 0, x: 0 },
                plugins: {
                    attractors: true
                }
            },
        },
        pixelArt: true,
        scene: [
            new SplashScene(),
            new StartScene(),
            new MainScene(),
            new DeathScene(),
            new PauseScene(),
            new EndingScene(),
        ],
    };

    return new Game(config)
}
