import Phaser from "phaser";

class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private direction: 'left' | 'right' = 'right';
  private isJump: boolean = false;
  private wasOnGround: boolean = true;
  private standardOffsetX: number = 0;
  private jumpVelocity: number = -900;

  private touchStartX: number | null = null;
  private touchStartY: number | null = null;
  private airMoveVelocityX: number = 0;
  private flickFlg: boolean = false;

  private currentDragDistance: number = 0;
  private minDistance: number = 30;
  private maxDistance: number = 300;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    const objectScale = window.innerWidth < 768 ? 0.6 : 0.8;

    this.sprite = this.scene.physics.add.sprite(x, y, 'idle_00');
    this.sprite.setCollideWorldBounds(true);
    // this.sprite.setScale(0.4);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(objectScale);
    this.sprite!.body!.setSize(this.sprite.width * 0.16, this.sprite.height * 0.78);
    this.sprite!.body!.setOffset(this.sprite.width / 2, this.sprite.height * 0.18);
    this.sprite.play('idle');

    //引っ張りアクション用
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.flickFlg = true;
      this.currentDragDistance = 0;
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.touchStartX !== null && this.touchStartY !== null) {
        const dragX = this.touchStartX - pointer.x;
        const dragY = Math.abs(this.touchStartY - pointer.y);
        this.currentDragDistance = Math.sqrt(dragX ** 2 + dragY ** 2);
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const onGround = (this.sprite.body as Phaser.Physics.Arcade.Body).onFloor();
      if (!onGround || this.isJump || this.touchStartX === null || this.touchStartY === null) return;

      const dragX = this.touchStartX - pointer.x;
      const dragY = Math.abs(this.touchStartY - pointer.y);
      const dragDistance = Math.sqrt(dragX ** 2 + dragY ** 2);
      const threshold = 1;

      if (dragDistance < threshold) return;

      const directionX = dragX / dragDistance;
      const directionY = dragY / dragDistance;

      // 距離に応じたジャンプパワー（最大900）
      const jumpPower = Phaser.Math.Clamp(dragDistance * 3, 100, 900);

      const angleRad = Math.atan2(-directionY, directionX);
      const angleDeg = Phaser.Math.RadToDeg(angleRad);
      const absAngleFromHorizontal = angleDeg;

      // 反対方向にジャンプ（マイナスをつける）
      const velocityX = directionX * jumpPower * 0.7; // 横方向は調整して抑えめに
      const velocityY = -directionY * jumpPower;

      console.log(absAngleFromHorizontal);

      if (absAngleFromHorizontal > -90) {
        this.direction = 'right';
        this.sprite.setFlipX(false);
        this.standardOffsetX = this.sprite.width / 2;
      } else {
        this.direction = 'left';
        this.sprite.setFlipX(true);
        this.standardOffsetX = this.sprite.width / 2 - 35;
      }

      if (pointer.y > this.touchStartY) {
        this.isJump = true;
        this.airMoveVelocityX = velocityX;
        this.sprite.setVelocityY(velocityY);

        this.sprite.anims.play('jump').once('animationcomplete', () => {
          if (this.isJump) {
            this.isJump = false;
            this.sprite.anims.play('idle', true);
          }
        });
      } else {
        return;
      }

      this.touchStartX = null;
      this.touchStartY = null;
    });
  }

  //画像データ読み込み
  // static preload(scene: Phaser.Scene) {
  //   for (let i = 0; i < 69; i++) {
  //     const frameKey = `idle_${i.toString().padStart(2, '0')}`;
  //     scene.load.image(frameKey, `assets/player_idle/Armature_${frameKey}.png`);
  //   }

  //   for (let i = 0; i < 25; i++) {
  //     const frameKey = `run_${i.toString().padStart(2, '0')}`;
  //     scene.load.image(frameKey, `assets/player_run/Armature_${frameKey}.png`);
  //   }

  //   for (let i = 0; i < 30; i++) {
  //     const frameKey = `jump_${i.toString().padStart(2, '0')}`;
  //     scene.load.image(frameKey, `assets/player_jump2/Armature_${frameKey}.png`);
  //   }
  // }

  //引っ張った
  public getJumpPowerPercent(): number {
    return Phaser.Math.Clamp(
      (this.currentDragDistance - this.minDistance) / (this.maxDistance - this.minDistance),
      0,
      1
    );
  }

  static preload(scene: Phaser.Scene) {
    for (let i = 0; i < 35; i++) {
      const frameKey = `idle_${i.toString().padStart(2, '0')}`;
      scene.load.image(frameKey, `assets/dot_idle/Armature_${frameKey}.png`);
    }

    for (let i = 0; i < 13; i++) {
      const frameKey = `run_${i.toString().padStart(2, '0')}`;
      scene.load.image(frameKey, `assets/dot_run/Armature_${frameKey}.png`);
    }

    for (let i = 0; i < 15; i++) {
      const frameKey = `jump_${i.toString().padStart(2, '0')}`;
      scene.load.image(frameKey, `assets/dot_jump/Armature_${frameKey}.png`);
    }
  }

  //アニメーション作成
  static createAnims(scene: Phaser.Scene) {
    scene.anims.create({
      key: 'idle',
      frames: Array.from({ length: 35 }, (_, i) => ({
        key: `idle_${i.toString().padStart(2, '0')}`
      })),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'run',
      frames: Array.from({ length: 13 }, (_, i) => ({
        key: `run_${i.toString().padStart(2, '0')}`
      })),
      frameRate: 16,
      repeat: -1,
    });

    scene.anims.create({
      key: 'jump',
      frames: Array.from({ length: 12 }, (_, i) => ({
        key: `jump_${(3 + i).toString().padStart(2, '0')}`
      })).concat([
        { key: 'jump_13' },
        { key: 'jump_13' },
        { key: 'jump_14' },
        { key: 'jump_14' },
        { key: 'jump_14' }
      ]),
      frameRate: 11,
      repeat: 0,
    });
  }

  //操作アクション
  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    spaceKey: Phaser.Input.Keyboard.Key
  ) {
    const onGround = (this.sprite.body as Phaser.Physics.Arcade.Body).onFloor();

    if (this.direction === 'right') {
      this.standardOffsetX = this.sprite.width / 2;
    } else {
      this.standardOffsetX = this.sprite.width / 2 - 35;
    }

    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-200);
      this.sprite.setFlipX(true);
      this.sprite!.body!.setOffset(this.standardOffsetX, this.sprite.height * 0.18);
      if (!this.isJump && onGround) {
        this.sprite.anims.play('run', true);
      }
      this.direction = 'left';
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(200);
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

    if (this.flickFlg && !onGround && this.isJump) {
      this.sprite.setVelocityX(this.airMoveVelocityX);
      this.sprite!.body!.setOffset(this.standardOffsetX, this.sprite.height * 0.18);
    }

    if (this.flickFlg && onGround && !this.wasOnGround) {
      this.sprite.anims.play('idle');
      this.sprite!.body!.setOffset(this.standardOffsetX, this.sprite.height * 0.18);
      this.isJump = false;
      this.airMoveVelocityX = 0;
      this.flickFlg = false;
    }
  }
}

export default Player;
