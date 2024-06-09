import {DisplayModule} from "../DisplayModule.ts";
import {AutoRpgDisplay} from "./AutoRpgDisplay.ts";

export class FloatingNumbersDisplay extends DisplayModule<AutoRpgDisplay> {
    display: AutoRpgDisplay;
    private availableTexts: Phaser.GameObjects.Text[] = [];
    private activeTexts: Phaser.GameObjects.Text[] = [];
    
    public init(display: AutoRpgDisplay): void {
        this.display = display;

    }
    private showFloatingDamage(damage: number, x: number, y: number): void {
        const floatingText = this.getFloatingText();
        
        floatingText.setText(`-${damage}`);
        floatingText.setPosition(x, y - 20);
        floatingText.setVisible(true);
        this.display.scene.add.tween({
            targets: floatingText,
            y: y - 120,
            alpha: 0,
            duration: 1500,
            ease: 'Cubic.easeOut',
            onComplete: this.returnFloatingText.bind(this)(floatingText)
        });
    }

    private returnFloatingText(floatingText: Phaser.GameObjects.Text) {
        return () => {
            floatingText.setVisible(false);
            floatingText.setAlpha(1);
            this.activeTexts = this.activeTexts.filter(text => text !== floatingText);
            this.availableTexts.push(floatingText);
        }
    }
    
    private getFloatingText(): Phaser.GameObjects.Text {
        const text = this.availableTexts.pop() || this.makeText(this.display);
        this.activeTexts.push(text);
        return text;
    }
    
    private makeText(display: AutoRpgDisplay): Phaser.GameObjects.Text {
        const text = display.scene.add.text(0, 0, '', {
            fontSize: '24px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setVisible(false);
        display.uiLayer.add(text);
        return text;
    }
    
    public update(_: number): void {
        this.display.mobs.forEach(mob => {
            if (mob.state.damage) {
                this.showFloatingDamage(mob.state.damage, mob.x, mob.y);
            }
        });
    }
}
