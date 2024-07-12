import {SpritesMobView} from "./SpritesMobView.ts";

enum BlueKingAnimationState {
    Idle = 'blue-king-idle',
    Walking = 'blue-king-walk',
    Attacking = 'blue-king-attack',
    Dead = 'blue-king-dead'
}

export class BlueKingView extends SpritesMobView {
    static initAnimations(scene: Phaser.Scene): void {
        scene.anims.create({
            key: BlueKingAnimationState.Idle,
            frames: scene.anims.generateFrameNumbers(BlueKingAnimationState.Idle, {start: 0, end: 7}),
            frameRate: 12,
            repeat: 1
        });

        scene.anims.create({
            key: BlueKingAnimationState.Walking,
            frames: scene.anims.generateFrameNumbers(BlueKingAnimationState.Walking, {start: 0, end: 7}),
            frameRate: 12,
            repeat: 1
        });

        scene.anims.create({
            key: BlueKingAnimationState.Attacking,
            frames: scene.anims.generateFrameNumbers(BlueKingAnimationState.Attacking, {start: 0, end: 3}),
            frameRate: 12,
            repeat: 1
        });
    }
    
    walkAnimName = BlueKingAnimationState.Walking;
    attackAnimName = BlueKingAnimationState.Attacking;
    idleAnimName = BlueKingAnimationState.Idle;
}
    