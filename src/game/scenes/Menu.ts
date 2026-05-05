import * as Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(512, 150, 'LaPuRa', {
            fontSize: '64px',
            color: '#FFF',
            fontFamily: '"Courier New", Courier, monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);


        this.add.text(512, 400, [ 
            "COMMENT JOUER :",
            "",
            " - Utilisez les flèches pour vous déplacer.",
            " - Récoltez les pièces (1 pt) et les sacs (10 pts).",
            " - Évitez les bombes, vous n'avez que 3 hp",
            " - Mission : Atteignez 100 points en 60s."
        ], {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: '"Courier New", Courier, monospace',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        this.add.text(512, 650, 'Appuyez sur ESPACE pour jouer', {
            fontSize: '32px',
            color: '#ff0000', 
            fontFamily: '"Courier New", Courier, monospace'
        }).setOrigin(0.5);

        this.input.keyboard!.once('keydown-SPACE', () => {
            this.scene.start('Game');
        });
    }
}