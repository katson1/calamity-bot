export class Game {
    constructor() {
        this.mapPlayed = '';
        this.mapChooser = null;
        this.winner = null;
        this.fp = null;
        this.isFinished = false;
    }

    setWinner(winner) {
        this.winner = winner;
        this.isFinished = true;
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
        this.isFinished = false;
    }

}

