export class MatchSetup {
    constructor(team1Role, team2Role) {
        this.games = [];
        this.winner = null;
        this.bans = 0;
        this.isBo7 = false;
        this.banCount = 0;
        this.currentBanUser = '';
        this.noCurrentBanUser = '';
        this.banPhaseFlag = true;
        this.pickingTeam = null;
        this.fpTeam = null;
        this.mode;
        this.totalWinsToFinish = 0;
        this.selecting = null;
        this.team1Controller = {
            role: team1Role,
            user: null,
            mapsBanned: [],
            tosscoin_fp: false,
            tosscoin_map: false,
            wins: 0
        };
        this.team2Controller = {
            role: team2Role,
            user: null,
            mapsBanned: [],
            tosscoin_fp: false,
            tosscoin_map: false,
            wins: 0
        };
    }

    getCheckIfSerieIsComplete(){
        console.log('checking');
        if (this.team1Controller.wins == this.totalWinsToFinish) {
            return team1Controller;
        }
        if (this.team2Controller.wins == this.totalWinsToFinish) {
            return team1Controller;
        }
        return false;
    }


    startBanPhase() {
        this.banPhaseFlag = true;
    }

    startPickPhase() {
        this.banPhaseFlag = false;
    }

    addMapBan(team, map) {
        if (team === 1) {
            this.team1Controller.mapsBanned.push(map);
        } else if (team === 2) {
            this.team2Controller.mapsBanned.push(map);
        }
    }

    getMapBan(team) {
        if (team === 1) {
            return this.team1Controller.mapsBanned;
        } else if (team === 2) {
            return this.team2Controller.mapsBanned;
        }
    }

    setUserToTeam(team, user){
        if (team === 1) {
            this.team1Controller.user = user;
        } else if (team === 2) {
            this.team2Controller.user = user;
        }
    }

    getUserFromTeam(team){
        if (team === 1) {
            return this.team1Controller.user;
        } else if (team === 2) {
            return this.team2Controller.user = user;
        }
    }

    getTeamFp() {
        if (this.team1Controller.tosscoin_fp) {
            return this.team1Controller;
        } else if (this.team2Controller.tosscoin_fp) {
            return this.team2Controller;
        }
        return null;
    }
    
    getTeamMap() {
        if (this.team1Controller.tosscoin_map) {
            return this.team1Controller;
        } else if (this.team2Controller.tosscoin_map) {
            return this.team2Controller;
        }
        return null;
    }

    setFirstPickAndMap(fpmap, chosenTeam){
        if (fpmap === 'fp') {
            if (chosenTeam === this.team1Controller.user) {
                this.team1Controller.tosscoin_fp = true;
                this.team2Controller.tosscoin_map = true;
                this.currentBanUser = this.team2Controller.user;
            } else {
                this.team2Controller.tosscoin_fp = true;
                this.team1Controller.tosscoin_map = true;
                this.currentBanUser = this.team1Controller.user;
            }
        } else if (fpmap === 'map') {
            if (chosenTeam === this.team1Controller.user) {
                this.team1Controller.tosscoin_map = true;
                this.team2Controller.tosscoin_fp = true;
                this.currentBanUser = this.team1Controller.user;
            } else {
                this.team2Controller.tosscoin_map = true;
                this.team1Controller.tosscoin_fp = true;
                this.currentBanUser = this.team2Controller.user;
            }
        }
    }

    setMode(mode){
        this.mode = mode;
        switch (mode) {
            case 'Bo1':
            case 'Bo2':
                this.bans = 4;
                this.totalWinsToFinish = 1;
                break;
            case 'Bo3':
                this.bans = 4;
                this.totalWinsToFinish = 2;
                break;
            case 'Bo5':
                this.bans = 2;
                this.totalWinsToFinish = 3;
                break;
            case 'Bo7':
                this.bans = 2;
                this.isBo7 = true;
                this.totalWinsToFinish = 4;
                break;
            default:
                console.log(`?`);
        }
    }

}
