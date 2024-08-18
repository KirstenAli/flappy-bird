const config = {
    type: Phaser.AUTO,
    width: 288,
    height: 512,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let bird;
let pipes;
let score = 0;
let scoreText;
let gameOver = false;
let background;
let flapSound;
let hitSound;
let pointSound;
const pipeGap = 150;

function preload() {
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('background', 'assets/background.png');
    this.load.audio('flapSound', 'assets/wing.ogg');
    this.load.audio('hit', 'assets/hit.ogg');
    this.load.audio('point', 'assets/point.ogg');
}

function create() {
    background = this.add.tileSprite(config.width / 2, config.height / 2, config.width, config.height, 'background');

    bird = this.physics.add.sprite(100, config.height / 2, 'bird');
    bird.setCollideWorldBounds(true);

    pipes = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    this.input.keyboard.on('keydown-SPACE', flap, this);

    flapSound = this.sound.add('flapSound');
    hitSound = this.sound.add('hit');
    pointSound = this.sound.add('point');

    this.time.addEvent({
        delay: 1500,
        callback: addRowOfPipes,
        callbackScope: this,
        loop: true
    });

    this.physics.add.collider(bird, pipes, hitPipe, null, this);
}

function flap() {
    if (!gameOver) {
        bird.setVelocityY(-350);
        flapSound.play();
    }
}

function addPipe(x, y, flipY) {
    let pipe = pipes.create(x, y, 'pipe');
    pipe.setOrigin(0, 0);

    if(flipY){
        pipe.setFlipY(true);
    }

    pipe.body.allowGravity = false;
    pipe.body.immovable = true;
    pipe.setVelocityX(-200);
}

function addRowOfPipes() {
    const pipeHolePosition = Phaser.Math.Between(config.height/4, 300);

    addPipe(config.width, pipeHolePosition - 320, true);
    addPipe(config.width, pipeHolePosition + pipeGap);

    let triggerZone = this.physics.add.sprite(config.width, pipeHolePosition, null);
    initTriggerZone(triggerZone);
    this.physics.add.overlap(bird, triggerZone, scorePoint, null, this);
}

function initTriggerZone(triggerZone){
    triggerZone.displayHeight = pipeGap;
    triggerZone.displayWidth = 1;
    triggerZone.setOrigin(0, 0);
    triggerZone.setVisible(false);
    triggerZone.body.allowGravity = false;
    triggerZone.setVelocityX(-200);
}

function scorePoint(bird, triggerZone){
    score++;
    scoreText.setText('Score: ' + score);

    triggerZone.destroy();
    pointSound.play();
}

function hitPipe() {
    hitSound.play();
    this.physics.pause();
    bird.setTint(0xff0000);
    bird.anims.stop();
    gameOver = true;
}

function update() {
    background.tilePositionX += 1;

    pipes.getChildren().forEach(pipe => {
        if (pipe.x < -pipe.width) {
            pipe.destroy();
        }
    });
}
