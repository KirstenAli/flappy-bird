const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

function preload() {
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('background', 'assets/background.png');
}

function create() {
    background = this.add.tileSprite(400, 300, 800, 600, 'background');

    bird = this.physics.add.sprite(100, 300, 'bird');
    bird.setCollideWorldBounds(true);

    pipes = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    this.input.keyboard.on('keydown-SPACE', flap, this);

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
    }
}

function addPipe(x, y) {
    let pipe = pipes.create(x, y, 'pipe');
    pipe.setVelocityX(-200);
    pipe.setOrigin(0, 0);
    pipe.body.allowGravity = false;
}

function addRowOfPipes() {
    const pipeGap = 150;
    const pipeHolePosition = Phaser.Math.Between(100, 450);

    // Create the top pipe
    addPipe(800, pipeHolePosition - 320);

    // Create the bottom pipe
    addPipe(800, pipeHolePosition + pipeGap);

    score++;
    scoreText.setText('Score: ' + score);
}

function hitPipe() {
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
