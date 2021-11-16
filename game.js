class Game{
    constructor(){
        this.engine = Matter.Engine.create();
        this.renderer = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options:{
                showDebug: true,
            }
        });

        Matter.Render.run(this.renderer);
        Matter.Runner.run(this.engine);
    }
}