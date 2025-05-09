import Phaser from "phaser";
import Player from "../characters/Player";
import GroundBlock from "../maps/GroundBlock";

class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private player!: Player;
  private platform!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    Player.preload(this);
    this.load.image('ground', 'assets/platform.png');
    this.load.atlas('maps', 'assets/maps/spritesheet.png', 'assets/maps/spritesheet.json');
  }

  create() {
    this.cursors = this.input!.keyboard!.createCursorKeys();
    this.spaceKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    //ステージの広さ
    const mapWidth = 1280;
    const mapHeight = 4000;

    this.platform = this.physics.add.staticGroup();

    //地面の生成
    for (let x = 0; x < mapWidth; x += 64) {
      this.platform.create(x, 4000, 'maps', 'terrain_grass_block_top').setScale(1, 1).setOrigin(0, 1).refreshBody();
    }
    // platform.create(640, 800, 'ground').setScale(4.0, 1).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(400, 3850, 'ground').setScale(0.3, 0.8).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(680, 3700, 'ground').setScale(0.3, 0.8).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(1000, 3650, 'ground').setScale(0.2, 0.8).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(1200, 3550, 'ground').setScale(0.2, 0.8).setOrigin(0.5, 1).refreshBody();
    new GroundBlock(this, this.platform, 360, 3800, 3, 'grass');
    new GroundBlock(this, this.platform, 640, 3650, 3, 'grass');
    new GroundBlock(this, this.platform, 950, 3600, 2, 'grass');
    new GroundBlock(this, this.platform, 1150, 3500, 2, 'grass');

    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight); //カメラの移動範囲
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight) //物理演算の範囲

    Player.createAnims(this);

    this.player = new Player(this, 100, 3950);
    this.physics.add.collider(this.player.sprite, this.platform);

    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08); //カメラの追従設定

    ////////////////////////// デバッグモード //////////////////////////
    this.physics.world.createDebugGraphic();
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowVelocity = true;
    this.physics.world.drawDebug = true;
  }

  update() {
    this.player.update(this.cursors, this.spaceKey);

    if (this.escKey.isDown) {
      this.scene.restart();
    }
  }
}

export default MainScene;
