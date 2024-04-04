export class Game {
    constructor() {
        this.mapPlayed = '';
        this.mapChooser = null;
        this.winner = null;
        this.fp = null;
        this.progress = 1;
    }

    setWinner(winner) {
        this.winner = winner;
        this.isFinished = true;
        this.progress = 3;
    }

    setFpAndMapChooser(fp, mapChooser){
        this.mapChooser = mapChooser;
        this.fp = fp;
    }

    startNewGame() {
        this.mapPlayed = '';
        this.mapChooser = null;
        this.winner = null;
        this.fp = null;
        this.progress = 1;
    }

    bo7(winner){
        this.mapPlayed = 'Upper Finals Winner';
        this.winner = winner;
        this.progress = 3;
    }

}

