import {SpritesMobView} from "./SpritesMobView.ts";

enum SkeletonAnimationState {
    Idle = 'skeleton-idle',
    Walking = 'skeleton-walk',
    Attacking = 'skeleton-attack',
    Dead = 'skeleton-dead'
}

export class SkeletonView extends SpritesMobView {
    static initAnimations(scene: Phaser.Scene): void {
        scene.anims.create({
            key: SkeletonAnimationState.Idle,
            frames: scene.anims.generateFrameNumbers(SkeletonAnimationState.Idle, {start: 0, end: 3}),
            frameRate: 6,
            repeat: 1
        });

        scene.anims.create({
            key: SkeletonAnimationState.Walking,
            frames: scene.anims.generateFrameNumbers(SkeletonAnimationState.Walking, {start: 0, end: 3}),
            frameRate: 12,
            repeat: 1
        });

        scene.anims.create({
            key: SkeletonAnimationState.Attacking,
            frames: scene.anims.generateFrameNumbers(SkeletonAnimationState.Attacking, {start: 0, end: 7}),
            frameRate: 12,
            repeat: 1
        });
    }
    
    walkAnimName = SkeletonAnimationState.Walking;
    attackAnimName = SkeletonAnimationState.Attacking;
    idleAnimName = SkeletonAnimationState.Idle;
}
    