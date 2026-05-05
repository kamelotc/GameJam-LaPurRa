import * as Phaser from 'phaser';

export class Game extends Phaser.Scene
{
    private player: Phaser.Physics.Arcade.Sprite;
    private stars: Phaser.Physics.Arcade.Group;
    private sacs: Phaser.Physics.Arcade.Group;
    private bombs: Phaser.Physics.Arcade.Group;
    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private timerEvent: Phaser.Time.TimerEvent;
    private score = 0;
    private gameOver = false;
    private vies = 3;
    private timeLeft = 60;
    private scoreText: Phaser.GameObjects.Text;
    private viesText: Phaser.GameObjects.Text;
    private timerText: Phaser.GameObjects.Text;


    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');

        this.load.image('sky', 'sky.png');
        this.load.image('ground', 'platform.png');
        this.load.image('star', 'star.png');
        this.load.image('bomb', 'bomb.png');
        this.load.image('sacs', 'sac.png');
        this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create ()
    {   this.score = 0;
        this.vies = 3;
        this.timeLeft = 60;
        this.gameOver = false;
        this.add.image(400, 300, 'sky');
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(600, 725, 'ground').setScale(3).refreshBody();

        this.platforms.create(600, 300, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 120, 'ground');
        this.platforms.create(550, 500, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.setBodySize(0,40);
        this.player.setOffset(0,10);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard!.createCursorKeys();

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.getChildren().forEach(function (child) {
            const star = child as Phaser.Physics.Arcade.Sprite;
            star.setScale(0.015);

            //  Give each star a slightly different bounce
            (child as Phaser.Physics.Arcade.Sprite).setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));

        });

        this.sacs = this.physics.add.group();

        this.bombs = this.physics.add.group();

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.sacs, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
        this.physics.add.overlap(this.player, this.sacs, this.collectSac, undefined, this);
        this.physics.add.overlap(this.player, this.bombs, this.hitBomb, undefined, this);        
        
        this.viesText = this.add.text(16, 16, 'Vies: ' + this.vies, { 
            fontSize: '32px', color: '#FFF', fontFamily: '"Courier New", Courier, monospace', fontStyle: 'bold' 
        });
        
        this.scoreText = this.add.text(16, 56, 'Score: 0 / 110', { 
            fontSize: '32px', color: '#FFF', fontFamily: '"Courier New", Courier, monospace', fontStyle: 'bold' 
        });
        
        this.timerText = this.add.text(780, 16, 'Temps: ' + this.timeLeft, { 
                    fontSize: '32px', color: '#FFF', fontFamily: '"Courier New", Courier, monospace', fontStyle: 'bold' 
                }).setOrigin(1, 0);

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onTimerTick,
            callbackScope: this,
            loop: true
        });
    }

    update ()
    {
        if (this.gameOver)
        {
            return;
        }

        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-1000);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(1000);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown)
        {
            this.player.setVelocityY(-1000);
        }
        else if(this.cursors.down.isDown)
        {
            this.player.setVelocityY(1000);
        }
    }

    collectStar(object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile, object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile)
    {
        const playerSprite = object1 as Phaser.Physics.Arcade.Sprite;
        const star = object2 as Phaser.Physics.Arcade.Sprite;

        star.disableBody(true, true);

        this.score += 1;
        this.scoreText.setText('Score: ' + this.score + ' / 110');
        if (this.score >= 110) {
            this.declencherVictoire();
            return;
        }

        if (this.stars.countActive(true) === 0)
        {
            this.stars.getChildren().forEach(function (child) {
                const sprite = child as Phaser.Physics.Arcade.Sprite;
                sprite.enableBody(true, sprite.x, 0, true, true);
            });

            var x = (playerSprite.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
        }

        if (this.score % 50 === 0 && this.score > 0) {
            const positionsSacs = [150, 400, 650]; 

            for (let i = 0; i < 3; i++) {
                const positionX = positionsSacs[i];
                const sac = this.sacs.create(positionX, 0, 'sacs') as Phaser.Physics.Arcade.Sprite;
                
                sac.setScale(0.15); 
                sac.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));

                this.stars.getChildren().forEach(function (child) {
                    const etoile = child as Phaser.Physics.Arcade.Sprite;
                    if (etoile.active && Math.abs(etoile.x - positionX) < 40) {
                        etoile.disableBody(true, true);
                    }
                });
            }
        }
    }

    collectSac(_object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile, object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile)
    {
        const sac = object2 as Phaser.Physics.Arcade.Sprite;

        sac.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score + ' / 110'); 
        if (this.score >= 150) {
            this.declencherVictoire();
            return; 
        }       
    
    }

    hitBomb (_object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile, _object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile)
        {
            this.vies -= 1;
            this.viesText.setText('Vies: ' + this.vies);

            if (this.vies <= 0) {
                this.declencherGameOver();
            } else {
                this.player.setPosition(100, 450);
                this.player.setVelocity(0, 0);
            }
        }


    onTimerTick() {
        if (this.gameOver) return;

        this.timeLeft -= 1;
        this.timerText.setText('Temps: ' + this.timeLeft);

        if (this.timeLeft <= 0) {
            this.declencherGameOver();
        }
    }

    declencherVictoire() {
        this.physics.pause();
        this.player.setTint(0x00ff00);
        this.player.anims.play('turn');
        this.gameOver = true;
        
        this.timerEvent.remove();
    }

    declencherGameOver() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
        
        this.timerEvent.remove(); 
    }
}

