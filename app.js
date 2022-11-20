import {Application, Assets, Sprite, utils, Texture, AnimatedSprite, autoDetectRenderer, Container} from 'pixi.js';
const app = new Application();

// The application will create a canvas element for you that you
// can then insert into the DOM
(async ()=> {
    let gameMap = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 4, 1, 1, 1, 3, 0, 1, 1, 1, 4, 1, 1, 5, 3, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 9, 0, 0, 3, 0, 3, 0, 0, 0, 0, 9, 0, 3, 0],
        [1, 1, 1, 1, 5, 1, 1, 1, 3, 0, 3, 0, 8, 2, 0, 8, 0, 3, 0, 3, 0, 6, 0, 2, 0, 8, 3, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 10, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0],
        [1, 1, 1, 3, 0, 0, 0, 0, 3, 0, 5, 3, 0, 0, 0, 2, 1, 3, 0, 3, 0, 0, 0, 0, 0, 2, 3, 0],
        [3, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 1, 1, 1, 3, 0, 1, 1, 3, 0],
        [3, 0, 0, 3, 0, 0, 0, 0, 3, 0, 1, 1, 1, 11, 1, 1, 1, 3, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
        [3, 0, 0, 3, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0],
        [3, 0, 0, 1, 1, 4, 11, 1, 3, 0, 3, 0, 0, 2, 0, 0, 0, 1, 1, 4, 1, 1, 3, 0, 1, 1, 3, 0],
        [3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
        [3, 6, 0, 1, 1, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 3, 0, 0, 8, 3, 0],
        [3, 0, 9, 3, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 10, 0, 0, 3, 0, 0, 0, 0, 3, 0, 2, 0, 3, 0],
        [1, 1, 1, 3, 0, 1, 1, 1, 1, 5, 1, 1, 1, 1, 5, 1, 1, 3, 0, 0, 0, 0, 1, 1, 1, 1, 3, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]

    let scaleX = 3;
    let scaleY = 3;
    let alienScaleX = 2;
    let alienScaleY = 2;
    let animated = false;

    var containerSize = {x:document.documentElement.clientWidth - 20, y:document.documentElement.clientHeight - 20};

    var renderer = autoDetectRenderer(containerSize?.x, containerSize?.y);
    renderer.resize(containerSize.x, containerSize.y);
    document.body.appendChild(renderer.view);

    //document.body.appendChild(renderer.view);

    var stage = new Container();
    var container = new Container();

    stage.addChild(container);

    const alienImages = [
        'assets/big_demon_idle_anim_f0.png',
        'assets/big_demon_idle_anim_f1.png',
        'assets/big_demon_idle_anim_f2.png',
        'assets/big_demon_idle_anim_f3.png'
    ];

    await renderMap();
    const animatedAlienIdle = await createAnimatedSprite(alienImages);
    animatedAlienIdle.x = 0;
    animatedAlienIdle.y = 0;
    animatedAlienIdle.scale.set(alienScaleX, alienScaleY);
    container.addChild(animatedAlienIdle);

    animatedAlienIdle.play();
    renderer.render(stage);
    document.addEventListener('keydown', await movePlayer);
    requestAnimationFrame(update)

    function update() {
        // animatedSprite.position.x += 1;
        renderer.render(stage);
        requestAnimationFrame(update);
    }

    async function createAnimatedSprite(images) {
        const textureArray = []
        for (let i = 0; i < images.length; i++)
        {
            const texture = await Assets.load(images[i]);
            textureArray.push(texture);
        }
        const animatedSprite = new AnimatedSprite(textureArray);
        animatedSprite.scale.set(scaleX, scaleY);
        animatedSprite.animationSpeed = 0.08;

        return animatedSprite;
    }

    async function renderMap() {
        const floorImage = "assets/floor_1.png";
        const wallLeft = "assets/wall_left.png";
        const wallTopRight = "assets/wall_top_right.png";
        const floorSpikes = [
            'assets/floor_spikes_anim_f0.png',
            'assets/floor_spikes_anim_f1.png',
            'assets/floor_spikes_anim_f2.png',
            'assets/floor_spikes_anim_f3.png'
        ];

        gameMap.forEach((y,i) => y.forEach(async (x, j) => {
            switch(x){
                case 0: {
                    await addMapSimpleSprite(j, i, floorImage);
                    break;
                }
                case 1: {
                    await addMapSimpleSprite(j, i, wallLeft);
                    break;
                }
                case 2: {
                    const animatedSpikesFloor = await createAnimatedSprite(floorSpikes);
                    animatedSpikesFloor.x = animatedSpikesFloor.width * j;
                    console.log(`animatedSpikesFloor.width ${animatedSpikesFloor.width}`);
                    animatedSpikesFloor.y = animatedSpikesFloor.height * i;
                    animatedSpikesFloor.scale.set(scaleX, scaleY);
                    container.addChild(animatedSpikesFloor);
                    console.log(`animatedSpikesFloor.hight ${animatedSpikesFloor.height}`);
                    animatedSpikesFloor.play();
                    break;
                }
                case 3: {
                    await addMapSimpleSprite(j, i, floorImage);
                    await addMapSimpleSprite(j, i, wallTopRight, 0);
                    break;
                }
                case 4: {
                    const wall_fountain = [
                        'assets/wall_fountain_mid_red_anim_f0.png',
                        'assets/wall_fountain_mid_red_anim_f1.png',
                        'assets/wall_fountain_mid_red_anim_f2.png'
                    ];
                    const animatedSpikesFloor = await createAnimatedSprite(wall_fountain);
                    animatedSpikesFloor.x = animatedSpikesFloor.width * j;
                    console.log(animatedSpikesFloor.width);
                    animatedSpikesFloor.y = animatedSpikesFloor.height * i;
                    container.addChild(animatedSpikesFloor);
                    animatedSpikesFloor.play();
                    break;
                }
                case 5: {
                    const wall_fountain_blue = [
                        'assets/wall_fountain_basin_blue_anim_f0.png',
                        'assets/wall_fountain_basin_blue_anim_f1.png',
                        'assets/wall_fountain_basin_blue_anim_f2.png'
                    ];
                    const animatedSpikesFloor = await createAnimatedSprite(wall_fountain_blue);
                    animatedSpikesFloor.x = animatedSpikesFloor.width * j;
                    animatedSpikesFloor.y = animatedSpikesFloor.height * i;
                    container.addChild(animatedSpikesFloor);
                    animatedSpikesFloor.play();
                    break;
                }
                case 6: {
                    const wizard = [
                        'assets/wizzard_f_idle_anim_f0.png',
                        'assets/wizzard_f_idle_anim_f1.png',
                        'assets/wizzard_f_idle_anim_f2.png',
                        'assets/wizzard_f_idle_anim_f3.png',

                    ];
                    await addMapSimpleSprite(j, i, floorImage);
                    const wizardSprite = await createAnimatedSprite(wizard);
                    wizardSprite.x = 48 * j;
                    wizardSprite.y = 48 * i;
                    //wizardSprite.scale.set(alienScaleX, alienScaleY);
                    container.addChild(wizardSprite);
                    wizardSprite.play();
                    break;
                }
                case 7: {
                    const wizard = [
                        'assets/wizzard_f_idle_anim_f0.png',
                        'assets/wizzard_f_idle_anim_f1.png',
                        'assets/wizzard_f_idle_anim_f2.png',
                        'assets/wizzard_f_idle_anim_f3.png'
                    ];
                    await addMapSimpleSprite(j, i, floorImage);
                    const wizardSprite = await createAnimatedSprite(wizard);
                    wizardSprite.x = 48 * j;
                    wizardSprite.y = 48 * i;
                    //wizardSprite.scale.set(alienScaleX, alienScaleY);
                    container.addChild(wizardSprite);
                    wizardSprite.play();
                    break;
                }
                case 8: {
                    const wizard = [
                        'assets/candlestick_2_1.png',
                        'assets/candlestick_2_2.png',
                        'assets/candlestick_2_3.png',
                        'assets/candlestick_2_4.png'
                    ];
                    await addMapSimpleSprite(j, i, floorImage);
                    const wizardSprite = await createAnimatedSprite(wizard);
                    wizardSprite.x = 48 * j;
                    wizardSprite.y = 48 * i;
                    //wizardSprite.scale.set(alienScaleX, alienScaleY);
                    container.addChild(wizardSprite);
                    wizardSprite.play();
                    break;
                }
                case 9: {
                    await addMapSimpleSprite(j, i, floorImage);
                    const key = 'assets/keys_1_3.png';
                    await addMapSimpleSprite(j, i, key);
                    break;
                }
                case 10: {
                    await addMapSimpleSprite(j, i, floorImage);
                    const open_chest = 'assets/chest_open_4.png';
                    await addMapSimpleSprite(j, i, open_chest);
                    break;
                }
                case 11: {
                    //await addMapSimpleSprite(j, i, floorImage);
                    await addMapSimpleSprite(j, i, wallLeft);
                    const door_closed = 'assets/doors_leaf_closed.png';
                    const element = await addMapSimpleSprite(j, i, door_closed, 0);
                    element.scale.set(scaleX/2, scaleY/2);
                    element.x = 48 * j;
                    element.y = 48 * i;
                    break;
                }
            }
        }));
    }

    async function addMapSimpleSprite(j, i, texturePath, rotate = 0) {
        const texture = await Assets.load(texturePath);
        const element = new Sprite(texture);
        element.x = element.width * scaleX * j;
        element.angle = rotate;
        element.y = element.height * scaleY * i;
        element.scale.set(scaleX, scaleY);
        container.addChild(element);

        return element;
    }

    async function movePlayer(key, moveStep = 30) {
        if (animated === true) {
            return;
        }

        const playerRun = [
            'assets/big_demon_run_anim_f0.png',
            'assets/big_demon_run_anim_f1.png',
            'assets/big_demon_run_anim_f2.png',
            'assets/big_demon_run_anim_f3.png'
        ];

        const playerRunTextures = []
        for (let i = 0; i < playerRun.length; i++)
        {
            const texture = await Assets.load(playerRun[i]);
            playerRunTextures.push(texture);
        }

        // W Key is 87
        // Up arrow 38
        if (key.keyCode === 87 || key.keyCode === 38) {
            animatedAlienIdle.textures = playerRunTextures;
            if (animatedAlienIdle.position.y != 0) {
                animatedAlienIdle.position.y -= moveStep;
            }
            animatedAlienIdle.loop = false;
            animated = true;
            animatedAlienIdle.play();
            animatedAlienIdle.animationSpeed = 0.3;
        }
        // S Key is 83
        // Down arrow is 40
        if (key.keyCode === 83 || key.keyCode === 40) {
            animatedAlienIdle.textures = playerRunTextures;
            if (animatedAlienIdle.position.y + animatedAlienIdle.height < containerSize.y) {
                animatedAlienIdle.position.y += moveStep;
            }
            animatedAlienIdle.loop = false;
            animated = true;
            animatedAlienIdle.animationSpeed = 0.3;
            animatedAlienIdle.play();
        }
        // A Key is 65
        // Left arrow is 37
        if (key.keyCode === 65 || key.keyCode === 37) {
            animatedAlienIdle.textures = playerRunTextures;
            if (animatedAlienIdle.position.x > 0) {
                animatedAlienIdle.position.x -= moveStep;
            }
            animatedAlienIdle.loop = false;
            animated = true;
            animatedAlienIdle.animationSpeed = 0.3;
            animatedAlienIdle.play();
        }
        // D Key is 68
        // Right arrow is 39
        if (key.keyCode === 68 || key.keyCode === 39) {
            animatedAlienIdle.textures = playerRunTextures;
            if (animatedAlienIdle.position.x + animatedAlienIdle.width < containerSize.x) {
                animatedAlienIdle.position.x += moveStep;
            }
            animatedAlienIdle.loop = false;
            animated = true;
            animatedAlienIdle.animationSpeed = 0.3;
            animatedAlienIdle.play();
        }

        animatedAlienIdle.onComplete = () => {
            animated = false;
        }
    }
})();

