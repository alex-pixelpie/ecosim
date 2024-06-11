import {SpritesMobView} from "./SpritesMobView.ts";

enum ElfArcherAnimationState {
    Idle = 'elf-archer-idle',
    Walking = 'elf-archer-walk',
    Attacking = 'elf-archer-attack',
    Dead = 'elf-archer-dead'
}

export class ElfArcherView extends SpritesMobView {
    static initAnimations(scene: Phaser.Scene): void {
        scene.anims.create({
            key: ElfArcherAnimationState.Idle,
            frames: scene.anims.generateFrameNumbers(ElfArcherAnimationState.Idle, {start: 0, end: 9}),
            frameRate: 6,
            repeat: 1
        });

        scene.anims.create({
            key: ElfArcherAnimationState.Walking,
            frames: scene.anims.generateFrameNumbers(ElfArcherAnimationState.Walking, {start: 0, end: 7}),
            frameRate: 12,
            repeat: 1
        });

        scene.anims.create({
            key: ElfArcherAnimationState.Attacking,
            frames: scene.anims.generateFrameNumbers(ElfArcherAnimationState.Attacking, {start: 0, end: 5}),
            frameRate: 12,
            repeat: 1
        });
    }

    walkAnimName = ElfArcherAnimationState.Walking;
    attackAnimName = ElfArcherAnimationState.Attacking;
    idleAnimName = ElfArcherAnimationState.Idle;
}
    