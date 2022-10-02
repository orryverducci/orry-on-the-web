import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets: string[] = ["background"];

    declare readonly backgroundTarget: HTMLCanvasElement;
    cancelAnimation!: boolean;
    canvasContext!: CanvasRenderingContext2D | null;
    frameInterval!: number;
    declare readonly hasBackgroundTarget: boolean;
    then!: number;

    connect(): void {
        console.log("hi");

        if (!this.hasBackgroundTarget) {
            return;
        }

        this.cancelAnimation = false;
        this.canvasContext = this.backgroundTarget.getContext("2d");
        this.frameInterval = 1000 / 30;
        this.then = 0;

        this.resize();
        window.onresize = this.resize.bind(this);

        this.animate();
    }

    disconnect(): void {
        this.cancelAnimation = true;
        window.removeEventListener("resize", this.resize.bind(this))
    }

    animate(): void {
        if (this.cancelAnimation) {
            return;
        }

        let now = Date.now();
        let delta = now - this.then;

        if (delta > this.frameInterval) {
            this.then = now - (delta % this.frameInterval);

            this.render();
        }

        requestAnimationFrame(this.animate.bind(this));
    }
    
    render(): void {
        let imageData = this.canvasContext!.createImageData(this.canvasContext!.canvas.width, this.canvasContext!.canvas.height),
            buffer32 = new Uint32Array(imageData.data.buffer);

        for (let i = 0; i < buffer32.length; i++) {
            if (Math.random() < 0.5) {
                buffer32[i] = 0xff000000;
            }
        }

        this.canvasContext!.putImageData(imageData, 0, 0);
    }
    
    resize(): void {
        let aspectRatio = window.innerWidth / window.innerHeight;
        this.backgroundTarget.height = 256;
        this.backgroundTarget.width = Math.round(256 * aspectRatio);
    }
}
