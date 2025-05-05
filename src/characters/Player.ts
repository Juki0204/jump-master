import Phaser from "phaser";

class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private direction: 'left' | 'right' = 'right';
  private isJump: boolean = false;
  private wasOnGround: boolean = true;
  private standardOffsetX: number = 0;
  private jumpVelocity: number = -800;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.sprite = this.scene.physics.add.sprite(x, y, 'jump_00');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.5);
    this.sprite.setOrigin(0.5, 1);
    this.sprite!.body!.setSize(this.sprite.width * 0.16, this.sprite.height * 0.78);
    this.sprite!.body!.setOffset(this.sprite.width / 2, this.sprite.height * 0.18);
    this.sprite.play('idle');
  }

  //画像データ読み込み
  static preload(scene: Phaser.Scene) {
    for (let i = 0; i < 69; i++) {
      const frameKey = `idle_${i.toString().padStart(2, '0')}`;
      scene.load.image(frameKey, `assets/player_idle/Armature_${frameKey}.png`);
    }

    for (let i = 0; i < 25; i++) {
      const frameKey = `run_${i.toString().padStart(2, '0')}`;
      scene.load.image(frameKey, `assets/player_run/Armature_${frameKey}.png`);
    }

    for (let i = 0; i < 30; i++) {
      const frameKey = `jump_${i.toString().padStart(2, '0')}`;
      scene.load.image(frameKey, `assets/player_jump2/Armature_${frameKey}.png`);
    }
  }

  //アニメーション作成
  static createAnims(scene: Phaser.Scene) {
    scene.anims.create({
      key: 'idle',
      frames: Array.from({ length: 69 }, (_, i) => ({
        key: `idle_${i.toString().padStart(2, '0')}`
      })),
      frameRate: 16,
      repeat: -1,
    });

    scene.anims.create({
      key: 'run',
      frames: Array.from({ length: 25 }, (_, i) => ({
        key: `run_${i.toString().padStart(2, '0')}`
      })),
      frameRate: 32,
      repeat: -1,
    });

    scene.anims.create({
      key: 'jump',
      frames: Array.from({ length: 24 }, (_, i) => ({
        key: `jump_${(6 + i).toString().padStart(2, '0')}`
      })).concat([
        { key: 'jump_28' },
        { key: 'jump_28' },
        { key: 'jump_29' },
        { key: 'jump_29' },
        { key: 'jump_29' }
      ]),
      frameRate: 22,
      repeat: 0,
    });
  }

  //操作アクション
  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, spaceKey: Phaser.Input.Keyboard.Key) {
    const onGround = (this.sprite.body as Phaser.Physics.Arcade.Body).onFloor();

    if (this.direction === 'right') {
      this.standardOffsetX = this.sprite.width / 2;
    } else {
      this.standardOffsetX = this.sprite.width / 2 - 65;
    }

    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-300);
      this.sprite.setFlipX(true);
      this.sprite!.body!.setOffset(this.standardOffsetX, this.sprite.height * 0.18);
      if (!this.isJump && onGround) {
        this.sprite.anims.play('run', true);
      }
      this.direction = 'left';
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(300);
      this.sprite.setFlipX(false);
      this.sprite!.body!.setOffset(this.standardOffsetX, this.sprite.height * 0.18);
      if (!this.isJump && onGround) {
        this.sprite.anims.play('run', true);
      }
      this.direction = 'right';
    } else {
      this.sprite.setVelocityX(0);
      if (!this.isJump && onGround) {
        this.sprite.anims.play('idle', true);
      }
    }

    if (onGround && !this.wasOnGround) {
      this.sprite.anims.play('idle');
      this.sprite!.body!.setOffset(this.standardOffsetX, this.sprite.height * 0.18);
      this.isJump = false;
    }

    if (spaceKey.isDown && onGround && !this.isJump) {
      this.isJump = true;
      this.sprite.setVelocityY(this.jumpVelocity);
      this.sprite.anims.play('jump').once('animationcomplete', () => {
        if (this.isJump) {
          this.isJump = false;
          this.sprite.anims.play('idle', true);
        }
      });
    }

    this.wasOnGround = onGround;
  }
}

export default Player;
