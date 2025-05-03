import Phaser from "phaser";
import Player from "../characters/Player";

class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private player!: Player;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    Player.preload(this);
    this.load.image('ground', 'assets/platform.png');
  }

  create() {
    this.cursors = this.input!.keyboard!.createCursorKeys();
    this.spaceKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const mapWidth = 3000;
    const mapHeight = 800;

    let platform = this.physics.add.staticGroup();
    for (let x = 0; x < mapWidth; x += 400) {
      platform.create(x, 800, 'ground').setScale(4.0, 1).setOrigin(0, 1).refreshBody();
    }
    // platform.create(640, 800, 'ground').setScale(4.0, 1).setOrigin(0.5, 1).refreshBody();
    platform.create(400, 650, 'ground').setScale(0.3, 0.8).setOrigin(0.5, 1).refreshBody();
    platform.create(700, 500, 'ground').setScale(0.3, 0.8).setOrigin(0.5, 1).refreshBody();
    platform.create(1000, 450, 'ground').setScale(0.2, 0.8).setOrigin(0.5, 1).refreshBody();
    platform.create(1300, 450, 'ground').setScale(0.2, 0.8).setOrigin(0.5, 1).refreshBody();

    for (let x = 1600; x < mapWidth; x += 300) {
      platform.create(x, 500, 'ground').setScale(0.1, 0.8).setOrigin(0.5, 1).refreshBody();
    }


    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight); //カメラの移動範囲
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight) //物理演算の範囲

    Player.createAnims(this);

    this.player = new Player(this, 100, 750);
    this.physics.add.collider(this.player.sprite, platform);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08); //カメラの追従設定

    this.physics.world.createDebugGraphic();
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowVelocity = true;
    this.physics.world.drawDebug = true;
  }

  update() {
    this.player.update(this.cursors, this.spaceKey);
  }
}

export default MainScene;
