<script lang="ts">
    import { onMount } from "svelte";
    import { initGame } from "./lib/init/initGame";
    import { configs } from "./lib/stores/configs";
    import { controls } from "./lib/stores/controls";

    let gameContainer: HTMLElement;

    onMount(() => {
        initGame("#game-container");
    });

    function invokeCallback(
        searchKey: string,
        callbacks: Array<{ key: string; callback: () => any }>,
    ) {
        for (let i = 0; i < callbacks.length; i++) {
            const { key, callback } = callbacks[i];

            if (key === searchKey) {
                callback();
            }
        }
    }

    function onKey(e: KeyboardEvent) {
        if ($controls.locked) return;

        e.preventDefault();
        // console.log(controls, $controls);
        // $controls.on("test", () => {
            // console.log("worked");
        // });

        controls.update((state) => {
            if (e.type === "keyup") {
                state.pressingStart = 0;
                state.pressingFor = 0;

                if (e.code === $configs.keyAction) {
                    state.isActionPress = false;
                } else if (e.code === $configs.keyReturn) {
                    state.isReturnPress = false;
                } else if (e.code === $configs.keyUp) {
                    state.isUpPress = false;
                } else if (e.code === $configs.keyDown) {
                    state.isDownPress = false;
                } else if (e.code === $configs.keyLeft) {
                    state.isLeftPress = false;
                } else if (e.code === $configs.keyRight) {
                    state.isRightPress = false;
                } else if (e.code === $configs.keyEscape) {
                    state.isEscapePress = false;
                }
            } else if (e.type === "keydown") {
                const currentTime = new Date().getTime();

                if (state.pressingStart === 0) {
                    state.pressingStart = currentTime;
                } else {
                    state.pressingFor = currentTime - $controls.pressingStart;
                }

                if (e.code === $configs.keyAction) {
                    if (!state.isActionPress) {
                        invokeCallback("action", state.callbacks);
                    }
                    state.isActionPress = true;
                } else if (e.code === $configs.keyUp) {
                    if (!state.isUpPress) {
                        invokeCallback("up", state.callbacks);
                    }

                    state.isUpPress = true;
                } else if (e.code === $configs.keyDown) {
                    if (!state.isDownPress) {
                        invokeCallback("down", state.callbacks);
                    }
                    state.isDownPress = true;
                } else if (e.code === $configs.keyLeft) {
                    if (!state.isLeftPress) {
                        invokeCallback("left", state.callbacks);
                    }
                    state.isLeftPress = true;
                } else if (e.code === $configs.keyRight) {
                    if (!state.isRightPress) {
                        invokeCallback("right", state.callbacks);
                    }
                    state.isRightPress = true;
                } else if (e.code === $configs.keyEscape) {
                    if (!state.isEscapePress) {
                        invokeCallback("escape", state.callbacks);
                    }

                    state.isEscapePress = true;
                }
            }

            const allKeys =
                state.isActionPress +
                state.isLeftPress +
                state.isUpPress +
                state.isRightPress +
                state.isDownPress +
                state.isEscapePress;

            state.isMultiKey = allKeys > 1;
            state.isKeyBeingPress = allKeys > 0;

            return state;
        });
    }
</script>

<svelte:window on:keyup={onKey} on:keydown={onKey} />

<div bind:this={gameContainer} id="game-container" />

<style>
    #game-container {
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
</style>
